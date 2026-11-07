import type postgres from "postgres";
import { getDb } from "./db";
import { SITE } from "@/lib/site";

/**
 * Le paiement d'une place de stage.
 *
 * Règle première : aucun numéro de carte ne traverse jamais ce serveur. La
 * saisie se fait sur une page hébergée par Stripe (Checkout), qui gère la
 * banque, le 3-D Secure et les portefeuilles. Nous ne voyons que des
 * identifiants — `cs_…`, `pi_…` — et un montant.
 *
 * Règle deuxième : le montant est décidé ici, jamais reçu du navigateur. Il
 * est relu dans la base à partir du stage et du nombre de places. Un prix qui
 * vient du client est un prix qu'on peut changer.
 *
 * Règle troisième : c'est le webhook qui fait foi, pas la redirection. Un
 * onglet qui se ferme, un réseau qui tombe, et la personne ne revient jamais
 * sur la page de remerciement — sa place serait alors payée sans que nous le
 * sachions. Stripe, lui, rappelle pendant trois jours.
 *
 * Tant que les clés ne sont pas posées, tout ce module dort : `stripeActif()`
 * répond faux, le tableau de bord le dit, et rien ne casse.
 */

/** La part demandée à la réservation quand on ne prend pas tout. */
export const PART_ACOMPTE = 0.3;

/** L'adresse que Stripe doit appeler, et les deux événements qui comptent. */
export const ADRESSE_WEBHOOK = `${SITE.url}/api/stripe/webhook`;
export const EVENEMENTS_WEBHOOK = [
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "charge.refunded",
] as const;

export type GenrePaiement = "acompte" | "solde" | "integral";

export type Paiement = {
  id: string;
  participation_id: string;
  contact_id: string | null;
  montant_cents: number;
  genre: GenrePaiement;
  statut: "attente" | "payee" | "expiree" | "manuelle" | "remboursee";
  session_id: string | null;
  lien: string | null;
  paye_le: Date | null;
  cree_le: Date;
};

