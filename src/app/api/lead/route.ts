import { Resend } from "resend";
import { SITE } from "@/lib/site";

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

  const prenom = String(data.prenom ?? "").trim();
  const email = String(data.email ?? "").trim();
  const source = String(data.source ?? "Guide gratuit").trim();

  if (!prenom || !email) {
    return Response.json({ error: "Champs requis manquants." }, { status: 400 });
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return Response.json({ error: "Adresse e-mail invalide." }, { status: 400 });
  }

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
      `→ Ajoutez-le à votre liste / séquence.\n`,
  });

  if (error) {
    return Response.json({ error: "L'envoi a échoué. Réessayez." }, { status: 502 });
  }

  // 2) Envoi du guide à l'inscrit (best-effort : n'échoue pas la requête).
  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: "Votre guide — Sortir de la crise silencieuse",
      text:
        `Bonjour ${prenom},\n\n` +
        `Merci pour votre confiance. Voici votre guide gratuit à télécharger :\n` +
        `${GUIDE_URL}\n\n` +
        `Prenez-le comme une conversation, à votre rythme. Et si vous souhaitez en parler, ` +
        `l'appel découverte de 45 minutes est offert : ${SITE.url}/contact\n\n` +
        `Avec toute ma présence,\n` +
        `Domoïna Ramiadana — La Voie 2 la Conscience\n`,
    });
  } catch {
    // L'inscrit dispose de toute façon du téléchargement immédiat sur le site.
  }

  return Response.json({ ok: true });
}
