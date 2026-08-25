import { getDb } from "./db";
import type { Identite } from "./session";

/**
 * Le journal d'audit.
 *
 * Trace ce qui touche aux données sensibles et à l'argent : changements de
 * statut, export du fichier, envois de propositions et de campagnes, gestion
 * des comptes, droits RGPD exercés. Le but n'est pas de surveiller le travail
 * courant, mais de pouvoir répondre à « qui a fait ça, et quand » — pour une
 * réclamation, un doute, ou une obligation légale.
 *
 * Écriture silencieuse : une trace qui échoue ne doit jamais empêcher l'action
 * elle-même d'aboutir.
 */

export type LigneJournal = {
  id: string;
  acteur_id: string;
  acteur_nom: string;
  action: string;
  cible: string | null;
  details: string | null;
  ip: string | null;
  cree_le: Date;
};

/** Enregistre une action au nom d'une identité connectée. */
export async function tracer(
  qui: Identite | null,
  action: string,
  cible?: string | null,
  details?: string | null,
): Promise<void> {
  await ecrire(qui?.id ?? "?", qui?.nom ?? "Inconnu", action, cible, details);
}

/**
 * Trace une action sans identité de tableau de bord (côté public : une
 * personne qui exerce ses droits RGPD, par exemple).
 */
export async function tracerPublic(
  acteurNom: string,
  action: string,
  cible?: string | null,
  details?: string | null,
): Promise<void> {
  await ecrire("public", acteurNom, action, cible, details);
}

async function ecrire(
  acteurId: string,
  acteurNom: string,
  action: string,
  cible?: string | null,
  details?: string | null,
): Promise<void> {
  const sql = await getDb();
  if (!sql) return;
  try {
    await sql`
      INSERT INTO journal (acteur_id, acteur_nom, action, cible, details)
      VALUES (${acteurId}, ${acteurNom}, ${action}, ${cible ?? null}, ${details ?? null})
    `;
  } catch (e) {
    console.error("[crm] journal:", e);
  }
}

export type FiltreJournal = { recherche?: string; limite?: number };

export async function listerJournal(f: FiltreJournal = {}): Promise<LigneJournal[]> {
  const sql = await getDb();
  if (!sql) return [];
  const limite = Math.min(f.limite ?? 200, 1000);
  const recherche = f.recherche?.trim() ? `%${f.recherche.trim()}%` : null;
  try {
    return await sql<LigneJournal[]>`
      SELECT id, acteur_id, acteur_nom, action, cible, details, ip, cree_le
      FROM journal
      WHERE (${recherche}::text IS NULL
             OR acteur_nom ILIKE ${recherche}
             OR action ILIKE ${recherche}
             OR COALESCE(cible, '') ILIKE ${recherche}
             OR COALESCE(details, '') ILIKE ${recherche})
      ORDER BY cree_le DESC
      LIMIT ${limite}
    `;
  } catch (e) {
    console.error("[crm] listerJournal:", e);
    return [];
  }
}