export function stripeActif(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

/** Les clés de test commencent par `sk_test_` : on le dit à l'écran. */
export function stripeEnEssai(): boolean {
  const cle = process.env.STRIPE_SECRET_KEY ?? "";
  return cle.startsWith("sk_test_") || cle.startsWith("rk_test_");
}

async function client() {
  const cle = process.env.STRIPE_SECRET_KEY;
  if (!cle) return null;
  const { default: Stripe } = await import("stripe");
  return new Stripe(cle);
}

export function euros(cents: number): string {
  return (cents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

/** L'acompte, arrondi à l'euro : personne n'aime payer 149,97 €. */
export function acompteDe(total: number): number {
  return Math.max(100, Math.round((total * PART_ACOMPTE) / 100) * 100);
}

/**
 * Ce qu'on réclame, et à quel titre.
 *
 * C'est **la** décision d'argent du module, et elle est ici, pure, pour être
 * tenue par des tests : enfouie dans la fonction qui parle à Stripe et à la
 * base, elle avait déjà laissé passer une relance qui réclamait le prix plein
 * à quelqu'un ayant reçu un lien d'acompte.
 *
 * Rend `null` quand il n'y a plus rien à demander.
 */
export function montantAReclamer(entree: {
  total: number;
  dejaPaye: number;
  genre: GenrePaiement;
}): { montant: number; genre: GenrePaiement } | null {
  const reste = Math.max(0, entree.total - entree.dejaPaye);
  if (reste <= 0) return null;

  // Un acompte ne se demande qu'une fois : dès qu'un premier versement est
  // arrivé, la suite est un solde, quoi qu'on ait demandé.
  const montant =
    entree.genre === "acompte" && entree.dejaPaye === 0
      ? Math.min(acompteDe(entree.total), reste)
      : reste;

  const genre: GenrePaiement =
    montant === entree.total ? "integral" : entree.dejaPaye > 0 ? "solde" : "acompte";

  return { montant, genre };
}

type Place = {
  participation_id: string;
  contact_id: string;
  email: string;
  prenom: string | null;
  personnes: number;
  statut: string;
  titre: string;
  slug: string;
  prix_cents: number | null;
  deja_paye: number;
};

/** Ce qu'il faut savoir d'une place pour la facturer. */
async function laPlace(participationId: string): Promise<Place | null> {
  const sql = await getDb();
  if (!sql) return null;
  try {
    const [l] = await sql<Place[]>`
      SELECT p.id AS participation_id, p.contact_id, c.email, c.prenom,
             p.personnes, p.statut, s.titre, s.slug, s.prix_cents::int AS prix_cents,
             COALESCE((
               SELECT SUM(x.montant_cents - x.rembourse_cents) FROM paiements x
               WHERE x.participation_id = p.id AND x.statut IN ('payee', 'manuelle')
             ), 0)::int AS deja_paye
      FROM participations p
      JOIN contacts c ON c.id = p.contact_id
      JOIN stages s   ON s.id = p.stage_id
      WHERE p.id = ${participationId}
    `;
    return l ?? null;
  } catch (e) {
    console.error("[crm] laPlace:", e);
    return null;
  }
}

export type LienDePaiement =
  | { ok: true; lien: string; montant: number; genre: GenrePaiement }
  | { ok: false; raison: string };

/**
 * Ouvre une session de paiement et rend le lien à transmettre.
 *
 * Le lien n'est pas envoyé d'ici : c'est le secrétariat qui décide quand il
 * part, et par quel message. Une session vit vingt-quatre heures — au-delà,
 * on en ouvre une autre, ce qui ne coûte rien.
 */
export async function ouvrirPaiement(
  participationId: string,
  genre: GenrePaiement,
): Promise<LienDePaiement> {
  if (!stripeActif()) {
    return { ok: false, raison: "Stripe n'est pas branché : ajoutez STRIPE_SECRET_KEY." };
  }
  const sql = await getDb();
  const place = await laPlace(participationId);
  if (!sql || !place) return { ok: false, raison: "Cette place est introuvable." };
  if (place.prix_cents == null) {
    return { ok: false, raison: "Ce stage n'a pas de tarif : réglez-le avant de faire payer." };
  }

  const total = place.prix_cents * Math.max(1, place.personnes);
  const aReclamer = montantAReclamer({ total, dejaPaye: place.deja_paye, genre });
  if (!aReclamer) return { ok: false, raison: "Cette place est déjà réglée." };
  const { montant, genre: genreReel } = aReclamer;

  const stripe = await client();
  if (!stripe) return { ok: false, raison: "Stripe n'est pas branché." };

  try {
    // Une place n'a qu'un lien vivant à la fois.
    //
    // Sans cela, deux liens ouverts pour la même place — un acompte envoyé
    // lundi, un total envoyé jeudi — sont tous les deux payables : la personne
    // qui clique les deux règle cent trente pour cent, et il faut rembourser à
    // la main. On périme donc les précédents avant d'en ouvrir un.
    const anciens = await sql<{ session_id: string | null }[]>`
      UPDATE paiements SET statut = 'expiree'
      WHERE participation_id = ${participationId} AND statut = 'attente'
      RETURNING session_id
    `;
    for (const a of anciens) {
      if (!a.session_id) continue;
      // Fermer la session chez Stripe aussi : une session périmée seulement
      // chez nous resterait payable depuis le lien déjà reçu par e-mail.
      try {
        await stripe.checkout.sessions.expire(a.session_id);
      } catch {
        // Déjà expirée ou déjà réglée : Stripe refuse, et c'est sans
        // conséquence — notre ligne, elle, ne vaut plus rien.
      }
    }

    const [ligne] = await sql<{ id: string }[]>`
      INSERT INTO paiements (participation_id, contact_id, montant_cents, genre, statut)
      VALUES (${participationId}, ${place.contact_id}, ${montant}, ${genreReel}, 'attente')
      RETURNING id
    `;
    if (!ligne) return { ok: false, raison: "Le paiement n'a pas pu être ouvert." };

    const intitule =
      genreReel === "acompte"
        ? `Acompte — ${place.titre}`
        : genreReel === "solde"
          ? `Solde — ${place.titre}`
          : place.titre;

    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        locale: "fr",
        customer_email: place.email,
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "eur",
              unit_amount: montant,
              product_data: {
                name: intitule,
                description:
                  place.personnes > 1
                    ? `${place.personnes} places · total ${euros(total)}`
                    : `Une place · total ${euros(total)}`,
              },
            },
          },
        ],
        success_url: `${SITE.url}/paiement/merci?s={CHECKOUT_SESSION_ID}`,
        cancel_url: `${SITE.url}/evenements/${place.slug}`,
        metadata: {
          paiement_id: String(ligne.id),
          participation_id: String(participationId),
          contact_id: String(place.contact_id),
        },
      },
      // Deux clics sur le même bouton n'ouvrent pas deux sessions.
      { idempotencyKey: `paiement-${ligne.id}` },
    );

    await sql`
      UPDATE paiements SET session_id = ${session.id}, lien = ${session.url}
      WHERE id = ${ligne.id}
    `;

    if (!session.url) return { ok: false, raison: "Stripe n'a pas rendu de lien." };
    return { ok: true, lien: session.url, montant, genre: genreReel };
  } catch (e) {
    console.error("[crm] ouvrirPaiement:", e);
    return { ok: false, raison: "Stripe a refusé d'ouvrir la session." };
  }
}

/**
 * Encaisse une session réglée. Appelé par le webhook, et lui seul.
 *
 * Idempotent par construction : la mise à jour ne vaut que pour une ligne
 * encore en attente. Stripe peut livrer deux fois le même événement, la
 * deuxième fois ne change rien.
 */
export async function encaisser(
  sessionId: string,
  tx?: postgres.TransactionSql,
  paymentIntent?: string | null,
): Promise<boolean> {
  const sql = tx ?? (await getDb());
  if (!sql) return false;
  // Pas de try/catch : une écriture qui échoue doit remonter jusqu'au webhook,
  // qui répondra 500 et fera rejouer Stripe. Avalée ici, l'erreur rendait un
  // 200 — l'argent était débité et la place restait « en attente », pour
  // toujours, sans que personne en soit averti.
  //
  // L'identifiant du paiement Stripe est gardé : c'est par lui, et non par la
  // session, que Stripe signale un remboursement.
  const [l] = await sql<{ id: string }[]>`
    UPDATE paiements
    SET statut = 'payee', paye_le = NOW(), payment_intent = COALESCE(${paymentIntent ?? null}, payment_intent)
    WHERE session_id = ${sessionId} AND statut = 'attente'
    RETURNING id
  `;
  return Boolean(l);
}

