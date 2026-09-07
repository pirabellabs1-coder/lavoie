import { getDb } from "./db";
import type { Identite } from "./session";
import { peut } from "./utilisateurs";

/**
 * Le carnet de bord de l'équipe.
 *
 * Une stratégie marketing se mène à plusieurs, et se raconte mal. Chacun sait
 * ce qu'il a fait ; personne ne sait ce que les autres ont fait ; et la
 * personne pour qui l'on travaille ne voit qu'un résultat, sans le travail qui
 * l'a produit. Ce carnet est l'endroit où chacun note son geste du jour, en une
 * ligne, et où la cliente lit ce qui a été mené — par qui, quel jour.
 *
 * Deux états, un seul carnet : ce qui est **prévu** attend d'être coché, ce qui
 * est **fait** se range au jour où il a été fait. Une action prévue devient
 * faite sans rien ressaisir, avec un mot en plus si l'on veut.
 *
 * L'auteur est figé au moment de l'écriture, comme au journal d'audit : un
 * collaborateur qui s'en va n'efface pas ce qu'il a accompli.
 */

export const CATEGORIES_ACTION = [
  { cle: "contenu", label: "Contenu", ton: "#3b5bd0", aide: "Article, vidéo, script, newsletter écrite." },
  { cle: "reseaux", label: "Réseaux", ton: "#93304f", aide: "Publication, story, réponses, communauté." },
  { cle: "publicite", label: "Publicité", ton: "#8a5a06", aide: "Campagne payante, ciblage, budget." },
  { cle: "emailing", label: "E-mailing", ton: "#0e6b7a", aide: "Séquence, campagne, relance écrite." },
  { cle: "relation", label: "Relation", ton: "#17654c", aide: "Appel, rendez-vous, message à une personne." },
  { cle: "site", label: "Site & technique", ton: "#5b32b5", aide: "Page, correction, réglage, mise en ligne." },
  { cle: "analyse", label: "Analyse", ton: "#b98900", aide: "Chiffres regardés, décision prise, rapport." },
  { cle: "autre", label: "Autre", ton: "#6b7590", aide: "Ce qui n'entre dans aucune case." },
] as const;

export type CategorieAction = (typeof CATEGORIES_ACTION)[number]["cle"];

export function categorieAction(cle: string) {
  return (
    CATEGORIES_ACTION.find((c) => c.cle === cle) ??
    CATEGORIES_ACTION[CATEGORIES_ACTION.length - 1]
  );
}

export function estCategorieValide(v: string): v is CategorieAction {
  return CATEGORIES_ACTION.some((c) => c.cle === v);
}

export type Action = {
  id: string;
  auteur_id: string;
  auteur_nom: string;
  titre: string;
  detail: string | null;
  categorie: string;
  /** prevue · faite */
  statut: string;
  fait_le: Date | null;
  echeance: Date | null;
  duree_min: number | null;
  cree_le: Date;
};

/** Qui peut retoucher une ligne : son auteur, ou le propriétaire. */
export function peutRetoucher(action: Action, qui: Identite): boolean {
  return action.auteur_id === qui.id || peut(qui.role, "comptes");
}

export type Filtres = {
  /** Bornes de la période, au format AAAA-MM-JJ. */
  depuis?: string;
  jusqu?: string;
  auteur?: string;
  categorie?: string;
  limite?: number;
};

/** Ce qui est fait, du plus récent au plus ancien. */
export async function listerActions(f: Filtres = {}): Promise<Action[]> {
  const sql = await getDb();
  if (!sql) return [];
  const depuis = f.depuis || null;
  const jusqu = f.jusqu || null;
  const auteur = f.auteur || null;
  const categorie = f.categorie || null;
  try {
    return await sql<Action[]>`
      SELECT id, auteur_id, auteur_nom, titre, detail, categorie, statut,
             fait_le, echeance, duree_min, cree_le
      FROM actions
      WHERE statut = 'faite'
        AND (${depuis}::date IS NULL OR fait_le >= ${depuis}::date)
        AND (${jusqu}::date IS NULL OR fait_le <= ${jusqu}::date)
        AND (${auteur}::text IS NULL OR auteur_nom = ${auteur}::text)
        AND (${categorie}::text IS NULL OR categorie = ${categorie}::text)
      ORDER BY fait_le DESC, cree_le DESC
      LIMIT ${Math.min(f.limite ?? 300, 1000)}
    `;
  } catch (e) {
    console.error("[crm] listerActions:", e);
    return [];
  }
}

