import type { Reponses } from "@/lib/questionnaire";

/**
 * Les profils de personnes.
 *
 * Jusqu'ici, une seule chose distinguait deux inscrits : leur revenu. C'était
 * peu. Une dirigeante de cinquante-cinq ans qui a tout réussi et ne sent plus
 * rien, et un salarié de trente ans qui démarre, n'ont ni les mêmes objections,
 * ni le même vocabulaire, ni la même porte d'entrée — leur envoyer le même
 * e-mail, c'est n'en toucher aucun des deux.
 *
 * Un profil n'est donc pas une étiquette commerciale : c'est la réponse à
 * « qu'est-ce que cette personne a besoin d'entendre d'abord ». Il décide la
 * séquence, il colore la fiche, il sert de cible aux campagnes.
 *
 * Il se déduit du questionnaire et ne s'invente jamais : sans questionnaire,
 * le profil reste inconnu, et la personne suit le parcours général.
 */

export type CleProfil =
  | "dirigeant"
  | "cadre"
  | "avance"
  | "debutant"
  | "accessible"
  | "inconnu";

export type Profil = {
  cle: CleProfil;
  /** Le nom qu'on lit dans le tableau de bord. */
  nom: string;
  /** Deux mots, pour une pastille. */
  court: string;
  /** Qui c'est, en une phrase. */
  phrase: string;
  /** Ce qu'on vise pour cette personne, en une phrase. */
  vers: string;
  /** La séquence qui lui parle. */
  sequence: string;
  /**
   * Le ton de la pastille. L'union plutôt qu'une chaîne : le CSS ne connaît
   * que ces valeurs, et une faute de frappe donnerait une pastille sans style,
   * en silence.
   */
  ton: "nouveau" | "lead" | "contacte" | "appel" | "proposition" | "client" | "perdu";
};

export const PROFILS: Profil[] = [
  {
    cle: "dirigeant",
    nom: "Dirigeant en crise silencieuse",
    court: "Dirigeant",
    phrase:
      "Dirige ou travaille à son compte, gagne bien sa vie, et quelque chose s'est éteint derrière la réussite.",
    vers: "L'entretien individuel, puis l'accompagnement.",
    sequence: "dirigeant",
    ton: "appel",
  },
  {
    cle: "cadre",
    nom: "En transition",
    court: "Transition",
    phrase:
      "Salarié ou en reconversion, budget réel mais mesuré, se pose la question depuis un moment.",
    vers: "Un stage de saison au Centre HUT.",
    sequence: "cadre",
    ton: "lead",
  },
  {
    cle: "avance",
    nom: "Chemin déjà engagé",
    court: "Avancé",
    phrase:
      "Plus de trois ans de travail personnel, une pratique tenue, une blessure déjà nommée.",
    vers: "Le Cycle des Saisons complet, le jeûne.",
    sequence: "avance",
    ton: "client",
  },
  {
    cle: "debutant",
    nom: "Premier pas",
    court: "Débutant",
    phrase: "N'a jamais entrepris de travail personnel. Arrive par le guide ou une conférence.",
    vers: "Le livret sur le Cadre, puis un cercle.",
    sequence: "debutant",
    ton: "nouveau",
  },
  {
    cle: "accessible",
    nom: "Budget serré",
    court: "Accessible",
    phrase:
      "Moins de 2 000 € par mois : un accompagnement premium ne serait pas tenable, et le dire est plus honnête que le vendre.",
    vers: "Les cercles à 70 € et les ressources écrites.",
    sequence: "formations",
    ton: "contacte",
  },
  {
    cle: "inconnu",
    nom: "Profil inconnu",
    court: "Inconnu",
    phrase: "Pas encore de questionnaire : on ne sait pas à qui on parle.",
    vers: "Le parcours général, jusqu'au questionnaire.",
    sequence: "guide",
    ton: "nouveau",
  },
];

const PAR_CLE = new Map(PROFILS.map((p) => [p.cle, p]));

export function profil(cle: string | null | undefined): Profil {
  return PAR_CLE.get((cle ?? "inconnu") as CleProfil) ?? PAR_CLE.get("inconnu")!;
}

/** Travaille sur soi depuis assez longtemps pour qu'on ne lui réexplique pas les bases. */
function cheminEngage(r: Reponses): boolean {
  if (r.travail_personnel !== "Oui") return false;
  const depuis = r.depuis_quand;
  return depuis === "3 à 5 ans" || depuis === "Plus de 5 ans";
}

function travailleAuSommet(r: Reponses): boolean {
  return (
    r.situation_pro === "Dirigeant(e) / Chef d'entreprise" ||
    r.situation_pro === "Indépendant(e) / Entrepreneur"
  );
}

/**
 * Le profil d'une copie de questionnaire.
 *
 * L'ordre des règles est la décision elle-même :
 *
 *   1. le budget d'abord — proposer un accompagnement à quelqu'un qui ne peut
 *      pas le suivre ne sert personne, quelle que soit sa maturité ;
 *   2. puis ceux qui dirigent et en ont les moyens, parce que leur objection
 *      n'est jamais le prix mais le temps et la crédibilité ;
 *   3. puis le chemin déjà engagé, qu'il faut cesser de prendre pour un
 *      débutant ;
 *   4. puis celui qui n'a jamais rien entrepris, à qui on ne vend rien tout de
 *      suite ;
 *   5. et le reste, qui est la transition ordinaire — la plus nombreuse.
 */
export function profilDesReponses(reponses: Reponses): CleProfil {
  if (reponses.revenu === "0 – 2 000 €") return "accessible";
  if (travailleAuSommet(reponses) && reponses.revenu === "Plus de 5 000 €") return "dirigeant";
  if (cheminEngage(reponses)) return "avance";
  if (reponses.travail_personnel === "Non") return "debutant";
  return "cadre";
}
