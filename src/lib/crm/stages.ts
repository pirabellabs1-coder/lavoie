import { Resend } from "resend";
import { SITE } from "@/lib/site";
import { EVENEMENTS } from "@/lib/evenements";
import { getDb } from "./db";
import { habiller } from "./email";
import { EXPEDITEUR, inscrireASequence } from "./sequences";
import { lienAvis } from "./avis";

/**
 * Les stages, et qui vient.
 *
 * Le catalogue des événements reste dans le code (`src/lib/evenements.ts`) :
 * c'est du contenu éditorial, pas de la donnée. La base ne retient de chaque
 * stage que ce qui bouge — le nombre de places, le texte de logistique, et
 * surtout la liste des personnes.
 *
 * Le parcours d'une place :
 *
 *   demande → confirmée → venue
 *      ↓         ↓
 *   attente   annulée
 *
 * Une demande n'est pas une inscription. Le paiement passe encore par la
 * billetterie, donc c'est le secrétariat qui confirme, et la confirmation
 * porte le lien de règlement. Quand une place se libère, la première personne
 * en attente est proposée à la confirmation — jamais promue en silence.
 */

export const ETATS_PARTICIPATION: Record<string, { texte: string; ton: string }> = {
  demande: { texte: "Demande", ton: "nouveau" },
  attente: { texte: "Liste d'attente", ton: "contacte" },
  confirmee: { texte: "Confirmée", ton: "client" },
  venue: { texte: "Venue", ton: "appel" },
  annulee: { texte: "Annulée", ton: "perdu" },
};

export type Stage = {
  id: string;
  slug: string;
  titre: string;
  debut_le: Date | null;
  places: number;
  actif: boolean;
  logistique: string | null;
  lieu: string | null;
  /** En centimes : jamais de flottant sur de l'argent. */
  prix_cents: number | null;
  resume: string | null;
};

export type StageVue = Stage & {
  confirmees: number;
  demandes: number;
  attente: number;
};

export type Participation = {
  id: string;
  stage_id: string;
  contact_id: string;
  statut: string;
  message: string | null;
  cree_le: Date;
  personnes: number;
  date_debut: Date | null;
  prenom: string | null;
  nom: string | null;
  email: string;
  telephone: string | null;
};

/**
 * Le semis n'a lieu qu'une fois par instance. Il est appelé depuis des pages
 * publiques : le rejouer à chaque visite ferait une dizaine de requêtes pour
 * rien. Même motif que le semis des séquences.
 */
let semisStagesFait: Promise<void> | null = null;

/**
 * Crée en base les stages du catalogue qui n'y sont pas encore, et leur pose ce
 * que le catalogue sait déjà : le lieu, le tarif ferme, et la date du stage
 * comme première date disponible. Idempotent, et jamais destructeur : ce qui
 * est réglé depuis le tableau de bord fait toujours autorité.
 */
export async function semerStages(): Promise<void> {
  if (!semisStagesFait) {
    semisStagesFait = semer().catch((e) => {
      // Un semis raté ne reste pas mémorisé : la base était peut-être
      // simplement indisponible, et l'appel suivant doit réessayer.
      semisStagesFait = null;
      console.error("[crm] semerStages:", e);
    });
  }
  return semisStagesFait;
}

async function semer(): Promise<void> {
  const sql = await getDb();
  if (!sql) return;

  for (const e of EVENEMENTS) {
    // Le lieu et le tarif ne sont posés que s'ils manquent : ce qui est réglé
    // depuis le tableau de bord fait toujours autorité sur le catalogue.
    await sql`
      INSERT INTO stages (slug, titre, debut_le, lieu, prix_cents)
      VALUES (${e.slug}, ${e.titreLong || e.titre}, ${e.debutISO ?? null},
              ${e.lieu ?? null}, ${e.prixCents ?? null})
      ON CONFLICT (slug) DO UPDATE SET
        lieu = COALESCE(stages.lieu, EXCLUDED.lieu),
        prix_cents = COALESCE(stages.prix_cents, EXCLUDED.prix_cents)
    `;

    // La date du catalogue devient la première date disponible — une seule
    // fois, marquée comme telle. Un stage dont les dates ne sont pas encore
    // fixées reste sans date, et donc ouvert à la demande.
    if (e.debutISO) {
      await sql`
        WITH cible AS (
          SELECT id FROM stages WHERE slug = ${e.slug} AND dates_semees = FALSE
        ),
        posee AS (
          INSERT INTO stage_dates (stage_id, debut_le, fin_le)
          SELECT id, ${e.debutISO}::timestamptz, ${e.finISO ?? null}::timestamptz
          FROM cible
          ON CONFLICT (stage_id, debut_le) DO NOTHING
          RETURNING stage_id
        )
        UPDATE stages SET dates_semees = TRUE
        WHERE id IN (SELECT id FROM cible)
      `;
    }
  }
}

