"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { identiteAvecDroit } from "@/lib/crm/session";
import {
  basculerUtilisateur,
  changerMotDePasse,
  creerUtilisateur,
  estRoleValide,
} from "@/lib/crm/utilisateurs";

/**
 * Toutes ces actions sont réservées au propriétaire. La vérification est refaite
 * ici : une Server Action est une adresse publique, et la barre latérale qui
 * masque le lien ne protège rien.
 */

export async function actionCreerCompte(donnees: FormData) {
  if (!(await identiteAvecDroit("comptes"))) return;

  const email = String(donnees.get("email") ?? "");
  const nom = String(donnees.get("nom") ?? "");
  const motDePasse = String(donnees.get("motDePasse") ?? "");
  const role = String(donnees.get("role") ?? "secretariat");
  if (!estRoleValide(role)) return;

  const resultat = await creerUtilisateur({ email, nom, motDePasse, role });
  revalidatePath("/admin/comptes");

  // L'erreur repasse par l'URL : la page reste servie par le serveur, sans état
  // client à maintenir pour un formulaire utilisé trois fois par an.
  if (!resultat.ok) {
    redirect(`/admin/comptes?erreur=${encodeURIComponent(resultat.erreur)}`);
  }
  redirect("/admin/comptes?cree=1");
}

export async function actionBasculerCompte(donnees: FormData) {
  const qui = await identiteAvecDroit("comptes");
  if (!qui) return;

  const id = String(donnees.get("id") ?? "");
  const actif = String(donnees.get("actif") ?? "") === "1";
  if (!id) return;

  // Se désactiver soi-même reviendrait à se mettre dehors.
  if (id === qui.id) {
    redirect("/admin/comptes?erreur=" + encodeURIComponent("Vous ne pouvez pas désactiver votre propre compte."));
  }

  await basculerUtilisateur(id, actif);
  revalidatePath("/admin/comptes");
}

export async function actionChangerMotDePasse(donnees: FormData) {
  if (!(await identiteAvecDroit("comptes"))) return;

  const id = String(donnees.get("id") ?? "");
  const motDePasse = String(donnees.get("motDePasse") ?? "");
  if (!id) return;

  const ok = await changerMotDePasse(id, motDePasse);
  revalidatePath("/admin/comptes");
  if (!ok) {
    redirect(
      "/admin/comptes?erreur=" +
        encodeURIComponent("Mot de passe trop court : douze caractères au minimum."),
    );
  }
  redirect("/admin/comptes?modifie=1");
}
