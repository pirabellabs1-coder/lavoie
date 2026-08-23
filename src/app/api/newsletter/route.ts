import { after } from "next/server";
import { enregistrerContact } from "@/lib/crm/contacts";
import { controlerFormulaire, reponseRefus } from "@/lib/crm/antispam";
import { depuisCorps } from "@/lib/attribution";
import { inscrireASequence } from "@/lib/crm/sequences";

/**
 * Inscription aux Lettres. Jusqu'ici le formulaire n'envoyait rien du tout :
 * il affichait une confirmation et l'adresse était perdue.
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
    await inscrireASequence(contact.id, "lettres");
    // L'étape 1 est due immédiatement : on la traite après la réponse plutôt
    // que d'attendre le passage quotidien du worker.
    after(async () => {
      const { traiterEcheances } = await import("@/lib/crm/sequences");
      await traiterEcheances(20);
    });
  }

  return Response.json({ ok: true });
}
