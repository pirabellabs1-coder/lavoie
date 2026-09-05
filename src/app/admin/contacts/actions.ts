"use server";

import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { enregistrerContact, estStatutValide, journaliser } from "@/lib/crm/contacts";
import { identite } from "@/lib/crm/session";
import { peut } from "@/lib/crm/utilisateurs";
import { categorie } from "@/lib/crm/categories";
import { entreeDansLaSequence } from "@/lib/crm/ajouts";
import { tracer } from "@/lib/crm/journal";

const RE_EMAIL = /^[^@\s,;]+@[^@\s,;]+\.[^@\s,;]+$/;

function erreur(message: string): never {
  redirect(`/admin/contacts?erreur=${encodeURIComponent(message)}#ajouter`);
}

/**
 * Créer une fiche à la main, depuis la liste des contacts.
 *
 * Le pendant, pour une seule personne, du panneau d'ajout des séquences : la
 * personne rencontrée en stage, l'adresse notée au téléphone. Une adresse déjà
 * connue n'est pas dupliquée — sa fiche est complétée, et l'on arrive dessus.
 *
 * La catégorie est facultative : on peut vouloir seulement noter quelqu'un
 * dans le fichier, sans rien lui envoyer. Dès qu'elle est choisie, c'est elle
 * qui décide du statut et de la source, et l'accord devient obligatoire.
 */
export async function actionCreerContact(donnees: FormData) {
  const qui = await identite();
  if (!qui) return;

  const email = String(donnees.get("email") ?? "").trim().toLowerCase().slice(0, 254);
  if (!RE_EMAIL.test(email)) erreur("Cette adresse e-mail n'est pas lisible.");

  const prenom = String(donnees.get("prenom") ?? "").trim().slice(0, 80);
  const nom = String(donnees.get("nom") ?? "").trim().slice(0, 80);
  const telephone = String(donnees.get("telephone") ?? "").trim().slice(0, 40);
  const note = String(donnees.get("note") ?? "").trim().slice(0, 2000);

  const cle = String(donnees.get("categorie") ?? "");
  const cat = cle ? categorie(cle) : null;
  const inscrire = Boolean(cat?.manuel) && peut(qui.role, "sequences");
  if (cle && !inscrire) erreur("Cette catégorie n'accepte pas d'ajout à la main.");
  if (inscrire && donnees.get("accord") !== "on") {
    erreur("Sans l'accord de la personne concernée, rien n'est envoyé.");
  }

  const statutChoisi = String(donnees.get("statut") ?? "nouveau");
  const statut = cat?.statut ?? (estStatutValide(statutChoisi) ? statutChoisi : "nouveau");
  const source =
    cat?.source ?? (String(donnees.get("source") ?? "").trim().slice(0, 120) || "Ajout manuel");

  const contact = await enregistrerContact({
    email,
    prenom,
    nom,
    telephone,
    source,
    statut,
    message: note,
    libelleEvenement: cat
      ? `Ajout manuel dans « ${cat.cat} » par ${qui.nom}`
      : `Fiche créée à la main par ${qui.nom}`,
  });
  if (!contact) {
    erreur("La fiche n'a pas pu être enregistrée. La base est peut-être indisponible.");
  }

  await tracer(qui, "contact_cree", `contact ${contact.id}`, cat ? cat.cat : "sans séquence");

  let suite = "";
  if (inscrire && cat) {
    const { inscrireContact, traiterEcheances } = await import("@/lib/crm/sequences");
    suite = await inscrireContact(contact.id, cat.cle, {
      reprendre: true,
      exigerConsentement: true,
    });
    if (suite === "inscrite" || suite === "reprise") {
      await journaliser(contact.id, "consentement", entreeDansLaSequence(cat.cat, qui.nom));
      // Le premier e-mail d'une catégorie part souvent à J+0 : il n'attend pas
      // le passage du worker le lendemain matin.
      after(async () => {
        await traiterEcheances(5);
      });
    }
  }

  revalidatePath("/admin/contacts");
  revalidatePath("/admin");
  redirect(
    `/admin/contacts/${contact.id}?cree=${contact.nouveau ? "1" : "connue"}${
      suite ? `&seq=${suite}` : ""
    }`,
  );
}
