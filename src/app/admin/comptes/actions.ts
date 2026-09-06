"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { identiteAvecDroit } from "@/lib/crm/session";
import {
  basculerUtilisateur,
  estRoleValide,
  inviterUtilisateur,
  obtenirUtilisateur,
  poserInvitation,
} from "@/lib/crm/utilisateurs";
import { envoyerInvitation } from "@/lib/crm/invitations";
import { tracer } from "@/lib/crm/journal";

/**
 * Toutes ces actions sont réservées au propriétaire. La vérification est refaite
 * ici : une Server Action est une adresse publique, et la barre latérale qui
 * masque le lien ne protège rien.
 */

/**
 * Inviter quelqu'un. On ne saisit que son nom, son adresse et son rôle : le
 * mot de passe ne passe jamais par ici. La personne le choisit elle-même en
 * suivant le lien reçu, et elle est la seule à le connaître.
 */
export async function actionInviterCompte(donnees: FormData) {
  const qui = await identiteAvecDroit("comptes");
  if (!qui) return;

  const email = String(donnees.get("email") ?? "");
  const nom = String(donnees.get("nom") ?? "");
  const role = String(donnees.get("role") ?? "secretariat");
  if (!estRoleValide(role)) return;

  const resultat = await inviterUtilisateur({ email, nom, role });
  if (!resultat.ok) {
    redirect(`/admin/comptes?erreur=${encodeURIComponent(resultat.erreur)}`);
  }

  const souci = await envoyerInvitation({
    email: email.trim().toLowerCase(),
    nom,
    role,
    jeton: resultat.jeton,
    parQui: qui.nom,
  });
  await tracer(qui, "compte_invite", `${nom} (${email})`, souci ? `échec : ${souci}` : role);
  revalidatePath("/admin/comptes");

  // Le compte existe même si l'e-mail n'est pas parti : on le dit, et le bouton
  // « Renvoyer l'invitation » de la liste permet de réessayer.
  if (souci) {
    redirect(
      `/admin/comptes?erreur=${encodeURIComponent(
        `Le compte est créé, mais l'invitation n'est pas partie : ${souci}`,
      )}`,
    );
  }
  redirect(`/admin/comptes?invite=${encodeURIComponent(email.trim().toLowerCase())}`);
}

/**
 * Renvoyer un lien : invitation perdue, expirée, ou mot de passe oublié. C'est
 * la seule façon de rendre un accès — personne ne peut en choisir un pour
 * quelqu'un d'autre.
 */
export async function actionRenvoyerInvitation(donnees: FormData) {
  const qui = await identiteAvecDroit("comptes");
  if (!qui) return;

  const id = String(donnees.get("id") ?? "");
  if (!/^\d+$/.test(id)) return;

  const u = await obtenirUtilisateur(id);
  if (!u) redirect("/admin/comptes?erreur=" + encodeURIComponent("Ce compte est introuvable."));

  const jeton = await poserInvitation(id);
  if (!jeton) {
    redirect("/admin/comptes?erreur=" + encodeURIComponent("Le lien n'a pas pu être préparé."));
  }

  const souci = await envoyerInvitation({
    email: u.email,
    nom: u.nom,
    role: u.role,
    jeton,
    parQui: qui.nom,
    renvoi: true,
  });
  await tracer(qui, "compte_invite", `compte ${id}`, souci ? `échec : ${souci}` : "lien renvoyé");
  revalidatePath("/admin/comptes");

  if (souci) {
    redirect(`/admin/comptes?erreur=${encodeURIComponent(`L'envoi a échoué : ${souci}`)}`);
  }
  redirect(`/admin/comptes?invite=${encodeURIComponent(u.email)}`);
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
