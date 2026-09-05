import type { StatutCle } from "./contacts";

/**
 * Les catégories de personnes.
 *
 * Une catégorie décrit *qui* est la personne — « a téléchargé le guide »,
 * « qualifiée pour l'entretien » — et non le message qu'elle reçoit. À chaque
 * catégorie répond une séquence, et une seule : c'est ce couple qui rend le
 * parcours lisible dans le tableau de bord, et c'est lui qu'on manipule quand
 * on ajoute quelqu'un à la main.
 *
 * `statut` et `source` ne servent qu'aux ajouts manuels : ils décrivent la
 * fiche que l'on crée pour une personne rencontrée hors du site. Sur une fiche
 * qui existe déjà, la source d'origine n'est jamais réécrite (voir
 * `enregistrerContact`), et le statut ne recule jamais dans l'entonnoir.
 */
export type Categorie = {
  /** Clé de la séquence qui sert cette catégorie. */
  cle: string;
  /** Regroupement d'affichage. */
  groupe: string;
  /** La catégorie de personnes elle-même. */
  cat: string;
  /** Ce qui fait entrer quelqu'un ici tout seul, depuis le site. */
  cond: string;
  /** Couleur du fil, pour suivre la catégorie d'un bout à l'autre de la page. */
  ton: string;
  ordre: number;
  /** Peut-on y inscrire quelqu'un à la main ? */
  manuel: boolean;
  /** Qui mettre ici à la main, en une phrase. */
  aide: string;
  /** Ce qu'il faut savoir avant d'y ajouter quelqu'un, s'il y a lieu. */
  avertissement?: string;
  /** Statut posé sur une fiche créée par un ajout manuel. */
  statut: StatutCle;
  /** Source inscrite sur une fiche créée par un ajout manuel. */
  source: string;
};

export const CATEGORIES: Record<string, Categorie> = {
  guide: {
    cle: "guide",
    groupe: "Aimants gratuits",
    cat: "A téléchargé le guide",
    cond: "téléchargement du guide « Sortir de la crise silencieuse »",
    ton: "#3b5bd0",
    ordre: 1,
    manuel: true,
    aide: "Une personne à qui vous avez donné le guide autrement que par le site : de la main à la main, en salon, en message privé.",
    statut: "lead",
    source: "Guide gratuit",
  },
  lettres: {
    cle: "lettres",
    groupe: "Aimants gratuits",
    cat: "S'est inscrit aux Lettres",
    cond: "inscription aux Lettres depuis le site",
    ton: "#3b5bd0",
    ordre: 2,
    manuel: true,
    aide: "Une personne qui vous a demandé de recevoir les Lettres sans passer par le formulaire du site.",
    statut: "lead",
    source: "Lettres",
  },
  appel: {
    cle: "appel",
    groupe: "Demande directe",
    cat: "A demandé un appel",
    cond: "formulaire de contact rempli",
    ton: "#8a5a06",
    ordre: 3,
    manuel: true,
    aide: "Une demande d'appel arrivée par téléphone, par message ou de vive voix.",
    statut: "contacte",
    source: "Formulaire de contact",
  },
  prerequis: {
    cle: "prerequis",
    groupe: "Questionnaire de préparation",
    cat: "Qualifié → appel avec Domoïna",
    cond: "questionnaire au-dessus du seuil d'éligibilité",
    ton: "#b98900",
    ordre: 4,
    manuel: true,
    aide: "Une personne que vous jugez prête pour l'entretien offert sans être passée par le questionnaire.",
    avertissement:
      "Sans questionnaire rempli, le lien de confirmation des prérequis renvoie vers la page de contact au lieu du bouton personnel.",
    statut: "contacte",
    source: "Questionnaire 1er RDV",
  },
  stages: {
    cle: "stages",
    groupe: "Questionnaire de préparation",
    cat: "Revenu > 2 000 € → stages",
    cond: "questionnaire, non qualifié, revenu supérieur à 2 000 €",
    ton: "#17654c",
    ordre: 5,
    manuel: true,
    aide: "Une personne à orienter vers les stages en présence plutôt que vers l'entretien.",
    statut: "lead",
    source: "Questionnaire 1er RDV",
  },
  formations: {
    cle: "formations",
    groupe: "Questionnaire de préparation",
    cat: "Revenu ≤ 2 000 € → formations",
    cond: "questionnaire, revenu modeste",
    ton: "#93304f",
    ordre: 6,
    manuel: true,
    aide: "Une personne pour qui les formations accessibles sont la bonne porte d'entrée.",
    statut: "lead",
    source: "Questionnaire 1er RDV",
  },
  suivi_entretien: {
    cle: "suivi_entretien",
    groupe: "Après l'entretien",
    cat: "L'appel a eu lieu",
    cond: "statut passé à « Appel fait »",
    ton: "#5b32b5",
    ordre: 7,
    manuel: true,
    aide: "Un entretien qui a eu lieu hors du parcours habituel. Passer une fiche à « Appel fait » y inscrit déjà la personne toute seule.",
    statut: "appel",
    source: "Entretien",
  },
  orientation: {
    cle: "orientation",
    groupe: "Anciennes",
    cat: "Orientation (remplacée)",
    cond: "ancienne route, conservée pour l'historique",
    ton: "#6b7590",
    ordre: 99,
    manuel: false,
    aide: "Ancienne route, remplacée par le routage au revenu. On n'y ajoute plus personne.",
    statut: "lead",
    source: "Questionnaire 1er RDV",
  },
};

/** La catégorie d'une séquence, ou un repli neutre pour une séquence inconnue. */
export function categorie(cle: string): Categorie {
  return (
    CATEGORIES[cle] ?? {
      cle,
      groupe: "Autres",
      cat: cle,
      cond: cle,
      ton: "#6b7590",
      ordre: 50,
      manuel: false,
      aide: "Séquence ajoutée hors des catégories connues.",
      statut: "lead",
      source: "Ajout manuel",
    }
  );
}

/**
 * Les catégories où l'on peut inscrire quelqu'un à la main, dans l'ordre du
 * parcours et regroupées comme dans la page des séquences.
 */
export function groupesManuels(): { titre: string; cats: Categorie[] }[] {
  const groupes: { titre: string; cats: Categorie[] }[] = [];
  const manuelles = Object.values(CATEGORIES)
    .filter((c) => c.manuel)
    .sort((a, b) => a.ordre - b.ordre);
  for (const c of manuelles) {
    const dernier = groupes[groupes.length - 1];
    if (dernier && dernier.titre === c.groupe) dernier.cats.push(c);
    else groupes.push({ titre: c.groupe, cats: [c] });
  }
  return groupes;
}
