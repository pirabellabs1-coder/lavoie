import { Resend } from "resend";
import { getDb } from "./db";
import { SITE } from "../site";

/**
 * Séquences d'e-mails automatiques.
 *
 * Une séquence est une suite d'étapes, chacune envoyée après un délai exprimé
 * en jours depuis l'inscription. Un worker (Vercel Cron → /api/cron/sequences)
 * traite chaque jour les échéances arrivées à terme.
 */

export const EXPEDITEUR =
  process.env.RESEND_FROM || "La Voie 2 la Conscience <onboarding@resend.dev>";

export type EtapeGraine = { ordre: number; delai_jours: number; sujet: string; corps: string };
export type SequenceGraine = {
  cle: string;
  nom: string;
  description: string;
  declencheur: string;
  etapes: EtapeGraine[];
};

const SIGNATURE = `\n\nAvec toute ma présence,\nDomoïna Ramiadana — La Voie 2 la Conscience\n${SITE.url}`;

/**
 * Scénarios installés au premier démarrage. Ils sont modifiables depuis le
 * tableau de bord ; le semis ne réécrit jamais une séquence existante.
 */
export const SEQUENCES_PAR_DEFAUT: SequenceGraine[] = [
  {
    cle: "guide",
    nom: "Suite du guide gratuit",
    description:
      "Se déclenche quand quelqu'un télécharge « Sortir de la crise silencieuse ». Le guide lui-même part immédiatement ; cette séquence prend le relais.",
    declencheur: "guide",
    etapes: [
      {
        ordre: 1,
        delai_jours: 2,
        sujet: "Avez-vous ouvert le guide, {{prenom}} ?",
        corps:
          `Bonjour {{prenom}},\n\nVous avez reçu le guide il y a deux jours. Si vous ne l'avez pas encore ouvert, ce n'est pas un oubli : c'est souvent le signe que quelque chose résiste un peu.\n\nCommencez simplement par la première partie, celle des six signaux. La plupart des personnes que j'accompagne en reconnaissent au moins trois — et c'est en général le moment où elles cessent de se dire que « ça va passer ».\n\nSi une phrase vous arrête, répondez-moi directement à cet e-mail. Je lis tout.` +
          SIGNATURE,
      },
      {
        ordre: 2,
        delai_jours: 5,
        sujet: "Ce que la lucidité ne suffit pas à guérir",
        corps:
          `Bonjour {{prenom}},\n\nBeaucoup de personnes très lucides sur leur histoire — capables d'en parler avec finesse — continuent pourtant de reproduire les mêmes schémas.\n\nComprendre est nécessaire. Mais insuffisant. On ne guérit pas une blessure en l'analysant : on la guérit en la vivant autrement, dans le corps, dans l'émotion enfin traversée.\n\nC'est exactement ce que travaille la notion de blessure originelle, et c'est le cœur de mon accompagnement.\n\nÀ lire si le sujet vous parle : ${SITE.url}/blog/la-blessure-originelle` +
          SIGNATURE,
      },
      {
        ordre: 3,
        delai_jours: 9,
        sujet: "45 minutes, offertes, sans engagement",
        corps:
          `Bonjour {{prenom}},\n\nJe réserve chaque semaine quelques créneaux pour des appels découverte. 45 minutes, offerts, sans aucun engagement.\n\nCe n'est pas un appel de vente. C'est un temps pour poser votre situation à voix haute et regarder ensemble ce qui serait juste pour vous — même si la réponse est « pas maintenant », ou « pas avec moi ».\n\nRéserver votre créneau : ${SITE.url}/contact` +
          SIGNATURE,
      },
      {
        ordre: 4,
        delai_jours: 16,
        sujet: "Et si vous le viviez, plutôt que de le lire ?",
        corps:
          `Bonjour {{prenom}},\n\nLire éclaire. Traverser transforme.\n\nQuatre fois par an, au Centre HUT en Sarthe, j'accompagne un groupe restreint pendant quatre jours, au rythme des saisons. On y descend à ses racines, on y regarde son histoire en face, et on en ressort avec des fondations — pas avec des notes.\n\nLes prochaines dates : ${SITE.url}/evenements\nLe parcours complet : ${SITE.url}/cycle-des-saisons` +
          SIGNATURE,
      },
    ],
  },
  {
    cle: "lettres",
    nom: "Bienvenue aux Lettres",
    description:
      "Se déclenche à l'inscription aux Lettres depuis le site. Souhaite la bienvenue et oriente vers les ressources.",
    declencheur: "lettres",
    etapes: [
      {
        ordre: 1,
        delai_jours: 0,
        sujet: "Bienvenue parmi les Lettres, {{prenom}}",
        corps:
          `Bonjour {{prenom}},\n\nMerci de votre inscription. Vous recevrez désormais mes Lettres : des réflexions et des repères sur la transformation, le couple, le sens et l'équilibre. Pas de rythme imposé, pas de remplissage — j'écris quand j'ai quelque chose à dire.\n\nEn attendant la prochaine, le guide « Sortir de la crise silencieuse » est offert : ${SITE.url}/evenements#guide` +
          SIGNATURE,
      },
      {
        ordre: 2,
        delai_jours: 7,
        sujet: "Réussir, et se sentir vide",
        corps:
          `Bonjour {{prenom}},\n\nC'est la situation que je rencontre le plus souvent : de l'extérieur tout va bien — le parcours, le titre, la famille — et à l'intérieur, quelque chose s'est éteint sans prévenir.\n\nCe vide n'est pas un défaut de gratitude. C'est un signal.\n\nJ'ai écrit là-dessus : ${SITE.url}/blog/reussir-et-se-sentir-vide` +
          SIGNATURE,
      },
    ],
  },
  {
    cle: "appel",
    nom: "Suite d'une demande d'appel",
    description:
      "Se déclenche quand quelqu'un remplit le formulaire de contact. Accuse réception, puis relance si l'appel n'a pas eu lieu.",
    declencheur: "appel",
    etapes: [
      {
        ordre: 1,
        delai_jours: 0,
        sujet: "Votre demande est bien arrivée, {{prenom}}",
        corps:
          `Bonjour {{prenom}},\n\nVotre demande d'appel découverte m'est bien parvenue. Je reviens vers vous sous 48 heures ouvrées pour convenir d'un créneau.\n\nEn attendant, rien à préparer. Venez comme vous êtes — c'est même préférable.` +
          SIGNATURE,
      },
      {
        ordre: 2,
        delai_jours: 4,
        sujet: "Toujours partant pour cet échange ?",
        corps:
          `Bonjour {{prenom}},\n\nJe reviens vers vous au cas où mon précédent message serait passé inaperçu. Si vous souhaitez toujours cet appel, répondez simplement à cet e-mail avec deux ou trois créneaux qui vous arrangent.\n\nEt si le moment n'est plus le bon, dites-le-moi aussi : c'est une réponse parfaitement valable.` +
          SIGNATURE,
      },
    ],
  },
];

