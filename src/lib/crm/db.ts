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
