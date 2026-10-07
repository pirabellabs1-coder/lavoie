import { getDb } from "@/lib/crm/db";
import { encaisser } from "@/lib/crm/paiements";

/**
 * Le retour de Stripe.
 *
 * C'est ici, et nulle part ailleurs, qu'une place devient payée. La
 * redirection vers la page de remerciement est un indice ; elle se perd quand
 * un onglet se ferme ou qu'un réseau tombe. Stripe, lui, rappelle pendant
 * trois jours jusqu'à obtenir un 2xx.
 *
 * Deux invariants :
 *
 *   1. la signature est vérifiée contre le corps brut — un corps déjà
 *      transformé en JSON ne se vérifie plus, jamais ;
 *   2. chaque événement n'est traité qu'une fois, par son identifiant : Stripe
 *      livre au moins une fois, donc parfois deux.
 */

export async function POST(req: Request) {
  const cle = process.env.STRIPE_SECRET_KEY;
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!cle || !secret) {
    // Stripe n'est pas branché : on répond poliment, sans rien faire.
    return new Response("Stripe non configuré.", { status: 503 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("Signature absente.", { status: 400 });

  const brut = await req.text();

  const { default: Stripe } = await import("stripe");
  const stripe = new Stripe(cle);

  let evenement: import("stripe").Stripe.Event;
  try {
    evenement = await stripe.webhooks.constructEventAsync(brut, signature, secret);
  } catch (e) {
    // Forgé ou malformé : on refuse, et on ne traite rien.
    console.error("[stripe] signature refusée:", e instanceof Error ? e.message : e);
    return new Response("Signature invalide.", { status: 400 });
  }

  const sql = await getDb();
  if (!sql) {
    // Base indisponible : un 500 fait rejouer Stripe plus tard, ce qui est
    // exactement ce qu'on veut — l'encaissement ne doit pas se perdre.
    return new Response("Base indisponible.", { status: 500 });
  }

  try {
    const [neuf] = await sql<{ id: string }[]>`
      INSERT INTO stripe_evenements (id, type) VALUES (${evenement.id}, ${evenement.type})
      ON CONFLICT (id) DO NOTHING
      RETURNING id
    `;
    // Déjà vu : on acquitte sans rejouer.
    if (!neuf) return Response.json({ recu: true, deja: true });

    if (evenement.type === "checkout.session.completed") {
      const session = evenement.data.object;
      // `paid` couvre le cas des moyens de paiement différés, où la session se
      // termine avant que l'argent soit là.
      if (session.payment_status === "paid") {
        await encaisser(session.id);
      }
    } else if (evenement.type === "checkout.session.async_payment_succeeded") {
      await encaisser(evenement.data.object.id);
    }

    return Response.json({ recu: true });
  } catch (e) {
    console.error("[stripe] traitement:", e);
    return new Response("Traitement en échec.", { status: 500 });
  }
}
