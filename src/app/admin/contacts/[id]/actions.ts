"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { COOKIE_SESSION, sessionValide } from "@/lib/crm/auth";
import { changerStatut, enregistrerNote, estStatutValide } from "@/lib/crm/contacts";
import { definirRdv } from "@/lib/crm/questionnaires";
import { depuisParis } from "@/lib/heure";

/**
 * Les Server Actions sont des points d'entrée publics : la session est
 * revérifiée ici, la protection du proxy ne couvrant que la navigation.
 */
async function exigerSession(): Promise<boolean> {
  const jar = await cookies();
  return sessionValide(jar.get(COOKIE_SESSION)?.value);
}

export async function actionChangerStatut(formData: FormData) {
  if (!(await exigerSession())) return;
  const id = String(formData.get("id") ?? "");
  const statut = String(formData.get("statut") ?? "");
  if (!id || !estStatutValide(statut)) return;
  await changerStatut(id, statut);
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
