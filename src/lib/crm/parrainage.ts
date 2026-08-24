import { getDb } from "./db";
import { SITE } from "@/lib/site";

/**
 * Le parrainage.
 *
 * Chaque contact peut recevoir un lien personnel. Une personne qui arrive par
 * ce lien et laisse ses coordonnées est rattachée à son parrain — sans que ni
 * l'un ni l'autre n'ait rien à saisir. Le rattachement se fait une seule fois,
 * au premier contact, et ne s'écrase jamais ensuite.
 *
 * Le code de parrainage est tiré au sort à la demande, pas à la création du
 * contact : la plupart des contacts n'en auront jamais besoin, inutile d'en
 * générer des milliers d'avance.
 */

function nouveauCode(): string {
  // Court et lisible — il finit dans une URL qu'on peut lire au téléphone.
  const octets = new Uint8Array(9);
  crypto.getRandomValues(octets);
  return Array.from(octets, (o) => o.toString(16).padStart(2, "0")).join("");
}

export function lienParrainage(code: string): string {
  return `${SITE.url}/?parrain=${code}`;
}

/** Le code de parrainage d'un contact, créé au premier appel puis stable. */
export async function codeParrainage(contactId: string): Promise<string | null> {
  const sql = await getDb();
  if (!sql) return null;
  try {
    const [existant] = await sql<{ jeton_parrainage: string | null }[]>`
      SELECT jeton_parrainage FROM contacts WHERE id = ${contactId}
    `;
    if (existant?.jeton_parrainage) return existant.jeton_parrainage;

    // Une poignée de tentatives suffit largement : la collision est improbable.
    for (let i = 0; i < 5; i++) {
      const code = nouveauCode();
      const rows = await sql<{ jeton_parrainage: string }[]>`
        UPDATE contacts
        SET jeton_parrainage = ${code}
        WHERE id = ${contactId} AND jeton_parrainage IS NULL
        RETURNING jeton_parrainage
      `;
      if (rows[0]) return rows[0].jeton_parrainage;
      // Un autre appel a posé le code entre-temps : on relit.
      const [maj] = await sql<{ jeton_parrainage: string | null }[]>`
        SELECT jeton_parrainage FROM contacts WHERE id = ${contactId}
      `;
      if (maj?.jeton_parrainage) return maj.jeton_parrainage;
    }
    return null;
  } catch (e) {
    console.error("[crm] codeParrainage:", e);
    return null;
  }
}

/** L'identifiant du parrain derrière un code, ou `null` si le code est inconnu. */
export async function parrainDuCode(code: string): Promise<string | null> {
  const sql = await getDb();
  if (!sql) return null;
  if (!/^[a-f0-9]{18}$/.test(code)) return null;
  try {
    const [l] = await sql<{ id: string }[]>`
      SELECT id FROM contacts WHERE jeton_parrainage = ${code}
    `;
    return l ? String(l.id) : null;
  } catch (e) {
    console.error("[crm] parrainDuCode:", e);
    return null;
  }
}

/**
 * Rattache un filleul à son parrain, si les deux existent, s'ils sont
 * distincts, et si le filleul n'a pas déjà un parrain. Journalise chez les deux.
 */
export async function rattacherFilleul(filleulId: string, code: string): Promise<void> {
  const sql = await getDb();
  if (!sql) return;
  if (!/^[a-f0-9]{18}$/.test(code)) return;
  try {
    const rows = await sql<{ parrain_id: string; parrain_nom: string; filleul_nom: string }[]>`
      UPDATE contacts f
      SET parrain_id = p.id
      FROM contacts p
      WHERE p.jeton_parrainage = ${code}
        AND f.id = ${filleulId}
        AND f.parrain_id IS NULL
        AND p.id <> f.id
      RETURNING p.id AS parrain_id,
                COALESCE(NULLIF(TRIM(CONCAT(p.prenom, ' ', p.nom)), ''), p.email) AS parrain_nom,
                COALESCE(NULLIF(TRIM(CONCAT(f.prenom, ' ', f.nom)), ''), f.email) AS filleul_nom
    `;
    const l = rows[0];
    if (!l) return;
    await sql`
      INSERT INTO evenements (contact_id, type, libelle)
      VALUES (${filleulId}, 'parrainage', ${`Arrivé par le parrainage de ${l.parrain_nom}`})
    `;
    await sql`
      INSERT INTO evenements (contact_id, type, libelle)
      VALUES (${l.parrain_id}, 'parrainage', ${`A parrainé ${l.filleul_nom}`})
    `;
  } catch (e) {
    console.error("[crm] rattacherFilleul:", e);
  }
}

export type Filleul = {
  id: string;
  nom: string;
  email: string;
  statut: string;
  cree_le: Date;
};

/** Les personnes qu'un contact a amenées. */
export async function filleuls(parrainId: string): Promise<Filleul[]> {
  const sql = await getDb();
  if (!sql) return [];
  try {
    return await sql<Filleul[]>`
      SELECT id,
             COALESCE(NULLIF(TRIM(CONCAT(prenom, ' ', nom)), ''), email) AS nom,
             email, statut, cree_le
      FROM contacts
      WHERE parrain_id = ${parrainId}
      ORDER BY cree_le DESC
    `;
  } catch (e) {
    console.error("[crm] filleuls:", e);
    return [];
  }
}

export type Parrain = {
  id: string;
  nom: string;
  email: string;
  code: string | null;
  filleuls: number;
  clients: number;
};

/** Le palmarès des parrains — qui amène du monde, et combien deviennent clients. */
export async function classementParrains(): Promise<Parrain[]> {
  const sql = await getDb();
  if (!sql) return [];
  try {
    return await sql<Parrain[]>`
      SELECT p.id,
             COALESCE(NULLIF(TRIM(CONCAT(p.prenom, ' ', p.nom)), ''), p.email) AS nom,
             p.email, p.jeton_parrainage AS code,
             COUNT(f.id)::int AS filleuls,
             COUNT(f.id) FILTER (WHERE f.statut = 'client')::int AS clients
      FROM contacts p
      JOIN contacts f ON f.parrain_id = p.id
      GROUP BY p.id
      ORDER BY COUNT(f.id) DESC, clients DESC
      LIMIT 100
    `;
  } catch (e) {
    console.error("[crm] classementParrains:", e);
    return [];
  }
}
