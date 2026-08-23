import { traiterEcheances } from "@/lib/crm/sequences";

/**
 * Worker des séquences — appelé par Vercel Cron (voir vercel.json).
 *
 * Vercel signe ses appels planifiés avec l'en-tête `Authorization: Bearer
 * <CRON_SECRET>` dès que la variable est définie. Tant qu'elle ne l'est pas,
 * la route reste ouverte : elle ne fait qu'envoyer des e-mails déjà planifiés,
 * mais définir CRON_SECRET reste recommandé.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const entete = req.headers.get("authorization");
    if (entete !== `Bearer ${secret}`) {
      return Response.json({ error: "Non autorisé" }, { status: 401 });
    }
  }

  const debut = Date.now();
  const resultat = await traiterEcheances(200);

  return Response.json({
    ok: true,
    ...resultat,
    duree_ms: Date.now() - debut,
  });
}