export async function listerStages(): Promise<StageVue[]> {
  const sql = await getDb();
  if (!sql) return [];
  await semerStages();
  try {
    return await sql<StageVue[]>`
      SELECT s.id, s.slug, s.titre, s.debut_le, s.places, s.actif, s.logistique,
             s.lieu, s.prix_cents, s.resume,
             COALESCE(SUM(p.personnes) FILTER (WHERE p.statut = 'confirmee'), 0)::int AS confirmees,
             COALESCE(SUM(p.personnes) FILTER (WHERE p.statut = 'demande'), 0)::int   AS demandes,
             COALESCE(SUM(p.personnes) FILTER (WHERE p.statut = 'attente'), 0)::int   AS attente
      FROM stages s
      LEFT JOIN participations p ON p.stage_id = s.id
      GROUP BY s.id
      ORDER BY s.debut_le NULLS LAST, s.titre
    `;
  } catch (e) {
    console.error("[crm] listerStages:", e);
    return [];
  }
}

export async function participantsDuStage(stageId: string): Promise<Participation[]> {
  const sql = await getDb();
  if (!sql) return [];
  try {
    return await sql<Participation[]>`
      SELECT p.id, p.stage_id, p.contact_id, p.statut, p.message, p.cree_le,
             p.personnes, d.debut_le AS date_debut,
             c.prenom, c.nom, c.email, c.telephone
      FROM participations p
      JOIN contacts c ON c.id = p.contact_id
      LEFT JOIN stage_dates d ON d.id = p.date_id
      WHERE p.stage_id = ${stageId}
      ORDER BY
        array_position(ARRAY['confirmee','demande','attente','venue','annulee'], p.statut),
        p.cree_le
    `;
  } catch (e) {
    console.error("[crm] participantsDuStage:", e);
    return [];
  }
}

export type StagePublic = {
  titre: string;
  lieu: string | null;
  prix_cents: number | null;
  places: number;
  actif: boolean;
};

/** Ce qu'un visiteur a le droit de savoir d'un stage : son cadre et son tarif. */
export async function stagePublic(slug: string): Promise<StagePublic | null> {
  const sql = await getDb();
  if (!sql) return null;
  try {
    const [s] = await sql<StagePublic[]>`
      SELECT titre, lieu, prix_cents, places, actif FROM stages WHERE slug = ${slug}
    `;
    return s ?? null;
  } catch (e) {
    console.error("[crm] stagePublic:", e);
    return null;
  }
}

/** Reste-t-il de la place ? Les demandes en cours comptent comme des places prises. */
export async function placesRestantes(slug: string): Promise<number | null> {
  const sql = await getDb();
  if (!sql) return null;
  try {
    const [l] = await sql<{ places: number; prises: number }[]>`
      SELECT s.places,
             COALESCE(SUM(p.personnes) FILTER (WHERE p.statut IN ('confirmee', 'demande')), 0)::int AS prises
      FROM stages s
      LEFT JOIN participations p ON p.stage_id = s.id
      WHERE s.slug = ${slug}
      GROUP BY s.places
    `;
    if (!l) return null;
    return Math.max(0, l.places - l.prises);
  } catch (e) {
    console.error("[crm] placesRestantes:", e);
    return null;
  }
}

/**
 * Enregistre une demande de place. Renvoie l'état retenu — « demande » s'il
 * reste de la place, « attente » sinon.
 */
