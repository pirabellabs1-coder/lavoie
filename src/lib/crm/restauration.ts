import { getDb } from "./db";

/**
 * Remettre la base dans l'état d'une sauvegarde.
 *
 * La sauvegarde quotidienne produisait un fichier « restaurable » que rien ne
 * savait relire : le filet n'existait que dans un sens. Depuis qu'un bouton
 * permet de tout vider, ce déséquilibre n'était plus tenable.
 *
 * La restauration remplace, elle ne fusionne pas. Chaque table listée est
 * vidée puis réécrite telle qu'elle était, identifiants compris — c'est la
 * seule façon de conserver les liens entre les fiches, leurs inscriptions,
 * leurs questionnaires et leurs envois. Tout se joue dans une transaction : au
 * moindre accroc, la base reste exactement comme avant.
 *
 * Deux choses ne sont jamais restaurées :
 *
 *   · les comptes du tableau de bord — la sauvegarde ne contient pas les
 *     empreintes de mots de passe (volontairement), les restaurer créerait des
 *     accès inutilisables. Les comptes en place ne sont pas touchés ;
 *   · le journal d'audit, qui doit rester le récit continu de ce qui s'est
 *     passé, y compris de cette restauration.
 */

/**
 * Les tables restaurées, dans l'ordre des dépendances : une inscription a
 * besoin de son contact et de sa séquence.
 */
const TABLES = [
  "contacts",
  "sequences",
  "sequence_etapes",
  "stages",
  "campagnes",
  "evenements",
  "questionnaires",
  "inscriptions",
  "participations",
  "offres",
  "temoignages",
  "envois",
] as const;

type Ligne = Record<string, unknown>;

export type Restauration = { table: string; lignes: number }[];
export type ResultatRestauration =
  | { ok: true; tables: Restauration }
  | { ok: false; erreur: string };

/** Les colonnes réellement présentes aujourd'hui, table par table. */
async function colonnesActuelles(
  sql: NonNullable<Awaited<ReturnType<typeof getDb>>>,
): Promise<Map<string, Set<string>>> {
  const lignes = await sql<{ table_name: string; column_name: string }[]>`
    SELECT table_name, column_name FROM information_schema.columns
    WHERE table_schema = 'public'
  `;
  const par = new Map<string, Set<string>>();
  for (const l of lignes) {
    if (!par.has(l.table_name)) par.set(l.table_name, new Set());
    par.get(l.table_name)!.add(l.column_name);
  }
  return par;
}

/**
 * Une valeur prête pour l'insertion. Les colonnes JSON reviennent du fichier
 * sous forme d'objets : on les repasse en texte, que Postgres saura relire.
 */
function valeur(v: unknown): unknown {
  return v !== null && typeof v === "object" ? JSON.stringify(v) : v;
}

/**
 * Relit un fichier de sauvegarde et remet la base dans cet état. Renvoie le
 * compte par table, ou la raison du refus — jamais une base à moitié écrite.
 */
export async function restaurerSauvegarde(contenu: string): Promise<ResultatRestauration> {
  const sql = await getDb();
  if (!sql) return { ok: false, erreur: "La base de données n'est pas branchée." };

  let tables: Record<string, Ligne[]>;
  try {
    const lu = JSON.parse(contenu) as { tables?: Record<string, Ligne[]> };
    if (!lu || typeof lu !== "object" || !lu.tables || typeof lu.tables !== "object") {
      return { ok: false, erreur: "Ce fichier n'a pas la forme d'une sauvegarde." };
    }
    tables = lu.tables;
  } catch {
    return { ok: false, erreur: "Ce fichier n'est pas un JSON lisible." };
  }

  // Une sauvegarde sans contacts est presque toujours un fichier tronqué ou
  // pris au mauvais endroit : mieux vaut refuser que d'écraser une vraie base.
  if (!Array.isArray(tables.contacts)) {
    return { ok: false, erreur: "Ce fichier ne contient pas de table « contacts »." };
  }

  try {
    const colonnes = await colonnesActuelles(sql);
    const compte: Restauration = [];

    await sql.begin(async (tx) => {
      // On vide dans l'ordre inverse des dépendances — et seulement ce que le
      // fichier sait remplacer. Une sauvegarde ancienne, faite avant que les
      // stages n'entrent dans la copie, ne doit pas les emporter sans retour ;
      // ce qui dépend des contacts, lui, part par cascade de toute façon.
      for (const table of [...TABLES].reverse()) {
        if (!colonnes.has(table) || !Array.isArray(tables[table])) continue;
        await tx`DELETE FROM ${tx(table)}`;
      }

      for (const table of TABLES) {
        const dispo = colonnes.get(table);
        const lignes = tables[table];
        if (!dispo || !Array.isArray(lignes) || !lignes.length) continue;

        // Les colonnes d'une sauvegarde ancienne peuvent ne plus exister ;
        // celles d'aujourd'hui peuvent lui manquer. On garde l'intersection,
        // et les colonnes absentes reprennent leur valeur par défaut.
        const cles = Object.keys(lignes[0]).filter((c) => dispo.has(c));
        if (!cles.length) continue;

        // Par paquets : une seule instruction de dix mille lignes ne passe pas.
        for (let i = 0; i < lignes.length; i += 500) {
          const paquet = lignes.slice(i, i + 500).map((l) => {
            const propre: Ligne = {};
            for (const c of cles) propre[c] = valeur(l[c]);
            return propre;
          });
          await tx`INSERT INTO ${tx(table)} ${tx(paquet, ...cles)}`;
        }

        // Les identifiants sont réécrits tels quels : la séquence qui les
        // distribue doit repartir au-dessus, sinon la prochaine insertion
        // entrerait en collision.
        if (dispo.has("id")) {
          await tx`
            SELECT setval(
              pg_get_serial_sequence(${table}, 'id'),
              GREATEST((SELECT COALESCE(MAX(id), 1) FROM ${tx(table)}), 1)
            )
          `;
        }
        compte.push({ table, lignes: lignes.length });
      }
    });

    return { ok: true, tables: compte };
  } catch (e) {
    console.error("[crm] restaurerSauvegarde:", e);
    return {
      ok: false,
      erreur:
        e instanceof Error
          ? `La restauration a échoué, rien n'a été modifié : ${e.message}`
          : "La restauration a échoué. Rien n'a été modifié.",
    };
  }
}
