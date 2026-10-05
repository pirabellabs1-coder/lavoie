import { getEvenement } from "@/lib/evenements";
import { stagePublic } from "@/lib/crm/stages";
import { datesOuvertes, SANS_DATE } from "@/lib/crm/dates-stages";
import { periodeEnClair } from "@/lib/heure";

/**
 * Ce qu'il faut savoir d'un stage pour le réserver.
 *
 * Les six rendez-vous historiques sont écrits dans le code ; un stage tenu
 * depuis le tableau de bord ne l'est pas. Les deux doivent pourtant pouvoir se
 * réserver — sans quoi la page publique d'un stage créé à l'écran mènerait à un
 * formulaire qui répond « Stage inconnu ».
 */
export type FicheStage = {
  titre: string;
  titreLong: string;
  /** La période, en toutes lettres, telle qu'elle part dans les e-mails. */
  quand: string;
  lieu: string;
};

/**
 * La période annoncée.
 *
 * Elle est lue en base dès qu'une date y est ouverte : c'est elle qui fait foi,
 * et non le texte du catalogue, qui peut annoncer une session déjà passée. Les
 * dates rendues appartiennent au stage par construction — la requête part de
 * son slug — ce qui vaut vérification de l'identifiant reçu du navigateur.
 */
async function quandDuStage(
  slug: string,
  dateId: string | null,
  repli: string,
): Promise<string> {
  const ouvertes = await datesOuvertes(slug);
  const choisie = dateId ? ouvertes.find((d) => String(d.id) === dateId) : null;
  const date = choisie ?? ouvertes[0] ?? null;
  return date ? periodeEnClair(date.debut_le, date.fin_le) : repli;
}

/** Renvoie `null` si le stage n'existe pas, ou s'il n'est pas publié. */
export async function ficheDuStage(
  slug: string,
  dateId: string | null,
): Promise<FicheStage | null> {
  const e = getEvenement(slug);
  if (e) {
    return {
      titre: e.titre,
      titreLong: e.titreLong,
      quand: await quandDuStage(slug, dateId, e.date),
      lieu: e.lieu,
    };
  }

  // Hors catalogue : un stage du tableau de bord. Un brouillon n'en est pas un
  // — il n'a pas de page publique, il n'a pas à prendre de réservation.
  const stage = await stagePublic(slug);
  if (!stage || !stage.actif) return null;
  return {
    titre: stage.titre,
    titreLong: stage.titre,
    quand: await quandDuStage(slug, dateId, SANS_DATE),
    lieu: stage.lieu ?? "communiqué à l'inscription",
  };
}
