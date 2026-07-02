import { Resend } from "resend";

// Destinataire du formulaire.
const TO = "contact@lavoie2laconscience.com";
// Expéditeur : idéalement une adresse du domaine vérifié dans Resend
// (ex. "La Voie 2 la Conscience <contact@lavoie2laconscience.com>").
// Fallback sur l'adresse d'onboarding Resend tant que le domaine n'est pas vérifié.
const FROM =
  process.env.RESEND_FROM ||
  "La Voie 2 la Conscience <onboarding@resend.dev>";

const NIVEAUX: Record<string, string> = {
  essence: "Immersion Essence · 3 mois",
  expansion: "Immersion Expansion · 6 mois",
  royale: "Immersion Royale · 9–12 mois",
  conseil: "À discuter",
};

export async function POST(req: Request) {
  let data: Record<string, unknown>;
  try {
    data = await req.json();
  } catch {
    return Response.json({ error: "Requête invalide." }, { status: 400 });
  }

  const prenom = String(data.prenom ?? "").trim();
  const nom = String(data.nom ?? "").trim();
  const email = String(data.email ?? "").trim();
  const tel = String(data.tel ?? "").trim();
  const situation = String(data.situation ?? "").trim();
  const niveau = String(data.niveau ?? "");
  const rgpd = Boolean(data.rgpd);

  if (!prenom || !nom || !email || !tel || !situation || !rgpd) {
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

  const { error } = await resend.emails.send({
    from: FROM,
    to: TO,
    replyTo: email,
    subject: `Nouvelle demande — ${prenom} ${nom}`,
    text:
      `Nouvelle demande d'appel découverte\n\n` +
      `Nom       : ${prenom} ${nom}\n` +
      `Email     : ${email}\n` +
      `Téléphone : ${tel}\n` +
      `Niveau    : ${NIVEAUX[niveau] || "Non précisé"}\n\n` +
      `Message :\n${situation}\n`,
  });

  if (error) {
    return Response.json({ error: "L'envoi a échoué. Réessayez." }, { status: 502 });
  }

  return Response.json({ ok: true });
}
