import { dossier, lireJeton } from "@/lib/crm/rgpd";
import { tracerPublic } from "@/lib/crm/journal";

/**
 * Télécharge le dossier personnel, en JSON. Le jeton signé dans l'URL vaut
 * preuve d'identité : il n'a pu arriver que dans la boîte de la personne.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const email = await lireJeton(url.searchParams.get("t") ?? "");
  if (!email) {
    return new Response("Lien expiré ou invalide.", { status: 401 });
  }

  const d = await dossier(email);
  if (!d) {
    return new Response("Aucune donnée pour cette adresse.", { status: 404 });
  }

  await tracerPublic(email, "rgpd_acces", email, "Téléchargement du dossier personnel");

  const jour = new Date().toISOString().slice(0, 10);
  return new Response(JSON.stringify(d, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="mes-donnees-${jour}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
