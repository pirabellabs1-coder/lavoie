import { Resend } from "resend";
import { SITE } from "@/lib/site";
import { getDb } from "./db";
import { habiller } from "./email";
import { EXPEDITEUR } from "./sequences";

/**
 * Le réveil des contacts dormants.
 *
 * Une liste qui gonfle sans jamais se nettoyer coûte cher — en argent (chaque
 * envoi se paie) et en délivrabilité (des adresses mortes qui ne s'ouvrent
 * jamais dégradent la réputation d'expéditeur, donc l'arrivée en boîte de
 * réception de tout le monde).
 *
 * La règle est douce et en deux temps :
 *
 *   1. Après six mois sans le moindre signe (aucun événement dans sa
 *      chronologie), une dernière lettre part — une seule, jamais deux.
 *   2. Si trente jours plus tard rien n'a bougé, le contact sort de la liste
 *      active (désinscrit proprement, avec sa trace). Il reste dans le fichier,
 *      il ne reçoit simplement plus rien.
 *
 * Les clients ne sont jamais réveillés ni désinscrits de cette façon : une
 * relation établie ne se mesure pas à un clic.
 */

const DORMANCE_MOIS = 6;
const GRACE_JOURS = 30;

type Dormant = { id: string; email: string; prenom: string | null };

/** Passée une fois par jour par le worker. */
export async function reveillerLesDormants(): Promise<{ reveils: number; sorties: number }> {
  const sql = await getDb();
  if (!sql) return { reveils: 0, sorties: 0 };

  let reveils = 0;
  let sorties = 0;

  // ── Étape 2 d'abord : sortir ceux qui n'ont pas réagi au réveil. ──
  // Un événement postérieur au réveil (ouverture, clic, nouveau formulaire)
  // vaut réaction, et les épargne.
  try {
    const partis = await sql<Dormant[]>`
      UPDATE contacts c
      SET desabonne_le = NOW(), consentement = FALSE, maj_le = NOW()
      WHERE c.reveille_le IS NOT NULL
        AND c.reveille_le < NOW() - make_interval(days => ${GRACE_JOURS})
        AND c.desabonne_le IS NULL
        AND c.statut <> 'client'
        AND NOT EXISTS (
          SELECT 1 FROM evenements e
          WHERE e.contact_id = c.id AND e.cree_le > c.reveille_le
        )
      RETURNING c.id, c.email, c.prenom
    `;
    for (const d of partis) {
      await sql`
        UPDATE inscriptions SET statut = 'arretee'
        WHERE contact_id = ${d.id} AND statut = 'active'
      `;
      await sql`
        INSERT INTO evenements (contact_id, type, libelle)
        VALUES (${d.id}, 'desinscription', 'Sorti de la liste après réveil sans réponse')
      `;
    }
    sorties = partis.length;
  } catch (e) {
    console.error("[crm] reveillerLesDormants (sorties):", e);
  }

  // ── Étape 1 : la dernière lettre aux endormis jamais réveillés. ──
  if (!process.env.RESEND_API_KEY) return { reveils: 0, sorties };

  let dus: Dormant[] = [];
  try {
    dus = await sql<Dormant[]>`
      SELECT c.id, c.email, c.prenom
      FROM contacts c
      WHERE c.desabonne_le IS NULL
        AND c.reveille_le IS NULL
        AND c.statut <> 'client'
        AND c.email <> ''
        AND NOT EXISTS (
          SELECT 1 FROM evenements e
          WHERE e.contact_id = c.id
            AND e.cree_le > NOW() - make_interval(months => ${DORMANCE_MOIS})
        )
      ORDER BY c.cree_le ASC
      LIMIT 50
    `;
  } catch (e) {
    console.error("[crm] reveillerLesDormants (lecture):", e);
    return { reveils: 0, sorties };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  for (const d of dus) {
    // La date de réveil est posée avant l'envoi : un incident ne relance pas
    // en boucle, et le pire cas est une personne réveillée sans e-mail — jamais
    // l'inverse.
    await sql`UPDATE contacts SET reveille_le = NOW() WHERE id = ${d.id}`;

    const { html, text } = habiller({
      email: d.email,
      apercu: "Un dernier mot avant de vous laisser tranquille.",
      texte:
        `Bonjour ${d.prenom ?? ""},\n\n` +
        `Cela fait un moment que nos chemins ne se sont pas croisés, et je ne voudrais pas encombrer votre boîte sans raison.\n\n` +
        `Si vous souhaitez continuer à recevoir mes Lettres, vous n'avez rien à faire : ce simple message rouvre le fil.\n\n` +
        `Si le moment n'est plus le bon, ne faites rien non plus : dans quelques semaines, je cesserai de vous écrire, sans rancune et sans vous perdre — la porte reste ouverte le jour où vous voudrez revenir.\n\n` +
        `Et si vous voulez reprendre là où nous en étions, tout est ici : ${SITE.url}\n\n` +
        `Avec toute ma présence,\n` +
        `Domoïna Ramiadana — La Voie 2 la Conscience`,
    });

    try {
      const { error } = await resend.emails.send({
        from: EXPEDITEUR,
        to: d.email,
        subject: "Faut-il que je continue à vous écrire ?",
        html,
        text,
      });
      if (!error) {
        reveils += 1;
        await sql`
          INSERT INTO envois (contact_id, destinataire, sujet, statut)
          VALUES (${d.id}, ${d.email}, 'Faut-il que je continue à vous écrire ?', 'envoye')
        `;
        await sql`
          INSERT INTO evenements (contact_id, type, libelle)
          VALUES (${d.id}, 'reveil', 'Dernière lettre — contact dormant depuis 6 mois')
        `;
      }
    } catch (e) {
      console.error("[crm] réveil non envoyé:", e);
    }
  }

  return { reveils, sorties };
}

export type StatsReveil = { dormants: number; reveilles: number };

/** Pour la vue d'ensemble : combien de contacts sommeillent, combien sont en sursis. */
export async function statsReveil(): Promise<StatsReveil> {
  const sql = await getDb();
  if (!sql) return { dormants: 0, reveilles: 0 };
  try {
    const [l] = await sql<{ dormants: number; reveilles: number }[]>`
      SELECT
        COUNT(*) FILTER (
          WHERE c.desabonne_le IS NULL AND c.statut <> 'client'
            AND NOT EXISTS (
              SELECT 1 FROM evenements e
              WHERE e.contact_id = c.id
                AND e.cree_le > NOW() - make_interval(months => ${DORMANCE_MOIS})
            )
        )::int AS dormants,
        COUNT(*) FILTER (
          WHERE c.reveille_le IS NOT NULL AND c.desabonne_le IS NULL
        )::int AS reveilles
      FROM contacts c
    `;
    return { dormants: l?.dormants ?? 0, reveilles: l?.reveilles ?? 0 };
  } catch (e) {
    console.error("[crm] statsReveil:", e);
    return { dormants: 0, reveilles: 0 };
  }
}
