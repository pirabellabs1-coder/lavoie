import { identite } from "@/lib/crm/session";
import { exporterCarnetCsv } from "@/lib/crm/carnet";

/**
 * Le carnet d'une période, en CSV — pour joindre un rapport à un e-mail ou
 * l'ouvrir dans un tableur. Ouvert à toute personne connectée : c'est le
 * travail de l'équipe, pas le fichier des personnes accompagnées.
 */
export async function GET(req: Request) {
  const qui = await identite();
  if (!qui) return new Response("Non autorisé", { status: 401 });

  const url = new URL(req.url);
  const jours = Number(url.searchParams.get("periode"));
  const depuis = Number.isFinite(jours) && jours > 0
    ? new Date(Date.now() - jours * 86_400_000).toLocaleDateString("fr-CA", {
        timeZone: "Europe/Paris",
      })
    : undefined;

  const csv = await exporterCarnetCsv({
    depuis,
    auteur: url.searchParams.get("auteur") || undefined,
    categorie: url.searchParams.get("categorie") || undefined,
  });
  const jour = new Date().toISOString().slice(0, 10);

  return new Response("﻿" + csv, {
    headers: {
      // Le BOM en tête permet à Excel d'ouvrir l'accentuation correctement.
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="carnet-v2c-${jour}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
