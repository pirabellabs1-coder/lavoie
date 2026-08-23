"use server";

import { revalidatePath } from "next/cache";
import { confirmerPrerequis } from "@/lib/crm/questionnaires";

/**
 * Confirmation des prérequis en un clic. Volontairement minimale : aucun compte
 * à créer, aucun mot de passe — le jeton du lien suffit, et il ne donne accès
 * à rien d'autre qu'à cette validation.
 */
export async function actionConfirmerPrerequis(donnees: FormData): Promise<void> {
  const jeton = String(donnees.get("jeton") ?? "");
  await confirmerPrerequis(jeton);
  revalidatePath(`/prerequis/${jeton}`);
}