/**
 * Ce que devient un paiement après un remboursement.
 *
 * Stripe donne le cumul remboursé, pas le dernier geste : deux remboursements
 * partiels de 50 € arrivent comme « 50 » puis « 100 ». Le cumul rend donc le
 * calcul rejouable, et l'on ne descend jamais — un événement ancien livré en
 * retard ne doit pas effacer un remboursement plus récent.
 */
export function apresRemboursement(entree: {
  montant: number;
  dejaRembourse: number;
  cumulStripe: number;
}): { rembourse: number; integral: boolean } {
  const cumul = Math.max(0, Math.round(entree.cumulStripe));
  const rembourse = Math.min(entree.montant, Math.max(entree.dejaRembourse, cumul));
  return { rembourse, integral: rembourse >= entree.montant };
}

/**
 * Inscrit un remboursement fait chez Stripe. Appelé par le webhook, et lui
 * seul. Rend de quoi écrire la ligne de chronologie, ou `null` si aucun
 * paiement du site ne correspond.
 */
export async function rembourser(
  ref: { paymentIntent: string | null; sessionId: string | null },
  cumulStripe: number,
  tx: postgres.TransactionSql,
): Promise<{
  contact_id: string | null;
  rembourse: number;
  cumul: number;
  titre: string;
  integral: boolean;
} | null> {
  if (!ref.paymentIntent && !ref.sessionId) return null;
  const [l] = await tx<
    {
      id: string;
      participation_id: string;
      statut: string;
      montant_cents: number;
      rembourse_cents: number;
      contact_id: string | null;
      titre: string;
    }[]
  >`
    SELECT x.id, x.participation_id, x.statut, x.montant_cents::int AS montant_cents,
           x.rembourse_cents::int AS rembourse_cents, x.contact_id, s.titre
    FROM paiements x
    JOIN participations p ON p.id = x.participation_id
    JOIN stages s         ON s.id = p.stage_id
    WHERE x.statut IN ('payee', 'remboursee', 'attente')
      AND (x.payment_intent = ${ref.paymentIntent ?? ""} OR x.session_id = ${ref.sessionId ?? ""})
    ORDER BY x.id
    LIMIT 1
    FOR UPDATE OF x
  `;
  if (!l) return null;
  if (l.statut === "attente") {
    // Le remboursement arrive avant l'encaissement (paiement différé, ou
    // encaissement encore en rejeu). L'avaler consommerait l'événement, puis
    // l'encaissement inscrirait le montant plein : le remboursement serait
    // perdu. On refuse, la transaction s'annule, Stripe rejouera plus tard.
    throw new Error("Remboursement reçu avant l'encaissement : à rejouer.");
  }
  const r = apresRemboursement({
    montant: l.montant_cents,
    dejaRembourse: l.rembourse_cents,
    cumulStripe,
  });
  if (r.rembourse === l.rembourse_cents) {
    // Rien de neuf : un événement rejoué, ou plus ancien que ce qu'on sait.
    return null;
  }
  await tx`
    UPDATE paiements
    SET rembourse_cents = ${r.rembourse},
        rembourse_le    = NOW(),
        statut          = ${r.integral ? "remboursee" : "payee"},
        payment_intent  = COALESCE(payment_intent, ${ref.paymentIntent ?? null})
    WHERE id = ${l.id}
  `;
  if (r.integral) {
    // Après un remboursement intégral, plus rien ne part tout seul : un lien
    // encore ouvert pour la même place serait rappelé trois jours plus tard,
    // et réclamerait le total à quelqu'un qu'on vient de rembourser. La suite
    // — annuler, retirer, refaire payer — est une décision humaine.
    await tx`
      UPDATE paiements SET statut = 'expiree'
      WHERE participation_id = ${l.participation_id} AND statut = 'attente'
    `;
  }
  return {
    contact_id: l.contact_id ? String(l.contact_id) : null,
    rembourse: r.rembourse - l.rembourse_cents,
    cumul: r.rembourse,
    titre: l.titre,
    integral: r.integral,
  };
}

/**
 * Un règlement reçu autrement : virement, chèque, espèces le jour même.
 *
 * Le montant est borné par le reste dû — non par méfiance, mais parce qu'une
 * saisie à 50000 au lieu de 500 passait sans broncher, et qu'au-delà de vingt
 * et un millions l'écriture échouait en silence dans la colonne `INT`, pendant
 * que le journal affirmait le contraire.
 */