export async function demanderPlace(entree: {
  slug: string;
  contactId: string;
  message?: string;
  /** La date choisie, quand le stage en propose plusieurs. */
  dateId?: string | null;
  /** Combien de places pour cette demande. Une par défaut. */
  personnes?: number;
}): Promise<{
  statut: "demande" | "attente";
  titre: string;
  quand: Date | null;
  personnes: number;
} | null> {
  const sql = await getDb();
  if (!sql) return null;
  await semerStages();
  try {
    const [stage] = await sql<{ id: string; titre: string }[]>`
      SELECT id, titre FROM stages WHERE slug = ${entree.slug} AND actif = TRUE
    `;
    if (!stage) return null;

    // La disponibilité se juge sur la date choisie quand il y en a une : c'est
    // elle qui se remplit, pas le stage. Et elle se revérifie ici, au moment de
    // la demande — entre l'affichage et le clic, la dernière place a pu partir.
    const { datePrenable, placesRestantesDate } = await import("./dates-stages");
    const date = entree.dateId ? await datePrenable(entree.dateId) : null;
    const bonneDate = date && String(date.stage_id) === String(stage.id) ? date : null;

    const restantes = bonneDate
      ? placesRestantesDate(bonneDate)
      : await placesRestantes(entree.slug);
    const complet =
      restantes !== null && (restantes <= 0 || (bonneDate ? !bonneDate.ouverte : false));
    const statut = complet ? "attente" : "demande";

    const personnes = Math.max(1, Math.min(6, Math.round(entree.personnes ?? 1)));

    await sql`
      INSERT INTO participations (stage_id, contact_id, statut, message, date_id, personnes)
      VALUES (${stage.id}, ${entree.contactId}, ${statut}, ${entree.message || null},
              ${bonneDate ? bonneDate.id : null}, ${personnes})
      ON CONFLICT (stage_id, contact_id) DO UPDATE SET
        message = COALESCE(NULLIF(EXCLUDED.message, ''), participations.message),
        date_id = COALESCE(EXCLUDED.date_id, participations.date_id),
        personnes = EXCLUDED.personnes,
        -- Une personne qui refait une demande après une annulation redevient
        -- candidate ; une place déjà confirmée n'est jamais rétrogradée.
        statut = CASE WHEN participations.statut IN ('annulee', 'attente')
                      THEN EXCLUDED.statut ELSE participations.statut END
    `;

    await sql`
      INSERT INTO evenements (contact_id, type, libelle)
      VALUES (${entree.contactId}, 'stage',
              ${`${statut === "attente" ? "Liste d'attente" : "Demande de place"} — ${stage.titre}`})
    `;

    return {
      statut,
      titre: stage.titre,
      quand: bonneDate ? bonneDate.debut_le : null,
      personnes,
    };
  } catch (e) {
    console.error("[crm] demanderPlace:", e);
    return null;
  }
}

export async function changerStatutParticipation(
  id: string,
  statut: string,
): Promise<boolean> {
  const sql = await getDb();
  if (!sql) return false;
  if (!Object.keys(ETATS_PARTICIPATION).includes(statut)) return false;
  try {
    const rows = await sql<{ contact_id: string; titre: string }[]>`
      UPDATE participations p
      SET statut = ${statut}
      FROM stages s
      WHERE s.id = p.stage_id AND p.id = ${id}
      RETURNING p.contact_id, s.titre
    `;
    const l = rows[0];
    if (!l) return false;
    await sql`
      INSERT INTO evenements (contact_id, type, libelle)
      VALUES (${l.contact_id}, 'stage',
              ${`${ETATS_PARTICIPATION[statut].texte} — ${l.titre}`})
    `;
    // Venir à un stage, c'est être client.
    if (statut === "confirmee" || statut === "venue") {
      await sql`
        UPDATE contacts SET statut = 'client', maj_le = NOW()
        WHERE id = ${l.contact_id} AND statut <> 'client'
      `;
    }
    return true;
  } catch (e) {
    console.error("[crm] changerStatutParticipation:", e);
    return false;
  }
}

/**
 * Retire une demande de place, définitivement.
 *
 * À ne pas confondre avec « Annuler » : une annulation garde la trace de
 * quelqu'un qui s'était inscrit puis s'est désisté — c'est une information.
 * Retirer efface la ligne, et c'est ce qu'il faut pour une réservation
 * d'essai, un doublon, une erreur de saisie : des choses qui n'ont jamais eu
 * lieu et qui, gardées, faussent les comptes et la mémoire du stage.
 *
 * La fiche de la personne, elle, n'est pas touchée : elle vit sa vie ailleurs.
 */
