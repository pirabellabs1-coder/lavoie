import { getDb } from "./db";
import type { Reponses } from "@/lib/questionnaire";

/**
 * Les copies du questionnaire de préparation, et le cadre qui va avec.
 *
 * Chaque envoi crée une ligne portant un jeton : c'est lui qui fait le lien
 * personnel envoyé par e-mail (« j'ai visionné la vidéo et pris le livret »).
 * Il est tiré au sort, ne se devine pas, et n'expose rien d'autre que la
 * validation des prérequis.
 */

export type Questionnaire = {
  id: string;
  contact_id: string;
  jeton: string;
  reponses: Reponses;
  score: number;
  eligible: boolean;
  rdv_le: Date | null;
  prerequis_le: Date | null;
  annule_le: Date | null;
  cree_le: Date;
};

function nouveauJeton(): string {
  const octets = new Uint8Array(24);
  crypto.getRandomValues(octets);
  return Array.from(octets, (o) => o.toString(16).padStart(2, "0")).join("");
}

export async function enregistrerQuestionnaire(entree: {
  contactId: string;
  reponses: Reponses;
  score: number;
  eligible: boolean;
}): Promise<{ id: string; jeton: string } | null> {
  const sql = await getDb();
  if (!sql) return null;
  const jeton = nouveauJeton();
  try {
    const [ligne] = await sql<{ id: string }[]>`
      INSERT INTO questionnaires (contact_id, jeton, reponses, score, eligible)
      VALUES (${entree.contactId}, ${jeton}, ${JSON.stringify(entree.reponses)}::jsonb,
              ${entree.score}, ${entree.eligible})
      RETURNING id
    `;
    return ligne ? { id: String(ligne.id), jeton } : null;
  } catch (e) {
    console.error("[crm] enregistrerQuestionnaire:", e);
    return null;
  }
}

export type VueJeton = {
  id: string;
  contact_id: string;
  prenom: string | null;
  email: string;
  eligible: boolean;
  rdv_le: Date | null;
  prerequis_le: Date | null;
  annule_le: Date | null;
};

/** Retrouve une copie à partir du lien personnel reçu par e-mail. */
export async function parJeton(jeton: string): Promise<VueJeton | null> {
  const sql = await getDb();
  if (!sql) return null;
  if (!/^[a-f0-9]{48}$/.test(jeton)) return null;
  try {
    const [ligne] = await sql<VueJeton[]>`
      SELECT q.id, q.contact_id, c.prenom, c.email,
             q.eligible, q.rdv_le, q.prerequis_le, q.annule_le
      FROM questionnaires q
      JOIN contacts c ON c.id = q.contact_id
      WHERE q.jeton = ${jeton}
      LIMIT 1
    `;
    return ligne ?? null;
  } catch (e) {
    console.error("[crm] parJeton:", e);
    return null;
  }
}

/**
 * Enregistre la confirmation des prérequis. Idempotent : recliquer sur le lien
 * ne change pas la date déjà posée.
 */
export async function confirmerPrerequis(jeton: string): Promise<boolean> {
  const sql = await getDb();
  if (!sql) return false;
  if (!/^[a-f0-9]{48}$/.test(jeton)) return false;
  try {
    const rows = await sql<{ contact_id: string }[]>`
      UPDATE questionnaires
      SET prerequis_le = COALESCE(prerequis_le, NOW()), annule_le = NULL
      WHERE jeton = ${jeton}
      RETURNING contact_id
    `;
    const ligne = rows[0];
    if (!ligne) return false;

    // Plus rien à relancer : la séquence de rappel s'arrête ici.
    await sql`
      UPDATE inscriptions SET statut = 'terminee'
      WHERE contact_id = ${ligne.contact_id}
        AND statut = 'active'
        AND sequence_id = (SELECT id FROM sequences WHERE cle = 'prerequis')
    `;

    await sql`
      INSERT INTO evenements (contact_id, type, libelle)
      VALUES (${ligne.contact_id}, 'prerequis', 'Prérequis confirmés (vidéo et livret)')
    `;
    return true;
  } catch (e) {
    console.error("[crm] confirmerPrerequis:", e);
    return false;
  }
}

/** La dernière copie d'un contact, pour l'afficher dans sa fiche. */
export async function dernierQuestionnaire(
  contactId: string,
): Promise<Questionnaire | null> {
  const sql = await getDb();
  if (!sql) return null;
  try {
    const [ligne] = await sql<Questionnaire[]>`
      SELECT * FROM questionnaires
      WHERE contact_id = ${contactId}
      ORDER BY cree_le DESC
      LIMIT 1
    `;
    return ligne ?? null;
  } catch (e) {
    console.error("[crm] dernierQuestionnaire:", e);
    return null;
  }
}

/** Fixe (ou efface) la date du rendez-vous, saisie depuis la fiche du contact. */
export async function definirRdv(id: string, quand: Date | null): Promise<boolean> {
  const sql = await getDb();
  if (!sql) return false;
  try {
    const rows = await sql<{ contact_id: string }[]>`
      UPDATE questionnaires
      SET rdv_le = ${quand}, annule_le = NULL
      WHERE id = ${id}
      RETURNING contact_id
    `;
    const ligne = rows[0];
    if (!ligne) return false;
    await sql`
      INSERT INTO evenements (contact_id, type, libelle)
      VALUES (${ligne.contact_id}, 'rdv',
              ${quand ? `Rendez-vous fixé au ${quand.toLocaleString("fr-FR")}` : "Rendez-vous retiré"})
    `;
    return true;
  } catch (e) {
    console.error("[crm] definirRdv:", e);
    return false;
  }
}

/**
 * La clause d'annulation, appliquée par le worker quotidien : un rendez-vous
 * qui a lieu dans moins de 24 heures sans prérequis confirmés est annulé, la
 * place est rendue, et le contact repasse en « perdu » — statut qu'un simple
 * changement à la main suffit à rattraper si la personne se manifeste.
 *
 * Renvoie les personnes concernées pour que l'appelant les prévienne.
 */
export type Annulation = { contact_id: string; email: string; prenom: string | null };

export async function annulerFauteDeConfirmation(): Promise<Annulation[]> {
  const sql = await getDb();
  if (!sql) return [];
  try {
    const lignes = await sql<Annulation[]>`
      UPDATE questionnaires q
      SET annule_le = NOW()
      FROM contacts c
      WHERE c.id = q.contact_id
        AND q.rdv_le IS NOT NULL
        AND q.rdv_le > NOW()
        AND q.rdv_le < NOW() + INTERVAL '24 hours'
        AND q.prerequis_le IS NULL
        AND q.annule_le IS NULL
      RETURNING q.contact_id, c.email, c.prenom
    `;
    for (const l of lignes) {
      await sql`
        INSERT INTO evenements (contact_id, type, libelle)
        VALUES (${l.contact_id}, 'rdv', 'Rendez-vous annulé — prérequis non confirmés la veille')
      `;
    }
    return lignes;
  } catch (e) {
    console.error("[crm] annulerFauteDeConfirmation:", e);
    return [];
  }
}
