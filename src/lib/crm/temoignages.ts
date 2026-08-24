import { getDb } from "./db";

/**
 * Les témoignages déposés depuis le site.
 *
 * La page publique affichait jusqu'ici des avis écrits en dur dans le code :
 * chaque ajout demandait une modification du code et un déploiement. Ceux-ci
 * s'ajoutent en base, passent par une validation, et n'apparaissent que
 * lorsqu'ils sont publiés — un texte déposé n'est jamais mis en ligne tout seul.
 *
 * Les avis Google historiques restent dans le code : ce sont des captures
 * vérifiées, pas de la donnée qui bouge. Les deux sources cohabitent sur la
 * page.
 */

export type Temoignage = {
  id: string;
  contact_id: string | null;
  nom: string;
  texte: string;
  note: number | null;
  contexte: string | null;
  statut: string;
  cree_le: Date;
  publie_le: Date | null;
};

/** Un témoignage tel qu'affiché sur le site : le strict nécessaire. */
export type TemoignagePublie = {
  nom: string;
  texte: string;
  note: number | null;
  contexte: string | null;
};

export async function deposerTemoignage(entree: {
  nom: string;
  texte: string;
  note?: number | null;
  contexte?: string;
  contactId?: string | null;
  consentement: boolean;
}): Promise<boolean> {
  const sql = await getDb();
  if (!sql) return false;

  const nom = entree.nom.trim().slice(0, 120);
  const texte = entree.texte.trim().slice(0, 4000);
  if (!nom || texte.length < 20 || !entree.consentement) return false;

  const note =
    entree.note != null && entree.note >= 1 && entree.note <= 5 ? Math.round(entree.note) : null;

  try {
    await sql`
      INSERT INTO temoignages (contact_id, nom, texte, note, contexte, consentement)
      VALUES (${entree.contactId || null}, ${nom}, ${texte}, ${note},
              ${entree.contexte?.trim().slice(0, 160) || null}, ${entree.consentement})
    `;
    if (entree.contactId) {
      await sql`
        INSERT INTO evenements (contact_id, type, libelle)
        VALUES (${entree.contactId}, 'temoignage', 'A déposé un témoignage')
      `;
    }
    return true;
  } catch (e) {
    console.error("[crm] deposerTemoignage:", e);
    return false;
  }
}

/** Les témoignages publiés, pour la page publique. Vide si la base est absente. */
export async function temoignagesPublies(): Promise<TemoignagePublie[]> {
  const sql = await getDb();
  if (!sql) return [];
  try {
    return await sql<TemoignagePublie[]>`
      SELECT nom, texte, note, contexte
      FROM temoignages
      WHERE statut = 'publie'
      ORDER BY publie_le DESC NULLS LAST, cree_le DESC
      LIMIT 60
    `;
  } catch (e) {
    console.error("[crm] temoignagesPublies:", e);
    return [];
  }
}

/** Tous les témoignages, pour la modération. `filtre` restreint par statut. */
export async function listerTemoignages(filtre?: string): Promise<Temoignage[]> {
  const sql = await getDb();
  if (!sql) return [];
  const statut = ["attente", "publie", "masque"].includes(filtre ?? "")
    ? (filtre as string)
    : null;
  try {
    return await sql<Temoignage[]>`
      SELECT id, contact_id, nom, texte, note, contexte, statut, cree_le, publie_le
      FROM temoignages
      WHERE (${statut}::text IS NULL OR statut = ${statut})
      ORDER BY
        array_position(ARRAY['attente','publie','masque'], statut),
        cree_le DESC
      LIMIT 300
    `;
  } catch (e) {
    console.error("[crm] listerTemoignages:", e);
    return [];
  }
}

export async function compterEnAttente(): Promise<number> {
  const sql = await getDb();
  if (!sql) return 0;
  try {
    const [l] = await sql<{ n: number }[]>`
      SELECT COUNT(*)::int AS n FROM temoignages WHERE statut = 'attente'
    `;
    return l?.n ?? 0;
  } catch (e) {
    console.error("[crm] compterEnAttente:", e);
    return 0;
  }
}

/** Publie, masque ou repasse en attente. La date de publication est posée au premier passage. */
export async function changerStatutTemoignage(id: string, statut: string): Promise<boolean> {
  const sql = await getDb();
  if (!sql) return false;
  if (!["attente", "publie", "masque"].includes(statut)) return false;
  try {
    await sql`
      UPDATE temoignages
      SET statut = ${statut},
          publie_le = CASE WHEN ${statut} = 'publie' THEN COALESCE(publie_le, NOW()) ELSE publie_le END
      WHERE id = ${id}
    `;
    return true;
  } catch (e) {
    console.error("[crm] changerStatutTemoignage:", e);
    return false;
  }
}

export async function supprimerTemoignage(id: string): Promise<boolean> {
  const sql = await getDb();
  if (!sql) return false;
  try {
    await sql`DELETE FROM temoignages WHERE id = ${id}`;
    return true;
  } catch (e) {
    console.error("[crm] supprimerTemoignage:", e);
    return false;
  }
}
