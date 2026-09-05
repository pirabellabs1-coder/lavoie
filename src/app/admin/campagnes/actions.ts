"use server";

import { after } from "next/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { identiteAvecDroit } from "@/lib/crm/session";
import {
  arreterCampagne,
  creerCampagne,
  nettoyerSegment,
  type Segment,
} from "@/lib/crm/campagnes";
import { depuisParis } from "@/lib/heure";
import { tracer } from "@/lib/crm/journal";

async function exigerSession(): Promise<boolean> {
  return (await identiteAvecDroit("campagnes")) !== null;
}

/** Reconstruit le segment à partir des champs du formulaire. */
function lireSegment(donnees: FormData): Segment {
  return nettoyerSegment({
    statuts: donnees.getAll("statuts").map(String),
    source: donnees.get("source"),
    utm_source: donnees.get("utm_source"),
    depuis_jours: donnees.get("depuis_jours"),
    jamais_ouvert: donnees.get("jamais_ouvert") === "on",
    stage: donnees.get("stage"),
    stage_etats: donnees.getAll("stage_etats").map(String),
  });
}

/**
 * « Compter les destinataires » : on repasse par l'URL plutôt que par un état
 * client, ce qui rend le compte partageable et le formulaire rechargeable.
 */
export async function actionCompter(donnees: FormData) {
  if (!(await exigerSession())) return;
  const segment = lireSegment(donnees);

  const params = new URLSearchParams();
  params.set("apercu", "1");
  const sujet = String(donnees.get("sujet") ?? "");
  const corps = String(donnees.get("corps") ?? "");
  if (sujet) params.set("sujet", sujet);
  if (corps) params.set("corps", corps);
  for (const s of segment.statuts ?? []) params.append("statuts", s);
  if (segment.source) params.set("source", segment.source);
  if (segment.utm_source) params.set("utm_source", segment.utm_source);
  if (segment.depuis_jours) params.set("depuis_jours", String(segment.depuis_jours));
  if (segment.jamais_ouvert) params.set("jamais_ouvert", "on");
  if (segment.stage) params.set("stage", segment.stage);
  for (const e of segment.stage_etats ?? []) params.append("stage_etats", e);
  const quand = String(donnees.get("quand") ?? "");
  if (quand) params.set("quand", quand);

  redirect(`/admin/campagnes?${params.toString()}`);
}

export async function actionCreerCampagne(donnees: FormData) {
  const qui = await identiteAvecDroit("campagnes");
  if (!qui) return;

  const sujet = String(donnees.get("sujet") ?? "").trim().slice(0, 200);
  const corps = String(donnees.get("corps") ?? "").trim().slice(0, 20000);
  if (!sujet || !corps) return;

  const quand = String(donnees.get("quand") ?? "").trim();
  const programmeeLe = quand ? depuisParis(quand) : null;
  if (quand && !programmeeLe) return;

  const id = await creerCampagne({
    sujet,
    corps,
    segment: lireSegment(donnees),
    programmeeLe,
  });
  if (id) await tracer(qui, "campagne_creee", sujet);

  // Une campagne immédiate ne doit pas attendre le passage quotidien du worker.
  if (id && !programmeeLe) {
    after(async () => {
      const { traiterCampagnes } = await import("@/lib/crm/campagnes");
      await traiterCampagnes(100);
    });
  }

  revalidatePath("/admin/campagnes");
  redirect("/admin/campagnes");
}

export async function actionArreterCampagne(donnees: FormData) {
  if (!(await exigerSession())) return;
  const id = String(donnees.get("id") ?? "");
  if (!id) return;
  await arreterCampagne(id);
  revalidatePath("/admin/campagnes");
}
