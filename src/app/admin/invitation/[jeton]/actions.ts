"use server";

import { redirect } from "next/navigation";
import { activerInvitation } from "@/lib/crm/utilisateurs";
import { tracerPublic } from "@/lib/crm/journal";

/**
 * L'activation d'un compte par la personne invitée elle-même.
 *
 * Cette action est ouverte : celui qui l'appelle n'a pas encore de compte, et
 * c'est justement ce qu'il vient créer. Ce qui l'autorise, c'est le jeton — à
 * usage unique, valable sept jours, et vérifié contre son empreinte en base.
 */
export async function actionActiverInvitation(donnees: FormData) {
  const jeton = String(donnees.get("jeton") ?? "");
  const motDePasse = String(donnees.get("motDePasse") ?? "");
  const confirmation = String(donnees.get("confirmation") ?? "");
  const retour = `/admin/invitation/${encodeURIComponent(jeton)}`;

  if (motDePasse !== confirmation) {
    redirect(`${retour}?erreur=${encodeURIComponent("Les deux mots de passe ne correspondent pas.")}`);
  }

  const resultat = await activerInvitation(jeton, motDePasse);
  if (!resultat.ok) {
    redirect(`${retour}?erreur=${encodeURIComponent(resultat.erreur)}`);
  }

  // La trace est publique : la personne n'a pas encore d'identité de tableau de
  // bord au moment où elle agit.
  await tracerPublic(resultat.nom, "compte_active", "activation par invitation");
  redirect("/admin/login?active=1");
}
