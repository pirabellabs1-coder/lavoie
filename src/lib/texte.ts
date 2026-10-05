/**
 * Les saisies libres du tableau de bord, telles qu'elles s'affichent.
 *
 * Un texte tapé dans une zone de saisie n'a pas de balises : ses paragraphes
 * sont ses lignes vides, et c'est au rendu de les retrouver. La règle est ici
 * plutôt que dans le composant, parce qu'elle se teste.
 */

/**
 * Découpe un texte saisi au clavier en paragraphes. Une ligne vide sépare,
 * quel que soit le style de retour à la ligne de la machine qui a saisi.
 */
export function paragraphes(texte: string | null | undefined): string[] {
  if (!texte) return [];
  return texte
    .split(/\r?\n[ \t]*(?:\r?\n[ \t]*)+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/** « 1 place », « 3 places » — l'accord, sans y penser à chaque appel. */
export function pluriel(n: number, mot: string, suffixe = "s"): string {
  return `${n} ${mot}${Math.abs(n) > 1 ? suffixe : ""}`;
}
