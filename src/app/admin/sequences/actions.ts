"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { COOKIE_SESSION, sessionValide } from "@/lib/crm/auth";
import { basculerSequence, majEtape } from "@/lib/crm/sequences";

async function exigerSession(): Promise<boolean> {
  const jar = await cookies();
  return sessionValide(jar.get(COOKIE_SESSION)?.value);
}

export async function actionBasculer(formData: FormData) {
  if (!(await exigerSession())) return;
  const id = String(formData.get("id") ?? "");
  const active = String(formData.get("active") ?? "") === "1";
  if (!id) return;
  await basculerSequence(id, active);
  revalidatePath("/admin/sequences");
}

export async function actionMajEtape(formData: FormData) {
  if (!(await exigerSession())) return;
  const id = String(formData.get("id") ?? "");
  const sujet = String(formData.get("sujet") ?? "").slice(0, 300);
  const corps = String(formData.get("corps") ?? "").slice(0, 20000);
  const delai = Number(formData.get("delai_jours") ?? 0);
  if (!id || !sujet.trim() || !corps.trim() || !Number.isFinite(delai)) return;
  await majEtape(id, { sujet, corps, delai_jours: Math.trunc(delai) });
  revalidatePath("/admin/sequences");
}
