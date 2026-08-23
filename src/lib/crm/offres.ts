import { Resend } from "resend";
import { SITE } from "@/lib/site";
import { getDb } from "./db";
import { habiller, personnaliser } from "./email";
import { EXPEDITEUR } from "./sequences";

/**
 * Les propositions — la partie du tableau de bord où il est question d'argent.
 *
 * Une proposition n'est pas un e-mail : c'est une page personnelle que la
 * personne ouvre, relit, fait lire autour d'elle, et sur laquelle elle répond.
 * On sait donc si elle a été vue, combien de fois, et quand — savoir qu'une
 * offre a été ouverte quatre fois sans réponse ne se relance pas comme une
 * offre jamais ouverte.
 *
 * Les montants sont en centimes. Aucun flottant ne touche à de l'argent.
 */

export const ETATS: Record<string, { texte: string; ton: string }> = {
  brouillon: { texte: "Brouillon", ton: "nouveau" },
  envoyee: { texte: "Envoyée", ton: "contacte" },
  vue: { texte: "Vue", ton: "appel" },
  acceptee: { texte: "Acceptée", ton: "client" },
  refusee: { texte: "Refusée", ton: "perdu" },
  expiree: { texte: "Expirée", ton: "perdu" },
};

/** Les propositions encore en jeu — ni acceptées, ni refusées, ni expirées. */
export const EN_JEU = ["brouillon", "envoyee", "vue"];

export type Offre = {
  id: string;
  contact_id: string;
  jeton: string;
  intitule: string;
  montant_cents: string | number;
  echeancier: string | null;
  probabilite: number;
  message: string | null;
  statut: string;
  valide_jusqu_au: Date | null;
  envoyee_le: Date | null;
  vue_le: Date | null;
  vues: number;
  repondue_le: Date | null;
  relances: number;
  cree_le: Date;
};

export type LigneOffre = Offre & {
  prenom: string | null;
  nom: string | null;
  email: string;
};

/** Vue publique : la péremption est calculée par la base, pas par le rendu. */
export type OffreOuverte = LigneOffre & { perimee: boolean };

export function euros(cents: string | number): string {
  const n = Number(cents) / 100;
  return n.toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: n % 1 === 0 ? 0 : 2,
  });
}

/** « 1 800,50 », « 1800.5 », « 1 800 € » → 180050 centimes. */
export function enCentimes(saisie: string): number | null {
  const propre = saisie.replace(/[\s€]/g, "").replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(propre)) return null;
  return Math.round(Number(propre) * 100);
}

function nouveauJeton(): string {
  const octets = new Uint8Array(24);
  crypto.getRandomValues(octets);
  return Array.from(octets, (o) => o.toString(16).padStart(2, "0")).join("");
}

export function lienOffre(jeton: string): string {
  return `${SITE.url}/proposition/${jeton}`;
}

// ─── Écriture ───────────────────────────────────────────────────────────────

export async function creerOffre(entree: {
  contactId: string;
  intitule: string;
  montantCents: number;
  echeancier?: string;
  probabilite: number;
  message?: string;
  valideJusquAu?: string | null;
}): Promise<string | null> {
  const sql = await getDb();
  if (!sql) return null;
  try {
    const [ligne] = await sql<{ id: string }[]>`
      INSERT INTO offres (contact_id, jeton, intitule, montant_cents, echeancier,
                          probabilite, message, valide_jusqu_au)
      VALUES (${entree.contactId}, ${nouveauJeton()}, ${entree.intitule},
              ${entree.montantCents}, ${entree.echeancier || null},
              ${Math.max(0, Math.min(100, entree.probabilite))},
              ${entree.message || null}, ${entree.valideJusquAu || null})
      RETURNING id
    `;
    if (!ligne) return null;
    await sql`
      INSERT INTO evenements (contact_id, type, libelle)
      VALUES (${entree.contactId}, 'offre',
              ${`Proposition préparée — ${entree.intitule} (${euros(entree.montantCents)})`})
    `;
    return String(ligne.id);
  } catch (e) {
    console.error("[crm] creerOffre:", e);
    return null;
  }
}

/**
 * Envoie la proposition à la personne concernée et passe l'offre en « envoyée ».
 * Le contact avance à l'étape « proposition » du parcours.
 */
