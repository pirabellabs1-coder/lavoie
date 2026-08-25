import { Resend } from "resend";
import { SITE } from "@/lib/site";
import { getDb } from "./db";
import { habiller } from "./email";
import { inscrireASequence } from "./sequences";

/**
 * Double opt-in des inscriptions marketing.
 *
 * Une inscription aux Lettres ou au guide ne vaut consentement qu'une fois
 * confirmée par un clic dans un e-mail. Tant que ce n'est pas fait, aucune
 * séquence ne démarre. C'est ce qui écarte les fausses adresses et les fautes
 * de frappe (bon pour la délivrabilité), et ce qui fournit une preuve de
 * consentement — date et adresse — en cas de contrôle.
 *
 * Le jeton de confirmation est sans état : il porte l'adresse, la séquence à
 * lancer et la source, signés en HMAC. Aucune table à tenir, et il vaut sept
 * jours — le temps de tomber sur l'e-mail.
 *
 * Les autres formulaires (contact, questionnaire, demande de stage) ne passent
 * pas par ici : ce sont des demandes explicites, où le consentement est direct.
 */

const DUREE_MS = 7 * 24 * 60 * 60 * 1000; // 7 jours
const FROM =
  process.env.RESEND_FROM || "La Voie 2 la Conscience <onboarding@resend.dev>";

function secret(): string {
  return process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || "";
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
  return Buffer.from(sig).toString("base64url");
}

function egalConstant(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export type Intention = { email: string; sequence: string; source: string };

/** Fabrique le jeton porté par le lien de confirmation. */
export async function creerJeton(i: Intention): Promise<string> {
  const charge = [
    Buffer.from(i.email.trim().toLowerCase()).toString("base64url"),
    Buffer.from(i.sequence).toString("base64url"),
    Buffer.from(i.source).toString("base64url"),
    Date.now() + DUREE_MS,
  ].join(".");
  return `${charge}.${await signer(charge)}`;
}

export async function lireJeton(jeton: string): Promise<Intention | null> {
  if (!jeton || !secret()) return null;
  const bouts = jeton.split(".");
  if (bouts.length !== 5) return null;
  const [emailB64, seqB64, sourceB64, expiration, signature] = bouts;
  if (!/^\d+$/.test(expiration) || Number(expiration) < Date.now()) return null;
  const charge = `${emailB64}.${seqB64}.${sourceB64}.${expiration}`;
  if (!egalConstant(await signer(charge), signature)) return null;
  try {
    return {
      email: Buffer.from(emailB64, "base64url").toString("utf8"),
      sequence: Buffer.from(seqB64, "base64url").toString("utf8"),
      source: Buffer.from(sourceB64, "base64url").toString("utf8"),
    };
  } catch {
    return null;
  }
}

/**
 * Place un contact en attente de confirmation : consentement retiré tant que
 * le clic n'a pas eu lieu. N'affecte pas quelqu'un déjà confirmé — se
 * réinscrire aux Lettres ne redemande pas de reconfirmer.
 */
export async function mettreEnAttente(contactId: string): Promise<void> {
  const sql = await getDb();
  if (!sql) return;
  try {
    await sql`
      UPDATE contacts
      SET consentement = FALSE, maj_le = NOW()
      WHERE id = ${contactId} AND confirme_le IS NULL
    `;
  } catch (e) {
    console.error("[crm] mettreEnAttente:", e);
  }
}

/** Envoie l'e-mail de confirmation. `contexte` décrit ce qu'on confirme. */
export async function envoyerConfirmation(entree: {
  email: string;
  prenom?: string;
  sequence: string;
  source: string;
  contexte: string;
}): Promise<void> {
  if (!process.env.RESEND_API_KEY) return;

  const lien = `${SITE.url}/confirmer?t=${encodeURIComponent(
    await creerJeton({ email: entree.email, sequence: entree.sequence, source: entree.source }),
  )}`;

  const { html, text } = habiller({
    email: entree.email,
    apercu: "Un dernier clic pour confirmer votre inscription.",
    texte:
      `Bonjour ${entree.prenom ?? ""},\n\n` +
      `Il ne reste qu'une chose à faire pour confirmer ${entree.contexte} : cliquer sur ce lien.\n\n` +
      `${lien}\n\n` +
      `Ce simple clic nous assure que c'est bien vous, et que votre adresse est juste. Sans lui, nous ne vous enverrons rien.\n\n` +
      `Si vous n'êtes pas à l'origine de cette demande, ignorez ce message : rien ne partira.`,
  });

  try {
    await new Resend(process.env.RESEND_API_KEY).emails.send({
      from: FROM,
      to: entree.email,
      subject: "Confirmez votre inscription",
      html,
      text,
    });
  } catch (e) {
    console.error("[crm] envoyerConfirmation:", e);
  }
}

export type Confirmation = { prenom: string | null; sequence: string; deja: boolean } | null;

/**
 * Confirme un contact à partir d'un jeton : pose la date de confirmation, rend
 * le consentement, inscrit à la séquence et journalise le consentement. Renvoie
 * le prénom pour la page de remerciement, ou `null` si le jeton est mauvais.
 */
export async function confirmer(jeton: string): Promise<Confirmation> {
  const i = await lireJeton(jeton);
  if (!i) return null;

  const sql = await getDb();
  if (!sql) return null;

  try {
    const [contact] = await sql<{ id: string; prenom: string | null; deja: boolean }[]>`
      SELECT id, prenom, (confirme_le IS NOT NULL) AS deja
      FROM contacts WHERE email = ${i.email.trim().toLowerCase()}
    `;
    if (!contact) return null;

    if (contact.deja) {
      return { prenom: contact.prenom, sequence: i.sequence, deja: true };
    }

    await sql`
      UPDATE contacts
      SET confirme_le = NOW(), consentement = TRUE, desabonne_le = NULL, maj_le = NOW()
      WHERE id = ${contact.id}
    `;
    await sql`
      INSERT INTO evenements (contact_id, type, libelle)
      VALUES (${contact.id}, 'consentement', ${`Inscription confirmée (double opt-in) — ${i.source}`})
    `;

    await inscrireASequence(contact.id, i.sequence);

    return { prenom: contact.prenom, sequence: i.sequence, deja: false };
  } catch (e) {
    console.error("[crm] confirmer:", e);
    return null;
  }
}
