import { Resend } from "resend";
import { SITE } from "@/lib/site";
import { jourParis } from "@/lib/heure";
import { getDb } from "./db";
import { habiller } from "./email";
import { annulerFauteDeConfirmation } from "./questionnaires";
import { EXPEDITEUR } from "./sequences";

/** Un client Resend par appel : la clé n'est lue qu'au moment de s'en servir. */
function resendClient(): Resend {
  return new Resend(process.env.RESEND_API_KEY);
}

const DESTINATAIRE_INTERNE = "contact@lavoie2laconscience.com";

type Chiffres = {
  contacts: number;
  nouveaux: number;
  clients: number;
  envoyes: number;
  ouverts: number;
  questionnaires: number;
  eligibles: number;
  prerequis: number;
  rdv: number;
  /** Nombre de passages du worker sur la semaine — six ou sept, normalement. */
  passages: number;
};

/**
 * Le point hebdomadaire, envoyé le lundi matin par le worker.
 *
 * Volontairement court : sept chiffres et une phrase. Un rapport que l'on ne
 * lit pas ne sert à rien, et le tableau de bord reste là pour le détail.
 */
export async function envoyerRapportHebdomadaire(): Promise<boolean> {
  if (jourParis() !== "lundi") return false;

  const sql = await getDb();
  if (!sql) return false;
  if (!process.env.RESEND_API_KEY) return false;

  let c: Chiffres;
  try {
    const [ligne] = await sql<Chiffres[]>`
      SELECT
        (SELECT COUNT(*) FROM contacts)::int AS contacts,
        (SELECT COUNT(*) FROM contacts WHERE cree_le >= NOW() - INTERVAL '7 days')::int AS nouveaux,
        (SELECT COUNT(*) FROM contacts WHERE statut = 'client')::int AS clients,
        (SELECT COUNT(*) FROM envois WHERE envoye_le >= NOW() - INTERVAL '7 days'
           AND statut <> 'echec')::int AS envoyes,
        (SELECT COUNT(*) FROM envois WHERE envoye_le >= NOW() - INTERVAL '7 days'
           AND ouvert_le IS NOT NULL)::int AS ouverts,
        (SELECT COUNT(*) FROM questionnaires WHERE cree_le >= NOW() - INTERVAL '7 days')::int AS questionnaires,
        (SELECT COUNT(*) FROM questionnaires WHERE cree_le >= NOW() - INTERVAL '7 days'
           AND eligible)::int AS eligibles,
        (SELECT COUNT(*) FROM questionnaires WHERE prerequis_le >= NOW() - INTERVAL '7 days')::int AS prerequis,
        (SELECT COUNT(*) FROM questionnaires WHERE rdv_le > NOW()
           AND rdv_le < NOW() + INTERVAL '7 days' AND annule_le IS NULL)::int AS rdv,
        (SELECT COUNT(*) FROM passages WHERE cree_le >= NOW() - INTERVAL '7 days')::int AS passages
    `;
    if (!ligne) return false;
    c = ligne;
  } catch (e) {
    console.error("[crm] rapport hebdomadaire:", e);
    return false;
  }

  const tauxOuverture = c.envoyes ? Math.round((c.ouverts / c.envoyes) * 100) : 0;

  const { html, text } = habiller({
    apercu: `${c.nouveaux} nouveaux contacts cette semaine.`,
    texte:
      `Bonjour Domoïna,\n\n` +
      `Voici la semaine écoulée.\n\n` +
      `Contacts\n` +
      `· ${c.nouveaux} nouveaux cette semaine\n` +
      `· ${c.contacts} au total, dont ${c.clients} clients\n\n` +
      `Questionnaires\n` +
      `· ${c.questionnaires} reçus, dont ${c.eligibles} éligibles à l'entretien\n` +
      `· ${c.prerequis} personnes ont confirmé leurs prérequis\n` +
      `· ${c.rdv} rendez-vous prévus dans les sept prochains jours\n\n` +
      `E-mails\n` +
      `· ${c.envoyes} partis, ${tauxOuverture} % ouverts\n` +
      `· le worker est passé ${c.passages} fois cette semaine` +
      `${c.passages < 6 ? " — il devrait passer chaque matin" : ""}\n\n` +
      `Le détail est dans le tableau de bord : ${SITE.url}/admin`,
  });

  try {
    await resendClient().emails.send({
      from: EXPEDITEUR,
      to: DESTINATAIRE_INTERNE,
      subject: `La semaine — ${c.nouveaux} nouveaux contacts, ${c.questionnaires} questionnaires`,
      html,
      text,
    });
    return true;
  } catch (e) {
    console.error("[crm] rapport hebdomadaire non envoyé:", e);
    return false;
  }
}

/**
 * La clause d'annulation, appliquée pour de bon.
 *
 * Passée une fois par jour par le worker : les rendez-vous de moins de
 * 24 heures dont les prérequis ne sont pas confirmés sont annulés, et les
 * personnes concernées prévenues. Le message reste une porte ouverte — la
 * place est rendue, pas la relation.
 */
export async function appliquerClauseAnnulation(): Promise<number> {
  const annules = await annulerFauteDeConfirmation();
  if (!annules.length) return 0;
  if (!process.env.RESEND_API_KEY) return annules.length;

  const resend = new Resend(process.env.RESEND_API_KEY);

  for (const personne of annules) {
    const prenom = personne.prenom || "";
    const { html, text } = habiller({
      email: personne.email,
      apercu: "Votre rendez-vous a été annulé faute de confirmation.",
      texte:
        `Bonjour ${prenom},\n\n` +
        `Faute de confirmation de votre part, votre rendez-vous a été annulé et la place rendue à une autre personne.\n\n` +
        `Ce n'est pas un jugement sur vous : c'est le cadre annoncé, et il vaut aussi pour nous. Les deux prérequis — la vidéo sur la gratuité et le livret sur le Cadre — ne sont pas une formalité administrative. Ils évitent qu'un entretien offert se transforme en consommation d'un conseil de plus.\n\n` +
        `Quand vous les aurez traversés, reprenez simplement le questionnaire, nous vous reproposerons un créneau :\n` +
        `${SITE.url}/questionnaire\n\n` +
        `Avec toute ma présence,\n` +
        `Domoïna Ramiadana — La Voie 2 la Conscience`,
    });

    try {
      await resend.emails.send({
        from: EXPEDITEUR,
        to: personne.email,
        subject: "Votre rendez-vous a été annulé",
        html,
        text,
      });
    } catch (e) {
      console.error("[crm] annulation non notifiée:", e);
    }
  }

  return annules.length;
}