export async function envoyerOffre(id: string): Promise<boolean> {
  const sql = await getDb();
  if (!sql) return false;

  try {
    const [offre] = await sql<LigneOffre[]>`
      SELECT o.*, c.prenom, c.nom, c.email
      FROM offres o JOIN contacts c ON c.id = o.contact_id
      WHERE o.id = ${id}
    `;
    if (!offre) return false;
    if (!process.env.RESEND_API_KEY) return false;

    const lien = lienOffre(offre.jeton);
    const { html, text } = habiller({
      email: offre.email,
      apercu: `Votre proposition : ${offre.intitule}.`,
      texte:
        `Bonjour ${offre.prenom ?? ""},\n\n` +
        `Voici la proposition dont nous avons parlé : ${offre.intitule}.\n\n` +
        `Vous pouvez la lire, la relire et y répondre ici :\n${lien}\n\n` +
        (offre.valide_jusqu_au
          ? `Elle reste valable jusqu'au ${new Date(offre.valide_jusqu_au).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}.\n\n`
          : "") +
        `Prenez le temps qu'il faut. Une décision prise sous pression n'engage rien de solide.\n\n` +
        `Avec toute ma présence,\n` +
        `Domoïna Ramiadana — La Voie 2 la Conscience`,
    });

    const { data, error } = await new Resend(process.env.RESEND_API_KEY).emails.send({
      from: EXPEDITEUR,
      to: offre.email,
      subject: personnaliser(`Votre proposition — ${offre.intitule}`, offre),
      html,
      text,
    });
    if (error) {
      console.error("[crm] envoyerOffre:", error.message);
      return false;
    }

    await sql`
      UPDATE offres SET statut = 'envoyee', envoyee_le = COALESCE(envoyee_le, NOW())
      WHERE id = ${id}
    `;
    await sql`
      INSERT INTO envois (contact_id, destinataire, sujet, statut, message_id)
      VALUES (${offre.contact_id}, ${offre.email},
              ${`Votre proposition — ${offre.intitule}`}, 'envoye', ${data?.id ?? null})
    `;
    await sql`
      INSERT INTO evenements (contact_id, type, libelle)
      VALUES (${offre.contact_id}, 'offre', ${`Proposition envoyée — ${offre.intitule}`})
    `;
    // Le parcours n'avance que s'il n'est pas déjà plus loin.
    await sql`
      UPDATE contacts SET statut = 'proposition', maj_le = NOW()
      WHERE id = ${offre.contact_id} AND statut IN ('nouveau', 'lead', 'contacte', 'appel')
    `;
    return true;
  } catch (e) {
    console.error("[crm] envoyerOffre:", e);
    return false;
  }
}

/** Retrouve une proposition par son lien personnel, et compte la visite. */
export async function ouvrirOffre(jeton: string): Promise<OffreOuverte | null> {
  const sql = await getDb();
  if (!sql) return null;
  if (!/^[a-f0-9]{48}$/.test(jeton)) return null;
  try {
    const [offre] = await sql<OffreOuverte[]>`
      SELECT o.*, c.prenom, c.nom, c.email,
             (o.valide_jusqu_au IS NOT NULL AND o.valide_jusqu_au < CURRENT_DATE) AS perimee
      FROM offres o JOIN contacts c ON c.id = o.contact_id
      WHERE o.jeton = ${jeton}
    `;
    if (!offre) return null;

    if (offre.statut === "envoyee" || offre.statut === "vue") {
      await sql`
        UPDATE offres
        SET vues = vues + 1,
            vue_le = COALESCE(vue_le, NOW()),
            statut = 'vue'
        WHERE id = ${offre.id}
      `;
      // Une seule ligne de chronologie à la première ouverture : le compteur
      // dit le reste, et la fiche ne se noie pas sous les relectures.
      if (!offre.vue_le) {
        await sql`
          INSERT INTO evenements (contact_id, type, libelle)
          VALUES (${offre.contact_id}, 'offre', ${`Proposition ouverte — ${offre.intitule}`})
        `;
      }
    }
    return offre;
  } catch (e) {
    console.error("[crm] ouvrirOffre:", e);
    return null;
  }
}

