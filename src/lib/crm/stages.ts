import { Resend } from "resend";
import { SITE } from "@/lib/site";
import { EVENEMENTS } from "@/lib/evenements";
import { getDb } from "./db";
import { habiller } from "./email";
import { EXPEDITEUR } from "./sequences";

/**
 * Les stages, et qui vient.
 *
 * Le catalogue des événements reste dans le code (`src/lib/evenements.ts`) :
 * c'est du contenu éditorial, pas de la donnée. La base ne retient de chaque
 * stage que ce qui bouge — le nombre de places, le texte de logistique, et
 * surtout la liste des personnes.
 *
 * Le parcours d'une place :
 *
 *   demande → confirmée → venue
 *      ↓         ↓
 *   attente   annulée
 *
 * Une demande n'est pas une inscription. Le paiement passe encore par la
 * billetterie, donc c'est le secrétariat qui confirme, et la confirmation
 * porte le lien de règlement. Quand une place se libère, la première personne
 * en attente est proposée à la confirmation — jamais promue en silence.
 */

export const ETATS_PARTICIPATION: Record<string, { texte: string; ton: string }> = {
  demande: { texte: "Demande", ton: "nouveau" },
  attente: { texte: "Liste d'attente", ton: "contacte" },
  confirmee: { texte: "Confirmée", ton: "client" },
  venue: { texte: "Venue", ton: "appel" },
  annulee: { texte: "Annulée", ton: "perdu" },
};

export type Stage = {
  id: string;
  slug: string;
  titre: string;
  debut_le: Date | null;
  places: number;
  actif: boolean;
  logistique: string | null;
};

export type StageVue = Stage & {
  confirmees: number;
  demandes: number;
  attente: number;
};

export type Participation = {
  id: string;
  stage_id: string;
  contact_id: string;
  statut: string;
  message: string | null;
  cree_le: Date;
  prenom: string | null;
  nom: string | null;
  email: string;
  telephone: string | null;
};

/**
 * Crée en base les stages du catalogue qui n'y sont pas encore. Idempotent :
 * un stage déjà présent n'est jamais réécrit, pour ne pas effacer un nombre de
 * places ou un texte de logistique ajustés à la main.
 */
export async function semerStages(): Promise<void> {
  const sql = await getDb();
  if (!sql) return;
  try {
    for (const e of EVENEMENTS) {
      await sql`
        INSERT INTO stages (slug, titre, debut_le)
        VALUES (${e.slug}, ${e.titreLong || e.titre}, ${e.debutISO ?? null})
        ON CONFLICT (slug) DO NOTHING
      `;
    }
  } catch (err) {
    console.error("[crm] semerStages:", err);
  }
}

export async function listerStages(): Promise<StageVue[]> {
  const sql = await getDb();
  if (!sql) return [];
  await semerStages();
  try {
    return await sql<StageVue[]>`
      SELECT s.id, s.slug, s.titre, s.debut_le, s.places, s.actif, s.logistique,
             COUNT(p.id) FILTER (WHERE p.statut = 'confirmee')::int AS confirmees,
             COUNT(p.id) FILTER (WHERE p.statut = 'demande')::int   AS demandes,
             COUNT(p.id) FILTER (WHERE p.statut = 'attente')::int   AS attente
      FROM stages s
      LEFT JOIN participations p ON p.stage_id = s.id
      GROUP BY s.id
      ORDER BY s.debut_le NULLS LAST, s.titre
    `;
  } catch (e) {
    console.error("[crm] listerStages:", e);
    return [];
  }
}

export async function participantsDuStage(stageId: string): Promise<Participation[]> {
  const sql = await getDb();
  if (!sql) return [];
  try {
    return await sql<Participation[]>`
      SELECT p.id, p.stage_id, p.contact_id, p.statut, p.message, p.cree_le,
             c.prenom, c.nom, c.email, c.telephone
      FROM participations p
      JOIN contacts c ON c.id = p.contact_id
      WHERE p.stage_id = ${stageId}
      ORDER BY
        array_position(ARRAY['confirmee','demande','attente','venue','annulee'], p.statut),
        p.cree_le
    `;
  } catch (e) {
    console.error("[crm] participantsDuStage:", e);
    return [];
  }
}

