import { Resend } from "resend";
import { SITE } from "@/lib/site";
import { getDb } from "./db";
import { habiller } from "./email";
import { EXPEDITEUR } from "./sequences";

/**
 * Demander un avis à quelqu'un en particulier.
 *
 * Le formulaire public existait déjà, mais il était anonyme : une page ouverte
 * à tous, où le témoignage arrivait détaché de la personne qui l'avait écrit.
 * Il manquait le geste le plus courant — envoyer un lien à quelqu'un dont on
 * sait qu'il a quelque chose à dire.
 *
 * Le lien porte un jeton signé qui dit *qui* écrit. Trois conséquences :
 *
 *   · la personne n'a pas à retaper son nom, il est déjà là ;
 *   · le témoignage arrive rattaché à sa fiche, donc à son parcours ;
 *   · on sait qui a été sollicité, et qui n'a pas encore répondu.
 *
 * Le jeton est sans état, comme celui du double opt-in : il porte l'identifiant
 * et l'adresse, signés en HMAC, et vaut soixante jours. Aucune table à tenir,
 * et un lien qui traîne dans une vieille conversation finit par expirer.
 */

const DUREE_MS = 60 * 24 * 60 * 60 * 1000; // 60 jours

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

export type Invitation = { contactId: string; email: string };

export async function creerJetonAvis(i: Invitation): Promise<string> {
  const charge = [
    Buffer.from(i.contactId).toString("base64url"),
    Buffer.from(i.email.trim().toLowerCase()).toString("base64url"),
    Date.now() + DUREE_MS,
  ].join(".");
  return `${charge}.${await signer(charge)}`;
}

export async function lireJetonAvis(jeton: string): Promise<Invitation | null> {
  if (!jeton || !secret()) return null;
  const bouts = jeton.split(".");
  if (bouts.length !== 4) return null;
  const [idB64, emailB64, expiration, signature] = bouts;
  if (!/^\d+$/.test(expiration) || Number(expiration) < Date.now()) return null;
  const charge = `${idB64}.${emailB64}.${expiration}`;
  if (!egalConstant(await signer(charge), signature)) return null;
  try {
    return {
      contactId: Buffer.from(idB64, "base64url").toString("utf8"),
      email: Buffer.from(emailB64, "base64url").toString("utf8"),
    };
  } catch {
    return null;
  }
}

/** L'adresse personnelle où déposer son avis. */
export async function lienAvis(contactId: string, email: string): Promise<string> {
  return `${SITE.url}/avis/${encodeURIComponent(await creerJetonAvis({ contactId, email }))}`;
}

export type Invite = {
  id: string;
  prenom: string | null;
  nom: string | null;
  email: string;
  desabonne: boolean;
};

/** La personne derrière un jeton, si elle existe encore et que l'adresse colle. */
export async function contactDuJeton(jeton: string): Promise<Invite | null> {
  const i = await lireJetonAvis(jeton);
  if (!i) return null;
  const sql = await getDb();
  if (!sql) return null;
  try {
    const [c] = await sql<
      { id: string; prenom: string | null; nom: string | null; email: string; desabonne_le: Date | null }[]
    >`
      SELECT id, prenom, nom, email, desabonne_le FROM contacts WHERE id = ${i.contactId}
    `;
    // L'adresse doit correspondre : un jeton reste attaché à la personne à qui
    // il a été envoyé, même si la fiche a changé de main depuis.
    if (!c || c.email.toLowerCase() !== i.email.toLowerCase()) return null;
    return {
      id: String(c.id),
      prenom: c.prenom,
      nom: c.nom,
      email: c.email,
      desabonne: c.desabonne_le !== null,
    };
  } catch (e) {
    console.error("[crm] contactDuJeton:", e);
    return null;
  }
}

