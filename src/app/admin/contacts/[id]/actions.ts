"use server";

import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  changerStatut,
  enregistrerNote,
  estStatutValide,
  journaliser,
} from "@/lib/crm/contacts";
import { definirRdv } from "@/lib/crm/questionnaires";
import { depuisParis } from "@/lib/heure";
import { identite, identiteAvecDroit } from "@/lib/crm/session";
import { tracer } from "@/lib/crm/journal";
import { categorie } from "@/lib/crm/categories";
import { entreeDansLaSequence } from "@/lib/crm/ajouts";

/**
 * Les Server Actions sont des points d'entrée publics : la session est
 * revérifiée ici, la protection du proxy ne couvrant que la navigation.
 *
 * La vérification passe par `identite()`, qui relit le compte en base : un
 * compte désactivé perd la main tout de suite, sans attendre l'expiration de
 * son cookie. Signer un cookie ne suffit pas à rester habilité.
 */
async function exigerSession(): Promise<boolean> {
  return (await identite()) !== null;
}

export async function actionChangerStatut(formData: FormData) {
  if (!(await exigerSession())) return;
  const id = String(formData.get("id") ?? "");
  const statut = String(formData.get("statut") ?? "");
  if (!id || !estStatutValide(statut)) return;
  await changerStatut(id, statut);
  await tracer(await identite(), "statut", `contact ${id}`, statut);

  // Marquer « Appel fait » déclenche la suite d'entretien — une seule fois par
  // contact (l'inscription ignore les doublons), et le premier e-mail part sans
  // attendre le passage quotidien du worker.
  if (statut === "appel") {
    const { inscrireASequence, traiterEcheances } = await import("@/lib/crm/sequences");
    await inscrireASequence(id, "suivi_entretien");
    after(async () => {
      await traiterEcheances(20);
    });
  }

  revalidatePath(`/admin/contacts/${id}`);
  revalidatePath("/admin/contacts");
  revalidatePath("/admin");
}

/**
 * Fixe la date du rendez-vous portée par le dernier questionnaire. C'est elle
 * qui déclenche, ou non, la clause d'annulation la veille.
 */
export async function actionDefinirRdv(formData: FormData) {
  if (!(await exigerSession())) return;
  const contactId = String(formData.get("contact") ?? "");
  const questionnaireId = String(formData.get("questionnaire") ?? "");
  const quand = String(formData.get("quand") ?? "").trim();
  if (!questionnaireId) return;

  // Un champ vidé retire le rendez-vous ; une saisie illisible ne change rien.
  // La saisie est lue en heure de Paris, pas en heure du serveur.
  const date = quand ? depuisParis(quand) : null;
  if (quand && !date) return;

  await definirRdv(questionnaireId, date);
  revalidatePath(`/admin/contacts/${contactId}`);
}

/** Crée (ou révèle) le code de parrainage d'un contact, à copier pour lui. */
export async function actionGenererParrainage(formData: FormData) {
  if (!(await exigerSession())) return;
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const { codeParrainage } = await import("@/lib/crm/parrainage");
  await codeParrainage(id);
  revalidatePath(`/admin/contacts/${id}`);
}

export async function actionEnregistrerNote(formData: FormData) {
  if (!(await exigerSession())) return;
  const id = String(formData.get("id") ?? "");
  const notes = String(formData.get("notes") ?? "").slice(0, 5000);
  if (!id) return;
  await enregistrerNote(id, notes);
  revalidatePath(`/admin/contacts/${id}`);
}

/**
 * Ajoute la personne dans une catégorie, donc dans la séquence qui la sert.
 *
 * C'est le pendant, pour une fiche ouverte, du panneau d'ajout des séquences :
 * la personne rencontrée hors du site, ou qu'on veut faire repasser par un
 * parcours qu'elle a déjà terminé.
 */
export async function actionInscrireContact(formData: FormData) {
  const qui = await identiteAvecDroit("sequences");
  if (!qui) return;

  const id = String(formData.get("id") ?? "");
  const cle = String(formData.get("cle") ?? "");
  const cat = categorie(cle);
  if (!/^\d+$/.test(id) || !cat.manuel) return;

  // Même règle qu'un ajout depuis la page des séquences : l'accord des
  // personnes concernées est déclaré, et il se retrouve au journal.
  if (formData.get("accord") !== "on") {
    redirect(`/admin/contacts/${id}?seq=sans_accord`);
  }

  const { inscrireContact, traiterEcheances } = await import("@/lib/crm/sequences");
  const resultat = await inscrireContact(id, cle, {
    reprendre: true,
    exigerConsentement: true,
  });

  if (resultat === "inscrite" || resultat === "reprise") {
    await journaliser(id, "consentement", entreeDansLaSequence(cat.cat, qui.nom));
    await tracer(qui, "sequence_ajout_fiche", `contact ${id}`, cat.cat);
    // Une première étape à J+0 ne doit pas attendre le worker du lendemain.
    after(async () => {
      await traiterEcheances(20);
    });
  }

  revalidatePath(`/admin/contacts/${id}`);
  redirect(`/admin/contacts/${id}?seq=${resultat}`);
}

/** Sort la personne d'une séquence en cours. Ce qui est parti reste parti. */
export async function actionRetirerContact(formData: FormData) {
  const qui = await identiteAvecDroit("sequences");
  if (!qui) return;

  const id = String(formData.get("id") ?? "");
  const sequenceId = String(formData.get("sequence") ?? "");
  if (!/^\d+$/.test(id) || !/^\d+$/.test(sequenceId)) return;

  const { retirerDeSequence } = await import("@/lib/crm/sequences");
  const nom = await retirerDeSequence(id, sequenceId);
  if (nom) {
    await journaliser(id, "sequence", `Sorti de la séquence « ${nom} » par ${qui.nom}`);
    await tracer(qui, "sequence_retrait", `contact ${id}`, nom);
  }

  revalidatePath(`/admin/contacts/${id}`);
}
