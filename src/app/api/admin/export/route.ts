import { identiteAvecDroit } from "@/lib/crm/session";
import { exporterCsv } from "@/lib/crm/contacts";
import { tracer } from "@/lib/crm/journal";

/**
 * Le fichier clients complet : réservé au propriétaire. Le secrétariat travaille
 * dans le tableau de bord, il n'a pas besoin d'emporter la base entière.
 */
export async function GET() {
  const qui = await identiteAvecDroit("export");
  if (!qui) {
    return new Response("Non autorisé", { status: 401 });
  }

  await tracer(qui, "export_csv", "Fichier contacts complet");
  const csv = await exporterCsv();
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
