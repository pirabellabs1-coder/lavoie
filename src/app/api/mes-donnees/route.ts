import { Resend } from "resend";
import { SITE } from "@/lib/site";
import { controlerFormulaire, reponseRefus } from "@/lib/crm/antispam";
import { contactExiste, creerJeton } from "@/lib/crm/rgpd";
import { habiller } from "@/lib/crm/email";

/**
 * Demande d'accès ou d'effacement des données personnelles.
 *
 * On ne dit jamais si une adresse est connue ou non — sinon le formulaire
 * deviendrait un moyen de savoir qui est dans le fichier. La réponse est
 * toujours la même ; le lien de vérification n'est envoyé que s'il y a bien
 * quelque chose à montrer.
 */
const FROM =
  process.env.RESEND_FROM || "La Voie 2 la Conscience <onboarding@resend.dev>";

export async function POST(req: Request) {
  let data: Record<string, unknown>;
  try {
    data = await req.json();
  } catch {
    return Response.json({ error: "Requête invalide." }, { status: 400 });
  }

  const verdict = controlerFormulaire(req, data);
  if (!verdict.ok) return reponseRefus(verdict);

  const email = String(data.email ?? "").trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return Response.json({ error: "Adresse e-mail invalide." }, { status: 400 });
  }

  // Réponse générique, quoi qu'il arrive.
  const reponseGenerique = Response.json({ ok: true });

  if (!(await contactExiste(email)) || !process.env.RESEND_API_KEY) {
    return reponseGenerique;
  }

  const lien = `${SITE.url}/mes-donnees/verifier?t=${encodeURIComponent(await creerJeton(email))}`;
  const { html, text } = habiller({
    email,
    apercu: "Votre lien pour accéder à vos données ou les effacer.",
    texte:
      `Bonjour,\n\n` +
      `Vous avez demandé à accéder à vos données personnelles, ou à les effacer, sur le site de La Voie 2 la Conscience.\n\n` +
      `Voici votre lien personnel — il est valable une heure :\n${lien}\n\n` +
      `Si vous n'êtes pas à l'origine de cette demande, ne faites rien : ce lien expirera de lui-même et aucune donnée ne sera modifiée.`,
  });

  try {
    await new Resend(process.env.RESEND_API_KEY).emails.send({
      from: FROM,
      to: email,
      subject: "Vos données personnelles — lien d'accès",
      html,
      text,
    });
  } catch (e) {
    console.error("[crm] envoi lien RGPD:", e);
  }

  return reponseGenerique;
}