/** Reste-t-il de la place ? Les demandes en cours comptent comme des places prises. */
export async function placesRestantes(slug: string): Promise<number | null> {
  const sql = await getDb();
  if (!sql) return null;
  try {
    const [l] = await sql<{ places: number; prises: number }[]>`
      SELECT s.places,
             COUNT(p.id) FILTER (WHERE p.statut IN ('confirmee', 'demande'))::int AS prises
      FROM stages s
      LEFT JOIN participations p ON p.stage_id = s.id
      WHERE s.slug = ${slug}
      GROUP BY s.places
    `;
    if (!l) return null;
    return Math.max(0, l.places - l.prises);
  } catch (e) {
    console.error("[crm] placesRestantes:", e);
    return null;
  }
}

/**
 * Enregistre une demande de place. Renvoie l'état retenu — « demande » s'il
 * reste de la place, « attente » sinon.
 */
export async function demanderPlace(entree: {
  slug: string;
  contactId: string;
  message?: string;
}): Promise<{ statut: "demande" | "attente"; titre: string } | null> {
  const sql = await getDb();
  if (!sql) return null;
  await semerStages();
  try {
    const [stage] = await sql<{ id: string; titre: string }[]>`
      SELECT id, titre FROM stages WHERE slug = ${entree.slug} AND actif = TRUE
    `;
    if (!stage) return null;

    const restantes = await placesRestantes(entree.slug);
    const statut = restantes !== null && restantes <= 0 ? "attente" : "demande";

    await sql`
      INSERT INTO participations (stage_id, contact_id, statut, message)
      VALUES (${stage.id}, ${entree.contactId}, ${statut}, ${entree.message || null})
      ON CONFLICT (stage_id, contact_id) DO UPDATE SET
        message = COALESCE(NULLIF(EXCLUDED.message, ''), participations.message),
        -- Une personne qui refait une demande après une annulation redevient
        -- candidate ; une place déjà confirmée n'est jamais rétrogradée.
        statut = CASE WHEN participations.statut IN ('annulee', 'attente')
                      THEN EXCLUDED.statut ELSE participations.statut END
    `;

    await sql`
      INSERT INTO evenements (contact_id, type, libelle)
      VALUES (${entree.contactId}, 'stage',
              ${`${statut === "attente" ? "Liste d'attente" : "Demande de place"} — ${stage.titre}`})
    `;

    return { statut, titre: stage.titre };
  } catch (e) {
    console.error("[crm] demanderPlace:", e);
    return null;
  }
}

export async function changerStatutParticipation(
  id: string,
  statut: string,
): Promise<boolean> {
  const sql = await getDb();
  if (!sql) return false;
  if (!Object.keys(ETATS_PARTICIPATION).includes(statut)) return false;
  try {
    const rows = await sql<{ contact_id: string; titre: string }[]>`
      UPDATE participations p
      SET statut = ${statut}
      FROM stages s
      WHERE s.id = p.stage_id AND p.id = ${id}
      RETURNING p.contact_id, s.titre
    `;
    const l = rows[0];
    if (!l) return false;
    await sql`
      INSERT INTO evenements (contact_id, type, libelle)
      VALUES (${l.contact_id}, 'stage',
              ${`${ETATS_PARTICIPATION[statut].texte} — ${l.titre}`})
    `;
    // Venir à un stage, c'est être client.
    if (statut === "confirmee" || statut === "venue") {
      await sql`
        UPDATE contacts SET statut = 'client', maj_le = NOW()
        WHERE id = ${l.contact_id} AND statut <> 'client'
      `;
    }
    return true;
  } catch (e) {
    console.error("[crm] changerStatutParticipation:", e);
    return false;
  }
}

export async function reglerStage(
  id: string,
  entree: { places: number; logistique: string; actif: boolean },
): Promise<boolean> {
  const sql = await getDb();
  if (!sql) return false;
  try {
    await sql`
      UPDATE stages
      SET places = ${Math.max(0, Math.min(500, entree.places))},
          logistique = ${entree.logistique || null},
          actif = ${entree.actif}
      WHERE id = ${id}
    `;
    return true;
  } catch (e) {
    console.error("[crm] reglerStage:", e);
    return false;
  }
}

// ─── Les deux e-mails que le worker envoie ──────────────────────────────────

const AVANT_JOURS = 7;
const APRES_JOURS = 2;

/**
 * La logistique une semaine avant, le retour deux jours après. Chaque e-mail
 * n'est envoyé qu'une fois par personne et par stage — la date d'envoi est
 * posée en base avant même de savoir si Resend a réussi, pour qu'un incident
 * ne se transforme jamais en envoi en boucle.
 */