/** Ce qui est prévu, échéance la plus proche d'abord. */
export async function listerPrevues(limite = 100): Promise<Action[]> {
  const sql = await getDb();
  if (!sql) return [];
  try {
    return await sql<Action[]>`
      SELECT id, auteur_id, auteur_nom, titre, detail, categorie, statut,
             fait_le, echeance, duree_min, cree_le
      FROM actions
      WHERE statut = 'prevue'
      ORDER BY echeance ASC NULLS LAST, cree_le ASC
      LIMIT ${limite}
    `;
  } catch (e) {
    console.error("[crm] listerPrevues:", e);
    return [];
  }
}

/** Le jour du calendrier à Paris, au format des champs « date ». */
export function jourDuJour(): string {
  return new Date().toLocaleDateString("fr-CA", { timeZone: "Europe/Paris" });
}

/**
 * Le premier jour d'une période de N jours, ou `undefined` pour « depuis le
 * début ». La lecture de l'horloge vit ici et non dans la page : un composant
 * n'a pas à appeler `Date.now()` pendant son rendu.
 */
export function borneDepuis(jours: number): string | undefined {
  if (!jours) return undefined;
  return new Date(Date.now() - jours * 86_400_000).toLocaleDateString("fr-CA", {
    timeZone: "Europe/Paris",
  });
}

function aujourdhui(): string {
  return jourDuJour();
}

export async function noterAction(entree: {
  qui: Identite;
  titre: string;
  detail?: string;
  categorie: string;
  /** « faite » par défaut ; « prevue » pour une case à cocher plus tard. */
  statut?: "faite" | "prevue";
  /** Jour de l'action, ou échéance si elle est seulement prévue. AAAA-MM-JJ. */
  quand?: string;
  dureeMin?: number | null;
}): Promise<boolean> {
  const sql = await getDb();
  if (!sql) return false;
  const titre = entree.titre.trim().slice(0, 200);
  if (!titre) return false;

  const statut = entree.statut === "prevue" ? "prevue" : "faite";
  const jour = entree.quand && /^\d{4}-\d{2}-\d{2}$/.test(entree.quand) ? entree.quand : null;
  const categorie = estCategorieValide(entree.categorie) ? entree.categorie : "autre";
  const duree =
    entree.dureeMin && Number.isFinite(entree.dureeMin) && entree.dureeMin > 0
      ? Math.min(Math.round(entree.dureeMin), 24 * 60)
      : null;
  const faitLe = statut === "faite" ? (jour ?? aujourdhui()) : null;
  const echeance = statut === "prevue" ? jour : null;

  try {
    await sql`
      INSERT INTO actions (auteur_id, auteur_nom, titre, detail, categorie, statut,
                           fait_le, echeance, duree_min)
      VALUES (${entree.qui.id}, ${entree.qui.nom}, ${titre},
              ${entree.detail?.trim().slice(0, 4000) || null},
              ${categorie}, ${statut}, ${faitLe}::date, ${echeance}::date, ${duree})
    `;
    return true;
  } catch (e) {
    console.error("[crm] noterAction:", e);
    return false;
  }
}

/**
 * Coche une action prévue : elle passe à « faite », au jour d'aujourd'hui, avec
 * un mot en plus si l'on en a un. Décocher la remet en attente.
 */
export async function basculerAction(
  id: string,
  qui: Identite,
  note?: string,
): Promise<boolean> {
  const sql = await getDb();
  if (!sql) return false;
  try {
    const [a] = await sql<Action[]>`SELECT * FROM actions WHERE id = ${id}`;
    if (!a || !peutRetoucher(a, qui)) return false;

    const versFaite = a.statut !== "faite";
    const mot = note?.trim().slice(0, 2000);
    // La note s'ajoute au détail sans écraser ce qui était déjà écrit.
    const detail = mot ? [a.detail, mot].filter(Boolean).join("\n") : a.detail;

    await sql`
      UPDATE actions
      SET statut = ${versFaite ? "faite" : "prevue"},
          fait_le = ${versFaite ? aujourdhui() : null}::date,
          detail = ${detail},
          maj_le = NOW()
      WHERE id = ${id}
    `;
    return true;
  } catch (e) {
    console.error("[crm] basculerAction:", e);
    return false;
  }
}

