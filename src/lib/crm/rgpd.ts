import { getDb } from "./db";

/**
 * Droits RGPD en libre-service.
 *
 * Une personne peut, depuis le site, obtenir une copie de ses données (droit
 * d'accès) ou en demander l'effacement (droit à l'oubli). Le point délicat est
 * la vérification : on doit être sûr que c'est bien la personne concernée, sans
 * créer de compte. La solution est un lien signé envoyé à son adresse — seule
 * la personne qui relève cette boîte peut agir.
 *
 * Le jeton est sans état : il porte l'adresse et une expiration, signés en
 * HMAC. Aucune table à tenir, et il devient inutilisable au bout d'une heure.
 */

const DUREE_MS = 60 * 60 * 1000; // 1 heure

function secret(): string {
  return process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || "";
}

function b64url(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64url");
}

async function signer(donnee: string): Promise<string> {
  const cle = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", cle, new TextEncoder().encode(donnee));
  return b64url(new Uint8Array(sig));
}

function egalConstant(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Fabrique le jeton porté par le lien de vérification. */
export async function creerJeton(email: string): Promise<string> {
  const charge = `${Buffer.from(email.trim().toLowerCase()).toString("base64url")}.${Date.now() + DUREE_MS}`;
  return `${charge}.${await signer(charge)}`;
}

/** Renvoie l'adresse portée par un jeton valide, ou `null`. */
export async function lireJeton(jeton: string): Promise<string | null> {
  if (!jeton || !secret()) return null;
  const bouts = jeton.split(".");
  if (bouts.length !== 3) return null;
  const [emailB64, expiration, signature] = bouts;
  if (!/^\d+$/.test(expiration)) return null;
  if (Number(expiration) < Date.now()) return null;
  if (!egalConstant(await signer(`${emailB64}.${expiration}`), signature)) return null;
  try {
    return Buffer.from(emailB64, "base64url").toString("utf8");
  } catch {
    return null;
  }
}

// ─── Accès ──────────────────────────────────────────────────────────────────

export type DossierPersonnel = {
  contact: Record<string, unknown>;
  evenements: Record<string, unknown>[];
  questionnaires: Record<string, unknown>[];
  participations: Record<string, unknown>[];
  propositions: Record<string, unknown>[];
  temoignages: Record<string, unknown>[];
};

/** Existe-t-il un contact pour cette adresse ? (sans divulguer lequel.) */
export async function contactExiste(email: string): Promise<boolean> {
  const sql = await getDb();
  if (!sql) return false;
  try {
    const [l] = await sql<{ n: number }[]>`
      SELECT COUNT(*)::int AS n FROM contacts WHERE email = ${email.trim().toLowerCase()}
    `;
    return (l?.n ?? 0) > 0;
  } catch {
    return false;
  }
}

/** Rassemble tout ce que la base sait d'une personne. */
export async function dossier(email: string): Promise<DossierPersonnel | null> {
  const sql = await getDb();
  if (!sql) return null;
  const e = email.trim().toLowerCase();
  try {
    const [contact] = await sql<Record<string, unknown>[]>`
      SELECT * FROM contacts WHERE email = ${e}
    `;
    if (!contact) return null;
    const id = contact.id as string | number;
    const [evenements, questionnaires, participations, propositions, temoignages] =
      await Promise.all([
        sql`SELECT type, libelle, cree_le FROM evenements WHERE contact_id = ${id} ORDER BY cree_le`,
        sql`SELECT reponses, score, eligible, rdv_le, cree_le FROM questionnaires WHERE contact_id = ${id} ORDER BY cree_le`,
        sql`SELECT stage_id, statut, message, cree_le FROM participations WHERE contact_id = ${id} ORDER BY cree_le`,
        sql`SELECT intitule, montant_cents, statut, cree_le FROM offres WHERE contact_id = ${id} ORDER BY cree_le`,
        sql`SELECT nom, texte, note, statut, cree_le FROM temoignages WHERE contact_id = ${id} ORDER BY cree_le`,
      ]);
    return {
      contact: contact as Record<string, unknown>,
      evenements: evenements as Record<string, unknown>[],
      questionnaires: questionnaires as Record<string, unknown>[],
      participations: participations as Record<string, unknown>[],
      propositions: propositions as Record<string, unknown>[],
      temoignages: temoignages as Record<string, unknown>[],
    };
  } catch (err) {
    console.error("[crm] dossier RGPD:", err);
    return null;
  }
}

// ─── Effacement ───────────────────────────────────────────────────────────

/**
 * Efface les données personnelles d'un contact.
 *
 * On supprime ce qui est intrinsèquement personnel (chronologie,
 * questionnaires, participations, propositions, témoignages non publiés) et on
 * anonymise la fiche elle-même plutôt que de la détruire : la ligne demeure,
 * vidée de toute donnée identifiante, ce qui préserve l'intégrité des comptes
 * agrégés tout en satisfaisant le droit à l'oubli. L'adresse est remplacée par
 * un marqueur non nominatif.
 *
 * Renvoie `true` si un contact a bien été traité.
 */
export async function effacer(email: string): Promise<boolean> {
  const sql = await getDb();
  if (!sql) return false;
  const e = email.trim().toLowerCase();
  try {
    const [contact] = await sql<{ id: string }[]>`SELECT id FROM contacts WHERE email = ${e}`;
    if (!contact) return false;
    const id = contact.id;

    await sql`DELETE FROM questionnaires WHERE contact_id = ${id}`;
    await sql`DELETE FROM participations WHERE contact_id = ${id}`;
    await sql`DELETE FROM inscriptions WHERE contact_id = ${id}`;
    await sql`DELETE FROM offres WHERE contact_id = ${id}`;
    // Les témoignages publiés sont détachés (contact_id devient NULL) mais
    // restent en ligne s'ils l'étaient ; les autres partent.
    await sql`DELETE FROM temoignages WHERE contact_id = ${id} AND statut <> 'publie'`;
    await sql`UPDATE temoignages SET contact_id = NULL WHERE contact_id = ${id}`;
    await sql`DELETE FROM evenements WHERE contact_id = ${id}`;

    await sql`
      UPDATE contacts SET
        email = ${`efface-${id}@rgpd.local`},
        prenom = NULL, nom = NULL, telephone = NULL,
        message = NULL, notes = NULL, interet = NULL,
        utm_source = NULL, utm_medium = NULL, utm_campaign = NULL,
        referent = NULL, page_entree = NULL, jeton_parrainage = NULL,
        statut = 'perdu', consentement = FALSE, desabonne_le = NOW(), maj_le = NOW()
      WHERE id = ${id}
    `;
    return true;
  } catch (err) {
    console.error("[crm] effacement RGPD:", err);
    return false;
  }
}