export async function supprimerParticipation(
  id: string,
): Promise<{ nom: string; titre: string } | null> {
  const sql = await getDb();
  if (!sql) return null;
  try {
    const lignes = await sql<{ nom: string; titre: string }[]>`
      DELETE FROM participations p
      USING contacts c, stages s
      WHERE p.id = ${id} AND c.id = p.contact_id AND s.id = p.stage_id
      RETURNING COALESCE(NULLIF(TRIM(CONCAT(c.prenom, ' ', c.nom)), ''), c.email) AS nom,
                s.titre
    `;
    return lignes[0] ?? null;
  } catch (e) {
    console.error("[crm] supprimerParticipation:", e);
    return null;
  }
}

export async function reglerStage(
  id: string,
  entree: {
    places: number;
    logistique: string;
    actif: boolean;
    titre?: string;
    lieu?: string;
    resume?: string;
    prixEuros?: number | null;
  },
): Promise<boolean> {
  const sql = await getDb();
  if (!sql) return false;
  const titre = entree.titre?.trim().slice(0, 200);
  const prix =
    entree.prixEuros != null && Number.isFinite(entree.prixEuros) && entree.prixEuros >= 0
      ? Math.round(entree.prixEuros * 100)
      : null;
  try {
    await sql`
      UPDATE stages
      SET places = ${Math.max(0, Math.min(500, entree.places))},
          logistique = ${entree.logistique || null},
          actif = ${entree.actif},
          titre = COALESCE(${titre || null}, titre),
          lieu = ${entree.lieu?.trim().slice(0, 200) || null},
          resume = ${entree.resume?.trim().slice(0, 2000) || null},
          prix_cents = ${prix}
      WHERE id = ${id}
    `;
    return true;
  } catch (e) {
    console.error("[crm] reglerStage:", e);
    return false;
  }
}

