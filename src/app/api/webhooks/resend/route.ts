import { getDb } from "@/lib/crm/db";
import { desinscrire, journaliser } from "@/lib/crm/contacts";

/**
 * Ce que devient un e-mail après son départ.
 *
 * Resend appelle cette adresse à chaque étape de la vie d'un message : livré,
 * ouvert, cliqué, rejeté, signalé comme indésirable. On rattache l'événement à
 * la ligne d'envoi grâce à l'identifiant Resend mémorisé au moment de l'envoi,
 * puis on l'inscrit dans la chronologie du contact.
 *
 * Deux cas déclenchent une désinscription immédiate : un rejet définitif
 * (l'adresse n'existe pas) et une plainte pour spam. Continuer d'écrire dans
 * ces deux situations abîme la réputation d'expéditeur du domaine, donc la
 * délivrabilité de tous les autres messages.
 *
 * Tant que `RESEND_WEBHOOK_SECRET` n'est pas défini, l'adresse répond 503 :
 * personne ne peut pousser de faux événements dans la base.
 *
 * Réglage côté Resend : Webhooks → Add endpoint →
 * https://www.lavoie2laconscience.com/api/webhooks/resend
 */

const TOLERANCE_SECONDES = 5 * 60;

type EvenementResend = {
  type?: string;
  data?: {
    email_id?: string;
    to?: string[];
    subject?: string;
    click?: { link?: string };
    bounce?: { message?: string; type?: string; subType?: string };
  };
};

type LigneEnvoi = {
  id: string;
  contact_id: string | null;
  destinataire: string;
  sujet: string;
};

/** Comparaison à temps constant de deux signatures en base64. */
function egalConstant(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * Vérifie la signature Svix utilisée par Resend : le secret signe la
 * concaténation « identifiant.horodatage.corps », et l'en-tête peut porter
 * plusieurs signatures séparées par des espaces (rotation de clé).
 */
async function signatureValide(
  secret: string,
  id: string,
  horodatage: string,
  corps: string,
  entete: string,
): Promise<boolean> {
  const brut = secret.startsWith("whsec_") ? secret.slice(6) : secret;
  const cle = await crypto.subtle.importKey(
    "raw",
    Buffer.from(brut, "base64"),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    cle,
    new TextEncoder().encode(`${id}.${horodatage}.${corps}`),
  );
  const attendue = Buffer.from(signature).toString("base64");

  return entete
    .split(" ")
    .map((part) => part.split(",")[1] ?? "")
    .some((fournie) => fournie && egalConstant(fournie, attendue));
}

async function traiter(evenement: EvenementResend): Promise<void> {
  const sql = await getDb();
  if (!sql) return;

  const emailId = evenement.data?.email_id;
  const type = evenement.type ?? "";
  if (!emailId) return;

  const [envoi] = await sql<LigneEnvoi[]>`
    SELECT id, contact_id, destinataire, sujet
    FROM envois
    WHERE message_id = ${emailId}
    LIMIT 1
  `;

  // Un e-mail parti avant la mise en place du suivi, ou une notification
  // interne : rien à rattacher, on acquitte sans bruit.
  if (!envoi) return;

  const destinataire = envoi.destinataire || evenement.data?.to?.[0] || "";

  switch (type) {
    case "email.delivered": {
      await sql`
        UPDATE envois SET statut = 'livre'
        WHERE id = ${envoi.id} AND statut = 'envoye'
      `;
      break;
    }

    case "email.opened": {
      await sql`
        UPDATE envois SET ouvert_le = COALESCE(ouvert_le, NOW())
        WHERE id = ${envoi.id}
      `;
      if (envoi.contact_id) {
        await journaliser(envoi.contact_id, "email", `E-mail ouvert — ${envoi.sujet}`);
      }
      break;
    }

    case "email.clicked": {
      await sql`
        UPDATE envois SET clique_le = COALESCE(clique_le, NOW())
        WHERE id = ${envoi.id}
      `;
      if (envoi.contact_id) {
        const lien = evenement.data?.click?.link;
        await journaliser(
          envoi.contact_id,
          "email",
          lien ? `Lien cliqué — ${lien}` : `Lien cliqué — ${envoi.sujet}`,
        );
      }
      break;
    }

    case "email.bounced": {
      const bounce = evenement.data?.bounce;
      await sql`
        UPDATE envois SET statut = 'rejete', erreur = ${bounce?.message ?? "Rejet"}
        WHERE id = ${envoi.id}
      `;
      // Un rejet passager (boîte pleine, serveur indisponible) ne condamne pas
      // l'adresse : seul un rejet définitif la retire de la liste.
      const definitif = (bounce?.type ?? "").toLowerCase() !== "transient";
      if (definitif && destinataire) {
        await desinscrire(destinataire);
        if (envoi.contact_id) {
          await journaliser(
            envoi.contact_id,
            "desinscription",
            `Adresse rejetée définitivement — ${bounce?.message ?? "sans détail"}`,
          );
        }
      }
      break;
    }

    case "email.complained": {
      await sql`UPDATE envois SET statut = 'plainte' WHERE id = ${envoi.id}`;
      if (destinataire) await desinscrire(destinataire);
      if (envoi.contact_id) {
        await journaliser(
          envoi.contact_id,
          "desinscription",
          "Message signalé comme indésirable — envois arrêtés",
        );
      }
      break;
    }

    default:
      break;
  }
}

export async function POST(req: Request) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) {
    return Response.json({ error: "Suivi des envois non configuré." }, { status: 503 });
  }

  const corps = await req.text();
  const id = req.headers.get("svix-id");
  const horodatage = req.headers.get("svix-timestamp");
  const signature = req.headers.get("svix-signature");

  if (!id || !horodatage || !signature) {
    return Response.json({ error: "En-têtes de signature manquants." }, { status: 400 });
  }

  const age = Math.abs(Date.now() / 1000 - Number(horodatage));
  if (!Number.isFinite(age) || age > TOLERANCE_SECONDES) {
    return Response.json({ error: "Horodatage hors tolérance." }, { status: 400 });
  }

  if (!(await signatureValide(secret, id, horodatage, corps, signature))) {
    return Response.json({ error: "Signature invalide." }, { status: 401 });
  }

  let evenement: EvenementResend;
  try {
    evenement = JSON.parse(corps) as EvenementResend;
  } catch {
    return Response.json({ error: "Corps illisible." }, { status: 400 });
  }

  try {
    await traiter(evenement);
  } catch (e) {
    // Une erreur d'écriture ne doit pas faire réessayer Resend en boucle sur
    // un événement que l'on ne saura de toute façon pas traiter.
    console.error("[crm] webhook Resend:", e);
  }

  return Response.json({ ok: true });
}
