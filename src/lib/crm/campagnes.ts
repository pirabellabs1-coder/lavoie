import { Resend } from "resend";
import { getDb } from "./db";
import { habiller, lienDesinscription, personnaliser } from "./email";
import { EXPEDITEUR } from "./sequences";

/**
 * Campagnes ponctuelles — les e-mails que l'on décide d'écrire, par opposition
 * aux séquences qui partent toutes seules.
 *
 * Trois principes tiennent tout le fichier :
 *
 *   · Un envoi n'est jamais atomique. Une campagne part par paquets, au fil des
 *     passages du worker, et reste « en cours » tant qu'il reste du monde. Une
 *     interruption au milieu ne fait perdre personne et n'envoie rien deux fois
 *     (un index unique sur (campagne, contact) le garantit en base).
 *
 *   · Les désabonnés sont exclus à la source, dans la requête elle-même. Pas
 *     dans une boucle où l'on pourrait oublier le test.
 *
 *   · Chaque message part par la même porte que les séquences : même gabarit,
 *     même lien de désinscription, même journal d'envois — donc les ouvertures
 *     et les clics remontent aussi pour les campagnes.
 */

/** Critères de ciblage. Tous facultatifs, combinés par « et ». */
export type Segment = {
  /** Statuts retenus dans l'entonnoir. Vide ou absent = tous. */
  statuts?: string[];
  /** Libellé exact du formulaire d'origine (« Lettres », « Guide gratuit »…). */
  source?: string;
  /** Campagne d'acquisition (utm_source). */
  utm_source?: string;
  /** Arrivés depuis moins de N jours. */
  depuis_jours?: number;
  /** N'a jamais ouvert un seul e-mail. */
  jamais_ouvert?: boolean;
  /**
   * Inscrits à un stage : le slug du stage, ou « * » pour n'importe lequel.
   * Les stages ne sont pas une source ni un statut — on peut être venu à un
   * stage et rester « lead » —, il leur faut donc leur propre critère.
   */
  stage?: string;
  /** États de participation retenus. Vide = tous, annulées comprises. */
  stage_etats?: string[];
};

/** Les états d'une participation, tels qu'ils sont écrits en base. */
export const ETATS_STAGE = ["demande", "attente", "confirmee", "venue", "annulee"] as const;

export type Campagne = {
  id: string;
  sujet: string;
  corps: string;
  segment: Segment;
  statut: string;
  programmee_le: Date | null;
  envoyee_le: Date | null;
  cree_le: Date;
};

export type CampagneVue = Campagne & {
  partis: number;
  ouverts: number;
  cliques: number;
};

/** Normalise un segment reçu d'un formulaire : rien d'autre que ces cinq clés. */
export function nettoyerSegment(brut: unknown): Segment {
  const s = (brut ?? {}) as Record<string, unknown>;
  const segment: Segment = {};

  if (Array.isArray(s.statuts)) {
    const liste = s.statuts.filter((v): v is string => typeof v === "string").slice(0, 10);
    if (liste.length) segment.statuts = liste;
  }
  if (typeof s.source === "string" && s.source.trim()) {
    segment.source = s.source.trim().slice(0, 120);
  }
  if (typeof s.utm_source === "string" && s.utm_source.trim()) {
    segment.utm_source = s.utm_source.trim().slice(0, 120);
  }
  const jours = Number(s.depuis_jours);
  if (Number.isFinite(jours) && jours > 0) segment.depuis_jours = Math.min(3650, Math.round(jours));
  if (s.jamais_ouvert === true) segment.jamais_ouvert = true;
  if (typeof s.stage === "string" && s.stage.trim()) {
    segment.stage = s.stage.trim().slice(0, 120);
  }
  if (Array.isArray(s.stage_etats)) {
    const etats = s.stage_etats.filter(
      (v): v is string => typeof v === "string" && (ETATS_STAGE as readonly string[]).includes(v),
    );
    // Tous les états cochés revient à n'en cocher aucun : on ne garde pas un
    // critère qui ne filtre rien.
    if (etats.length && etats.length < ETATS_STAGE.length) segment.stage_etats = etats;
  }
  // Un état de participation sans stage n'a pas de sens : c'est le stage qui
  // porte le critère.
  if (!segment.stage) delete segment.stage_etats;

  return segment;
}

/**
 * Description lisible d'un segment, pour l'afficher dans le tableau de bord.
 * `titresDesStages` traduit les slugs en noms de stage, quand on les a sous la
 * main : « stage-automne-naitre-a-soi » ne dit rien à personne.
 */