/** Un identifiant d'adresse lisible, tiré du titre. */
export function slugifier(titre: string): string {
  return titre
    .normalize("NFD")
    // Les accents décomposés par NFD s'enlèvent en retirant les diacritiques.
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/**
 * Crée un stage depuis le tableau de bord. Le catalogue éditorial reste dans le
 * code — pages, textes, photos —, mais un stage peut désormais naître ici :
 * celui qu'on ajoute en cours d'année, celui qui n'a pas de page à lui.
 */
export async function creerStage(entree: {
  titre: string;
  lieu?: string;
  resume?: string;
  places?: number;
  prixEuros?: number | null;
}): Promise<{ ok: true; id: string } | { ok: false; erreur: string }> {
  const sql = await getDb();
  if (!sql) return { ok: false, erreur: "Base de données indisponible." };

  const titre = entree.titre.trim().slice(0, 200);
  if (titre.length < 3) return { ok: false, erreur: "Le titre est trop court." };
  const slug = slugifier(titre);
  if (!slug) return { ok: false, erreur: "Ce titre ne donne pas d'adresse lisible." };

  const prix =
    entree.prixEuros != null && Number.isFinite(entree.prixEuros) && entree.prixEuros >= 0
      ? Math.round(entree.prixEuros * 100)
      : null;

  try {
    const [ligne] = await sql<{ id: string }[]>`
      INSERT INTO stages (slug, titre, lieu, resume, places, prix_cents)
      VALUES (${slug}, ${titre}, ${entree.lieu?.trim().slice(0, 200) || null},
              ${entree.resume?.trim().slice(0, 2000) || null},
              ${Math.max(1, Math.min(500, entree.places ?? 12))}, ${prix})
      ON CONFLICT (slug) DO NOTHING
      RETURNING id
    `;
    if (!ligne) return { ok: false, erreur: "Un stage porte déjà ce titre." };
    return { ok: true, id: String(ligne.id) };
  } catch (e) {
    console.error("[crm] creerStage:", e);
    return { ok: false, erreur: "La création a échoué." };
  }
}

// ─── Les deux e-mails que le worker envoie ──────────────────────────────────

const AVANT_JOURS = 7;
const APRES_JOURS = 2;
/** Une demande sans réponse au bout de ce délai reçoit un mot. */
const RELANCE_JOURS = 4;
/** Le temps qu'on laisse avant d'ouvrir la suite du chemin. */
const SUITE_JOURS = 5;

/**
 * La logistique une semaine avant, le retour deux jours après. Chaque e-mail
 * n'est envoyé qu'une fois par personne et par stage — la date d'envoi est
 * posée en base avant même de savoir si Resend a réussi, pour qu'un incident
 * ne se transforme jamais en envoi en boucle.
 */
export async function accompagnerLesStages(): Promise<{
  logistique: number;
  retours: number;
  relances: number;
  suites: number;
}> {
  const vide = { logistique: 0, retours: 0, relances: 0, suites: 0 };
  const sql = await getDb();
  if (!sql) return vide;
  if (!process.env.RESEND_API_KEY) return vide;

  const resend = new Resend(process.env.RESEND_API_KEY);
  let logistique = 0;
  let retours = 0;
  let relances = 0;
  let suites = 0;

  type Due = {
    id: string;
    email: string;
    prenom: string | null;
    titre: string;
    debut_le: Date;
    logistique: string | null;
  };

  // ── Une semaine avant ──
  try {
    const dues = await sql<Due[]>`
      SELECT p.id, c.email, c.prenom, s.titre, s.debut_le, s.logistique
      FROM participations p
      JOIN stages s   ON s.id = p.stage_id
      JOIN contacts c ON c.id = p.contact_id
      WHERE p.statut = 'confirmee'
        AND p.logistique_le IS NULL
        AND s.debut_le IS NOT NULL
        AND s.debut_le > NOW()
        AND s.debut_le < NOW() + make_interval(days => ${AVANT_JOURS})
        AND c.desabonne_le IS NULL
      LIMIT 100
    `;

    for (const d of dues) {
      await sql`UPDATE participations SET logistique_le = NOW() WHERE id = ${d.id}`;
      const quand = new Date(d.debut_le).toLocaleDateString("fr-FR", {
        timeZone: "Europe/Paris",
        weekday: "long",
        day: "numeric",
        month: "long",
      });
      const { html, text } = habiller({
        email: d.email,
        apercu: `Votre stage commence ${quand}.`,
        texte:
          `Bonjour ${d.prenom ?? ""},\n\n` +
          `Votre place est confirmée pour « ${d.titre} », qui commence ${quand}.\n\n` +
          (d.logistique
            ? `${d.logistique}\n\n`
            : `Le Centre HUT se trouve à Rouperroux-le-Coquet, dans la Sarthe. Prévoyez des vêtements confortables, de quoi écrire, et de bonnes chaussures : une partie du travail se fait dehors.\n\n`) +
          `Si quelque chose vous empêche de venir, dites-le-nous : une autre personne attend cette place.\n\n` +
          `Avec toute ma présence,\n` +
          `Domoïna Ramiadana — La Voie 2 la Conscience`,
      });
      try {
        await resend.emails.send({
          from: EXPEDITEUR,
          to: d.email,
          subject: `Votre stage commence ${quand}`,
          html,
          text,
        });
        logistique += 1;
      } catch (e) {
        console.error("[crm] logistique non envoyée:", e);
      }
    }
  } catch (e) {
    console.error("[crm] accompagnerLesStages (avant):", e);
  }

  // ── Deux jours après ──
  try {
    const dues = await sql<(Due & { contact_id: string })[]>`
      SELECT p.id, p.contact_id, c.email, c.prenom, s.titre, s.debut_le, s.logistique
      FROM participations p
      JOIN stages s   ON s.id = p.stage_id
      JOIN contacts c ON c.id = p.contact_id
      WHERE p.statut IN ('confirmee', 'venue')
        AND p.retour_le IS NULL
        AND s.debut_le IS NOT NULL
        AND s.debut_le < NOW() - make_interval(days => ${APRES_JOURS})
        AND s.debut_le > NOW() - INTERVAL '30 days'
        AND c.desabonne_le IS NULL
      LIMIT 100
    `;

    for (const d of dues) {
      await sql`UPDATE participations SET retour_le = NOW() WHERE id = ${d.id}`;
      // Le lien de dépôt est personnel : le témoignage arrive rattaché à sa
      // fiche, et la personne n'a pas à retaper son nom.
      const lienDepot = await lienAvis(String(d.contact_id), d.email);
      await sql`
        UPDATE contacts SET avis_demande_le = COALESCE(avis_demande_le, NOW())
        WHERE id = ${d.contact_id}
      `;
      const { html, text } = habiller({
        email: d.email,
        apercu: "Ce qui se dépose après un stage.",
        texte:
          `Bonjour ${d.prenom ?? ""},\n\n` +
          `Quelques jours ont passé depuis « ${d.titre} ». C'est souvent maintenant que les choses se déposent — pas pendant, après.\n\n` +
          `Si vous voulez me dire un mot de ce qui a bougé, répondez simplement à cet e-mail. Je lis tout, et ces retours nourrissent les stages suivants.\n\n` +
          `Et si votre expérience peut éclairer quelqu'un qui hésite encore, vous pouvez la déposer ici, en quelques lignes : ${lienDepot}\n\n` +
          `Pour poursuivre le chemin, le parcours complet est là : ${SITE.url}/cycle-des-saisons\n\n` +
          `Avec toute ma présence,\n` +
          `Domoïna Ramiadana — La Voie 2 la Conscience`,
      });
      try {
        await resend.emails.send({
          from: EXPEDITEUR,
          to: d.email,
          subject: "Après le stage",
          html,
          text,
        });
        retours += 1;
      } catch (e) {
        console.error("[crm] retour non envoyé:", e);
      }
    }
  } catch (e) {
    console.error("[crm] accompagnerLesStages (après):", e);
  }

  // ── Une demande restée sans réponse ──
  //
  // L'accusé de réception promet une confirmation sous 48 heures ouvrées.
  // Quand le délai passe, le silence vient de nous, pas de la personne : on le
  // dit, et on lui laisse la possibilité de se retirer proprement. Une seule
  // fois, jamais deux.
  try {
    const dues = await sql<Due[]>`
      SELECT p.id, c.email, c.prenom, s.titre, s.debut_le, s.logistique
      FROM participations p
      JOIN stages s   ON s.id = p.stage_id
      JOIN contacts c ON c.id = p.contact_id
      WHERE p.statut = 'demande'
        AND p.relance_le IS NULL
        AND p.cree_le < NOW() - make_interval(days => ${RELANCE_JOURS})
        AND (s.debut_le IS NULL OR s.debut_le > NOW())
        AND c.desabonne_le IS NULL
      LIMIT 100
    `;

    for (const d of dues) {
      await sql`UPDATE participations SET relance_le = NOW() WHERE id = ${d.id}`;
      const { html, text } = habiller({
        email: d.email,
        apercu: `Votre demande de place pour « ${d.titre} » attend toujours.`,
        texte:
          `Bonjour ${d.prenom ?? ""},\n\n` +
          `Vous avez demandé une place pour « ${d.titre} », et nous ne l'avons pas encore confirmée. Ce délai vient de nous.\n\n` +
          `Deux mots suffisent à débloquer les choses. Si votre intention tient toujours, répondez simplement à ce message : le secrétariat revient vers vous avec les modalités de règlement.\n\n` +
          `Et si le moment n'est plus le bon, dites-le aussi. Ce n'est pas un reproche, et une autre personne attend peut-être cette place.\n\n` +
          `À très vite,\n` +
          `Le secrétariat — La Voie 2 la Conscience`,
      });
      try {
        await resend.emails.send({
          from: EXPEDITEUR,
          to: d.email,
          subject: `Votre place pour « ${d.titre} » — toujours d'actualité ?`,
          html,
          text,
        });
        relances += 1;
      } catch (e) {
        console.error("[crm] relance de demande non envoyée:", e);
      }
    }
  } catch (e) {
    console.error("[crm] accompagnerLesStages (demandes):", e);
  }

  // ── Cinq jours après : la suite du chemin ──
  //
  // La demande de retour part à J+2 ; celle-ci prend le relais et ouvre le pas
  // suivant. C'est une séquence et non un e-mail unique : elle s'étale, et
  // s'arrête d'elle-même si la personne se désabonne.
  try {
    const dues = await sql<{ id: string; contact_id: string }[]>`
      SELECT p.id, p.contact_id
      FROM participations p
      JOIN stages s   ON s.id = p.stage_id
      JOIN contacts c ON c.id = p.contact_id
      WHERE p.statut IN ('confirmee', 'venue')
        AND p.suite_le IS NULL
        AND s.debut_le IS NOT NULL
        AND s.debut_le < NOW() - make_interval(days => ${SUITE_JOURS})
        AND s.debut_le > NOW() - INTERVAL '60 days'
        AND c.desabonne_le IS NULL
      LIMIT 100
    `;

    for (const d of dues) {
      await sql`UPDATE participations SET suite_le = NOW() WHERE id = ${d.id}`;
      await inscrireASequence(String(d.contact_id), "apres_stage");
      suites += 1;
    }
  } catch (e) {
    console.error("[crm] accompagnerLesStages (suite):", e);
  }

  return { logistique, retours, relances, suites };
}
