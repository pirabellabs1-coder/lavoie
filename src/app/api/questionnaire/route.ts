import { Resend } from "resend";
import { after } from "next/server";
import { SITE } from "@/lib/site";
import { enregistrerContact } from "@/lib/crm/contacts";
import { enregistrerQuestionnaire } from "@/lib/crm/questionnaires";
import { inscrireASequence } from "@/lib/crm/sequences";
import { controlerFormulaire, reponseRefus } from "@/lib/crm/antispam";
import { depuisCorps } from "@/lib/attribution";
import { evaluer, manquantes, QUESTIONS, type Reponses } from "@/lib/questionnaire";

/**
 * Réception du questionnaire de préparation au premier rendez-vous.
 *
 * Le parcours complet tient ici : contrôle anti-robot, enregistrement du
 * contact, notation des réponses, puis inscription à l'une des deux séquences
 * — les prérequis pour les personnes éligibles, une orientation pour les
 * autres. Le premier e-mail part sans attendre le passage quotidien du worker.
 */

const TO = "contact@lavoie2laconscience.com";
const FROM =
  process.env.RESEND_FROM || "La Voie 2 la Conscience <onboarding@resend.dev>";

/** Ne garde que les clés du questionnaire, en bornant la taille des réponses. */
function nettoyer(brut: unknown): Reponses {
  const source = (brut ?? {}) as Record<string, unknown>;
  const propre: Reponses = {};
  for (const q of QUESTIONS) {
    const v = source[q.cle];
    if (typeof v === "string") {
      const t = v.trim().slice(0, 5000);
      if (t) propre[q.cle] = t;
    } else if (Array.isArray(v)) {
      const liste = v
        .filter((x): x is string => typeof x === "string")
        .map((x) => x.trim().slice(0, 300))
        .filter(Boolean)
        .slice(0, 20);
      if (liste.length) propre[q.cle] = liste;
    }
  }
  return propre;
}

function couperNom(complet: string): { prenom: string; nom: string } {
  const morceaux = complet.trim().split(/\s+/);
  if (morceaux.length === 1) return { prenom: morceaux[0], nom: "" };
  return { prenom: morceaux[0], nom: morceaux.slice(1).join(" ") };
}

export async function POST(req: Request) {
  let data: Record<string, unknown>;
  try {
    data = await req.json();
  } catch {
    return Response.json({ error: "Requête invalide." }, { status: 400 });
  }

  const verdict = controlerFormulaire(req, data);
  if (!verdict.ok) return reponseRefus(verdict);

  const reponses = nettoyer(data.reponses);

  const absentes = manquantes(reponses);
  if (absentes.length) {
    return Response.json(
      { error: "Certaines réponses obligatoires manquent.", champs: absentes },
      { status: 400 },
    );
  }

  const email = String(reponses.email ?? "").toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return Response.json({ error: "Adresse e-mail invalide." }, { status: 400 });
  }

  const { prenom, nom } = couperNom(String(reponses.nom_prenom ?? ""));
  const evaluation = evaluer(reponses);

  const contact = await enregistrerContact({
    email,
    prenom,
    nom,
    telephone: String(reponses.telephone ?? ""),
    source: "Questionnaire 1er RDV",
    interet: String(reponses.attente_appel ?? ""),
    message: String(reponses.aspect_transformer ?? ""),
    statut: "contacte",
    libelleEvenement: `Questionnaire de préparation envoyé — score ${evaluation.score}/100`,
    origine: depuisCorps(data.origine),
  });

  if (contact) {
    const copie = await enregistrerQuestionnaire({
      contactId: contact.id,
      reponses,
      score: evaluation.score,
      eligible: evaluation.eligible,
    });
    // La séquence n'est lancée qu'une fois la copie enregistrée : c'est elle
    // qui porte le jeton du lien de confirmation.
    if (copie) {
      await inscrireASequence(contact.id, evaluation.eligible ? "prerequis" : "orientation");
      after(async () => {
        const { traiterEcheances } = await import("@/lib/crm/sequences");
        await traiterEcheances(20);
      });
    }
  }

  // Notification au secrétariat — jamais bloquante pour la personne.
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const detail = evaluation.details
      .map((d) => `  · ${d.libelle} : ${d.points}`)
      .join("\n");
    try {
      await resend.emails.send({
        from: FROM,
        to: TO,
        replyTo: email,
        subject: `Questionnaire — ${prenom} ${nom} — ${evaluation.score}/100 ${
          evaluation.eligible ? "(éligible)" : "(à orienter)"
        }`,
        text:
          `Questionnaire de préparation reçu\n\n` +
          `Nom       : ${prenom} ${nom}\n` +
          `Email     : ${email}\n` +
          `Téléphone : ${reponses.telephone || "non communiqué"}\n` +
          `Score     : ${evaluation.score}/100 — ${
            evaluation.eligible ? "éligible à l'entretien" : "à orienter"
          }\n\n` +
          `Détail du score :\n${detail}\n\n` +
          (contact ? `Fiche complète : ${SITE.url}/admin/contacts/${contact.id}\n` : ""),
      });
    } catch (e) {
      console.error("[crm] notification questionnaire:", e);
    }
  }

  return Response.json({ ok: true, eligible: evaluation.eligible });
}
