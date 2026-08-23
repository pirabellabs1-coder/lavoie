import { getDb } from "./db";
import type { Origine } from "@/lib/attribution";

/**
 * Le parcours d'un prospect, du premier contact jusqu'à la conversion.
 * L'ordre du tableau est l'ordre de l'entonnoir affiché au tableau de bord.
 */
export const STATUTS = [
  { cle: "nouveau", label: "Nouveau", aide: "Vient d'arriver, rien n'a encore été fait." },
  { cle: "lead", label: "Lead", aide: "A laissé son e-mail (guide, lettres)." },
  { cle: "contacte", label: "Contacté", aide: "A demandé un appel ou été relancé." },
  { cle: "appel", label: "Appel fait", aide: "L'appel découverte a eu lieu." },
  { cle: "proposition", label: "Proposition", aide: "Une offre lui a été envoyée." },
  { cle: "client", label: "Client", aide: "A rejoint un programme ou un stage." },
  { cle: "perdu", label: "Perdu", aide: "Ne donne pas suite." },
] as const;

export type StatutCle = (typeof STATUTS)[number]["cle"];

export const STATUT_LABEL: Record<string, string> = Object.fromEntries(
  STATUTS.map((s) => [s.cle, s.label]),
);

export function estStatutValide(v: string): v is StatutCle {
  return STATUTS.some((s) => s.cle === v);
}

export type Contact = {
  id: string;
  email: string;
  prenom: string | null;
  nom: string | null;
  telephone: string | null;
  statut: string;
  source: string | null;
  interet: string | null;
  message: string | null;
  notes: string | null;
  consentement: boolean;
  desabonne_le: Date | null;
  cree_le: Date;
  maj_le: Date;
  // Attribution — renseignée au premier formulaire, jamais écrasée ensuite.
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  referent: string | null;
  page_entree: string | null;
};

export type Evenement = {
  id: string;
  type: string;
  libelle: string;
  cree_le: Date;
};

export function nomAffiche(c: {
  prenom: string | null;
  nom: string | null;
  email: string;
}): string {
  const n = [c.prenom, c.nom].filter(Boolean).join(" ").trim();
  return n || c.email;
}

/**
 * Crée ou met à jour un contact à partir d'une soumission de formulaire.
 * Les champs vides ne remplacent jamais une valeur déjà connue, et le statut
 * n'est jamais reculé dans l'entonnoir.
 *
 * Renvoie `null` si la base n'est pas configurée — l'appelant continue alors
 * son chemin normal (envoi d'e-mail) sans échouer.
 */