/** Installe les scénarios manquants. Idempotent, n'écrase jamais l'existant. */
export async function semerSequences(): Promise<void> {
  const sql = await getDb();
  if (!sql) return;
  try {
    for (const g of SEQUENCES_PAR_DEFAUT) {
      const rows = await sql<{ id: string }[]>`
        INSERT INTO sequences (cle, nom, description, declencheur)
        VALUES (${g.cle}, ${g.nom}, ${g.description}, ${g.declencheur})
        ON CONFLICT (cle) DO NOTHING
        RETURNING id
      `;
      const creee = rows[0];
      if (!creee) continue;
      for (const e of g.etapes) {
        await sql`
          INSERT INTO sequence_etapes (sequence_id, ordre, delai_jours, sujet, corps)
          VALUES (${creee.id}, ${e.ordre}, ${e.delai_jours}, ${e.sujet}, ${e.corps})
          ON CONFLICT (sequence_id, ordre) DO NOTHING
        `;
      }
    }
  } catch (e) {
    console.error("[crm] semerSequences:", e);
  }
}

/**
 * Inscrit un contact à une séquence. Sans effet si le contact y est déjà,
 * s'il s'est désabonné, ou si la séquence est désactivée.
 */
export async function inscrireASequence(contactId: string, cle: string): Promise<void> {
  const sql = await getDb();
  if (!sql) return;
  try {
    await semerSequences();
    const [seq] = await sql<{ id: string }[]>`
      SELECT id FROM sequences WHERE cle = ${cle} AND active = TRUE
    `;
    if (!seq) return;

    const [contact] = await sql<{ desabonne_le: Date | null }[]>`
      SELECT desabonne_le FROM contacts WHERE id = ${contactId}
    `;
    if (!contact || contact.desabonne_le) return;

    const [premiere] = await sql<{ delai_jours: number }[]>`
      SELECT delai_jours FROM sequence_etapes
      WHERE sequence_id = ${seq.id} ORDER BY ordre ASC LIMIT 1
    `;
    if (!premiere) return;

    await sql`
      INSERT INTO inscriptions (contact_id, sequence_id, etape_suivante, echeance)
      VALUES (${contactId}, ${seq.id}, 1, NOW() + make_interval(days => ${premiere.delai_jours}))
      ON CONFLICT (contact_id, sequence_id) DO NOTHING
    `;
  } catch (e) {
    console.error("[crm] inscrireASequence:", e);
  }
}