/** La réponse de la personne. Idempotent : une offre déjà tranchée ne rebascule pas. */
export async function repondreOffre(jeton: string, accepte: boolean): Promise<boolean> {
  const sql = await getDb();
  if (!sql) return false;
  if (!/^[a-f0-9]{48}$/.test(jeton)) return false;
  try {
    const rows = await sql<{ contact_id: string; intitule: string }[]>`
      UPDATE offres
      SET statut = ${accepte ? "acceptee" : "refusee"}, repondue_le = NOW()
      WHERE jeton = ${jeton} AND statut IN ('envoyee', 'vue')
      RETURNING contact_id, intitule
    `;
    const offre = rows[0];
    if (!offre) return false;

    await sql`
      INSERT INTO evenements (contact_id, type, libelle)
      VALUES (${offre.contact_id}, 'offre',
              ${`Proposition ${accepte ? "acceptée" : "déclinée"} — ${offre.intitule}`})
    `;

    if (accepte) {
      await sql`UPDATE contacts SET statut = 'client', maj_le = NOW() WHERE id = ${offre.contact_id}`;
    } else {
      // Un refus ne fait reculer que quelqu'un qui n'est encore rien d'autre.
      await sql`
        UPDATE contacts SET statut = 'perdu', maj_le = NOW()
        WHERE id = ${offre.contact_id} AND statut = 'proposition'
      `;
    }
    return true;
  } catch (e) {
    console.error("[crm] repondreOffre:", e);
    return false;
  }
}

export async function annulerOffre(id: string): Promise<boolean> {
  const sql = await getDb();
  if (!sql) return false;
  try {
    await sql`
      UPDATE offres SET statut = 'expiree', repondue_le = COALESCE(repondue_le, NOW())
      WHERE id = ${id} AND statut IN ('brouillon', 'envoyee', 'vue')
    `;
    return true;
  } catch (e) {
    console.error("[crm] annulerOffre:", e);
    return false;
  }
}

// ─── Lecture ────────────────────────────────────────────────────────────────

export async function listerOffres(filtre?: "en_jeu" | "gagnees"): Promise<LigneOffre[]> {
  const sql = await getDb();
  if (!sql) return [];
  const enJeu = filtre === "en_jeu";
  const gagnees = filtre === "gagnees";
  try {
    return await sql<LigneOffre[]>`
      SELECT o.*, c.prenom, c.nom, c.email
      FROM offres o JOIN contacts c ON c.id = o.contact_id
      WHERE (${enJeu} = FALSE OR o.statut = ANY(${EN_JEU}))
        AND (${gagnees} = FALSE OR o.statut = 'acceptee')
      ORDER BY o.cree_le DESC
      LIMIT 300
    `;
  } catch (e) {
    console.error("[crm] listerOffres:", e);
    return [];
  }
}

export async function offresDuContact(contactId: string): Promise<Offre[]> {
  const sql = await getDb();
  if (!sql) return [];
  try {
    return await sql<Offre[]>`
      SELECT * FROM offres WHERE contact_id = ${contactId} ORDER BY cree_le DESC LIMIT 20
    `;
  } catch (e) {
    console.error("[crm] offresDuContact:", e);
    return [];
  }
}

export type PipelineChiffre = {
  enJeu: number;
  montantEnJeu: number;
  montantPondere: number;
  gagneesMois: number;
  montantGagneMois: number;
  tauxAcceptation: number;
};

export async function chiffresPipeline(): Promise<PipelineChiffre | null> {
  const sql = await getDb();
  if (!sql) return null;
  try {
    const [l] = await sql<
      {
        en_jeu: number;
        montant_en_jeu: string;
        montant_pondere: string;
        gagnees_mois: number;
        montant_gagne_mois: string;
        tranchees: number;
        acceptees: number;
      }[]
    >`
      SELECT
        COUNT(*) FILTER (WHERE statut = ANY(${EN_JEU}))::int AS en_jeu,
        COALESCE(SUM(montant_cents) FILTER (WHERE statut = ANY(${EN_JEU})), 0) AS montant_en_jeu,
        COALESCE(SUM(montant_cents * probabilite / 100) FILTER (WHERE statut = ANY(${EN_JEU})), 0) AS montant_pondere,
        COUNT(*) FILTER (WHERE statut = 'acceptee'
                           AND repondue_le >= date_trunc('month', NOW()))::int AS gagnees_mois,
        COALESCE(SUM(montant_cents) FILTER (WHERE statut = 'acceptee'
                           AND repondue_le >= date_trunc('month', NOW())), 0) AS montant_gagne_mois,
        COUNT(*) FILTER (WHERE statut IN ('acceptee', 'refusee', 'expiree'))::int AS tranchees,
        COUNT(*) FILTER (WHERE statut = 'acceptee')::int AS acceptees
      FROM offres
    `;
    if (!l) return null;
    return {
      enJeu: l.en_jeu,
      montantEnJeu: Number(l.montant_en_jeu),
      montantPondere: Number(l.montant_pondere),
      gagneesMois: l.gagnees_mois,
      montantGagneMois: Number(l.montant_gagne_mois),
      tauxAcceptation: l.tranchees ? Math.round((l.acceptees / l.tranchees) * 100) : 0,
    };
  } catch (e) {
    console.error("[crm] chiffresPipeline:", e);
    return null;
  }
}

