"use server";

import { revalidatePath } from "next/cache";
import { repondreOffre } from "@/lib/crm/offres";

/**
 * La réponse à une proposition. Le jeton du lien suffit — pas de compte à
 * créer pour dire oui ou non, et il ne donne accès à rien d'autre.
 */
export async function actionRepondre(donnees: FormData): Promise<void> {
  const jeton = String(donnees.get("jeton") ?? "");
  const reponse = String(donnees.get("reponse") ?? "");
  if (reponse !== "oui" && reponse !== "non") return;

  await repondreOffre(jeton, reponse === "oui");
  revalidatePath(`/proposition/${jeton}`);
}