function rendre(gabarit: string, contact: { prenom: string | null; email: string }): string {
  return gabarit
    .replace(/\{\{\s*prenom\s*\}\}/g, contact.prenom || "")
    .replace(/\{\{\s*email\s*\}\}/g, contact.email)
    // Un « Bonjour , » disgracieux si le prénom est inconnu.
    .replace(/Bonjour\s+,/g, "Bonjour,");
}

function lienDesinscription(email: string): string {
  return `${SITE.url}/desinscription?e=${encodeURIComponent(email)}`;
}

type AEnvoyer = {
  inscription_id: string;
  contact_id: string;
  sequence_id: string;
  email: string;
  prenom: string | null;
  etape: number;
  sujet: string;
  corps: string;
};

/**
 * Traite toutes les échéances arrivées à terme : envoie l'e-mail, journalise,
 * puis programme l'étape suivante ou clôt l'inscription.
 * Renvoie le compte des envois réussis et échoués.
 */
export async function traiterEcheances(
  limite = 100,
): Promise<{ envoyes: number; echecs: number; ignores: number }> {
  const sql = await getDb();
  if (!sql) return { envoyes: 0, echecs: 0, ignores: 0 };
  if (!process.env.RESEND_API_KEY) return { envoyes: 0, echecs: 0, ignores: 0 };

  const resend = new Resend(process.env.RESEND_API_KEY);
  let envoyes = 0;
  let echecs = 0;
  let ignores = 0;

  let dues: AEnvoyer[] = [];
  try {
    dues = await sql<AEnvoyer[]>`
      SELECT i.id AS inscription_id, i.contact_id, i.sequence_id, i.etape_suivante AS etape,
             c.email, c.prenom, e.sujet, e.corps
      FROM inscriptions i
      JOIN contacts c        ON c.id = i.contact_id
      JOIN sequences s       ON s.id = i.sequence_id
      JOIN sequence_etapes e ON e.sequence_id = i.sequence_id AND e.ordre = i.etape_suivante
      WHERE i.statut = 'active'
        AND i.echeance <= NOW()
        AND s.active = TRUE
        AND c.desabonne_le IS NULL
      ORDER BY i.echeance ASC
      LIMIT ${limite}
    `;
  } catch (e) {
    console.error("[crm] traiterEcheances (lecture):", e);
    return { envoyes: 0, echecs: 0, ignores: 0 };
  }

  for (const d of dues) {
    const sujet = rendre(d.sujet, d);
    const corps =
      rendre(d.corps, d) +
      `\n\n—\nPour ne plus recevoir ces messages : ${lienDesinscription(d.email)}`;

    let erreur: string | null = null;
    try {
      const { error } = await resend.emails.send({
        from: EXPEDITEUR,
        to: d.email,
        subject: sujet,
        text: corps,
        headers: { "List-Unsubscribe": `<${lienDesinscription(d.email)}>` },
      });
      if (error) erreur = error.message ?? "Erreur Resend";
    } catch (e) {
      erreur = e instanceof Error ? e.message : "Erreur inconnue";
    }

    try {
      await sql`
        INSERT INTO envois (contact_id, sequence_id, etape, destinataire, sujet, statut, erreur)
        VALUES (${d.contact_id}, ${d.sequence_id}, ${d.etape}, ${d.email}, ${sujet},
                ${erreur ? "echec" : "envoye"}, ${erreur})
      `;

      if (erreur) {
        echecs += 1;
        // Nouvelle tentative dans 6 heures, sans avancer l'étape.
        await sql`
          UPDATE inscriptions SET echeance = NOW() + INTERVAL '6 hours'
          WHERE id = ${d.inscription_id}
        `;
        continue;
      }

      envoyes += 1;
      await sql`
        INSERT INTO evenements (contact_id, type, libelle)
        VALUES (${d.contact_id}, 'email', ${"E-mail envoyé — " + sujet})
      `;

      const [suivante] = await sql<{ ordre: number; delai_jours: number }[]>`
        SELECT ordre, delai_jours FROM sequence_etapes
        WHERE sequence_id = ${d.sequence_id} AND ordre > ${d.etape}
        ORDER BY ordre ASC LIMIT 1
      `;

      if (suivante) {
        // Le délai de chaque étape est compté depuis l'inscription.
        await sql`
          UPDATE inscriptions
          SET etape_suivante = ${suivante.ordre},
              echeance = cree_le + make_interval(days => ${suivante.delai_jours})
          WHERE id = ${d.inscription_id}
        `;
      } else {
        await sql`
          UPDATE inscriptions SET statut = 'terminee' WHERE id = ${d.inscription_id}
        `;
      }
    } catch (e) {
      ignores += 1;
      console.error("[crm] traiterEcheances (ecriture):", e);
    }
  }

  return { envoyes, echecs, ignores };
}

