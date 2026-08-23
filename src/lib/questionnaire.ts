/**
 * Le questionnaire de préparation au premier rendez-vous.
 *
 * Reprend, question pour question, celui qui tournait chez Typeform, avec deux
 * différences : les réponses arrivent dans votre base plutôt que chez un tiers,
 * et un score d'éligibilité est calculé à l'arrivée.
 *
 * Tout est modifiable ici : l'ordre des étapes, le texte des questions, les
 * choix proposés, et le poids de chaque réponse dans le score. Une seule règle
 * à respecter — ne jamais changer une `cle` déjà utilisée, sinon les réponses
 * déjà enregistrées ne se rattachent plus à leur question.
 */

export type TypeQuestion =
  | "texte"
  | "email"
  | "tel"
  | "long"
  | "choix"
  | "multi"
  | "ouinon"
  | "case";

export type Question = {
  cle: string;
  type: TypeQuestion;
  titre: string;
  aide?: string;
  obligatoire?: boolean;
  choix?: string[];
  /** Choix qui ouvre un champ de précision (« Autre… »). */
  libre?: string;
  /** N'apparaît que si une autre réponse vaut la valeur attendue. */
  depend?: { cle: string; valeur: string };
};

export type Etape = {
  titre: string;
  intro: string;
  questions: Question[];
};

