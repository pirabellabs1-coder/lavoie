import postgres from "postgres";

/**
 * Couche base de données du tableau de bord.
 *
 * La connexion est optionnelle : tant que `DATABASE_URL` n'est pas défini,
 * `getDb()` renvoie `null` et le site continue de fonctionner exactement
 * comme avant (notifications par e-mail uniquement). Aucun formulaire public
 * ne doit jamais échouer parce que la base est absente ou indisponible.
 */

let client: postgres.Sql | null = null;
let schemaReady: Promise<void> | null = null;

export function isDbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

function connect(): postgres.Sql | null {
  if (!process.env.DATABASE_URL) return null;
  if (!client) {
    client = postgres(process.env.DATABASE_URL, {
      // Les bases serverless (Neon, Supabase) passent par un pooler type
      // pgbouncer, incompatible avec les requêtes préparées côté serveur.
      prepare: false,
      max: 3,
      idle_timeout: 20,
      connect_timeout: 10,
      onnotice: () => {},
    });
  }
  return client;
}

/** Crée le schéma si nécessaire. Idempotent, exécuté une fois par instance. */
async function ensureSchema(sql: postgres.Sql): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS contacts (
      id           BIGSERIAL PRIMARY KEY,
      email        TEXT NOT NULL UNIQUE,
      prenom       TEXT,
      nom          TEXT,
      telephone    TEXT,
      statut       TEXT NOT NULL DEFAULT 'nouveau',
      source       TEXT,
      interet      TEXT,
      message      TEXT,
      notes        TEXT,
      consentement BOOLEAN NOT NULL DEFAULT TRUE,
      desabonne_le TIMESTAMPTZ,
      cree_le      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      maj_le       TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS evenements (
      id         BIGSERIAL PRIMARY KEY,
      contact_id BIGINT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
      type       TEXT NOT NULL,
      libelle    TEXT NOT NULL,
      cree_le    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS sequences (
      id          BIGSERIAL PRIMARY KEY,
      cle         TEXT NOT NULL UNIQUE,
      nom         TEXT NOT NULL,
      description TEXT,
      declencheur TEXT NOT NULL,
      active      BOOLEAN NOT NULL DEFAULT TRUE,
      cree_le     TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS sequence_etapes (
      id          BIGSERIAL PRIMARY KEY,
      sequence_id BIGINT NOT NULL REFERENCES sequences(id) ON DELETE CASCADE,
      ordre       INT NOT NULL,
      delai_jours INT NOT NULL DEFAULT 0,
      sujet       TEXT NOT NULL,
      corps       TEXT NOT NULL,
      UNIQUE (sequence_id, ordre)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS inscriptions (
      id             BIGSERIAL PRIMARY KEY,
      contact_id     BIGINT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
      sequence_id    BIGINT NOT NULL REFERENCES sequences(id) ON DELETE CASCADE,
      etape_suivante INT NOT NULL DEFAULT 1,
      echeance       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      statut         TEXT NOT NULL DEFAULT 'active',
      cree_le        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (contact_id, sequence_id)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS envois (
      id          BIGSERIAL PRIMARY KEY,
      contact_id  BIGINT REFERENCES contacts(id) ON DELETE SET NULL,
      sequence_id BIGINT REFERENCES sequences(id) ON DELETE SET NULL,
      etape       INT,
      destinataire TEXT NOT NULL,
      sujet       TEXT NOT NULL,
      statut      TEXT NOT NULL,
      erreur      TEXT,
      envoye_le   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS temoignages (
      id          BIGSERIAL PRIMARY KEY,
      -- Rattaché à un contact quand il vient d'un lien personnel ; anonyme sinon.
      contact_id  BIGINT REFERENCES contacts(id) ON DELETE SET NULL,
      nom         TEXT NOT NULL,
      texte       TEXT NOT NULL,
      note        INT,
      contexte    TEXT,
      -- attente · publie · masque
      statut      TEXT NOT NULL DEFAULT 'attente',
      consentement BOOLEAN NOT NULL DEFAULT FALSE,
      cree_le     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      publie_le   TIMESTAMPTZ
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS stages (
      id         BIGSERIAL PRIMARY KEY,
      -- Reprend le slug du catalogue (src/lib/evenements.ts).
      slug       TEXT NOT NULL UNIQUE,
      titre      TEXT NOT NULL,
      debut_le   TIMESTAMPTZ,
      places     INT NOT NULL DEFAULT 12,
      actif      BOOLEAN NOT NULL DEFAULT TRUE,
      -- Ce qui part à J-7 aux personnes confirmées.
      logistique TEXT,
      cree_le    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS participations (
      id            BIGSERIAL PRIMARY KEY,
      stage_id      BIGINT NOT NULL REFERENCES stages(id) ON DELETE CASCADE,
      contact_id    BIGINT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
      -- demande · confirmee · attente · annulee · venue
      statut        TEXT NOT NULL DEFAULT 'demande',
      message       TEXT,
      logistique_le TIMESTAMPTZ,
      retour_le     TIMESTAMPTZ,
      cree_le       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (stage_id, contact_id)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS offres (
      id                  BIGSERIAL PRIMARY KEY,
      contact_id          BIGINT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
      -- Lien personnel de consultation, tiré au sort.
      jeton               TEXT NOT NULL UNIQUE,
      intitule            TEXT NOT NULL,
      -- En centimes : jamais de flottant sur de l'argent.
      montant_cents       BIGINT NOT NULL DEFAULT 0,
      echeancier          TEXT,
      probabilite         INT NOT NULL DEFAULT 50,
      message             TEXT,
      -- brouillon · envoyee · vue · acceptee · refusee · expiree
      statut              TEXT NOT NULL DEFAULT 'brouillon',
      valide_jusqu_au     DATE,
      envoyee_le          TIMESTAMPTZ,
      vue_le              TIMESTAMPTZ,
      vues                INT NOT NULL DEFAULT 0,
      repondue_le         TIMESTAMPTZ,
      relances            INT NOT NULL DEFAULT 0,
      derniere_relance_le TIMESTAMPTZ,
      cree_le             TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS utilisateurs (
      id                    BIGSERIAL PRIMARY KEY,
      email                 TEXT NOT NULL UNIQUE,
      nom                   TEXT NOT NULL,
      -- pbkdf2$iterations$sel$empreinte — jamais le mot de passe lui-même.
      empreinte             TEXT NOT NULL,
      role                  TEXT NOT NULL DEFAULT 'secretariat',
      actif                 BOOLEAN NOT NULL DEFAULT TRUE,
      cree_le               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      derniere_connexion_le TIMESTAMPTZ
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS journal (
      id         BIGSERIAL PRIMARY KEY,
      -- Qui : identifiant du compte, ou 0 pour la clé de secours.
      acteur_id  TEXT NOT NULL,
      acteur_nom TEXT NOT NULL,
      action     TEXT NOT NULL,
      cible      TEXT,
      details    TEXT,
      ip         TEXT,
      cree_le    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_journal_date ON journal (cree_le DESC)`;

  await sql`
    CREATE TABLE IF NOT EXISTS sauvegardes (
      id         BIGSERIAL PRIMARY KEY,
      -- Empreinte du contenu : deux jours identiques ne repartent pas deux fois.
      empreinte  TEXT NOT NULL,
      contacts_n INT NOT NULL DEFAULT 0,
      taille     INT NOT NULL DEFAULT 0,
      envoyee    BOOLEAN NOT NULL DEFAULT FALSE,
      cree_le    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS campagnes (
      id            BIGSERIAL PRIMARY KEY,
      sujet         TEXT NOT NULL,
      corps         TEXT NOT NULL,
      -- Critères de ciblage, sérialisés (voir src/lib/crm/campagnes.ts).
      segment       JSONB NOT NULL DEFAULT '{}'::jsonb,
      -- brouillon · programmee · en_cours · envoyee
      statut        TEXT NOT NULL DEFAULT 'brouillon',
      programmee_le TIMESTAMPTZ,
      envoyee_le    TIMESTAMPTZ,
      cree_le       TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS questionnaires (
      id           BIGSERIAL PRIMARY KEY,
      contact_id   BIGINT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
      jeton        TEXT NOT NULL UNIQUE,
      reponses     JSONB NOT NULL,
      score        INT NOT NULL DEFAULT 0,
      eligible     BOOLEAN NOT NULL DEFAULT FALSE,
      -- Prérequis à valider avant l'entretien, et rendez-vous associé.
      rdv_le       TIMESTAMPTZ,
      prerequis_le TIMESTAMPTZ,
      annule_le    TIMESTAMPTZ,
      cree_le      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  // ─── Évolutions du schéma ──────────────────────────────────────────────
  // Ajoutées après coup, donc en ALTER : les bases déjà en service se mettent
  // à niveau au premier démarrage, sans migration à lancer à la main.

  // D'où vient réellement le contact (campagne, site référent, page d'arrivée),
  // qui l'a parrainé, son propre code de parrainage, et la date du dernier
  // e-mail de réveil (pour ne pas le relancer sans fin).
  await sql`
    ALTER TABLE contacts
      ADD COLUMN IF NOT EXISTS utm_source        TEXT,
      ADD COLUMN IF NOT EXISTS utm_medium        TEXT,
      ADD COLUMN IF NOT EXISTS utm_campaign      TEXT,
      ADD COLUMN IF NOT EXISTS referent          TEXT,
      ADD COLUMN IF NOT EXISTS page_entree       TEXT,
      ADD COLUMN IF NOT EXISTS jeton_parrainage  TEXT,
      ADD COLUMN IF NOT EXISTS parrain_id        BIGINT REFERENCES contacts(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS reveille_le        TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS confirme_le        TIMESTAMPTZ
  `;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_contacts_parrainage ON contacts (jeton_parrainage) WHERE jeton_parrainage IS NOT NULL`;
  await sql`CREATE INDEX IF NOT EXISTS idx_contacts_parrain ON contacts (parrain_id) WHERE parrain_id IS NOT NULL`;

  // Ce que devient l'e-mail une fois parti : identifiant Resend, ouverture, clic.
  await sql`
    ALTER TABLE envois
      ADD COLUMN IF NOT EXISTS message_id  TEXT,
      ADD COLUMN IF NOT EXISTS ouvert_le   TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS clique_le   TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS campagne_id BIGINT REFERENCES campagnes(id) ON DELETE SET NULL
  `;

  // Le témoin du worker : une ligne par passage, pour voir tout de suite le
  // jour où il cesse de passer (voir `passages.ts`).
  await sql`
    CREATE TABLE IF NOT EXISTS passages (
      id       BIGSERIAL PRIMARY KEY,
      duree_ms INT NOT NULL DEFAULT 0,
      ok       BOOLEAN NOT NULL DEFAULT TRUE,
      resume   TEXT,
      cree_le  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  // Le suivi d'une place : la relance d'une demande qui traîne, et l'entrée
  // dans la séquence d'après-stage. Deux dates, pour n'agir qu'une fois.
  await sql`
    ALTER TABLE participations
      ADD COLUMN IF NOT EXISTS relance_le TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS suite_le   TIMESTAMPTZ
  `;

  // Un même contact ne reçoit jamais deux fois la même campagne, même si le
  // worker repasse au milieu d'un envoi interrompu.
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_envois_campagne_contact
    ON envois (campagne_id, contact_id)
    WHERE campagne_id IS NOT NULL
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_envois_message ON envois (message_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_questionnaires_contact ON questionnaires (contact_id, cree_le DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_offres_contact ON offres (contact_id, cree_le DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_offres_suivi ON offres (statut, envoyee_le)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_participations_stage ON participations (stage_id, statut)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_temoignages_statut ON temoignages (statut, publie_le DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_evenements_contact ON evenements (contact_id, cree_le DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_contacts_cree ON contacts (cree_le DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_contacts_statut ON contacts (statut)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_inscriptions_du ON inscriptions (statut, echeance)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_envois_date ON envois (envoye_le DESC)`;
}

/**
 * Renvoie le client SQL prêt à l'emploi, ou `null` si la base n'est pas
 * configurée ou injoignable. N'émet jamais d'exception.
 */
export async function getDb(): Promise<postgres.Sql | null> {
  const sql = connect();
  if (!sql) return null;
  try {
    if (!schemaReady) schemaReady = ensureSchema(sql);
    await schemaReady;
    return sql;
  } catch (e) {
    // Une base injoignable ne doit jamais casser un formulaire public.
    schemaReady = null;
    console.error("[crm] base indisponible:", e);
    return null;
  }
}
