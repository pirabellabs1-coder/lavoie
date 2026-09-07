"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { exigerIdentite } from "@/lib/crm/session";
import { basculerAction, noterAction, supprimerAction } from "@/lib/crm/carnet";

/**
 * Le carnet est ouvert à toute personne connectée : chacun y écrit ce qu'il a
 * fait, et lit ce que les autres ont fait. Ce qui est protégé, c'est la
 * retouche — on ne corrige que ses propres lignes, sauf à être propriétaire.
 */

export async function actionNoter(donnees: FormData) {
  const qui = await exigerIdentite();

  const titre = String(donnees.get("titre") ?? "");
  const detail = String(donnees.get("detail") ?? "");
  const categorie = String(donnees.get("categorie") ?? "autre");
  const quand = String(donnees.get("quand") ?? "");
  const duree = Number(donnees.get("duree") ?? 0);
  const prevue = donnees.get("prevue") === "on";

  if (!titre.trim()) {
    redirect("/admin/carnet?erreur=" + encodeURIComponent("Écrivez au moins ce que vous avez fait."));
  }

  const ok = await noterAction({
    qui,
    titre,
    detail,
    categorie,
    statut: prevue ? "prevue" : "faite",
    quand,
    dureeMin: Number.isFinite(duree) ? duree : null,
  });

  revalidatePath("/admin/carnet");
  redirect(
    ok
      ? `/admin/carnet?fait=${prevue ? "prevue" : "notee"}`
      : "/admin/carnet?erreur=" + encodeURIComponent("La ligne n'a pas pu être enregistrée."),
  );
}

/** Cocher (ou décocher) une action prévue. */
export async function actionCocher(donnees: FormData) {
  const qui = await exigerIdentite();
  const id = String(donnees.get("id") ?? "");
  const note = String(donnees.get("note") ?? "");
  if (!/^\d+$/.test(id)) return;

  const ok = await basculerAction(id, qui, note);
  revalidatePath("/admin/carnet");
  if (!ok) {
    redirect(
      "/admin/carnet?erreur=" +
        encodeURIComponent("Cette ligne ne vous appartient pas : seul son auteur peut la cocher."),
    );
  }
}

export async function actionSupprimer(donnees: FormData) {
  const qui = await exigerIdentite();
  const id = String(donnees.get("id") ?? "");
  if (!/^\d+$/.test(id)) return;

  const ok = await supprimerAction(id, qui);
  revalidatePath("/admin/carnet");
  if (!ok) {
    redirect(
      "/admin/carnet?erreur=" +
        encodeURIComponent("Cette ligne ne vous appartient pas : seul son auteur peut la retirer."),
    );
  }
}