export const ETAPES: Etape[] = [
  {
    titre: "Informations générales",
    intro:
      "Commençons par quelques informations personnelles pour mieux vous connaître, en toute bienveillance.",
    questions: [
      {
        cle: "nom_prenom",
        type: "texte",
        titre: "Quel est votre nom et prénom ?",
        aide: "Vos informations complètes nous permettent de personnaliser nos échanges.",
        obligatoire: true,
      },
      {
        cle: "email",
        type: "email",
        titre: "Quelle est votre adresse e-mail ?",
        aide: "Elle ne sera utilisée que pour le suivi de cet accompagnement.",
        obligatoire: true,
      },
      {
        cle: "telephone",
        type: "tel",
        titre: "Quel est votre numéro de téléphone ?",
        aide: "Facultatif. Nous pourrons vous joindre rapidement si besoin.",
      },
      { cle: "age", type: "texte", titre: "Quel est votre âge ?", obligatoire: true },
      {
        cle: "situation_perso",
        type: "choix",
        titre: "Quelle est votre situation personnelle actuelle ?",
        obligatoire: true,
        choix: ["Célibataire", "En couple", "Marié(e)", "Séparé(e) / Divorcé(e)", "Autre"],
        libre: "Autre",
      },
      {
        cle: "situation_pro",
        type: "choix",
        titre: "Quelle est votre situation professionnelle actuelle ?",
        obligatoire: true,
        choix: [
          "Salarié(e)",
          "Indépendant(e) / Entrepreneur",
          "Dirigeant(e) / Chef d'entreprise",
          "En reconversion",
          "Sans activité actuellement",
        ],
      },
      {
        cle: "revenu",
        type: "choix",
        titre: "Quel est votre revenu mensuel actuel ?",
        obligatoire: true,
        choix: ["0 – 2 000 €", "2 000 – 5 000 €", "Plus de 5 000 €"],
      },
    ],
  },
  {
    titre: "Votre parcours intérieur",
    intro:
      "Prenez un moment pour explorer votre cheminement personnel, avec douceur et honnêteté.",
    questions: [
      {
        cle: "travail_personnel",
        type: "choix",
        titre: "Avez-vous déjà entrepris un travail personnel ou spirituel ?",
        obligatoire: true,
        choix: ["Oui", "Non"],
      },
      {
        cle: "depuis_quand",
        type: "choix",
        titre: "Si oui, depuis combien de temps ?",
        choix: ["Moins d'un an", "1 à 3 ans", "3 à 5 ans", "Plus de 5 ans"],
        depend: { cle: "travail_personnel", valeur: "Oui" },
      },
      {
        cle: "approches",
        type: "multi",
        titre: "Quelles approches avez-vous explorées ?",
        aide: "Facultatif. Plusieurs réponses possibles.",
        choix: [
          "Méditation",
          "Thérapie",
          "Coaching personnel / professionnel",
          "Soins énergétiques / holistiques",
          "Développement personnel",
          "Autre",
        ],
      },
      {
        cle: "prise_conscience",
        type: "long",
        titre: "Quelle a été votre plus grande prise de conscience jusque-là ?",
        aide: "Exprimez avec authenticité la révélation la plus profonde vécue sur votre chemin.",
        obligatoire: true,
      },
      {
        cle: "difficulte_1",
        type: "long",
        titre: "Partagez une difficulté importante rencontrée dans votre parcours.",
        obligatoire: true,
      },
      {
        cle: "difficulte_2",
        type: "long",
        titre: "Décrivez une autre difficulté significative.",
        obligatoire: true,
      },
      {
        cle: "difficulte_3",
        type: "long",
        titre: "Quelle autre difficulté aimeriez-vous partager ?",
        obligatoire: true,
      },
    ],
  },
  {
    titre: "Vos schémas",
    intro:
      "Ces questions touchent à ce qui se rejoue sans que l'on s'en aperçoive. Répondez spontanément.",
    questions: [
      {
        cle: "reussite_ressenti",
        type: "choix",
        titre: "Quand vous pensez à votre réussite, comment vous sentez-vous ?",
        obligatoire: true,
        choix: ["Enthousiaste", "Inquiet(ète)", "Ambivalent(e)", "Indifférent(e)", "Autre"],
        libre: "Autre",
      },
      {
        cle: "relations",
        type: "choix",
        titre: "Dans vos relations, avez-vous tendance à :",
        obligatoire: true,
        choix: [
          "Vous adapter aux autres",
          "Affirmer vos besoins",
          "Vous effacer",
          "Vous mettre en retrait",
          "Autre",
        ],
        libre: "Autre",
      },
      {
        cle: "empechement",
        type: "long",
        titre: "Qu'est-ce qui vous empêche d'être pleinement vous-même ?",
        obligatoire: true,
      },
      {
        cle: "blessure_identifiee",
        type: "ouinon",
        titre: "Avez-vous identifié une blessure ou un schéma récurrent ?",
        obligatoire: true,
      },
      {
        cle: "blessure_precision",
        type: "texte",
        titre: "Si oui, pouvez-vous préciser ?",
        aide: "Facultatif.",
        depend: { cle: "blessure_identifiee", valeur: "Oui" },
      },
    ],
  },
  {
    titre: "Engagement et intention",
    intro:
      "Cet accompagnement est destiné aux personnes prêtes à s'engager dans une démarche profonde.",
    questions: [
      {
        cle: "investir_temps",
        type: "choix",
        titre: "Êtes-vous prêt(e) à investir du temps et de l'énergie dans ce processus ?",
        obligatoire: true,
        choix: ["Oui, pleinement", "J'ai besoin d'y réfléchir", "Non, pas pour le moment"],
      },
      {
        cle: "remettre_en_question",
        type: "choix",
        titre: "Êtes-vous prêt(e) à remettre en question certaines habitudes ou schémas ?",
        obligatoire: true,
        choix: ["Oui", "Peut-être", "Non"],
      },
      {
        cle: "attente_appel",
        type: "choix",
        titre: "Qu'attendez-vous de cet appel diagnostic ?",
        obligatoire: true,
        choix: [
          "Être conseillé(e) sur mon parcours",
          "Clarifier un besoin",
          "Identifier mes priorités",
          "Autre",
        ],
        libre: "Autre",
      },
      {
        cle: "etat_emotionnel",
        type: "long",
        titre: "Comment décririez-vous votre état émotionnel actuel ?",
        obligatoire: true,
      },
      {
        cle: "aspect_transformer",
        type: "long",
        titre: "Quel aspect de votre vie aimeriez-vous transformer ?",
        obligatoire: true,
      },
      {
        cle: "pratique_reconnexion",
        type: "choix",
        titre: "Avez-vous une pratique de reconnexion actuellement ?",
        obligatoire: true,
        choix: ["Oui, régulièrement", "Parfois", "Non, jamais"],
      },
      {
        cle: "confirmation",
        type: "case",
        titre: "Je confirme envoyer ce questionnaire en conscience.",
        aide:
          "En envoyant ce questionnaire, vous acceptez d'être recontacté(e) pour confirmer votre éligibilité ou être orienté(e) vers ce qui est le plus juste pour vous.",
        obligatoire: true,
      },
    ],
  },
];

export const QUESTIONS: Question[] = ETAPES.flatMap((e) => e.questions);

export function question(cle: string): Question | undefined {
  return QUESTIONS.find((q) => q.cle === cle);
}

export type Reponses = Record<string, string | string[]>;

