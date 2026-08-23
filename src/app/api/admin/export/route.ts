import { identiteAvecDroit } from "@/lib/crm/session";
import { exporterCsv } from "@/lib/crm/contacts";

/**
 * Le fichier clients complet : réservé au propriétaire. Le secrétariat travaille
 * dans le tableau de bord, il n'a pas besoin d'emporter la base entière.
 */
export async function GET() {
  if (!(await identiteAvecDroit("export"))) {
    return new Response("Non autorisé", { status: 401 });
  }

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
