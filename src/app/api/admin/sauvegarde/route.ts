import { identiteAvecDroit } from "@/lib/crm/session";
import { construireSauvegarde } from "@/lib/crm/sauvegarde";

/**
 * La sauvegarde complète, à la demande. Réservée au propriétaire : c'est
 * l'intégralité du fichier clients qui part dans un fichier.
 */
export async function GET() {
  if (!(await identiteAvecDroit("sauvegarde"))) {
    return new Response("Non autorisé", { status: 401 });
  }

  const copie = await construireSauvegarde();
  if (!copie) {
    return new Response("Base de données indisponible", { status: 503 });
  }

  const jour = new Date().toISOString().slice(0, 10);
  return new Response(copie.json, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="sauvegarde-v2c-${jour}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
