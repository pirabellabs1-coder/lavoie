import { identiteAvecDroit } from "@/lib/crm/session";
import { exporterContactsCsv } from "@/lib/crm/contacts";
import { tracer } from "@/lib/crm/journal";

/**
 * Le fichier clients : réservé au propriétaire. Le secrétariat travaille dans
 * le tableau de bord, il n'a pas besoin d'emporter la base entière.
 *
 * Les filtres de l'écran sont repris tels quels : on exporte ce qu'on voit,
 * sans quoi un fichier de mille lignes arrive là où on en attendait douze. Et
 * ce qui est emporté est écrit au journal, filtre compris.
 */
export async function GET(req: Request) {
  const qui = await identiteAvecDroit("export");
  if (!qui) {
    return new Response("Non autorisé", { status: 401 });
  }

  const url = new URL(req.url);
  const filtres = {
    recherche: url.searchParams.get("q") || undefined,
    statut: url.searchParams.get("statut") || undefined,
    profil: url.searchParams.get("profil") || undefined,
  };
  const dit = [
    filtres.recherche && `recherche « ${filtres.recherche} »`,
    filtres.statut && `statut ${filtres.statut}`,
    filtres.profil && `profil ${filtres.profil}`,
  ].filter(Boolean);

  await tracer(qui, "export_csv", dit.length ? dit.join(", ") : "Fichier contacts complet");
  const csv = await exporterContactsCsv(filtres);
  const jour = new Date().toISOString().slice(0, 10);

  return new Response("﻿" + csv, {
    headers: {
      // Le BOM en tête permet à Excel d'ouvrir l'accentuation correctement.
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="contacts-v2c-${jour}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