export async function enregistrerContact(entree: {
  email: string;
  prenom?: string;
  nom?: string;
  telephone?: string;
  source?: string;
  interet?: string;
  message?: string;
  statut?: StatutCle;
  libelleEvenement: string;
  /** Provenance transmise par le navigateur (voir `src/lib/attribution.ts`). */
  origine?: Origine;
}): Promise<{ id: string; nouveau: boolean } | null> {
  const sql = await getDb();
  if (!sql) return null;

  const email = entree.email.trim().toLowerCase();
  const statutVoulu = entree.statut ?? "lead";
  const o = entree.origine ?? {};

  try {
    const rows = await sql<{ id: string; est_nouveau: boolean }[]>`
      INSERT INTO contacts (email, prenom, nom, telephone, source, interet, message, statut,
                            utm_source, utm_medium, utm_campaign, referent, page_entree)
      VALUES (
        ${email},
        ${entree.prenom || null},
        ${entree.nom || null},
        ${entree.telephone || null},
        ${entree.source || null},
        ${entree.interet || null},
        ${entree.message || null},
        ${statutVoulu},
        ${o.utm_source || null},
        ${o.utm_medium || null},
        ${o.utm_campaign || null},
        ${o.referent || null},
        ${o.page_entree || null}
      )
      ON CONFLICT (email) DO UPDATE SET
        -- L'attribution du premier contact fait foi : on ne complète que ce
        -- qui manque encore.
        utm_source   = COALESCE(contacts.utm_source, EXCLUDED.utm_source),
        utm_medium   = COALESCE(contacts.utm_medium, EXCLUDED.utm_medium),
        utm_campaign = COALESCE(contacts.utm_campaign, EXCLUDED.utm_campaign),
        referent     = COALESCE(contacts.referent, EXCLUDED.referent),
        page_entree  = COALESCE(contacts.page_entree, EXCLUDED.page_entree),
        prenom    = COALESCE(NULLIF(EXCLUDED.prenom, ''), contacts.prenom),
        nom       = COALESCE(NULLIF(EXCLUDED.nom, ''), contacts.nom),
        telephone = COALESCE(NULLIF(EXCLUDED.telephone, ''), contacts.telephone),
        interet   = COALESCE(NULLIF(EXCLUDED.interet, ''), contacts.interet),
        message   = COALESCE(NULLIF(EXCLUDED.message, ''), contacts.message),
        statut    = CASE
          WHEN contacts.statut IN ('client', 'perdu') THEN contacts.statut
          WHEN array_position(ARRAY['nouveau','lead','contacte','appel','proposition','client','perdu'], EXCLUDED.statut)
             > array_position(ARRAY['nouveau','lead','contacte','appel','proposition','client','perdu'], contacts.statut)
            THEN EXCLUDED.statut
          ELSE contacts.statut
        END,
        maj_le = NOW()
      RETURNING id, (xmax = 0) AS est_nouveau
    `;

    const row = rows[0];
    if (!row) return null;

    await sql`
      INSERT INTO evenements (contact_id, type, libelle)
      VALUES (${row.id}, 'formulaire', ${entree.libelleEvenement})
    `;

    return { id: String(row.id), nouveau: row.est_nouveau };
  } catch (e) {
    console.error("[crm] enregistrerContact:", e);
    return null;
  }
}

/** Ajoute une ligne à la chronologie d'un contact. Silencieux en cas d'échec. */
export async function journaliser(
  contactId: string,
  type: string,
  libelle: string,
): Promise<void> {
  const sql = await getDb();
  if (!sql) return;
  try {
    await sql`
      INSERT INTO evenements (contact_id, type, libelle)
      VALUES (${contactId}, ${type}, ${libelle})
    `;
  } catch (e) {
    console.error("[crm] journaliser:", e);
  }
}

export type Filtres = {
  recherche?: string;
  statut?: string;
  limite?: number;
};

export async function listerContacts(f: Filtres = {}): Promise<Contact[]> {
  const sql = await getDb();
  if (!sql) return [];
  const limite = Math.min(f.limite ?? 200, 1000);
  const recherche = f.recherche?.trim() ? `%${f.recherche.trim()}%` : null;
  const statut = f.statut && estStatutValide(f.statut) ? f.statut : null;

  try {
    return await sql<Contact[]>`
      SELECT * FROM contacts
      WHERE (${recherche}::text IS NULL
             OR email ILIKE ${recherche}
             OR COALESCE(prenom, '') ILIKE ${recherche}
             OR COALESCE(nom, '') ILIKE ${recherche})
        AND (${statut}::text IS NULL OR statut = ${statut})
      ORDER BY cree_le DESC
      LIMIT ${limite}
    `;
  } catch (e) {
    console.error("[crm] listerContacts:", e);
    return [];
  }
}

export async function obtenirContact(
  id: string,
): Promise<{ contact: Contact; timeline: Evenement[] } | null> {
  const sql = await getDb();
  if (!sql) return null;
  try {
    const [contact] = await sql<Contact[]>`SELECT * FROM contacts WHERE id = ${id}`;
    if (!contact) return null;
    const timeline = await sql<Evenement[]>`
      SELECT id, type, libelle, cree_le FROM evenements
      WHERE contact_id = ${id}
      ORDER BY cree_le DESC
      LIMIT 100
    `;
    return { contact, timeline };
  } catch (e) {
    console.error("[crm] obtenirContact:", e);
    return null;
  }
}

