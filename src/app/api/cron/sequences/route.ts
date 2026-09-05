import { traiterEcheances } from "@/lib/crm/sequences";
import { appliquerClauseAnnulation, envoyerRapportHebdomadaire } from "@/lib/crm/rappels";
import { traiterCampagnes } from "@/lib/crm/campagnes";
import { sauvegardeQuotidienne } from "@/lib/crm/sauvegarde";
import { relancerOffres } from "@/lib/crm/offres";
import { accompagnerLesStages } from "@/lib/crm/stages";
import { reveillerLesDormants } from "@/lib/crm/reveil";
import { enregistrerPassage } from "@/lib/crm/passages";

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
  const stages = await accompagnerLesStages();
  const reveil = await reveillerLesDormants();
  // Le lundi seulement — la fonction se charge elle-même de vérifier le jour.
  const rapport = await envoyerRapportHebdomadaire();
  // En dernier : la sauvegarde reflète ainsi tout ce que ce passage a produit.
  const sauvegarde = await sauvegardeQuotidienne();

  const dureeMs = Date.now() - debut;

  // Le témoin : sans cette ligne, un worker qui cesse de passer ne se remarque
  // que le jour où quelqu'un s'étonne du silence.
  await enregistrerPassage({
    dureeMs,
    ok: resultat.echecs === 0,
    resume: [
      `${resultat.envoyes} e-mail(s) de séquence`,
      `${campagnes.envoyes} de campagne`,
      `${stages.logistique} logistique, ${stages.relances} relance(s), ${stages.suites} suite(s)`,
      `${annules} rendez-vous annulé(s)`,
      `${reveil.reveils} réveil(s), ${reveil.sorties} sortie(s)`,
      resultat.echecs ? `${resultat.echecs} échec(s)` : "aucun échec",
    ].join(" · "),
  });

  return Response.json({
    ok: true,
    ...resultat,
    annules,
    campagnes,
    offres,
    stages,
    reveil,
    rapport,
    sauvegarde,
    duree_ms: dureeMs,
  });
}
