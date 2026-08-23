"use server";

import { revalidatePath } from "next/cache";
import { identiteAvecDroit } from "@/lib/crm/session";
import { identite } from "@/lib/crm/session";
import { changerStatutParticipation, reglerStage } from "@/lib/crm/stages";

/**
 * Le secrétariat gère les places : confirmer, mettre en attente, annuler,
 * marquer venue. Régler un stage — nombre de places, texte de logistique —
 * reste au propriétaire.
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
  if (!id || !Number.isFinite(places)) return;
  await reglerStage(id, { places, logistique, actif });
  revalidatePath("/admin/stages");
}