export async function supprimerAction(id: string, qui: Identite): Promise<boolean> {
  const sql = await getDb();
  if (!sql) return false;
  try {
    const [a] = await sql<Action[]>`SELECT * FROM actions WHERE id = ${id}`;
    if (!a || !peutRetoucher(a, qui)) return false;
    await sql`DELETE FROM actions WHERE id = ${id}`;
    return true;
  } catch (e) {
    console.error("[crm] supprimerAction:", e);
    return false;
  }
}

export type Resume = {
  total: number;
  minutes: number;
  parPersonne: { nom: string; n: number; minutes: number }[];
  parCategorie: { cle: string; n: number }[];
  /** Tous les auteurs connus du carnet, pour le filtre. */
  auteurs: string[];
};

/** Ce qu'il faut savoir d'un coup d'œil sur une période. */
export async function resumeCarnet(f: Filtres = {}): Promise<Resume> {
  const vide: Resume = { total: 0, minutes: 0, parPersonne: [], parCategorie: [], auteurs: [] };
  const sql = await getDb();
  if (!sql) return vide;
  const depuis = f.depuis || null;
  const jusqu = f.jusqu || null;
  try {
    const personnes = await sql<{ nom: string; n: number; minutes: number }[]>`
      SELECT auteur_nom AS nom, COUNT(*)::int AS n,
             COALESCE(SUM(duree_min), 0)::int AS minutes
      FROM actions
      WHERE statut = 'faite'
        AND (${depuis}::date IS NULL OR fait_le >= ${depuis}::date)
        AND (${jusqu}::date IS NULL OR fait_le <= ${jusqu}::date)
      GROUP BY auteur_nom
      ORDER BY n DESC
    `;
    const categories = await sql<{ cle: string; n: number }[]>`
      SELECT categorie AS cle, COUNT(*)::int AS n
      FROM actions
      WHERE statut = 'faite'
        AND (${depuis}::date IS NULL OR fait_le >= ${depuis}::date)
        AND (${jusqu}::date IS NULL OR fait_le <= ${jusqu}::date)
      GROUP BY categorie
      ORDER BY n DESC
    `;
    const tous = await sql<{ nom: string }[]>`
      SELECT DISTINCT auteur_nom AS nom FROM actions ORDER BY nom
    `;
    return {
      total: personnes.reduce((n, p) => n + p.n, 0),
      minutes: personnes.reduce((n, p) => n + p.minutes, 0),
      parPersonne: personnes,
      parCategorie: categories,
      auteurs: tous.map((t) => t.nom),
    };
  } catch (e) {
    console.error("[crm] resumeCarnet:", e);
    return vide;
  }
}

/** Le carnet des sept derniers jours, pour le point du lundi. */
export async function actionsDeLaSemaine(): Promise<{ nom: string; n: number }[]> {
  const sql = await getDb();
  if (!sql) return [];
  try {
    return await sql<{ nom: string; n: number }[]>`
      SELECT auteur_nom AS nom, COUNT(*)::int AS n
      FROM actions
      WHERE statut = 'faite' AND fait_le >= CURRENT_DATE - 7
      GROUP BY auteur_nom
      ORDER BY n DESC
    `;
  } catch (e) {
    console.error("[crm] actionsDeLaSemaine:", e);
    return [];
  }
}

/** Le carnet d'une période, en CSV — de quoi joindre un rapport à un e-mail. */
export async function exporterCarnetCsv(f: Filtres = {}): Promise<string> {
  const lignes = await listerActions({ ...f, limite: 1000 });
  const entetes = ["date", "qui", "categorie", "action", "detail", "minutes"];
  const echapper = (v: unknown) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",\n;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  const corps = lignes.map((a) =>
    [
      a.fait_le ? new Date(a.fait_le).toISOString().slice(0, 10) : "",
      a.auteur_nom,
      categorieAction(a.categorie).label,
      a.titre,
      a.detail ?? "",
      a.duree_min ?? "",
    ]
      .map(echapper)
      .join(";"),
  );
  return [entetes.join(";"), ...corps].join("\n");
}
