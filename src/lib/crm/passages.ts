import { getDb } from "./db";

/**
 * La trace des passages du worker.
 *
 * Tout ce qui part tout seul — séquences, campagnes, relances, logistique des
 * stages, réveil des dormants, sauvegarde — dépend d'un unique appel planifié,
 * chaque matin à 8 h (voir `vercel.json`). Le jour où cet appel cesse, rien ne
 * casse bruyamment : les e-mails s'arrêtent simplement de partir, et l'on s'en
 * aperçoit une semaine plus tard, en cherchant pourquoi personne ne répond.
 *
 * Une secousse suffit à le provoquer : une variable `CRON_SECRET` recopiée de
 * travers, un changement de plan chez l'hébergeur, une clé Resend révoquée.
 * Chaque passage laisse donc une ligne ici, et le tableau de bord affiche la
 * dernière — avec un avertissement quand elle date trop.
 *
 * Ce n'est pas de la surveillance active : personne n'est réveillé la nuit.
 * C'est un témoin, à l'endroit où l'on regarde de toute façon tous les jours.
 */

/** Au-delà de ce délai sans passage, quelque chose ne tourne plus. */
export const SILENCE_HEURES = 36;
/** On ne garde pas l'historique complet : trois mois suffisent à voir un trou. */
const RETENTION_JOURS = 90;

export type Passage = {
  cree_le: Date;
  duree_ms: number;
  ok: boolean;
  resume: string | null;
};

/** Écrit la ligne du passage qui vient de finir. Jamais bloquant. */
export async function enregistrerPassage(entree: {
  dureeMs: number;
  ok: boolean;
  resume: string;
}): Promise<void> {
  const sql = await getDb();
  if (!sql) return;
  try {
    await sql`
      INSERT INTO passages (duree_ms, ok, resume)
      VALUES (${Math.round(entree.dureeMs)}, ${entree.ok}, ${entree.resume.slice(0, 1000)})
    `;
    await sql`
      DELETE FROM passages WHERE cree_le < NOW() - make_interval(days => ${RETENTION_JOURS})
    `;
  } catch (e) {
    console.error("[crm] enregistrerPassage:", e);
  }
}

export async function dernierPassage(): Promise<Passage | null> {
  const sql = await getDb();
  if (!sql) return null;
  try {
    const [p] = await sql<Passage[]>`
      SELECT cree_le, duree_ms, ok, resume FROM passages
      ORDER BY cree_le DESC LIMIT 1
    `;
    return p ?? null;
  } catch (e) {
    console.error("[crm] dernierPassage:", e);
    return null;
  }
}

/** Combien d'heures depuis le dernier passage. `null` s'il n'y en a jamais eu. */
export function heuresDepuis(p: Passage | null): number | null {
  if (!p) return null;
  const quand = p.cree_le instanceof Date ? p.cree_le : new Date(p.cree_le);
  return (Date.now() - quand.getTime()) / 3_600_000;
}

/**
 * Vrai quand le worker s'est tu depuis trop longtemps. L'absence totale de
 * passage n'est pas un silence : c'est une base qui vient d'être branchée, et
 * le premier passage a lieu le lendemain matin. Crier au feu ce jour-là
 * apprendrait surtout à ignorer l'alerte.
 */
export function enSilence(p: Passage | null): boolean {
  const h = heuresDepuis(p);
  return h !== null && h > SILENCE_HEURES;
}