export async function encaisserALaMain(
  participationId: string,
  montantCents: number,
): Promise<{ ok: boolean; montant: number; raison?: string }> {
  const sql = await getDb();
  if (!sql) return { ok: false, montant: 0, raison: "Base indisponible." };
  if (!Number.isFinite(montantCents) || montantCents <= 0) {
    return { ok: false, montant: 0, raison: "Indiquez un montant en euros." };
  }

  const place = await laPlace(participationId);
  if (!place) return { ok: false, montant: 0, raison: "Cette place est introuvable." };

  const total = (place.prix_cents ?? 0) * Math.max(1, place.personnes);
  const reste = Math.max(0, total - place.deja_paye);
  if (total > 0 && reste <= 0) {
    return { ok: false, montant: 0, raison: "Cette place est déjà réglée." };
  }

  // Sans tarif au stage, on fait confiance à la saisie : il n'y a rien à quoi
  // la comparer. Sinon, on ne peut pas encaisser plus que ce qui est dû.
  const montant = total > 0 ? Math.min(Math.round(montantCents), reste) : Math.round(montantCents);
  // Partiel ou solde : l'état affiché serait faux si tout était « intégral ».
  const genre: GenrePaiement =
    total > 0 && montant < reste ? "acompte" : place.deja_paye > 0 ? "solde" : "integral";

  try {
    await sql`
      INSERT INTO paiements (participation_id, contact_id, montant_cents, genre, statut, paye_le)
      VALUES (${participationId}, ${place.contact_id}, ${montant}, ${genre}, 'manuelle', NOW())
    `;
    return { ok: true, montant };
  } catch (e) {
    console.error("[crm] encaisserALaMain:", e);
    return { ok: false, montant: 0, raison: "Ce règlement n'a pas pu être enregistré." };
  }
}

export type EtatPaiement = {
  participation_id: string;
  du: number;
  paye: number;
};

/** L'état de paiement de chaque place d'un stage, en une requête. */
export async function etatsDuStage(stageId: string): Promise<Map<string, EtatPaiement>> {
  const sql = await getDb();
  const vide = new Map<string, EtatPaiement>();
  if (!sql) return vide;
  try {
    const lignes = await sql<EtatPaiement[]>`
      SELECT p.id AS participation_id,
             (COALESCE(s.prix_cents, 0) * GREATEST(p.personnes, 1))::int AS du,
             COALESCE(SUM(x.montant_cents - x.rembourse_cents) FILTER (WHERE x.statut IN ('payee', 'manuelle')), 0)::int AS paye
      FROM participations p
      JOIN stages s ON s.id = p.stage_id
      LEFT JOIN paiements x ON x.participation_id = p.id
      WHERE p.stage_id = ${stageId}
      GROUP BY p.id, s.prix_cents, p.personnes
    `;
    return new Map(lignes.map((l) => [String(l.participation_id), l]));
  } catch (e) {
    console.error("[crm] etatsDuStage:", e);
    return vide;
  }
}

/** Ce qu'une session de paiement a réglé, pour la page de remerciement. */
export async function sessionReglee(
  sessionId: string,
): Promise<{ montant: number; titre: string; encaisse: boolean } | null> {
  const sql = await getDb();
  if (!sql) return null;
  if (!/^cs_[A-Za-z0-9_]{1,200}$/.test(sessionId)) return null;
  try {
    const [l] = await sql<{ montant: number; titre: string; statut: string }[]>`
      SELECT x.montant_cents::int AS montant, s.titre, x.statut
      FROM paiements x
      JOIN participations p ON p.id = x.participation_id
      JOIN stages s ON s.id = p.stage_id
      WHERE x.session_id = ${sessionId}
    `;
    if (!l) return null;
    // Un paiement différé termine sa session avant que l'argent soit là, et
    // un ancien lien périmé reste ouvrable : la page ne doit affirmer un
    // encaissement que si la base le constate.
    return { montant: l.montant, titre: l.titre, encaisse: l.statut === "payee" || l.statut === "manuelle" };
  } catch (e) {
    console.error("[crm] sessionReglee:", e);
    return null;
  }
}

/**
 * Envoie à la personne le lien de règlement de sa place.
 *
 * L'e-mail est volontairement court : il ne vend plus rien, la décision est
 * prise. Il dit le montant, ce qu'il couvre, et où payer.
 */
