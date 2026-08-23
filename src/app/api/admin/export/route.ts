import { cookies } from "next/headers";
import { COOKIE_SESSION, sessionValide } from "@/lib/crm/auth";
import { exporterCsv } from "@/lib/crm/contacts";

export async function GET() {
  const jar = await cookies();
  if (!(await sessionValide(jar.get(COOKIE_SESSION)?.value))) {
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
