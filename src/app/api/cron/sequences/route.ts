import { traiterEcheances } from "@/lib/crm/sequences";
import { appliquerClauseAnnulation, envoyerRapportHebdomadaire } from "@/lib/crm/rappels";
import { traiterCampagnes } from "@/lib/crm/campagnes";
import { sauvegardeQuotidienne } from "@/lib/crm/sauvegarde";
import { relancerOffres } from "@/lib/crm/offres";

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
  // L'annulation d'abord : inutile d'envoyer un rappel de prérequis à quelqu'un
  // dont le rendez-vous vient de tomber.
  const annules = await appliquerClauseAnnulation();
  const resultat = await traiterEcheances(200);
  const campagnes = await traiterCampagnes(200);
  const offres = await relancerOffres();
  // Le lundi seulement — la fonction se charge elle-même de vérifier le jour.
  const rapport = await envoyerRapportHebdomadaire();
  // En dernier : la sauvegarde reflète ainsi tout ce que ce passage a produit.
  const sauvegarde = await sauvegardeQuotidienne();

  return Response.json({
    ok: true,
    ...resultat,
    annules,
    campagnes,
    offres,
    rapport,
    sauvegarde,
    duree_ms: Date.now() - debut,
  });
}