// ─── Relances automatiques ──────────────────────────────────────────────────

const RELANCES = [
  { apresJours: 3, sujet: "Votre proposition, sans pression" },
  { apresJours: 8, sujet: "Faut-il refermer cette porte ?" },
];
const EXPIRATION_JOURS = 15;

/**
 * Passée une fois par jour par le worker : deux relances espacées, puis on
 * classe l'offre sans réponse. Le texte tient compte de ce que l'on sait —
 * une proposition ouverte plusieurs fois sans réponse ne se relance pas comme
 * une proposition jamais ouverte.
 */
export async function relancerOffres(): Promise<{ relances: number; expirees: number }> {
  const sql = await getDb();
  if (!sql) return { relances: 0, expirees: 0 };

  let expirees = 0;
  try {
    const perdues = await sql<{ id: string; contact_id: string; intitule: string }[]>`
      UPDATE offres
      SET statut = 'expiree', repondue_le = NOW()
      WHERE statut IN ('envoyee', 'vue')
        AND envoyee_le < NOW() - make_interval(days => ${EXPIRATION_JOURS})
      RETURNING id, contact_id, intitule
    `;
    expirees = perdues.length;
    for (const o of perdues) {
      await sql`
        INSERT INTO evenements (contact_id, type, libelle)
        VALUES (${o.contact_id}, 'offre', ${`Proposition sans réponse, classée — ${o.intitule}`})
      `;
      await sql`
        UPDATE contacts SET statut = 'perdu', maj_le = NOW()
        WHERE id = ${o.contact_id} AND statut = 'proposition'
      `;
    }
  } catch (e) {
    console.error("[crm] relancerOffres (expiration):", e);
  }

  if (!process.env.RESEND_API_KEY) return { relances: 0, expirees };
  const resend = new Resend(process.env.RESEND_API_KEY);
  let relances = 0;

  for (const [index, plan] of RELANCES.entries()) {
    let dues: LigneOffre[] = [];
    try {
      dues = await sql<LigneOffre[]>`
        SELECT o.*, c.prenom, c.nom, c.email
        FROM offres o JOIN contacts c ON c.id = o.contact_id
        WHERE o.statut IN ('envoyee', 'vue')
          AND o.relances = ${index}
          AND o.envoyee_le < NOW() - make_interval(days => ${plan.apresJours})
          AND c.desabonne_le IS NULL
        LIMIT 50
      `;
    } catch (e) {
      console.error("[crm] relancerOffres (lecture):", e);
      continue;
    }

    for (const offre of dues) {
      const lien = lienOffre(offre.jeton);
      const ouverte = offre.vues > 0;
      const { html, text } = habiller({
        email: offre.email,
        texte:
          `Bonjour ${offre.prenom ?? ""},\n\n` +
          (ouverte
            ? `Vous avez ouvert la proposition « ${offre.intitule} », et vous n'avez pas répondu. C'est une réponse en soi, et elle mérite d'être posée.\n\n`
            : `Je ne sais pas si la proposition « ${offre.intitule} » vous est bien parvenue.\n\n`) +
          `Elle est là :\n${lien}\n\n` +
          `Un « non » ou un « pas maintenant » est une réponse parfaitement valable — et infiniment préférable à un silence qui laisse la place occupée.\n\n` +
          `Avec toute ma présence,\n` +
          `Domoïna Ramiadana — La Voie 2 la Conscience`,
      });

      try {
        const { error } = await resend.emails.send({
          from: EXPEDITEUR,
          to: offre.email,
          subject: plan.sujet,
          html,
          text,
        });
        if (error) continue;
        await sql`
          UPDATE offres SET relances = relances + 1, derniere_relance_le = NOW()
          WHERE id = ${offre.id}
        `;
        await sql`
          INSERT INTO envois (contact_id, destinataire, sujet, statut)
          VALUES (${offre.contact_id}, ${offre.email}, ${plan.sujet}, 'envoye')
        `;
        relances += 1;
      } catch (e) {
        console.error("[crm] relancerOffres (envoi):", e);
      }
    }
  }

  return { relances, expirees };
}
