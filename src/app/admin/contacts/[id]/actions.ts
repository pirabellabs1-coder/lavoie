"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { COOKIE_SESSION, sessionValide } from "@/lib/crm/auth";
import { changerStatut, enregistrerNote, estStatutValide } from "@/lib/crm/contacts";

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

export async function actionEnregistrerNote(formData: FormData) {
  if (!(await exigerSession())) return;
  const id = String(formData.get("id") ?? "");
  const notes = String(formData.get("notes") ?? "").slice(0, 5000);
  if (!id) return;
  await enregistrerNote(id, notes);
  revalidatePath(`/admin/contacts/${id}`);
}