/** Une réponse est-elle vide ? (chaîne blanche ou tableau sans élément) */
export function vide(v: string | string[] | undefined): boolean {
  if (Array.isArray(v)) return v.length === 0;
  return !v || !v.trim();
}

/** Une question conditionnelle ne s'affiche que si sa dépendance est satisfaite. */
export function visible(q: Question, reponses: Reponses): boolean {
  if (!q.depend) return true;
  return reponses[q.depend.cle] === q.depend.valeur;
}

/** Les clés obligatoires encore vides, dans l'ordre du questionnaire. */
export function manquantes(reponses: Reponses, etape?: Etape): string[] {
  const source = etape ? etape.questions : QUESTIONS;
  return source
    .filter((q) => q.obligatoire && visible(q, reponses) && vide(reponses[q.cle]))
    .map((q) => q.cle);
}

// ─── Score d'éligibilité ────────────────────────────────────────────────────
//
// Le score dit une seule chose : cette personne est-elle prête à entrer dans
// une démarche, ou vient-elle consommer une consultation de plus ? Il pèse donc
// d'abord l'engagement déclaré, ensuite l'antériorité du travail personnel, et
// seulement à la marge la capacité financière. Les barèmes se modifient ici.

const BAREMES: { cle: string; libelle: string; points: Record<string, number> }[] = [
  {
    cle: "investir_temps",
    libelle: "Prêt à investir du temps et de l'énergie",
    points: { "Oui, pleinement": 25, "J'ai besoin d'y réfléchir": 8, "Non, pas pour le moment": 0 },
  },
  {
    cle: "remettre_en_question",
    libelle: "Prêt à remettre ses schémas en question",
    points: { Oui: 20, "Peut-être": 7, Non: 0 },
  },
  {
    cle: "travail_personnel",
    libelle: "Travail personnel déjà entrepris",
    points: { Oui: 10, Non: 0 },
  },
  {
    cle: "depuis_quand",
    libelle: "Antériorité du travail personnel",
    points: { "Moins d'un an": 2, "1 à 3 ans": 5, "3 à 5 ans": 8, "Plus de 5 ans": 10 },
  },
  {
    cle: "pratique_reconnexion",
    libelle: "Pratique de reconnexion en cours",
    points: { "Oui, régulièrement": 10, Parfois: 5, "Non, jamais": 0 },
  },
  {
    cle: "blessure_identifiee",
    libelle: "Blessure ou schéma déjà identifié",
    points: { Oui: 8, Non: 0 },
  },
  {
    cle: "revenu",
    libelle: "Capacité d'investissement",
    points: { "0 – 2 000 €": 0, "2 000 – 5 000 €": 7, "Plus de 5 000 €": 12 },
  },
];

/** Champs libres dont le soin apporté à la réponse compte dans le score. */
const CHAMPS_DEVELOPPES = [
  "prise_conscience",
  "difficulte_1",
  "difficulte_2",
  "difficulte_3",
  "empechement",
  "etat_emotionnel",
  "aspect_transformer",
];

const POINTS_REDACTION = 15;
const SIGNES_POUR_LE_MAXIMUM = 900;
const TOTAL_MAXIMUM = 110;

export const SEUIL_ELIGIBILITE = 60;

export type Detail = { libelle: string; points: number };
export type Evaluation = { score: number; eligible: boolean; details: Detail[] };

/**
 * Note une copie sur 100. Le détail est conservé pour que le tableau de bord
 * puisse montrer d'où vient la note plutôt qu'un chiffre tombé du ciel.
 */
export function evaluer(reponses: Reponses): Evaluation {
  const details: Detail[] = [];
  let total = 0;

  for (const bareme of BAREMES) {
    const valeur = reponses[bareme.cle];
    if (typeof valeur !== "string") continue;
    const points = bareme.points[valeur];
    if (points === undefined) continue;
    total += points;
    details.push({ libelle: bareme.libelle, points });
  }

  const signes = CHAMPS_DEVELOPPES.reduce((n, cle) => {
    const v = reponses[cle];
    return n + (typeof v === "string" ? v.trim().length : 0);
  }, 0);
  const redaction = Math.round(
    Math.min(1, signes / SIGNES_POUR_LE_MAXIMUM) * POINTS_REDACTION,
  );
  total += redaction;
  details.push({ libelle: "Soin apporté aux réponses écrites", points: redaction });

  const score = Math.min(100, Math.round((total / TOTAL_MAXIMUM) * 100));
  return { score, eligible: score >= SEUIL_ELIGIBILITE, details };
}