export async function accompagnerLesStages(): Promise<{ logistique: number; retours: number }> {
  const sql = await getDb();
  if (!sql) return { logistique: 0, retours: 0 };
  if (!process.env.RESEND_API_KEY) return { logistique: 0, retours: 0 };

  const resend = new Resend(process.env.RESEND_API_KEY);
  let logistique = 0;
  let retours = 0;

  type Due = {
    id: string;
    email: string;
    prenom: string | null;
    titre: string;
    debut_le: Date;
    logistique: string | null;
  };

  // ── Une semaine avant ──
  try {
    const dues = await sql<Due[]>`
      SELECT p.id, c.email, c.prenom, s.titre, s.debut_le, s.logistique
      FROM participations p
      JOIN stages s   ON s.id = p.stage_id
      JOIN contacts c ON c.id = p.contact_id
      WHERE p.statut = 'confirmee'
        AND p.logistique_le IS NULL
        AND s.debut_le IS NOT NULL
        AND s.debut_le > NOW()
        AND s.debut_le < NOW() + make_interval(days => ${AVANT_JOURS})
        AND c.desabonne_le IS NULL
      LIMIT 100
    `;

    for (const d of dues) {
      await sql`UPDATE participations SET logistique_le = NOW() WHERE id = ${d.id}`;
      const quand = new Date(d.debut_le).toLocaleDateString("fr-FR", {
        timeZone: "Europe/Paris",
        weekday: "long",
        day: "numeric",
        month: "long",
      });
      const { html, text } = habiller({
        email: d.email,
        apercu: `Votre stage commence ${quand}.`,
        texte:
          `Bonjour ${d.prenom ?? ""},\n\n` +
          `Votre place est confirmée pour « ${d.titre} », qui commence ${quand}.\n\n` +
          (d.logistique
            ? `${d.logistique}\n\n`
            : `Le Centre HUT se trouve à Rouperroux-le-Coquet, dans la Sarthe. Prévoyez des vêtements confortables, de quoi écrire, et de bonnes chaussures : une partie du travail se fait dehors.\n\n`) +
          `Si quelque chose vous empêche de venir, dites-le-nous : une autre personne attend cette place.\n\n` +
          `Avec toute ma présence,\n` +
          `Domoïna Ramiadana — La Voie 2 la Conscience`,
      });
      try {
        await resend.emails.send({
          from: EXPEDITEUR,
          to: d.email,
          subject: `Votre stage commence ${quand}`,
          html,
          text,
        });
        logistique += 1;
      } catch (e) {
        console.error("[crm] logistique non envoyée:", e);
      }
    }
  } catch (e) {
    console.error("[crm] accompagnerLesStages (avant):", e);
  }

  // ── Deux jours après ──
  try {
    const dues = await sql<Due[]>`
      SELECT p.id, c.email, c.prenom, s.titre, s.debut_le, s.logistique
      FROM participations p
      JOIN stages s   ON s.id = p.stage_id
      JOIN contacts c ON c.id = p.contact_id
      WHERE p.statut IN ('confirmee', 'venue')
        AND p.retour_le IS NULL
        AND s.debut_le IS NOT NULL
        AND s.debut_le < NOW() - make_interval(days => ${APRES_JOURS})
        AND s.debut_le > NOW() - INTERVAL '30 days'
        AND c.desabonne_le IS NULL
      LIMIT 100
    `;

    for (const d of dues) {
      await sql`UPDATE participations SET retour_le = NOW() WHERE id = ${d.id}`;
      const { html, text } = habiller({
        email: d.email,
        apercu: "Ce qui se dépose après un stage.",
        texte:
          `Bonjour ${d.prenom ?? ""},\n\n` +
          `Quelques jours ont passé depuis « ${d.titre} ». C'est souvent maintenant que les choses se déposent — pas pendant, après.\n\n` +
          `Si vous voulez me dire un mot de ce qui a bougé, répondez simplement à cet e-mail. Je lis tout, et ces retours nourrissent les stages suivants.\n\n` +
          `Et si vous souhaitez poursuivre, le chemin complet est ici : ${SITE.url}/cycle-des-saisons\n\n` +
          `Avec toute ma présence,\n` +
          `Domoïna Ramiadana — La Voie 2 la Conscience`,
      });
      try {
        await resend.emails.send({
          from: EXPEDITEUR,
          to: d.email,
          subject: "Après le stage",
          html,
          text,
        });
        retours += 1;
      } catch (e) {
        console.error("[crm] retour non envoyé:", e);
      }
    }
  } catch (e) {
    console.error("[crm] accompagnerLesStages (après):", e);
  }

  return { logistique, retours };
}
