import { enregistrerContact } from "@/lib/crm/contacts";
import { controlerFormulaire, reponseRefus } from "@/lib/crm/antispam";
import { depuisCorps } from "@/lib/attribution";
import { envoyerConfirmation, mettreEnAttente } from "@/lib/crm/optin";

/**
 * Inscription aux Lettres, en double opt-in : on enregistre le contact, on le
 * met en attente de confirmation, et on lui envoie un lien à cliquer. La
 * séquence de bienvenue ne démarre qu'une fois ce clic effectué.
 */
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

  if (!prenom || !email) {
    return Response.json({ error: "Champs requis manquants." }, { status: 400 });
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return Response.json({ error: "Adresse e-mail invalide." }, { status: 400 });
  }

  const contact = await enregistrerContact({
    email,
    prenom,
    source: "Lettres",
    statut: "lead",
    origine: depuisCorps(data.origine),
    libelleEvenement: "Inscription aux Lettres",
  });

  if (contact) {
    await mettreEnAttente(contact.id);
    await envoyerConfirmation({
      email,
      prenom,
      sequence: "lettres",
      source: "Lettres",
      contexte: "votre inscription aux Lettres",
    });
  }

  // Réponse identique quoi qu'il arrive : le message côté site invite à aller
  // confirmer dans la boîte mail.
  return Response.json({ ok: true, confirmation: true });
}
