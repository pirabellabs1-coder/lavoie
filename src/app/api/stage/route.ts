import { Resend } from "resend";
import { SITE } from "@/lib/site";
import { getEvenement } from "@/lib/evenements";
import { enregistrerContact } from "@/lib/crm/contacts";
import { demanderPlace } from "@/lib/crm/stages";
import { controlerFormulaire, reponseRefus } from "@/lib/crm/antispam";
import { depuisCorps } from "@/lib/attribution";
import { habiller } from "@/lib/crm/email";

/**
 * Demande de place pour un stage.
 *
 * Ce n'est pas une inscription payée : le règlement passe encore par la
 * billetterie. La demande entre dans le fichier, le secrétariat confirme, et la
 * confirmation porte le lien de paiement. C'est ce qui permet enfin de savoir
 * qui vient — les inscriptions Eventbrite n'entraient jamais dans la base.
 */

const TO = "contact@lavoie2laconscience.com";
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

  const slug = String(data.slug ?? "").trim();
  const prenom = String(data.prenom ?? "").trim();
  const nom = String(data.nom ?? "").trim();
  const email = String(data.email ?? "").trim().toLowerCase();
  const telephone = String(data.telephone ?? "").trim();
  const message = String(data.message ?? "").trim().slice(0, 3000);

  const evenement = getEvenement(slug);
  if (!evenement) return Response.json({ error: "Stage inconnu." }, { status: 404 });
  if (!prenom || !nom || !email) {
    return Response.json({ error: "Champs requis manquants." }, { status: 400 });
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return Response.json({ error: "Adresse e-mail invalide." }, { status: 400 });
  }

  const contact = await enregistrerContact({
    email,
    prenom,
    nom,
    telephone,
    source: `Stage — ${evenement.titre}`,
    interet: evenement.titre,
    message,
    statut: "contacte",
    libelleEvenement: `Demande de place — ${evenement.titre}`,
    origine: depuisCorps(data.origine),
  });

  const place = contact
    ? await demanderPlace({ slug, contactId: contact.id, message })
    : null;
  const enAttente = place?.statut === "attente";

  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Accusé de réception — jamais bloquant pour la personne.
    try {
      const { html, text } = habiller({
        email,
        apercu: enAttente
          ? "Vous êtes sur la liste d'attente."
          : "Votre demande de place est arrivée.",
        texte:
          `Bonjour ${prenom},\n\n` +
          (enAttente
            ? `Le stage « ${evenement.titreLong} » affiche complet. Vous êtes inscrit(e) sur la liste d'attente : dès qu'une place se libère, nous vous prévenons — dans l'ordre des demandes.\n\n`
            : `Votre demande de place pour « ${evenement.titreLong} » nous est bien parvenue.\n\n` +
              `Le secrétariat revient vers vous sous 48 heures ouvrées pour confirmer la place et vous transmettre les modalités de règlement. Votre place n'est retenue qu'à ce moment-là.\n\n`) +
          `Les dates : ${evenement.date}\nLe lieu : ${evenement.lieu}\n\n` +
          `À très vite,\n` +
          `Le secrétariat — La Voie 2 la Conscience`,
      });
      await resend.emails.send({
        from: FROM,
        to: email,
        subject: enAttente
          ? `Liste d'attente — ${evenement.titre}`
          : `Votre demande de place — ${evenement.titre}`,
        html,
        text,
      });
    } catch (e) {
      console.error("[crm] accusé de réception stage:", e);
    }

    // Notification au secrétariat.
    try {
      await resend.emails.send({
        from: FROM,
        to: TO,
        replyTo: email,
        subject: `${enAttente ? "Liste d'attente" : "Demande de place"} — ${evenement.titre} — ${prenom} ${nom}`,
        text:
          `${enAttente ? "Liste d'attente" : "Nouvelle demande de place"}\n\n` +
          `Stage     : ${evenement.titreLong}\n` +
          `Dates     : ${evenement.date}\n` +
          `Nom       : ${prenom} ${nom}\n` +
          `Email     : ${email}\n` +
          `Téléphone : ${telephone || "non communiqué"}\n\n` +
          (message ? `Message :\n${message}\n\n` : "") +
          `Confirmer la place : ${SITE.url}/admin/stages\n` +
          (contact ? `Sa fiche : ${SITE.url}/admin/contacts/${contact.id}\n` : ""),
      });
    } catch (e) {
      console.error("[crm] notification stage:", e);
    }
  }

  return Response.json({ ok: true, attente: enAttente });
}