export async function envoyerLeLien(
  participationId: string,
  genre: GenrePaiement,
): Promise<{ ok: boolean; raison?: string; lien?: string }> {
  const place = await laPlace(participationId);
  if (!place) return { ok: false, raison: "Cette place est introuvable." };

  const ouverture = await ouvrirPaiement(participationId, genre);
  if (!ouverture.ok) return { ok: false, raison: ouverture.raison };

  if (!process.env.RESEND_API_KEY) {
    // Le lien existe : le secrétariat peut toujours le recopier à la main.
    return { ok: true, lien: ouverture.lien, raison: "E-mail non configuré : copiez le lien." };
  }

  const { habiller } = await import("./email");
  const { EXPEDITEUR } = await import("./sequences");
  const total = (place.prix_cents ?? 0) * Math.max(1, place.personnes);
  const quoi =
    ouverture.genre === "acompte"
      ? `l'acompte de ${euros(ouverture.montant)} (sur ${euros(total)})`
      : ouverture.genre === "solde"
        ? `le solde de ${euros(ouverture.montant)}`
        : `le règlement de ${euros(ouverture.montant)}`;

  const { html, text } = habiller({
    email: place.email,
    apercu: `Votre place pour « ${place.titre} ».`,
    texte:
      `Bonjour ${place.prenom ?? ""},\n\n` +
      `Votre place pour « ${place.titre} » est confirmée. Il reste ${quoi} à régler pour la retenir définitivement.\n\n` +
      `Le paiement se fait sur une page sécurisée, par carte :\n${ouverture.lien}\n\n` +
      `Le lien reste valable vingt-quatre heures. Passé ce délai, écrivez-nous : nous vous en renvoyons un autre, sans difficulté.\n\n` +
      `Si vous préférez régler par virement, répondez simplement à ce message.`,
  });

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: EXPEDITEUR,
      to: place.email,
      subject: `Votre place pour « ${place.titre} » — le règlement`,
      html,
      text,
    });
    return { ok: true, lien: ouverture.lien };
  } catch (e) {
    console.error("[crm] envoyerLeLien:", e);
    return { ok: true, lien: ouverture.lien, raison: "L'e-mail n'est pas parti : copiez le lien." };
  }
}

/** Jours avant qu'un règlement en attente soit rappelé, puis abandonné. */
const RELANCE_JOURS = 3;

/**
 * Rappelle les règlements restés en attente.
 *
 * Une seule fois, trois jours après l'ouverture : au-delà, ce n'est plus un
 * oubli, c'est une hésitation — et une hésitation se traite à la main, pas par
 * un automate.
 */
export async function relancerLesPaiements(): Promise<number> {
  const sql = await getDb();
  if (!sql || !stripeActif()) return 0;
  try {
    const dues = await sql<{ participation_id: string; genre: GenrePaiement }[]>`
      SELECT DISTINCT ON (x.participation_id) x.participation_id, x.genre
      FROM paiements x
      JOIN participations p ON p.id = x.participation_id
      JOIN contacts c       ON c.id = p.contact_id
      WHERE x.statut = 'attente'
        AND x.relance_le IS NULL
        AND x.cree_le < NOW() - make_interval(days => ${RELANCE_JOURS})
        AND p.statut IN ('demande', 'confirmee')
        AND c.desabonne_le IS NULL
        -- Rien à rappeler si la place a été réglée entre-temps, par un autre
        -- lien ou par virement.
        AND NOT EXISTS (
          SELECT 1 FROM paiements y
          WHERE y.participation_id = x.participation_id
            AND y.statut IN ('payee', 'manuelle')
        )
      ORDER BY x.participation_id, x.cree_le DESC
      LIMIT 50
    `;

    let partis = 0;
    for (const d of dues) {
      // Le même montant que ce qui avait été demandé. Relancer « en solde »
      // réclamait le prix plein à quelqu'un qui avait reçu un lien d'acompte.
      const envoi = await envoyerLeLien(String(d.participation_id), d.genre);
      if (envoi.ok) partis += 1;
      // Après l'envoi, et sur toutes les lignes de la place : un nouveau lien
      // vient d'être ouvert, et sans cette marque il serait relancé à son tour
      // trois jours plus tard, indéfiniment.
      await sql`
        UPDATE paiements SET relance_le = NOW()
        WHERE participation_id = ${d.participation_id} AND relance_le IS NULL
      `;
    }
    return partis;
  } catch (e) {
    console.error("[crm] relancerLesPaiements:", e);
    return 0;
  }
}

// ─── Le branchement, vérifié ────────────────────────────────────────────────
//
// Poser deux clés dans Vercel ne dit pas qu'elles marchent. Une clé publique
// collée à la place de la secrète, une adresse de webhook déclarée sans le
// « www », un seul des deux événements coché : tout cela échoue en silence, et
// on ne le découvre qu'au premier paiement perdu. Le tableau de bord pose donc
// les questions lui-même, à Stripe et à la base, et dit ce qui reste à faire.

export type EtatEtape = "ok" | "a-faire" | "probleme";
export type Etape = { titre: string; etat: EtatEtape; detail: string };

type PointDAccueil = { url: string; status: string; enabled_events: string[] };

/**
 * Une adresse ramenée à sa forme comparable : l'origine en minuscules, le
 * chemin tel quel — les routes distinguent les majuscules —, sans barre finale.
 */
function sansFin(url: string): string {
  try {
    const u = new URL(url.trim());
    return `${u.protocol}//${u.host}`.toLowerCase() + u.pathname.replace(/\/+$/, "");
  } catch {
    return url.trim().replace(/\/+$/, "");
  }
}

/**
 * Juge la déclaration du webhook chez Stripe, à partir de la liste des
 * adresses que Stripe connaît. Pure, pour être tenue par des tests.
 */
