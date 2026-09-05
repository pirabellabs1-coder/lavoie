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
import { tracer } from "@/lib/crm/journal";

/**
 * Toutes ces actions sont réservées au propriétaire. La vérification est refaite
 * ici : une Server Action est une adresse publique, et la barre latérale qui
 * masque le lien ne protège rien.
 */

export async function actionCreerCompte(donnees: FormData) {
  const qui = await identiteAvecDroit("comptes");
  if (!qui) return;

  const email = String(donnees.get("email") ?? "");
  const nom = String(donnees.get("nom") ?? "");
  const motDePasse = String(donnees.get("motDePasse") ?? "");
  const role = String(donnees.get("role") ?? "secretariat");
  if (!estRoleValide(role)) return;

  const resultat = await creerUtilisateur({ email, nom, motDePasse, role });
  if (resultat.ok) await tracer(qui, "compte_cree", `${nom} (${email})`, role);
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
  await tracer(qui, "compte_bascule", `compte ${id}`, actif ? "accès rendu" : "accès retiré");
  revalidatePath("/admin/comptes");
}

export async function actionChangerMotDePasse(donnees: FormData) {
  const qui = await identiteAvecDroit("comptes");
  if (!qui) return;

  const id = String(donnees.get("id") ?? "");
  const motDePasse = String(donnees.get("motDePasse") ?? "");
  if (!id) return;

  const ok = await changerMotDePasse(id, motDePasse);
  if (ok) await tracer(qui, "compte_mdp", `compte ${id}`);
  revalidatePath("/admin/comptes");
  if (!ok) {
    redirect(
      "/admin/comptes?erreur=" +
        encodeURIComponent("Mot de passe trop court : douze caractères au minimum."),
    );
  }
  redirect("/admin/comptes?modifie=1");
}

/**
 * Remettre le fichier à zéro. Sans retour possible, donc verrouillé à double
 * tour : réservé au propriétaire, et il faut écrire le mot exact. Un bouton
 * seul finit toujours par être cliqué un jour de fatigue.
 */
export async function actionViderLeFichier(donnees: FormData) {
  const qui = await identiteAvecDroit("comptes");
  if (!qui) return;

  if (String(donnees.get("confirmation") ?? "").trim() !== "VIDER") {
    redirect(
      "/admin/comptes?erreur=" +
        encodeURIComponent("Pour remettre le fichier à zéro, écrivez VIDER en majuscules.") +
        "#vider",
    );
  }

  const { viderLeFichier } = await import("@/lib/crm/reinitialisation");
  const purge = await viderLeFichier();

  // La trace s'écrit après coup, dans un journal qui, lui, n'est pas vidé.
  await tracer(
    qui,
    "fichier_vide",
    "toutes les personnes",
    purge ? purge.map((p) => `${p.lignes} ${p.table}`).join(", ") : "échec",
  );

  revalidatePath("/admin/comptes");
  revalidatePath("/admin/contacts");
  revalidatePath("/admin");

  if (!purge) {
    redirect(
      "/admin/comptes?erreur=" +
        encodeURIComponent("L'opération a échoué : rien n'a été retiré.") +
        "#vider",
    );
  }
  const detail =
    purge
      .filter((p) => p.lignes > 0)
      .map((p) => `${p.lignes} ${p.table}`)
      .join(", ") || "il n'y avait rien à retirer";
  redirect(`/admin/comptes?vide=${encodeURIComponent(detail)}#vider`);
}