/** A-t-elle déjà déposé quelque chose ? De quoi ne pas redemander pour rien. */
export async function aDejaTemoigne(contactId: string): Promise<boolean> {
  const sql = await getDb();
  if (!sql) return false;
  try {
    const [l] = await sql<{ n: number }[]>`
      SELECT COUNT(*)::int AS n FROM temoignages WHERE contact_id = ${contactId}
    `;
    return Number(l?.n ?? 0) > 0;
  } catch (e) {
    console.error("[crm] aDejaTemoigne:", e);
    return false;
  }
}

export type ResultatDemande =
  | { ok: true; lien: string }
  | { ok: false; erreur: string };

/**
 * Envoie la demande d'avis et note la date. Un désabonné n'en reçoit pas : son
 * lien personnel reste utilisable si on le lui transmet autrement.
 */
export async function demanderAvis(contactId: string, acteur: string): Promise<ResultatDemande> {
  const sql = await getDb();
  if (!sql) return { ok: false, erreur: "La base de données n'est pas branchée." };

  try {
    const [c] = await sql<
      { id: string; prenom: string | null; email: string; desabonne_le: Date | null }[]
    >`
      SELECT id, prenom, email, desabonne_le FROM contacts WHERE id = ${contactId}
    `;
    if (!c) return { ok: false, erreur: "Cette fiche est introuvable." };
    if (c.desabonne_le) {
      return {
        ok: false,
        erreur: "Cette personne s'est désabonnée : rien ne lui est envoyé automatiquement.",
      };
    }
    if (!process.env.RESEND_API_KEY) {
      return { ok: false, erreur: "L'envoi d'e-mails n'est pas configuré." };
    }

    const lien = await lienAvis(String(c.id), c.email);
    const { html, text } = habiller({
      email: c.email,
      apercu: "Quelques phrases sur ce que vous avez traversé.",
      texte:
        `Bonjour ${c.prenom ?? ""},\n\n` +
        `J'aimerais vous demander quelque chose, et vous êtes libre de dire non.\n\n` +
        `Les personnes qui hésitent à franchir le pas lisent ce que d'autres ont vécu avant elles. Pas des compliments : des phrases concrètes, sur ce qui était difficile, ce qui a bougé, ce que vous en gardez.\n\n` +
        `Quelques lignes suffisent, et le lien ci-dessous vous connaît déjà — vous n'avez rien à retaper :\n\n` +
        `${lien}\n\n` +
        `Rien n'est publié automatiquement : je relis, et vous pouvez demander le retrait à tout moment.\n\n` +
        `Merci du temps que vous y mettrez, s'il vous semble juste de le faire.`,
    });

    await new Resend(process.env.RESEND_API_KEY).emails.send({
      from: EXPEDITEUR,
      to: c.email,
      subject: "Diriez-vous quelques mots de votre expérience ?",
      html,
      text,
    });

    await sql`UPDATE contacts SET avis_demande_le = NOW(), maj_le = NOW() WHERE id = ${c.id}`;
    await sql`
      INSERT INTO evenements (contact_id, type, libelle)
      VALUES (${c.id}, 'avis', ${`Demande d'avis envoyée par ${acteur}`})
    `;

    return { ok: true, lien };
  } catch (e) {
    console.error("[crm] demanderAvis:", e);
    return { ok: false, erreur: "L'envoi a échoué." };
  }
}

export type EnAttente = {
  id: string;
  prenom: string | null;
  nom: string | null;
  email: string;
  avis_demande_le: Date;
};

/** Sollicités, sans réponse. C'est là que se joue la récolte d'avis. */
export async function avisEnAttente(limite = 100): Promise<EnAttente[]> {
  const sql = await getDb();
  if (!sql) return [];
  try {
    return await sql<EnAttente[]>`
      SELECT c.id, c.prenom, c.nom, c.email, c.avis_demande_le
      FROM contacts c
      WHERE c.avis_demande_le IS NOT NULL
        AND NOT EXISTS (SELECT 1 FROM temoignages t WHERE t.contact_id = c.id)
      ORDER BY c.avis_demande_le DESC
      LIMIT ${limite}
    `;
  } catch (e) {
    console.error("[crm] avisEnAttente:", e);
    return [];
  }
}
