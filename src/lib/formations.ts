/**
 * Formations numériques (canal UN TOUT / Chariow — étage 1 de l'échelle de valeur).
 * Les liens pointent vers la boutique ; remplacez `url` par le lien Chariow
 * précis de chaque formation dès qu'ils sont disponibles.
 */

export const STORE_URL = "https://formation-untout.com";

export type Formation = {
  titre: string;
  benefice: string;
  tag: string;
  url: string;
  featured?: boolean;
  livre?: boolean;
};

export const FORMATIONS: Formation[] = [
  {
    titre: "Polarités masculine – féminine & réussite professionnelle",
    benefice:
      "Réconcilier vos polarités intérieures pour une réussite qui ne s'oppose plus à votre vie personnelle.",
    tag: "Éveil & leadership",
    url: STORE_URL,
    featured: true,
  },
  {
    titre: "Le Paradoxe du Désir",
    benefice:
      "Comprendre ce qui nourrit — ou éteint — le désir, dans le couple comme en soi.",
    tag: "Couple & désir",
    url: STORE_URL,
  },
  {
    titre: "Comment le cadre vous rend-il libre ?",
    benefice:
      "Faire du cadre non pas une contrainte, mais la condition même de votre liberté intérieure.",
    tag: "Liberté intérieure",
    url: STORE_URL,
  },
  {
    titre: "Blessures originelles — De la compassion à l'excellence",
    benefice:
      "Transformer votre blessure originelle en source d'Excellence Authentique Unique.",
    tag: "Transformation",
    url: STORE_URL,
  },
  {
    titre: "Fragments de vie amoureuse — La puissance du (par)Don",
    benefice:
      "Le don et le pardon comme chemins de guérison amoureuse. Existe aussi en livre.",
    tag: "Couple & désir",
    url: STORE_URL,
    livre: true,
  },
  {
    titre: "Les trois attentes que les hommes cachent à leurs femmes",
    benefice:
      "Décrypter les attentes tues qui fragilisent le couple — et les dénouer.",
    tag: "Couple & désir",
    url: STORE_URL,
  },
  {
    titre: "Cultiver l'ordre et l'équilibre",
    benefice:
      "Remettre de l'ordre dans votre quotidien pour que la transformation tienne dans la durée.",
    tag: "Équilibre de vie",
    url: STORE_URL,
  },
  {
    titre: "Retrouver du sens grâce aux cycles des saisons",
    benefice:
      "Vivre en harmonie avec vos saisons intérieures : lâcher-prise, racines, élan, rayonnement.",
    tag: "Cycle des Saisons",
    url: STORE_URL,
  },
  {
    titre: "Apprendre à pardonner et se libérer de la rancœur",
    benefice:
      "Déposer le poids de la rancœur et retrouver une véritable paix intérieure.",
    tag: "Point d'entrée",
    url: STORE_URL,
  },
];