export function jugerWebhook(
  points: PointDAccueil[],
  adresse: string = ADRESSE_WEBHOOK,
): { etat: EtatEtape; detail: string } {
  const voulue = sansFin(adresse);
  const exacts = points.filter((p) => sansFin(p.url) === voulue);

  if (exacts.length === 0) {
    // Une adresse presque juste est le piège le plus courant : sans « www »,
    // en http, ou sur l'ancienne adresse Vercel. Stripe l'appelle, le site
    // redirige, et la redirection fait échouer la livraison.
    const chemin = "/api/stripe/webhook";
    const proche = points.find((p) => sansFin(p.url).toLowerCase().endsWith(chemin));
    if (proche) {
      return {
        etat: "probleme",
        detail: `Une adresse proche est déclarée (${proche.url}), mais pas exactement ${adresse}. Corrigez-la chez Stripe : une redirection suffit à faire échouer l'appel.`,
      };
    }
    return {
      etat: "a-faire",
      detail: `Aucune adresse n'est déclarée chez Stripe pour ce site. Ajoutez ${adresse}.`,
    };
  }

  const actives = exacts.filter((p) => p.status === "enabled");
  if (actives.length === 0) {
    return { etat: "probleme", detail: "L'adresse est déclarée, mais désactivée chez Stripe." };
  }
  if (actives.length > 1) {
    // Chaque déclaration a son propre secret, et le site n'en connaît qu'un :
    // l'une des deux échoue à chaque paiement, sans qu'on sache laquelle.
    return {
      etat: "probleme",
      detail: `L'adresse est déclarée ${actives.length} fois chez Stripe. Gardez-en une seule, et son secret dans Vercel.`,
    };
  }
  const active = actives[0];

  const recus = new Set(active.enabled_events);
  const manquants = recus.has("*") ? [] : EVENEMENTS_WEBHOOK.filter((e) => !recus.has(e));
  if (manquants.length > 0) {
    return {
      etat: "probleme",
      detail: `L'adresse est déclarée, mais il lui manque : ${manquants.join(", ")}.`,
    };
  }

  return { etat: "ok", detail: "L'adresse est déclarée, active, avec tous les événements nécessaires." };
}

export type Diagnostic = {
  mode: "essai" | "production" | null;
  compte: string | null;
  etapes: Etape[];
};

type ErreurStripe = { type?: string; code?: string; requestId?: string; message?: string };

/** Ce qu'on garde d'une erreur Stripe pour les journaux : jamais la clé. */
function trace(lieu: string, e: unknown): ErreurStripe {
  const err = (e ?? {}) as ErreurStripe;
  console.error(`[stripe] ${lieu}:`, err.type ?? "inconnue", err.code ?? "", err.requestId ?? "");
  return err;
}

