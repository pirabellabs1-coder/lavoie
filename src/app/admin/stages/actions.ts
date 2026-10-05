"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { identite, identiteAvecDroit } from "@/lib/crm/session";
import {
  changerStatutParticipation,
  creerStage,
  publierStage,
  reglerStage,
  supprimerParticipation,
} from "@/lib/crm/stages";
import { ajouterDate, basculerDate, retirerDate } from "@/lib/crm/dates-stages";
import { deposerImage, effacerImage } from "@/lib/crm/images";
import { depuisParis } from "@/lib/heure";
import { tracer } from "@/lib/crm/journal";

/**
 * Le secrétariat gère les places : confirmer, mettre en attente, annuler,
 * marquer venue. Tenir le catalogue — créer un stage, changer son tarif,
 * ouvrir ou fermer des dates — reste au propriétaire.
 */

/**
 * Tout ce qui doit repartir après un geste sur un stage.
 *
 * La page publique d'un stage rend ses dates côté serveur : sans ce rappel,
 * elle resterait dix minutes à annoncer une date qu'on vient de fermer, tandis
 * que le panneau de réservation, lui, dirait vrai. Une page qui se contredit
 * vaut moins qu'une page en retard.
 */
function rafraichir(slug?: string | null) {
  revalidatePath("/admin/stages");
  revalidatePath("/evenements");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/evenements/${slug}`);
}

export async function actionStatutParticipation(donnees: FormData) {
  if (!(await identite())) return;
  const id = String(donnees.get("id") ?? "");
  const statut = String(donnees.get("statut") ?? "");
  if (!id || !statut) return;
  await changerStatutParticipation(id, statut);
  revalidatePath("/admin/stages");
}

/**
 * Publie un stage, ou le retire du site, d'un seul geste.
 *
 * Un stage naît en brouillon : il faut une main pour décider qu'il est prêt.
 * Le réglage complet permet déjà de cocher « ouvert aux demandes », mais
 * publier mérite un bouton, pas un détour dans un formulaire de douze champs.
 */
export async function actionPublierStage(donnees: FormData) {
  const qui = await identiteAvecDroit("sequences");
  if (!qui) return;

  const id = String(donnees.get("id") ?? "");
  const publier = String(donnees.get("publier") ?? "") === "1";
  if (!/^[0-9]+$/.test(id)) return;

  const change = await publierStage(id, publier);
  rafraichir(change.slug);
  if (change.ok) {
    await tracer(qui, publier ? "stage_publie" : "stage_retire", change.titre ?? id);
  }
}

/**
 * Retirer une place. Réservé au propriétaire, et tracé : effacer une ligne ne
 * doit jamais être un geste anonyme.
 */
export async function actionSupprimerParticipation(donnees: FormData) {
  const qui = await identiteAvecDroit("sequences");
  if (!qui) return;

  const id = String(donnees.get("id") ?? "");
  if (!/^[0-9]+$/.test(id)) return;

  const retiree = await supprimerParticipation(id);
  if (retiree) {
    await tracer(qui, "place_retiree", retiree.nom, retiree.titre);
  }
  revalidatePath("/admin/stages");
}

/**
 * Lit la photo d'un formulaire, s'il y en a une. Renvoie son identifiant, ou un
 * message si le dépôt a échoué : une photo refusée ne doit pas faire échouer
 * l'enregistrement du reste.
 */
async function lirePhoto(
  donnees: FormData,
): Promise<{ id?: string; erreur?: string }> {
  const fichier = donnees.get("photo");
  if (!(fichier instanceof File) || fichier.size === 0) return {};
  const alt = String(donnees.get("photo_alt") ?? "");
  const depot = await deposerImage(fichier, alt);
  return depot.ok ? { id: depot.id } : { erreur: depot.erreur };
}

export async function actionReglerStage(donnees: FormData) {
  if (!(await identiteAvecDroit("sequences"))) return;
  const id = String(donnees.get("id") ?? "");
  const places = Number(donnees.get("places") ?? 12);
  const logistique = String(donnees.get("logistique") ?? "").slice(0, 4000);
  const actif = donnees.get("actif") === "on";
  const titre = String(donnees.get("titre") ?? "");
  const lieu = String(donnees.get("lieu") ?? "");
  const resume = String(donnees.get("resume") ?? "");
  const description = String(donnees.get("description") ?? "");
  const prixBrut = String(donnees.get("prix") ?? "").replace(",", ".");
  const prixEuros = prixBrut.trim() ? Number(prixBrut) : null;
  const retirerImage = donnees.get("retirer_photo") === "on";
  if (!id || !Number.isFinite(places)) return;

  const photo = await lirePhoto(donnees);

  const regle = await reglerStage(id, {
    places,
    logistique,
    actif,
    titre,
    lieu,
    resume,
    description,
    prixEuros: prixEuros != null && Number.isFinite(prixEuros) ? prixEuros : null,
    imageId: photo.id,
    retirerImage,
  });

  if (!regle.ok) {
    // L'écriture a échoué : la photo qu'on vient de déposer ne sera jamais
    // référencée, elle ne doit pas rester en base.
    if (photo.id) await effacerImage(photo.id);
    redirect(
      `/admin/stages?erreur=${encodeURIComponent("Ce stage n'a pas pu être enregistré.")}#stage-${id}`,
    );
  }

  // L'ancienne photo ne part qu'une fois la nouvelle en place : une image
  // effacée trop tôt laisserait une page sans illustration si l'écriture
  // échouait juste après. Son identifiant vient de la base, pas du formulaire.
  if ((photo.id || retirerImage) && regle.ancienneImage && regle.ancienneImage !== photo.id) {
    await effacerImage(regle.ancienneImage);
  }

  rafraichir(regle.slug);
  if (photo.erreur) {
    redirect(`/admin/stages?erreur=${encodeURIComponent(photo.erreur)}#stage-${id}`);
  }
}