export async function changerStatut(id: string, statut: StatutCle): Promise<boolean> {
  const sql = await getDb();
  if (!sql) return false;
  try {
    await sql`UPDATE contacts SET statut = ${statut}, maj_le = NOW() WHERE id = ${id}`;
    await sql`
      INSERT INTO evenements (contact_id, type, libelle)
      VALUES (${id}, 'statut', ${"Statut passé à « " + STATUT_LABEL[statut] + " »"})
    `;
    return true;
  } catch (e) {
    console.error("[crm] changerStatut:", e);
    return false;
  }
}

export async function enregistrerNote(id: string, notes: string): Promise<boolean> {
  const sql = await getDb();
  if (!sql) return false;
  try {
    await sql`UPDATE contacts SET notes = ${notes}, maj_le = NOW() WHERE id = ${id}`;
    return true;
  } catch (e) {
    console.error("[crm] enregistrerNote:", e);
    return false;
  }
}

/** Désinscription : coupe toutes les séquences en cours et marque le contact. */
export async function desinscrire(email: string): Promise<boolean> {
  const sql = await getDb();
  if (!sql) return false;
  try {
    const rows = await sql<{ id: string }[]>`
      UPDATE contacts
      SET desabonne_le = NOW(), consentement = FALSE, maj_le = NOW()
      WHERE email = ${email.trim().toLowerCase()}
      RETURNING id
    `;
    const contact = rows[0];
    if (!contact) return false;
    await sql`
      UPDATE inscriptions SET statut = 'arretee'
      WHERE contact_id = ${contact.id} AND statut = 'active'
    `;
    await sql`
      INSERT INTO evenements (contact_id, type, libelle)
      VALUES (${contact.id}, 'desinscription', 'Désinscription des e-mails')
    `;
    return true;
  } catch (e) {
    console.error("[crm] desinscrire:", e);
    return false;
  }
}

export type Statistiques = {
  total: number;
  actifs: number;
  desabonnes: number;
  parStatut: Record<string, number>;
  parSource: { source: string; n: number }[];
  parJour: { jour: string; n: number }[];
  nouveaux7j: number;
  nouveaux30j: number;
  /** Les trente jours d'avant, pour situer les trente derniers. */
  nouveaux30jAvant: number;
  envoyes30j: number;
  echecs30j: number;
  ouverts30j: number;
  cliques30j: number;
  enAttente: number;
  questionnaires30j: number;
  eligibles30j: number;
  prerequisEnAttente: number;
  rdv7j: number;
};

