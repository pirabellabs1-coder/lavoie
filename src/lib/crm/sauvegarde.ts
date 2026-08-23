import { Resend } from "resend";
import { SITE } from "@/lib/site";
import { getDb } from "./db";
import { habiller } from "./email";
import { exporterCsv } from "./contacts";
import { EXPEDITEUR } from "./sequences";

/**
 * La sauvegarde.
 *
 * Le filet de sécurité était jusqu'ici un export CSV que quelqu'un devait
 * penser à faire. Il part maintenant tout seul, par e-mail, avec le fichier
 * complet en pièce jointe : la copie vit ailleurs que sur le serveur qui
 * l'héberge, ce qui est le seul point qui compte le jour où l'on en a besoin.
 *
 * Deux détails qui évitent le bruit et les mauvaises surprises :
 *
 *   · rien ne repart si le contenu n'a pas bougé depuis la dernière fois
 *     (comparaison d'empreinte) — une base au repos n'inonde pas la boîte ;
 *
 *   · les empreintes de mots de passe des comptes ne sont jamais exportées.
 *     Une sauvegarde restaurée demandera de redonner un mot de passe à chacun,
 *     ce qui est infiniment préférable à des empreintes qui traînent en pièce
 *     jointe.
 */

const DESTINATAIRE = "contact@lavoie2laconscience.com";
const TAILLE_MAX = 8 * 1024 * 1024;

export type Sauvegarde = {
  json: string;
  csv: string;
  empreinte: string;
  contacts: number;
  taille: number;
};

async function empreinteDe(contenu: string): Promise<string> {
  const bits = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(contenu));
  return Array.from(new Uint8Array(bits), (o) => o.toString(16).padStart(2, "0")).join("");
}

/** Lit toute la base et en fait un JSON restaurable, plus le CSV des contacts. */
export async function construireSauvegarde(): Promise<Sauvegarde | null> {
  const sql = await getDb();
  if (!sql) return null;

  try {
    const [
      contacts,
      evenements,
      questionnaires,
      sequences,
      etapes,
      inscriptions,
      envois,
      campagnes,
      utilisateurs,
    ] = await Promise.all([
      sql`SELECT * FROM contacts ORDER BY id`,
      sql`SELECT * FROM evenements ORDER BY id`,
      sql`SELECT * FROM questionnaires ORDER BY id`,
      sql`SELECT * FROM sequences ORDER BY id`,
      sql`SELECT * FROM sequence_etapes ORDER BY id`,
      sql`SELECT * FROM inscriptions ORDER BY id`,
      sql`SELECT * FROM envois ORDER BY id`,
      sql`SELECT * FROM campagnes ORDER BY id`,
      // Sans la colonne `empreinte` : voir l'en-tête du fichier.
      sql`SELECT id, email, nom, role, actif, cree_le, derniere_connexion_le
          FROM utilisateurs ORDER BY id`,
    ]);

    const contenu = {
      site: SITE.url,
      tables: {
        contacts,
        evenements,
        questionnaires,
        sequences,
        sequence_etapes: etapes,
        inscriptions,
        envois,
        campagnes,
        utilisateurs,
      },
    };

    const json = JSON.stringify(contenu, null, 2);
    const csv = await exporterCsv();

    return {
      json,
      csv,
      // L'empreinte ignore la date de génération : deux journées sans activité
      // donnent bien le même résultat.
      empreinte: await empreinteDe(json),
      contacts: contacts.length,
      taille: Buffer.byteLength(json, "utf8"),
    };
  } catch (e) {
    console.error("[crm] construireSauvegarde:", e);
    return null;
  }
}

export type DerniereSauvegarde = {
  cree_le: Date;
  contacts_n: number;
  taille: number;
  envoyee: boolean;
};

export async function derniereSauvegarde(): Promise<DerniereSauvegarde | null> {
  const sql = await getDb();
  if (!sql) return null;
  try {
    const [ligne] = await sql<DerniereSauvegarde[]>`
      SELECT cree_le, contacts_n, taille, envoyee
      FROM sauvegardes ORDER BY cree_le DESC LIMIT 1
    `;
    return ligne ?? null;
  } catch (e) {
    console.error("[crm] derniereSauvegarde:", e);
    return null;
  }
}

export type ResultatSauvegarde = "envoyee" | "inchangee" | "impossible";

/** Appelée une fois par jour par le worker. */
export async function sauvegardeQuotidienne(): Promise<ResultatSauvegarde> {
  const sql = await getDb();
  if (!sql) return "impossible";

  const copie = await construireSauvegarde();
  if (!copie) return "impossible";

  try {
    const [precedente] = await sql<{ empreinte: string }[]>`
      SELECT empreinte FROM sauvegardes ORDER BY cree_le DESC LIMIT 1
    `;
    if (precedente?.empreinte === copie.empreinte) return "inchangee";
  } catch (e) {
    console.error("[crm] sauvegarde (lecture précédente):", e);
  }

  let envoyee = false;
  if (process.env.RESEND_API_KEY) {
    const trop = copie.taille > TAILLE_MAX;
    const jour = new Date().toISOString().slice(0, 10);

    const { html, text } = habiller({
      apercu: `Sauvegarde du ${jour} — ${copie.contacts} contacts.`,
      texte:
        `Sauvegarde automatique du ${jour}.\n\n` +
        `${copie.contacts} contacts, ${Math.round(copie.taille / 1024)} Ko de données.\n\n` +
        (trop
          ? `La sauvegarde complète dépasse la taille acceptée en pièce jointe : seul l'export des contacts est joint. Téléchargez la copie complète depuis le tableau de bord.\n\n`
          : `Deux fichiers sont joints : la sauvegarde complète au format JSON, et la liste des contacts au format CSV, ouvrable dans Excel.\n\n`) +
        `Rangez-les ailleurs que dans cette boîte : une sauvegarde qui vit au même endroit que le reste n'en est pas une.\n\n` +
        `Les mots de passe des comptes ne sont pas inclus, volontairement. Après une restauration, il faudra en redonner un à chaque personne.`,
    });

    const pieces = [
      {
        filename: `contacts-v2c-${jour}.csv`,
        content: Buffer.from("﻿" + copie.csv, "utf8"),
      },
      ...(trop
        ? []
        : [
            {
              filename: `sauvegarde-v2c-${jour}.json`,
              content: Buffer.from(copie.json, "utf8"),
            },
          ]),
    ];

    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const { error } = await resend.emails.send({
        from: EXPEDITEUR,
        to: DESTINATAIRE,
        subject: `Sauvegarde du ${jour} — ${copie.contacts} contacts`,
        html,
        text,
        attachments: pieces,
      });
      envoyee = !error;
      if (error) console.error("[crm] sauvegarde non envoyée:", error.message);
    } catch (e) {
      console.error("[crm] sauvegarde non envoyée:", e);
    }
  }

  try {
    await sql`
      INSERT INTO sauvegardes (empreinte, contacts_n, taille, envoyee)
      VALUES (${copie.empreinte}, ${copie.contacts}, ${copie.taille}, ${envoyee})
    `;
  } catch (e) {
    console.error("[crm] sauvegarde (enregistrement):", e);
  }

  return envoyee ? "envoyee" : "impossible";
}
