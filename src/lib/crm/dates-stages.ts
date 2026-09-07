import { getDb } from "./db";

/**
 * Les jours où un stage est disponible.
 *
 * Un stage n'est pas un rendez-vous unique : le même contenu se donne à
 * plusieurs dates, et c'est la date qui se remplit, pas le stage. C'est ainsi
 * que fonctionne la billetterie que nous remplaçons — on choisit son jour
 * parmi ceux qui restent, chacun avec son état : disponible, dernières places,
 * complet.
 *
 * Un stage sans aucune date reste ouvert à la demande, comme avant : c'est le
 * cas de ceux dont les dates ne sont pas encore fixées.
 */

/** En dessous de ce nombre de places restantes, on prévient que ça se remplit. */
export const SEUIL_DERNIERES = 3;

export type DateStage = {
  id: string;
  stage_id: string;
  debut_le: Date;
  fin_le: Date | null;
  /** Places propres à cette date, ou celles du stage à défaut. */
  places: number;
  ouverte: boolean;
  /** Demandes et confirmations déjà posées sur cette date. */
  prises: number;
};

export type EtatDate = "libre" | "dernieres" | "complet" | "fermee" | "passee";

export function etatDeLaDate(d: DateStage): EtatDate {
  if (new Date(d.debut_le).getTime() < Date.now()) return "passee";
  if (!d.ouverte) return "fermee";
  const restantes = d.places - d.prises;
  if (restantes <= 0) return "complet";
  if (restantes <= SEUIL_DERNIERES) return "dernieres";
  return "libre";
}

export function placesRestantesDate(d: DateStage): number {
  return Math.max(0, d.places - d.prises);
}

/** Toutes les dates d'un stage, avec ce qui est déjà pris sur chacune. */
export async function datesDuStage(stageId: string): Promise<DateStage[]> {
  const sql = await getDb();
  if (!sql) return [];
  try {
    return await sql<DateStage[]>`
      SELECT d.id, d.stage_id, d.debut_le, d.fin_le,
             COALESCE(d.places, s.places)::int AS places,
             d.ouverte,
             COUNT(p.id) FILTER (WHERE p.statut IN ('demande', 'confirmee'))::int AS prises
      FROM stage_dates d
      JOIN stages s ON s.id = d.stage_id
      LEFT JOIN participations p ON p.date_id = d.id
      WHERE d.stage_id = ${stageId}
      GROUP BY d.id, s.places
      ORDER BY d.debut_le
    `;
  } catch (e) {
    console.error("[crm] datesDuStage:", e);
    return [];
  }
}

/** Les dates encore proposables au public, pour un stage désigné par son slug. */
export async function datesOuvertes(slug: string): Promise<DateStage[]> {
  const sql = await getDb();
  if (!sql) return [];
  try {
    const lignes = await sql<DateStage[]>`
      SELECT d.id, d.stage_id, d.debut_le, d.fin_le,
             COALESCE(d.places, s.places)::int AS places,
             d.ouverte,
             COUNT(p.id) FILTER (WHERE p.statut IN ('demande', 'confirmee'))::int AS prises
      FROM stage_dates d
      JOIN stages s ON s.id = d.stage_id
      LEFT JOIN participations p ON p.date_id = d.id
      WHERE s.slug = ${slug} AND s.actif = TRUE AND d.debut_le > NOW()
      GROUP BY d.id, s.places
      ORDER BY d.debut_le
    `;
    // Une date fermée à la main disparaît de la vue publique ; une date
    // complète y reste, barrée : savoir que c'est plein est une information.
    return lignes.filter((d) => d.ouverte);
  } catch (e) {
    console.error("[crm] datesOuvertes:", e);
    return [];
  }
}

/** Ajoute un jour au stage. `debut` est une saisie « datetime-local ». */
export async function ajouterDate(entree: {
  stageId: string;
  debut: Date;
  fin?: Date | null;
  places?: number | null;
}): Promise<boolean> {
  const sql = await getDb();
  if (!sql) return false;
  try {
    await sql`
      INSERT INTO stage_dates (stage_id, debut_le, fin_le, places)
      VALUES (${entree.stageId}, ${entree.debut}, ${entree.fin ?? null},
              ${entree.places && entree.places > 0 ? Math.min(entree.places, 500) : null})
      ON CONFLICT (stage_id, debut_le) DO NOTHING
    `;
    return true;
  } catch (e) {
    console.error("[crm] ajouterDate:", e);
    return false;
  }
}

/** Ouvre ou ferme une date sans la supprimer : les demandes déjà posées restent. */
export async function basculerDate(id: string, ouverte: boolean): Promise<boolean> {
  const sql = await getDb();
  if (!sql) return false;
  try {
    await sql`UPDATE stage_dates SET ouverte = ${ouverte} WHERE id = ${id}`;
    return true;
  } catch (e) {
    console.error("[crm] basculerDate:", e);
    return false;
  }
}

/**
 * Retire une date. Refusé si quelqu'un y a déjà une place : on la ferme dans ce
 * cas, on ne l'efface pas — sans quoi des personnes se retrouveraient inscrites
 * à un jour qui n'existe plus.
 */
export async function retirerDate(id: string): Promise<{ ok: boolean; raison?: string }> {
  const sql = await getDb();
  if (!sql) return { ok: false, raison: "Base indisponible." };
  try {
    const [l] = await sql<{ n: number }[]>`
      SELECT COUNT(*)::int AS n FROM participations
      WHERE date_id = ${id} AND statut IN ('demande', 'confirmee', 'venue')
    `;
    if (Number(l?.n ?? 0) > 0) {
      return {
        ok: false,
        raison: "Des personnes sont inscrites à cette date : fermez-la plutôt que de l'effacer.",
      };
    }
    await sql`DELETE FROM stage_dates WHERE id = ${id}`;
    return { ok: true };
  } catch (e) {
    console.error("[crm] retirerDate:", e);
    return { ok: false, raison: "La suppression a échoué." };
  }
}

/**
 * La date choisie est-elle encore prenable ? Vérifié au moment de la demande,
 * et non à l'affichage : entre les deux, quelqu'un a pu prendre la dernière
 * place.
 */
export async function datePrenable(dateId: string): Promise<DateStage | null> {
  const sql = await getDb();
  if (!sql) return null;
  try {
    const [d] = await sql<DateStage[]>`
      SELECT d.id, d.stage_id, d.debut_le, d.fin_le,
             COALESCE(d.places, s.places)::int AS places,
             d.ouverte,
             COUNT(p.id) FILTER (WHERE p.statut IN ('demande', 'confirmee'))::int AS prises
      FROM stage_dates d
      JOIN stages s ON s.id = d.stage_id
      LEFT JOIN participations p ON p.date_id = d.id
      WHERE d.id = ${dateId}
      GROUP BY d.id, s.places
    `;
    return d ?? null;
  } catch (e) {
    console.error("[crm] datePrenable:", e);
    return null;
  }
}