/** Agrège tout ce qu'affiche la page d'accueil du tableau de bord. */
export async function statistiques(): Promise<Statistiques | null> {
  const sql = await getDb();
  if (!sql) return null;
  try {
    const [tot] = await sql<{ total: string; desabonnes: string }[]>`
      SELECT COUNT(*) AS total,
             COUNT(*) FILTER (WHERE desabonne_le IS NOT NULL) AS desabonnes
      FROM contacts
    `;
    const statuts = await sql<{ statut: string; n: string }[]>`
      SELECT statut, COUNT(*) AS n FROM contacts GROUP BY statut
    `;
    const sources = await sql<{ source: string; n: string }[]>`
      SELECT COALESCE(NULLIF(source, ''), 'Non précisée') AS source, COUNT(*) AS n
      FROM contacts GROUP BY 1 ORDER BY 2 DESC LIMIT 8
    `;
    const jours = await sql<{ jour: string; n: string }[]>`
      SELECT to_char(d.jour, 'YYYY-MM-DD') AS jour, COUNT(c.id) AS n
      FROM generate_series(CURRENT_DATE - INTERVAL '29 days', CURRENT_DATE, INTERVAL '1 day') AS d(jour)
      LEFT JOIN contacts c ON c.cree_le::date = d.jour::date
      GROUP BY d.jour ORDER BY d.jour
    `;
    const [recents] = await sql<{ j7: string; j30: string; avant: string }[]>`
      SELECT COUNT(*) FILTER (WHERE cree_le > NOW() - INTERVAL '7 days')  AS j7,
             COUNT(*) FILTER (WHERE cree_le > NOW() - INTERVAL '30 days') AS j30,
             COUNT(*) FILTER (WHERE cree_le > NOW() - INTERVAL '60 days'
                                AND cree_le <= NOW() - INTERVAL '30 days') AS avant
      FROM contacts
    `;
    const [mails] = await sql<
      { envoyes: string; echecs: string; ouverts: string; cliques: string }[]
    >`
      SELECT COUNT(*) FILTER (WHERE statut <> 'echec')       AS envoyes,
             COUNT(*) FILTER (WHERE statut = 'echec')        AS echecs,
             COUNT(*) FILTER (WHERE ouvert_le IS NOT NULL)   AS ouverts,
             COUNT(*) FILTER (WHERE clique_le IS NOT NULL)   AS cliques
      FROM envois WHERE envoye_le > NOW() - INTERVAL '30 days'
    `;

    const [copies] = await sql<
      { recus: string; eligibles: string; attente: string; rdv: string }[]
    >`
      SELECT COUNT(*) FILTER (WHERE cree_le > NOW() - INTERVAL '30 days') AS recus,
             COUNT(*) FILTER (WHERE cree_le > NOW() - INTERVAL '30 days' AND eligible) AS eligibles,
             COUNT(*) FILTER (WHERE eligible AND prerequis_le IS NULL AND annule_le IS NULL) AS attente,
             COUNT(*) FILTER (WHERE rdv_le > NOW() AND rdv_le < NOW() + INTERVAL '7 days'
                                AND annule_le IS NULL) AS rdv
      FROM questionnaires
    `;
    const [attente] = await sql<{ n: string }[]>`
      SELECT COUNT(*) AS n FROM inscriptions WHERE statut = 'active'
    `;

    const parStatut: Record<string, number> = {};
    for (const s of STATUTS) parStatut[s.cle] = 0;
    for (const r of statuts) parStatut[r.statut] = Number(r.n);

    const total = Number(tot?.total ?? 0);
    const desabonnes = Number(tot?.desabonnes ?? 0);

    return {
      total,
      actifs: total - desabonnes,
      desabonnes,
      parStatut,
      parSource: sources.map((s) => ({ source: s.source, n: Number(s.n) })),
      parJour: jours.map((j) => ({ jour: j.jour, n: Number(j.n) })),
      nouveaux7j: Number(recents?.j7 ?? 0),
      nouveaux30j: Number(recents?.j30 ?? 0),
      nouveaux30jAvant: Number(recents?.avant ?? 0),
      envoyes30j: Number(mails?.envoyes ?? 0),
      echecs30j: Number(mails?.echecs ?? 0),
      ouverts30j: Number(mails?.ouverts ?? 0),
      cliques30j: Number(mails?.cliques ?? 0),
      enAttente: Number(attente?.n ?? 0),
      questionnaires30j: Number(copies?.recus ?? 0),
      eligibles30j: Number(copies?.eligibles ?? 0),
      prerequisEnAttente: Number(copies?.attente ?? 0),
      rdv7j: Number(copies?.rdv ?? 0),
    };
  } catch (e) {
    console.error("[crm] statistiques:", e);
    return null;
  }
}

/** Export CSV de toute la base contacts. */
export async function exporterCsv(): Promise<string> {
  const contacts = await listerContacts({ limite: 1000 });
  const entetes = [
    "email", "prenom", "nom", "telephone", "statut", "source",
    "interet", "notes", "desabonne", "cree_le",
  ];
  const echapper = (v: unknown) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lignes = contacts.map((c) =>
    [
      c.email, c.prenom, c.nom, c.telephone, STATUT_LABEL[c.statut] ?? c.statut,
      c.source, c.interet, c.notes,
      c.desabonne_le ? "oui" : "non",
      c.cree_le instanceof Date ? c.cree_le.toISOString() : c.cree_le,
    ].map(echapper).join(";"),
  );
  return [entetes.join(";"), ...lignes].join("\n");
}
