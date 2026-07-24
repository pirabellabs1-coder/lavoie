import { Resend } from "resend";

// Destinataire des leads (guide gratuit / lead magnet).
const TO = "contact@lavoie2laconscience.com";
const FROM =
  process.env.RESEND_FROM ||
  "La Voie 2 la Conscience <onboarding@resend.dev>";

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
      `→ Envoyez-lui le guide, puis ajoutez-le à votre liste / séquence.\n`,
  });

  if (error) {
    return Response.json({ error: "L'envoi a échoué. Réessayez." }, { status: 502 });
  }

  return Response.json({ ok: true });
}
