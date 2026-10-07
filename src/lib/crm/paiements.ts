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

export type GenrePaiement = "acompte" | "solde" | "integral";

export type Paiement = {
  id: string;
  participation_id: string;
  contact_id: string | null;
  montant_cents: number;
  genre: GenrePaiement;
  statut: "attente" | "payee" | "expiree" | "manuelle";
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
  return (process.env.STRIPE_SECRET_KEY ?? "").startsWith("sk_test_");
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
               SELECT SUM(x.montant_cents) FROM paiements x
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
): Promise<boolean> {
  const sql = tx ?? (await getDb());
  if (!sql) return false;
  // Pas de try/catch : une écriture qui échoue doit remonter jusqu'au webhook,
  // qui répondra 500 et fera rejouer Stripe. Avalée ici, l'erreur rendait un
  // 200 — l'argent était débité et la place restait « en attente », pour
  // toujours, sans que personne en soit averti.
  const [l] = await sql<{ id: string }[]>`
    UPDATE paiements SET statut = 'payee', paye_le = NOW()
    WHERE session_id = ${sessionId} AND statut = 'attente'
    RETURNING id
  `;
  return Boolean(l);
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
             COALESCE(SUM(x.montant_cents) FILTER (WHERE x.statut IN ('payee', 'manuelle')), 0)::int AS paye
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