export type SequenceVue = {
  id: string;
  cle: string;
  nom: string;
  description: string | null;
  declencheur: string;
  active: boolean;
  etapes: { id: string; ordre: number; delai_jours: number; sujet: string; corps: string }[];
  inscrits: number;
};

export async function listerSequences(): Promise<SequenceVue[]> {
  const sql = await getDb();
  if (!sql) return [];
  try {
    await semerSequences();
    const seqs = await sql<Omit<SequenceVue, "etapes" | "inscrits">[]>`
      SELECT id, cle, nom, description, declencheur, active FROM sequences ORDER BY cle
    `;
    const out: SequenceVue[] = [];
    for (const s of seqs) {
      const etapes = await sql<SequenceVue["etapes"]>`
        SELECT id, ordre, delai_jours, sujet, corps FROM sequence_etapes
        WHERE sequence_id = ${s.id} ORDER BY ordre
      `;
      const [c] = await sql<{ n: string }[]>`
        SELECT COUNT(*) AS n FROM inscriptions WHERE sequence_id = ${s.id} AND statut = 'active'
      `;
      out.push({ ...s, etapes, inscrits: Number(c?.n ?? 0) });
    }
    return out;
  } catch (e) {
    console.error("[crm] listerSequences:", e);
    return [];
  }
}

export async function basculerSequence(id: string, active: boolean): Promise<boolean> {
  const sql = await getDb();
  if (!sql) return false;
  try {
    await sql`UPDATE sequences SET active = ${active} WHERE id = ${id}`;
    return true;
  } catch (e) {
    console.error("[crm] basculerSequence:", e);
    return false;
  }
}

export async function majEtape(
  id: string,
  champs: { sujet: string; corps: string; delai_jours: number },
): Promise<boolean> {
  const sql = await getDb();
  if (!sql) return false;
  try {
    await sql`
      UPDATE sequence_etapes
      SET sujet = ${champs.sujet}, corps = ${champs.corps},
          delai_jours = ${Math.max(0, Math.min(365, champs.delai_jours))}
      WHERE id = ${id}
    `;
    return true;
  } catch (e) {
    console.error("[crm] majEtape:", e);
    return false;
  }
}

export type LigneEnvoi = {
  id: string;
  contact_id: string | null;
  destinataire: string;
  sujet: string;
  statut: string;
  erreur: string | null;
  envoye_le: Date;
};

export async function listerEnvois(limite = 200): Promise<LigneEnvoi[]> {
  const sql = await getDb();
  if (!sql) return [];
  try {
    return await sql<LigneEnvoi[]>`
      SELECT id, contact_id, destinataire, sujet, statut, erreur, envoye_le
      FROM envois ORDER BY envoye_le DESC LIMIT ${limite}
    `;
  } catch (e) {
    console.error("[crm] listerEnvois:", e);
    return [];
  }
}
