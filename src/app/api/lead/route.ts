import { Resend } from "resend";
import { SITE } from "@/lib/site";
import { enregistrerContact } from "@/lib/crm/contacts";
import { controlerFormulaire, reponseRefus } from "@/lib/crm/antispam";
import { depuisCorps } from "@/lib/attribution";
import { habiller, lienDesinscription } from "@/lib/crm/email";
import { creerJeton, mettreEnAttente } from "@/lib/crm/optin";

// Destinataire des leads (guide gratuit / lead magnet).
const TO = "contact@lavoie2laconscience.com";
const FROM =
  process.env.RESEND_FROM ||
  "La Voie 2 la Conscience <onboarding@resend.dev>";

const GUIDE_URL = `${SITE.url}/guide-crise-silencieuse.pdf`;

export async function POST(req: Request) {
  let data: Record<string, unknown>;
  try {
    data = await req.json();
  } catch {
    return Response.json({ error: "Requête invalide." }, { status: 400 });
  }

  const verdict = controlerFormulaire(req, data);
  if (!verdict.ok) return reponseRefus(verdict);

  const prenom = String(data.prenom ?? "").trim();
  const email = String(data.email ?? "").trim();
  const source = String(data.source ?? "Guide gratuit").trim();

  if (!prenom || !email) {
    return Response.json({ error: "Champs requis manquants." }, { status: 400 });
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return Response.json({ error: "Adresse e-mail invalide." }, { status: 400 });
  }

  // Enregistrement au CRM avant tout envoi : le lead est conservé même si
  // l'e-mail échoue. Sans base configurée, renvoie null sans rien casser.
  const contact = await enregistrerContact({
    email,
    prenom,
    source,
    statut: "lead",
    libelleEvenement: `Guide demandé — ${source}`,
    origine: depuisCorps(data.origine),
  });
  // Double opt-in : le guide part tout de suite (il est demandé), mais la suite
  // — mes Lettres et repères — n'arrive qu'après confirmation par le lien.
  if (contact) await mettreEnAttente(contact.id);
  const lienConfirmation = `${SITE.url}/confirmer?t=${encodeURIComponent(
    await creerJeton({ email, sequence: "guide", source }),
  )}`;

  if (!process.env.RESEND_API_KEY) {
    return Response.json(
      { error: "Service e-mail non configuré (RESEND_API_KEY manquante)." },
      { status: 500 },
    );
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  // 1) Notification au propriétaire (capture du lead).
  const { error } = await resend.emails.send({
    from: FROM,
    to: TO,
    replyTo: email,
    subject: `Nouveau lead — ${source} — ${prenom}`,
    text:
      `Nouvelle inscription au lead magnet\n\n` +
      `Ressource : ${source}\n` +
      `Prénom    : ${prenom}\n` +
      `Email     : ${email}\n\n` +
      (contact
        ? `→ Fiche : ${SITE.url}/admin/contacts/${contact.id}\n`
        : `→ Ajoutez-le à votre liste / séquence.\n`),
  });

  if (error) {
    return Response.json({ error: "L'envoi a échoué. Réessayez." }, { status: 502 });
  }

  // 2) Envoi du guide à l'inscrit (best-effort : n'échoue pas la requête).
  // Le pied de page et le lien de désinscription sont posés par `habiller`.
  try {
    const { html, text } = habiller({
      email,
      apercu: "Votre guide est prêt à télécharger.",
      texte:
        `Bonjour ${prenom},\n\n` +
        `Merci pour votre confiance. Voici votre guide gratuit à télécharger :\n` +
        `${GUIDE_URL}\n\n` +
        `Prenez-le comme une conversation, à votre rythme.\n\n` +
        `Et si vous souhaitez recevoir la suite — mes Lettres et quelques repères pour aller plus loin — confirmez votre inscription en un clic :\n` +
        `${lienConfirmation}\n\n` +
        `Sans ce clic, vous gardez le guide et vous ne recevrez rien d'autre.\n\n` +
        `Avec toute ma présence,\n` +
        `Domoïna Ramiadana — La Voie 2 la Conscience`,
    });
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: "Votre guide — Sortir de la crise silencieuse",
      html,
      text,
      headers: { "List-Unsubscribe": `<${lienDesinscription(email)}>` },
    });
  } catch {
    // L'inscrit dispose de toute façon du téléchargement immédiat sur le site.
  }

  return Response.json({ ok: true });
}
