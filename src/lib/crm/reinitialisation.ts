import { getDb } from "./db";

/**
 * Vider le fichier — remettre la base à l'état d'avant les premiers essais.
 *
 * Un tableau de bord se rode avec de fausses fiches, des envois de test et des
 * questionnaires remplis pour voir. Le jour de la mise en service, tout cela
 * doit disparaître d'un coup, sans laisser de moitiés : un contact effacé dont
 * les envois resteraient fausserait tous les taux du tableau de bord.
 *
 * Ce qui part : les personnes et tout ce qui s'y rattache — chronologies,
 * questionnaires, places de stage, propositions, témoignages, inscriptions aux
 * séquences, journal des envois, campagnes écrites.
 *
 * Ce qui reste, et c'est délibéré :
 *
 *   · les séquences et leurs e-mails — c'est du réglage, pas de la donnée, et
 *     les réécrire coûterait une soirée ;
 *   · le catalogue des stages, avec ses places et sa logistique ;
 *   · les comptes du tableau de bord ;
 *   · le journal d'audit, où cette opération s'inscrit elle-même. Effacer les
 *     traces en même temps que les données serait le seul geste vraiment
 *     irrattrapable.
 *
 * L'opération est irréversible. Le filet, c'est la sauvegarde : la copie
 * quotidienne part par e-mail avec le fichier complet en pièce jointe, et
 * l'export CSV se télécharge en un clic. L'écran qui appelle cette fonction le
 * rappelle avant de la lancer.
 */

/** Les tables vidées, dans l'ordre où elles doivent l'être. */
export const TABLES_VIDEES = [
  "envois",
  "inscriptions",
  "evenements",
  "questionnaires",
  "participations",
  "offres",
  "temoignages",
  "campagnes",
  "contacts",
] as const;

export type Purge = { table: string; lignes: number }[];

/**
 * Vide les tables de personnes, en une seule transaction : ou tout part, ou
 * rien ne bouge. Renvoie le compte par table, ou `null` si la base est
 * absente ou si la transaction a échoué.
 */
export async function viderLeFichier(): Promise<Purge | null> {
  const sql = await getDb();
  if (!sql) return null;

  try {
    return await sql.begin(async (tx) => {
      // Les noms de tables ne peuvent pas être des paramètres : ces neuf
      // instructions sont écrites en toutes lettres, dans l'ordre des clés
      // étrangères, plutôt que fabriquées à partir d'une liste.
      const envois = await tx`DELETE FROM envois`;
      const inscriptions = await tx`DELETE FROM inscriptions`;
      const evenements = await tx`DELETE FROM evenements`;
      const questionnaires = await tx`DELETE FROM questionnaires`;
      const participations = await tx`DELETE FROM participations`;
      const offres = await tx`DELETE FROM offres`;
      const temoignages = await tx`DELETE FROM temoignages`;
      const campagnes = await tx`DELETE FROM campagnes`;
      const contacts = await tx`DELETE FROM contacts`;

      return [
        { table: "contacts", lignes: contacts.count },
        { table: "envois", lignes: envois.count },
        { table: "campagnes", lignes: campagnes.count },
        { table: "inscriptions", lignes: inscriptions.count },
        { table: "chronologies", lignes: evenements.count },
        { table: "questionnaires", lignes: questionnaires.count },
        { table: "places de stage", lignes: participations.count },
        { table: "propositions", lignes: offres.count },
        { table: "témoignages", lignes: temoignages.count },
      ];
    });
  } catch (e) {
    console.error("[crm] viderLeFichier:", e);
    return null;
  }
}

/** Combien de lignes le vidage emporterait aujourd'hui, sans rien toucher. */
export async function compterAvantVidage(): Promise<Purge | null> {
  const sql = await getDb();
  if (!sql) return null;
  try {
    const [l] = await sql<Record<string, number>[]>`
      SELECT
        (SELECT COUNT(*) FROM contacts)::int       AS contacts,
        (SELECT COUNT(*) FROM envois)::int         AS envois,
        (SELECT COUNT(*) FROM campagnes)::int      AS campagnes,
        (SELECT COUNT(*) FROM inscriptions)::int   AS inscriptions,
        (SELECT COUNT(*) FROM evenements)::int     AS evenements,
        (SELECT COUNT(*) FROM questionnaires)::int AS questionnaires,
        (SELECT COUNT(*) FROM participations)::int AS participations,
        (SELECT COUNT(*) FROM offres)::int         AS offres,
        (SELECT COUNT(*) FROM temoignages)::int    AS temoignages
    `;
    if (!l) return null;
    return [
      { table: "contacts", lignes: Number(l.contacts) },
      { table: "envois", lignes: Number(l.envois) },
      { table: "campagnes", lignes: Number(l.campagnes) },
      { table: "inscriptions", lignes: Number(l.inscriptions) },
      { table: "chronologies", lignes: Number(l.evenements) },
      { table: "questionnaires", lignes: Number(l.questionnaires) },
      { table: "places de stage", lignes: Number(l.participations) },
      { table: "propositions", lignes: Number(l.offres) },
      { table: "témoignages", lignes: Number(l.temoignages) },
    ];
  } catch (e) {
    console.error("[crm] compterAvantVidage:", e);
    return null;
  }
}