export function decrireSegment(s: Segment, titresDesStages: Record<string, string> = {}): string {
  const bouts: string[] = [];
  if (s.statuts?.length) bouts.push(s.statuts.join(", "));
  if (s.source) bouts.push(`source « ${s.source} »`);
  if (s.utm_source) bouts.push(`campagne « ${s.utm_source} »`);
  if (s.depuis_jours) bouts.push(`arrivés depuis moins de ${s.depuis_jours} jours`);
  if (s.jamais_ouvert) bouts.push("n'a jamais ouvert un e-mail");
  if (s.stage) {
    const nom = titresDesStages[s.stage] ?? s.stage;
    const ou = s.stage === "*" ? "inscrits à un stage" : `inscrits au stage « ${nom} »`;
    bouts.push(s.stage_etats?.length ? `${ou} (${s.stage_etats.join(", ")})` : ou);
  }
  return bouts.length ? bouts.join(" · ") : "toute la liste";
}

type Destinataire = { id: string; email: string; prenom: string | null };

/**
 * Les destinataires d'un segment. `campagneId` exclut ceux qui l'ont déjà
 * reçue : c'est ce qui rend la reprise après interruption sans danger.
 */
async function destinataires(
  segment: Segment,
  campagneId: string | null,
  limite: number,
): Promise<Destinataire[]> {
  const sql = await getDb();
  if (!sql) return [];

  const statuts = segment.statuts?.length ? segment.statuts : null;
  const source = segment.source ?? null;
  const utm = segment.utm_source ?? null;
  const jours = segment.depuis_jours ?? null;
  const jamaisOuvert = segment.jamais_ouvert === true;
  const stage = segment.stage ?? null;
  const etats = segment.stage_etats?.length ? segment.stage_etats : null;

  try {
    return await sql<Destinataire[]>`
      SELECT c.id, c.email, c.prenom
      FROM contacts c
      WHERE c.desabonne_le IS NULL
        AND c.consentement = TRUE
        AND c.email <> ''
        AND (${statuts}::text[] IS NULL OR c.statut = ANY(${statuts}::text[]))
        AND (${source}::text IS NULL OR c.source = ${source})
        AND (${utm}::text IS NULL OR c.utm_source = ${utm})
        AND (${jours}::int IS NULL OR c.cree_le >= NOW() - make_interval(days => ${jours}::int))
        AND (
          ${jamaisOuvert} = FALSE
          OR NOT EXISTS (
            SELECT 1 FROM envois e
            WHERE e.contact_id = c.id AND e.ouvert_le IS NOT NULL
          )
        )
        AND (
          ${stage}::text IS NULL
          OR EXISTS (
            SELECT 1 FROM participations p
            JOIN stages st ON st.id = p.stage_id
            WHERE p.contact_id = c.id
              AND (${stage}::text = '*' OR st.slug = ${stage}::text)
              AND (${etats}::text[] IS NULL OR p.statut = ANY(${etats}::text[]))
          )
        )
        AND (
          ${campagneId}::bigint IS NULL
          OR NOT EXISTS (
            SELECT 1 FROM envois e
            WHERE e.campagne_id = ${campagneId}::bigint AND e.contact_id = c.id
          )
        )
      ORDER BY c.cree_le DESC
      LIMIT ${limite}
    `;
  } catch (e) {
    console.error("[crm] destinataires:", e);
    return [];
  }
}

/** Combien de personnes ce segment touche-t-il aujourd'hui ? */
export async function compterSegment(segment: Segment): Promise<number> {
  const liste = await destinataires(segment, null, 100000);
  return liste.length;
}

/**
 * Les contacts d'un segment, hors de toute campagne. Sert aux ajouts en masse
 * dans une séquence (voir `ajouts.ts`) : même ciblage, mêmes exclusions, donc
 * le compte annoncé avant l'ajout est bien celui qu'on obtient.
 */
export async function contactsDuSegment(
  segment: Segment,
  limite = 5000,
): Promise<{ id: string; email: string; prenom: string | null }[]> {
  return destinataires(segment, null, limite);
}

export async function listerCampagnes(): Promise<CampagneVue[]> {
  const sql = await getDb();
  if (!sql) return [];
  try {
    return await sql<CampagneVue[]>`
      SELECT c.*,
             COUNT(e.id) FILTER (WHERE e.statut <> 'echec')::int AS partis,
             COUNT(e.id) FILTER (WHERE e.ouvert_le IS NOT NULL)::int AS ouverts,
             COUNT(e.id) FILTER (WHERE e.clique_le IS NOT NULL)::int AS cliques
      FROM campagnes c
      LEFT JOIN envois e ON e.campagne_id = c.id
      GROUP BY c.id
      ORDER BY c.cree_le DESC
      LIMIT 100
    `;
  } catch (e) {
    console.error("[crm] listerCampagnes:", e);
    return [];
  }
}

