"use server";

import { revalidatePath } from "next/cache";
import { identite } from "@/lib/crm/session";
import {
  changerStatutTemoignage,
  supprimerTemoignage,
} from "@/lib/crm/temoignages";

/**
 * La modération des témoignages est ouverte à toute personne connectée : c'est
 * du travail éditorial courant, pas une opération sensible. Publier revalide
 * aussi la page publique pour que le changement se voie tout de suite.
 */

export async function actionStatutTemoignage(donnees: FormData) {
  if (!(await identite())) return;
  const id = String(donnees.get("id") ?? "");
  const statut = String(donnees.get("statut") ?? "");
  if (!id || !statut) return;
  await changerStatutTemoignage(id, statut);
  revalidatePath("/admin/temoignages");
  revalidatePath("/temoignages");
}

export async function actionSupprimerTemoignage(donnees: FormData) {
  if (!(await identite())) return;
  const id = String(donnees.get("id") ?? "");
  if (!id) return;
  await supprimerTemoignage(id);
  revalidatePath("/admin/temoignages");
  revalidatePath("/temoignages");
}