/** Crée un stage qui n'existe pas au catalogue du code. */
export async function actionCreerStage(donnees: FormData) {
  const qui = await identiteAvecDroit("sequences");
  if (!qui) return;

  const titre = String(donnees.get("titre") ?? "");
  const lieu = String(donnees.get("lieu") ?? "");
  const resume = String(donnees.get("resume") ?? "");
  const description = String(donnees.get("description") ?? "");
  const places = Number(donnees.get("places") ?? 12);
  const prixBrut = String(donnees.get("prix") ?? "").replace(",", ".");
  const prixEuros = prixBrut.trim() ? Number(prixBrut) : null;

  // Une photo refusée ne fait pas échouer la création : le texte de la page
  // peut compter vingt mille caractères, et une redirection les perdrait tous
  // pour une image trop lourde. On crée, puis on le dit.
  const photo = await lirePhoto(donnees);

  const resultat = await creerStage({
    titre,
    lieu,
    resume,
    description,
    places: Number.isFinite(places) ? places : 12,
    prixEuros: prixEuros != null && Number.isFinite(prixEuros) ? prixEuros : null,
    imageId: photo.id ?? null,
  });

  rafraichir(resultat.ok ? resultat.slug : null);
  if (!resultat.ok) {
    // Même motif : une photo sans stage est une photo orpheline.
    if (photo.id) await effacerImage(photo.id);
    redirect(`/admin/stages?erreur=${encodeURIComponent(resultat.erreur)}#creer`);
  }
  await tracer(qui, "stage_cree", titre);
  if (photo.erreur) {
    redirect(
      `/admin/stages?erreur=${encodeURIComponent(
        `${photo.erreur} Le stage est créé : ajoutez-lui sa photo dans « Régler ce stage ».`,
      )}#stage-${resultat.id}`,
    );
  }
  redirect(`/admin/stages?cree=1#stage-${resultat.id}`);
}

/** Ajoute un jour de disponibilité à un stage. */
export async function actionAjouterDate(donnees: FormData) {
  if (!(await identiteAvecDroit("sequences"))) return;

  const stageId = String(donnees.get("stage") ?? "");
  const debutSaisi = String(donnees.get("debut") ?? "").trim();
  const finSaisie = String(donnees.get("fin") ?? "").trim();
  const places = Number(donnees.get("places") ?? 0);
  if (!/^\d+$/.test(stageId) || !debutSaisi) return;

  // La saisie est lue en heure de Paris, pas en heure du serveur.
  const debut = depuisParis(debutSaisi);
  const fin = finSaisie ? depuisParis(finSaisie) : null;
  if (!debut) {
    redirect(`/admin/stages?erreur=${encodeURIComponent("Cette date est illisible.")}#stage-${stageId}`);
  }
  if (fin && fin.getTime() < debut.getTime()) {
    redirect(
      `/admin/stages?erreur=${encodeURIComponent("La fin tombe avant le début.")}#stage-${stageId}`,
    );
  }

  const posee = await ajouterDate({
    stageId,
    debut,
    fin,
    places: Number.isFinite(places) && places > 0 ? places : null,
  });
  rafraichir(posee.slug);
  redirect(`/admin/stages#stage-${stageId}`);
}

export async function actionBasculerDate(donnees: FormData) {
  if (!(await identiteAvecDroit("sequences"))) return;
  const id = String(donnees.get("id") ?? "");
  const ouverte = String(donnees.get("ouverte") ?? "") === "1";
  if (!/^\d+$/.test(id)) return;
  const bascule = await basculerDate(id, ouverte);
  rafraichir(bascule.slug);
}

export async function actionRetirerDate(donnees: FormData) {
  if (!(await identiteAvecDroit("sequences"))) return;
  const id = String(donnees.get("id") ?? "");
  const stageId = String(donnees.get("stage") ?? "");
  if (!/^\d+$/.test(id)) return;

  const resultat = await retirerDate(id);
  rafraichir(resultat.slug);
  if (!resultat.ok) {
    redirect(
      `/admin/stages?erreur=${encodeURIComponent(resultat.raison ?? "Suppression refusée.")}#stage-${stageId}`,
    );
  }
}
