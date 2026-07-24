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
    url: `${STORE_URL}/polarite`,
    featured: true,
  },
  {
    titre: "Le Paradoxe du Désir",
    benefice:
      "Comprendre ce qui nourrit — ou éteint — le désir, dans le couple comme en soi.",
    tag: "Couple & désir",
    url: `${STORE_URL}/le-paradoxe-du-desir`,
  },
  {
    titre: "Comment le cadre vous rend-il libre ?",
    benefice:
      "Faire du cadre non pas une contrainte, mais la condition même de votre liberté intérieure.",
    tag: "Liberté intérieure",
    url: `${STORE_URL}/comment-le-cadre-vous-rend-t-il-plus-libre`,
  },
  {
    titre: "Blessures originelles — De la compassion à l'excellence",
    benefice:
      "Transformer votre blessure originelle en source d'Excellence Authentique Unique.",
    tag: "Transformation",
    url: `${STORE_URL}/de-la-compassion-a-lexcellence-authentique`,
  },
  {
    titre: "Fragments de vie amoureuse — La puissance du (par)Don",
    benefice:
      "Le don et le pardon comme chemins de guérison amoureuse. Existe aussi en livre.",
    tag: "Couple & désir",
    url: `${STORE_URL}/fragment-de-vie-amoureuse`,
    livre: true,
  },
  {
    titre: "Les trois attentes que les hommes cachent à leurs femmes",
    benefice:
      "Décrypter les attentes tues qui fragilisent le couple — et les dénouer.",
    tag: "Couple & désir",
    url: `${STORE_URL}/prd_bumvzh`,
  },
  {
    titre: "Cultiver l'ordre et l'équilibre",
    benefice:
      "Remettre de l'ordre dans votre quotidien pour que la transformation tienne dans la durée.",
    tag: "Équilibre de vie",
    url: `${STORE_URL}/cutiver-lordre-et-lequilibre`,
  },
  {
    titre: "Retrouver du sens grâce aux cycles des saisons",
    benefice:
      "Vivre en harmonie avec vos saisons intérieures : lâcher-prise, racines, élan, rayonnement.",
    tag: "Cycle des Saisons",
    url: `${STORE_URL}/retrouver-du-sens-grace-aux-cycles-des-saisons`,
  },
  {
    titre: "Apprendre à pardonner et se libérer de la rancœur",
    benefice:
      "Déposer le poids de la rancœur et retrouver une véritable paix intérieure.",
    tag: "Point d'entrée",
    url: `${STORE_URL}/aprendre-a-pardonner-et-se-liberer-de-la-rancoeur`,
  },
];
