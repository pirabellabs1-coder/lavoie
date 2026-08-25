"use server";

import { redirect } from "next/navigation";
import { effacer, lireJeton } from "@/lib/crm/rgpd";
import { tracerPublic } from "@/lib/crm/journal";

/**
 * Efface les données de la personne. Le jeton signé dans le formulaire prouve
 * l'identité ; l'effacement est journalisé, puis la personne est renvoyée vers
 * une page de confirmation.
 */
export async function actionEffacer(donnees: FormData): Promise<void> {
  const jeton = String(donnees.get("jeton") ?? "");
  const email = await lireJeton(jeton);
  if (!email) redirect("/mes-donnees/verifier?t=expire");

  const ok = await effacer(email);
  if (ok) {
    await tracerPublic(email, "rgpd_effacement", email, "Effacement demandé par la personne");
  }
  redirect(ok ? "/mes-donnees/verifier?efface=1" : "/mes-donnees/verifier?t=expire");
}