/** Interroge Stripe et la base, et rend l'état de chaque étape du branchement. */
export async function diagnosticStripe(): Promise<Diagnostic> {
  const etapes: Etape[] = [];
  const brute = process.env.STRIPE_SECRET_KEY ?? "";
  const secretBrut = process.env.STRIPE_WEBHOOK_SECRET ?? "";
  const cle = brute.trim();
  const secret = secretBrut.trim();
  const mode =
    cle.startsWith("sk_test_") || cle.startsWith("rk_test_")
      ? "essai"
      : cle.startsWith("sk_live_") || cle.startsWith("rk_live_")
        ? "production"
        : null;
  let compte: string | null = null;

  // 1. La clé secrète. Le paiement et le webhook la lisent telle quelle : un
  // retour à la ligne collé avec elle la rend inutilisable, même si elle
  // « ressemble » à une bonne clé.
  let cleUtilisable = false;
  if (!cle) {
    etapes.push({
      titre: "La clé secrète",
      etat: "a-faire",
      detail: "Ajoutez STRIPE_SECRET_KEY dans les réglages Vercel, puis redéployez.",
    });
  } else if (cle.startsWith("pk_")) {
    etapes.push({
      titre: "La clé secrète",
      etat: "probleme",
      detail: "C'est la clé publique (pk_…) qui est posée. Il faut la clé secrète, qui commence par sk_.",
    });
  } else if (!mode) {
    etapes.push({
      titre: "La clé secrète",
      etat: "probleme",
      detail: "Cette valeur ne ressemble pas à une clé Stripe : elle devrait commencer par sk_test_ ou sk_live_.",
    });
  } else if (brute !== cle) {
    etapes.push({
      titre: "La clé secrète",
      etat: "probleme",
      detail: "La clé a été collée avec un espace ou un retour à la ligne en trop. Recollez-la dans Vercel, sans rien autour.",
    });
  } else {
    cleUtilisable = true;
    etapes.push({
      titre: "La clé secrète",
      etat: "ok",
      detail:
        mode === "essai"
          ? "Clé d'essai posée : les paiements ne débitent rien, la carte 4242 4242 4242 4242 est acceptée."
          : "Clé de production posée : les paiements sont réels.",
    });
  }

  // 2, 3 et 5. Le compte et les adresses déclarées, demandés en même temps :
  // l'un après l'autre, la page pouvait attendre seize secondes.
  let compteLu: import("stripe").Stripe.Account | null = null;
  let erreurCompte: ErreurStripe | null = null;
  let adresses: PointDAccueil[] | null = null;
  let erreurAdresses: ErreurStripe | null = null;
  if (cleUtilisable) {
    const { default: Stripe } = await import("stripe");
    const stripe = new Stripe(cle, { timeout: 8000, maxNetworkRetries: 0 });
    const [c, w] = await Promise.allSettled([
      stripe.accounts.retrieveCurrent(),
      stripe.webhookEndpoints.list({ limit: 100 }),
    ]);
    if (c.status === "fulfilled") compteLu = c.value;
    else erreurCompte = trace("compte", c.reason);
    if (w.status === "fulfilled") {
      adresses = w.value.data.map((p) => ({ url: p.url, status: p.status, enabled_events: p.enabled_events }));
    } else erreurAdresses = trace("adresses", w.reason);
  }

  if (compteLu) {
    const c = compteLu;
    compte = c.settings?.dashboard?.display_name || c.business_profile?.name || c.email || c.id;
    etapes.push({
      titre: "Stripe accepte la clé",
      etat: "ok",
      detail: `Compte « ${compte} »${c.country ? ` (${c.country})` : ""}.`,
    });
    if (c.charges_enabled) {
      etapes.push({
        titre: "Le compte peut encaisser",
        etat: "ok",
        detail: c.payouts_enabled
          ? "Paiements et virements vers votre banque sont activés."
          : "Les paiements sont activés ; les virements vers votre banque attendent encore un IBAN ou une vérification.",
      });
    } else if (mode === "essai") {
      // En essai, un compte non activé est l'état normal du début : rien ne
      // bloque, et la ligne ne doit pas compter parmi les « points à régler ».
      etapes.push({
        titre: "Le compte peut encaisser",
        etat: "ok",
        detail:
          "En essai, rien à faire : les paiements de test fonctionnent. Avant de passer en production, terminez l'activation du compte chez Stripe — activité, identité, IBAN.",
      });
    } else {
      etapes.push({
        titre: "Le compte peut encaisser",
        etat: "a-faire",
        detail:
          "Stripe attend encore des informations (activité, identité, IBAN) avant d'autoriser les encaissements. Terminez l'activation dans votre compte Stripe.",
      });
    }
  } else if (erreurCompte) {
    etapes.push({
      titre: "Stripe accepte la clé",
      etat: "probleme",
      detail:
        erreurCompte.type === "StripeAuthenticationError"
          ? "Stripe refuse cette clé : elle est fausse, incomplète ou révoquée. Recopiez-la depuis votre compte Stripe."
          : erreurCompte.type === "StripePermissionError"
            ? "Cette clé restreinte n'a pas le droit de lire le compte. Utilisez la clé secrète standard, ou donnez-lui ce droit chez Stripe."
            : "Stripe n'a pas répondu. Rechargez la page dans un instant.",
    });
  }

  // 4. Le secret de signature du webhook.
  if (!secret) {
    etapes.push({
      titre: "Le secret du webhook",
      etat: "a-faire",
      detail: "Ajoutez STRIPE_WEBHOOK_SECRET dans les réglages Vercel : Stripe le donne quand on déclare l'adresse.",
    });
  } else if (!secret.startsWith("whsec_")) {
    etapes.push({
      titre: "Le secret du webhook",
      etat: "probleme",
      detail: "Cette valeur n'est pas un secret de signature : il commence par whsec_.",
    });
  } else if (secretBrut !== secret) {
    etapes.push({
      titre: "Le secret du webhook",
      etat: "probleme",
      detail: "Le secret a été collé avec un espace ou un retour à la ligne en trop : aucune signature ne pourra correspondre. Recollez-le dans Vercel.",
    });
  } else {
    etapes.push({ titre: "Le secret du webhook", etat: "ok", detail: "Secret de signature posé." });
  }

  // 5. L'adresse déclarée chez Stripe, dans le mode de la clé.
  if (adresses) {
    const jugement = jugerWebhook(adresses);
    etapes.push({
      titre: "L'adresse déclarée chez Stripe",
      etat: jugement.etat,
      detail:
        jugement.etat === "ok"
          ? jugement.detail
          : `${jugement.detail} (Les adresses se déclarent séparément en mode essai et en production.)`,
    });
  } else if (erreurAdresses) {
    etapes.push({
      titre: "L'adresse déclarée chez Stripe",
      etat: "probleme",
      detail:
        erreurAdresses.type === "StripePermissionError"
          ? "Cette clé n'a pas le droit de lire les adresses déclarées. Vérifiez-les directement chez Stripe."
          : "Impossible de lire les adresses déclarées pour l'instant. Rechargez la page, ou vérifiez-les chez Stripe.",
    });
  }

  // 6. Stripe a-t-il déjà réussi à appeler le site, dans ce mode ? Seule la
  // preuve compte : un appel dont la signature est refusée n'est pas
  // enregistré, et un appel d'essai ne dit rien du secret de production.
  const appel = mode ? await dernierAppelStripe(mode === "production") : null;
  etapes.push(
    appel
      ? {
          titre: "Stripe appelle bien le site",
          etat: "ok",
          detail: `Dernier appel reçu et vérifié le ${appel.vu_le.toLocaleString("fr-FR", {
            timeZone: "Europe/Paris",
            dateStyle: "long",
            timeStyle: "short",
          })} (${appel.type}).`,
        }
      : {
          titre: "Stripe appelle bien le site",
          etat: "a-faire",
          detail:
            mode === "production"
              ? "Aucun appel de production reçu pour l'instant. Au premier vrai paiement, cette ligne passera au vert. Si elle reste orange après un paiement, le secret du webhook ne correspond pas à l'adresse déclarée en production."
              : "Aucun appel reçu pour l'instant. Faites un paiement d'essai : cette ligne passera au vert. S'il reste orange après un paiement, le secret du webhook ne correspond pas à l'adresse déclarée.",
        },
  );

  // 7. Le rappel automatique des règlements. L'automate n'envoie de liens de
  // paiement que derrière CRON_SECRET : une route ouverte à tous ne doit pas
  // pouvoir déclencher des envois d'argent.
  etapes.push(
    process.env.CRON_SECRET
      ? {
          titre: "Le rappel des règlements",
          etat: "ok",
          detail: "Un lien resté sans paiement est rappelé une fois, trois jours après, par l'automate du matin.",
        }
      : {
          titre: "Le rappel des règlements",
          etat: "a-faire",
          detail:
            "Ajoutez CRON_SECRET (une longue chaîne au hasard) dans Vercel : sans elle, les liens restés sans paiement ne sont jamais rappelés.",
        },
  );

  return { mode, compte, etapes };
}

