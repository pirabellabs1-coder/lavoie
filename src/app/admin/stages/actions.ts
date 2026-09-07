"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { identite, identiteAvecDroit } from "@/lib/crm/session";
import { changerStatutParticipation, creerStage, reglerStage } from "@/lib/crm/stages";
import { ajouterDate, basculerDate, retirerDate } from "@/lib/crm/dates-stages";
import { depuisParis } from "@/lib/heure";
import { tracer } from "@/lib/crm/journal";

/**
 * Le secrétariat gère les places : confirmer, mettre en attente, annuler,
 * marquer venue. Tenir le catalogue — créer un stage, changer son tarif,
 * ouvrir ou fermer des dates — reste au propriétaire.
 */

export async function actionStatutParticipation(donnees: FormData) {
  if (!(await identite())) return;
  const id = String(donnees.get("id") ?? "");
  const statut = String(donnees.get("statut") ?? "");
  if (!id || !statut) return;
  await changerStatutParticipation(id, statut);
  revalidatePath("/admin/stages");
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
  const prixBrut = String(donnees.get("prix") ?? "").replace(",", ".");
  const prixEuros = prixBrut.trim() ? Number(prixBrut) : null;
  if (!id || !Number.isFinite(places)) return;

  await reglerStage(id, {
    places,
    logistique,
    actif,
    titre,
    lieu,
    resume,
    prixEuros: prixEuros != null && Number.isFinite(prixEuros) ? prixEuros : null,
  });
  revalidatePath("/admin/stages");
  revalidatePath("/evenements");
}

/** Crée un stage qui n'existe pas au catalogue du code. */
export async function actionCreerStage(donnees: FormData) {
  const qui = await identiteAvecDroit("sequences");
  if (!qui) return;

  const titre = String(donnees.get("titre") ?? "");
  const lieu = String(donnees.get("lieu") ?? "");
  const resume = String(donnees.get("resume") ?? "");
  const places = Number(donnees.get("places") ?? 12);
  const prixBrut = String(donnees.get("prix") ?? "").replace(",", ".");
  const prixEuros = prixBrut.trim() ? Number(prixBrut) : null;

  const resultat = await creerStage({
    titre,
    lieu,
    resume,
    places: Number.isFinite(places) ? places : 12,
    prixEuros: prixEuros != null && Number.isFinite(prixEuros) ? prixEuros : null,
  });

  revalidatePath("/admin/stages");
  if (!resultat.ok) {
    redirect(`/admin/stages?erreur=${encodeURIComponent(resultat.erreur)}#creer`);
  }
  await tracer(qui, "stage_cree", titre);
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

  await ajouterDate({
    stageId,
    debut,
    fin,
    places: Number.isFinite(places) && places > 0 ? places : null,
  });
  revalidatePath("/admin/stages");
  revalidatePath("/evenements");
  redirect(`/admin/stages#stage-${stageId}`);
}

export async function actionBasculerDate(donnees: FormData) {
  if (!(await identiteAvecDroit("sequences"))) return;
  const id = String(donnees.get("id") ?? "");
  const ouverte = String(donnees.get("ouverte") ?? "") === "1";
  if (!/^\d+$/.test(id)) return;
  await basculerDate(id, ouverte);
  revalidatePath("/admin/stages");
  revalidatePath("/evenements");
}

export async function actionRetirerDate(donnees: FormData) {
  if (!(await identiteAvecDroit("sequences"))) return;
  const id = String(donnees.get("id") ?? "");
  const stageId = String(donnees.get("stage") ?? "");
  if (!/^\d+$/.test(id)) return;

  const resultat = await retirerDate(id);
  revalidatePath("/admin/stages");
  revalidatePath("/evenements");
  if (!resultat.ok) {
    redirect(
      `/admin/stages?erreur=${encodeURIComponent(resultat.raison ?? "Suppression refusée.")}#stage-${stageId}`,
    );
  }
}