export async function creerCampagne(entree: {
  sujet: string;
  corps: string;
  segment: Segment;
  /** Absent = départ immédiat. */
  programmeeLe?: Date | null;
}): Promise<string | null> {
  const sql = await getDb();
  if (!sql) return null;
  const statut = entree.programmeeLe ? "programmee" : "en_cours";
  try {
    const [ligne] = await sql<{ id: string }[]>`
      INSERT INTO campagnes (sujet, corps, segment, statut, programmee_le)
      VALUES (${entree.sujet}, ${entree.corps}, ${JSON.stringify(entree.segment)}::jsonb,
              ${statut}, ${entree.programmeeLe ?? null})
      RETURNING id
    `;
    return ligne ? String(ligne.id) : null;
  } catch (e) {
    console.error("[crm] creerCampagne:", e);
    return null;
  }
}

/** Arrête une campagne en cours. Ce qui est parti est parti. */
export async function arreterCampagne(id: string): Promise<boolean> {
  const sql = await getDb();
  if (!sql) return false;
  try {
    await sql`
      UPDATE campagnes SET statut = 'envoyee', envoyee_le = COALESCE(envoyee_le, NOW())
      WHERE id = ${id} AND statut IN ('en_cours', 'programmee')
    `;
    return true;
  } catch (e) {
    console.error("[crm] arreterCampagne:", e);
    return false;
  }
}

/**
 * Envoie un paquet pour chaque campagne due. Appelée par le worker, et juste
 * après la création d'une campagne immédiate pour que le départ ne se fasse
 * pas attendre jusqu'au lendemain.
 */
export async function traiterCampagnes(
  parCampagne = 100,
): Promise<{ envoyes: number; echecs: number }> {
  const sql = await getDb();
  if (!sql) return { envoyes: 0, echecs: 0 };
  if (!process.env.RESEND_API_KEY) return { envoyes: 0, echecs: 0 };

  let dues: Campagne[] = [];
  try {
    dues = await sql<Campagne[]>`
      SELECT * FROM campagnes
      WHERE statut = 'en_cours'
         OR (statut = 'programmee' AND programmee_le IS NOT NULL AND programmee_le <= NOW())
      ORDER BY cree_le ASC
      LIMIT 5
    `;
  } catch (e) {
    console.error("[crm] traiterCampagnes (lecture):", e);
    return { envoyes: 0, echecs: 0 };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  let envoyes = 0;
  let echecs = 0;

  for (const campagne of dues) {
    const segment = (campagne.segment ?? {}) as Segment;
    const liste = await destinataires(segment, campagne.id, parCampagne);

    if (!liste.length) {
      await sql`
        UPDATE campagnes SET statut = 'envoyee', envoyee_le = COALESCE(envoyee_le, NOW())
        WHERE id = ${campagne.id}
      `;
      continue;
    }

    await sql`UPDATE campagnes SET statut = 'en_cours' WHERE id = ${campagne.id}`;

    for (const personne of liste) {
      const sujet = personnaliser(campagne.sujet, personne);
      const { html, text } = habiller({
        texte: personnaliser(campagne.corps, personne),
        email: personne.email,
      });

      let erreur: string | null = null;
      let messageId: string | null = null;
      try {
        const { data, error } = await resend.emails.send({
          from: EXPEDITEUR,
          to: personne.email,
          subject: sujet,
          html,
          text,
          headers: { "List-Unsubscribe": `<${lienDesinscription(personne.email)}>` },
        });
        if (error) erreur = error.message ?? "Erreur Resend";
        messageId = data?.id ?? null;
      } catch (e) {
        erreur = e instanceof Error ? e.message : "Erreur inconnue";
      }

      try {
        await sql`
          INSERT INTO envois (contact_id, campagne_id, destinataire, sujet, statut, erreur, message_id)
          VALUES (${personne.id}, ${campagne.id}, ${personne.email}, ${sujet},
                  ${erreur ? "echec" : "envoye"}, ${erreur}, ${messageId})
          ON CONFLICT DO NOTHING
        `;
        if (erreur) {
          echecs += 1;
        } else {
          envoyes += 1;
          await sql`
            INSERT INTO evenements (contact_id, type, libelle)
            VALUES (${personne.id}, 'email', ${"Campagne envoyée — " + sujet})
          `;
        }
      } catch (e) {
        console.error("[crm] traiterCampagnes (écriture):", e);
      }
    }
  }

  return { envoyes, echecs };
}