/** Le dernier événement Stripe reçu et vérifié, en essai ou en production. */
export async function dernierAppelStripe(
  production: boolean,
): Promise<{ type: string; vu_le: Date } | null> {
  const sql = await getDb();
  if (!sql) return null;
  try {
    const [l] = await sql<{ type: string; vu_le: Date }[]>`
      SELECT type, vu_le FROM stripe_evenements
      WHERE livemode = ${production}
      ORDER BY vu_le DESC LIMIT 1
    `;
    return l ?? null;
  } catch (e) {
    console.error("[crm] dernierAppelStripe:", e);
    return null;
  }
}

export type Bilan = {
  mois: number;
  total: number;
  carte: number;
  main: number;
  rembourse: number;
  ouverts: number;
  montantOuvert: number;
};

/** Ce qui est encaissé — ce mois-ci, en tout, par carte, à la main — et ce qui attend. */
export async function bilanPaiements(): Promise<Bilan | null> {
  const sql = await getDb();
  if (!sql) return null;
  try {
    // Le mois se compte à l'heure de Paris : un virement noté le 1er à 0 h 30
    // appartient au mois qui commence, pas à celui qui finit en UTC.
    // Tout est compté net : ce qui a été remboursé chez Stripe ne reste pas
    // dans l'encaissé.
    const [b] = await sql<Bilan[]>`
      SELECT
        COALESCE(SUM(montant_cents - rembourse_cents) FILTER (
          WHERE statut IN ('payee', 'manuelle')
            AND paye_le >= (date_trunc('month', NOW() AT TIME ZONE 'Europe/Paris') AT TIME ZONE 'Europe/Paris')
        ), 0)::int AS mois,
        COALESCE(SUM(montant_cents - rembourse_cents) FILTER (WHERE statut IN ('payee', 'manuelle')), 0)::int AS total,
        COALESCE(SUM(montant_cents - rembourse_cents) FILTER (WHERE statut = 'payee'), 0)::int AS carte,
        COALESCE(SUM(montant_cents) FILTER (WHERE statut = 'manuelle'), 0)::int AS main,
        COALESCE(SUM(rembourse_cents) FILTER (WHERE statut IN ('payee', 'remboursee')), 0)::int AS rembourse,
        COUNT(*) FILTER (WHERE statut = 'attente')::int AS ouverts,
        COALESCE(SUM(montant_cents) FILTER (WHERE statut = 'attente'), 0)::int AS "montantOuvert"
      FROM paiements
    `;
    return b ?? null;
  } catch (e) {
    console.error("[crm] bilanPaiements:", e);
    return null;
  }
}

export type LigneReglement = {
  id: string;
  montant: number;
  rembourse: number;
  genre: GenrePaiement;
  statut: Paiement["statut"];
  cree_le: Date;
  paye_le: Date | null;
  prenom: string | null;
  nom: string | null;
  email: string | null;
  contact_id: string | null;
  titre: string;
};

/** Les règlements les plus récents, tous stages confondus. */
export async function derniersReglements(limite = 60): Promise<LigneReglement[]> {
  const sql = await getDb();
  if (!sql) return [];
  try {
    return await sql<LigneReglement[]>`
      SELECT x.id, x.montant_cents::int AS montant, x.rembourse_cents::int AS rembourse,
             x.genre, x.statut, x.cree_le, x.paye_le,
             c.prenom, c.nom, c.email, x.contact_id, s.titre
      FROM paiements x
      JOIN participations p ON p.id = x.participation_id
      JOIN stages s         ON s.id = p.stage_id
      LEFT JOIN contacts c  ON c.id = x.contact_id
      ORDER BY COALESCE(x.paye_le, x.cree_le) DESC
      LIMIT ${Math.min(200, Math.max(1, Math.trunc(limite) || 1))}
    `;
  } catch (e) {
    console.error("[crm] derniersReglements:", e);
    return [];
  }
}
