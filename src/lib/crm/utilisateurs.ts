import { getDb } from "./db";

/**
 * Les comptes du tableau de bord.
 *
 * Jusqu'ici un seul mot de passe circulait entre Domoïna et le secrétariat :
 * impossible de savoir qui avait fait quoi, et retirer l'accès à quelqu'un
 * obligeait à changer le mot de passe de tout le monde. Chacun a désormais le
 * sien, avec des droits qui lui correspondent.
 *
 * Les mots de passe ne sont jamais stockés : seule une empreinte PBKDF2 avec
 * sel aléatoire l'est, et elle ne permet pas de remonter au mot de passe.
 *
 * `ADMIN_PASSWORD` reste valable comme **clé de secours** — sans elle, une
 * base momentanément injoignable enfermerait tout le monde dehors.
 *
 * Ce module n'est jamais importé par le proxy : il utilise `Buffer`, absent du
 * runtime Edge.
 */

export type Role = "proprietaire" | "secretariat";

export const ROLES: { cle: Role; label: string; aide: string }[] = [
  {
    cle: "proprietaire",
    label: "Propriétaire",
    aide:
      "Tout, y compris les propositions et leurs montants, les campagnes, l'export du fichier et la gestion des comptes.",
  },
  {
    cle: "secretariat",
    label: "Secrétariat",
    aide: "Contacts, questionnaires, rendez-vous et journal des envois. Rien d'autre.",
  },
];

/** Ce que chaque rôle a le droit de faire, en plus du socle commun. */
const DROITS: Record<Role, string[]> = {
  proprietaire: ["campagnes", "sequences", "export", "comptes", "sauvegarde", "offres"],
  secretariat: [],
};

export type Droit =
  | "campagnes"
  | "sequences"
  | "export"
  | "comptes"
  | "sauvegarde"
  | "offres";

export function peut(role: string, droit: Droit): boolean {
  return (DROITS[role as Role] ?? []).includes(droit);
}

export function estRoleValide(v: string): v is Role {
  return ROLES.some((r) => r.cle === v);
}

export type Utilisateur = {
  id: string;
  email: string;
  nom: string;
  role: string;
  actif: boolean;
  cree_le: Date;
  derniere_connexion_le: Date | null;
  /** Date d'envoi de l'invitation, tant qu'elle n'a pas été utilisée. */
  invite_le?: Date | null;
  /** Échéance de l'invitation en cours. Nulle une fois le compte activé. */
  invitation_expire_le?: Date | null;
};

// ─── Empreintes ─────────────────────────────────────────────────────────────

const ITERATIONS = 210_000;

async function deriver(
  motDePasse: string,
  sel: Uint8Array<ArrayBuffer>,
  iterations: number,
): Promise<string> {
  const cle = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(motDePasse),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: sel, iterations, hash: "SHA-256" },
    cle,
    256,
  );
  return Buffer.from(bits).toString("base64");
}

export async function empreinteDe(motDePasse: string): Promise<string> {
  const sel = crypto.getRandomValues(new Uint8Array(new ArrayBuffer(16)));
  const hash = await deriver(motDePasse, sel, ITERATIONS);
  return `pbkdf2$${ITERATIONS}$${Buffer.from(sel).toString("base64")}$${hash}`;
}

function egalConstant(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function correspond(motDePasse: string, stocke: string): Promise<boolean> {
  const [algo, iterations, sel64, hash] = stocke.split("$");
  if (algo !== "pbkdf2" || !iterations || !sel64 || !hash) return false;
  const brut = Buffer.from(sel64, "base64");
  const sel = new Uint8Array(new ArrayBuffer(brut.length));
  sel.set(brut);
  const calcule = await deriver(motDePasse, sel, Number(iterations));
  return egalConstant(calcule, hash);
}

// ─── Comptes ────────────────────────────────────────────────────────────────

export async function listerUtilisateurs(): Promise<Utilisateur[]> {
  const sql = await getDb();
  if (!sql) return [];
  try {
    return await sql<Utilisateur[]>`
      SELECT id, email, nom, role, actif, cree_le, derniere_connexion_le,
             invite_le, invitation_expire_le
      FROM utilisateurs
      ORDER BY actif DESC, nom ASC
    `;
  } catch (e) {
    console.error("[crm] listerUtilisateurs:", e);
    return [];
  }
}

export async function obtenirUtilisateur(id: string): Promise<Utilisateur | null> {
  const sql = await getDb();
  if (!sql) return null;
  if (!/^\d+$/.test(id)) return null;
  try {
    const [u] = await sql<Utilisateur[]>`
      SELECT id, email, nom, role, actif, cree_le, derniere_connexion_le
      FROM utilisateurs WHERE id = ${id}
    `;
    return u ?? null;
  } catch (e) {
    console.error("[crm] obtenirUtilisateur:", e);
    return null;
  }
}

/**
 * Invite un collaborateur.
 *
 * Personne, ici, ne choisit le mot de passe de quelqu'un d'autre. On crée le
 * compte sans mot de passe utilisable, et l'on renvoie un jeton à usage unique
 * que seul l'e-mail d'invitation transportera : la personne invitée choisira
 * elle-même son mot de passe, et sera la seule à le connaître.
 *
 * Ce qui est gardé en base n'est pas le jeton mais son empreinte — même
 * quelqu'un qui lirait la table ne pourrait pas s'en servir.
 */
export async function inviterUtilisateur(entree: {
  email: string;
  nom: string;
  role: Role;
}): Promise<{ ok: true; id: string; jeton: string } | { ok: false; erreur: string }> {
  const sql = await getDb();
  if (!sql) return { ok: false, erreur: "Base de données indisponible." };

  const email = entree.email.trim().toLowerCase();
  const nom = entree.nom.trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { ok: false, erreur: "Adresse e-mail invalide." };
  }
  if (!nom) return { ok: false, erreur: "Le nom est obligatoire." };

  try {
    // Une empreinte tirée au hasard : aucun mot de passe ne peut y correspondre
    // tant que la personne n'a pas activé son compte.
    const inutilisable = await empreinteDe(
      Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString("base64url"),
    );
    const [ligne] = await sql<{ id: string }[]>`
      INSERT INTO utilisateurs (email, nom, empreinte, role)
      VALUES (${email}, ${nom}, ${inutilisable}, ${entree.role})
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `;
    if (!ligne) return { ok: false, erreur: "Un compte existe déjà avec cette adresse." };

    const jeton = await poserInvitation(String(ligne.id));
    if (!jeton) return { ok: false, erreur: "L'invitation n'a pas pu être préparée." };
    return { ok: true, id: String(ligne.id), jeton };
  } catch (e) {
    console.error("[crm] inviterUtilisateur:", e);
    return { ok: false, erreur: "La création a échoué." };
  }
}

/** Combien de jours vaut une invitation. Au-delà, il faut la renvoyer. */
export const INVITATION_JOURS = 7;

/**
 * Prépare (ou remplace) l'invitation d'un compte et renvoie le jeton en clair —
 * la seule et unique fois où il existe ailleurs que dans l'e-mail.
 */
export async function poserInvitation(id: string): Promise<string | null> {
  const sql = await getDb();
  if (!sql) return null;
  try {
    const secret = Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString("base64url");
    await sql`
      UPDATE utilisateurs
      SET invitation_empreinte = ${await empreinteDe(secret)},
          invitation_expire_le = NOW() + make_interval(days => ${INVITATION_JOURS}),
          invite_le = NOW()
      WHERE id = ${id}
    `;
    // Le jeton porte l'identifiant : c'est ce qui permet de retrouver la ligne
    // avant de vérifier le secret contre son empreinte.
    return `${id}.${secret}`;
  } catch (e) {
    console.error("[crm] poserInvitation:", e);
    return null;
  }
}

export type Invitation = { id: string; nom: string; email: string };

/** La personne derrière un jeton d'invitation, si celui-ci tient encore. */
export async function lireInvitation(jeton: string): Promise<Invitation | null> {
  const sql = await getDb();
  if (!sql) return null;
  const [id, secret] = jeton.split(".");
  if (!id || !secret || !/^\d+$/.test(id)) return null;
  try {
    const [u] = await sql<
      { id: string; nom: string; email: string; invitation_empreinte: string | null }[]
    >`
      SELECT id, nom, email, invitation_empreinte
      FROM utilisateurs
      WHERE id = ${id} AND invitation_empreinte IS NOT NULL
        AND invitation_expire_le > NOW()
    `;
    if (!u || !u.invitation_empreinte) return null;
    if (!(await correspond(secret, u.invitation_empreinte))) return null;
    return { id: String(u.id), nom: u.nom, email: u.email };
  } catch (e) {
    console.error("[crm] lireInvitation:", e);
    return null;
  }
}

/**
 * Active le compte avec le mot de passe choisi par la personne, et consomme
 * l'invitation : le lien ne resservira pas.
 */
export async function activerInvitation(
  jeton: string,
  motDePasse: string,
): Promise<{ ok: true; nom: string } | { ok: false; erreur: string }> {
  if (motDePasse.length < 12) {
    return { ok: false, erreur: "Le mot de passe doit faire au moins douze caractères." };
  }
  const invite = await lireInvitation(jeton);
  if (!invite) {
    return { ok: false, erreur: "Cette invitation n'est plus valable. Demandez-en une nouvelle." };
  }
  const sql = await getDb();
  if (!sql) return { ok: false, erreur: "Base de données indisponible." };
  try {
    await sql`
      UPDATE utilisateurs
      SET empreinte = ${await empreinteDe(motDePasse)},
          actif = TRUE,
          invitation_empreinte = NULL,
          invitation_expire_le = NULL
      WHERE id = ${invite.id}
    `;
    return { ok: true, nom: invite.nom };
  } catch (e) {
    console.error("[crm] activerInvitation:", e);
    return { ok: false, erreur: "L'activation a échoué." };
  }
}

/**
 * Active ou désactive un compte. On ne supprime pas : un compte retiré garde
 * sa trace, et le réactiver ne demande pas de tout ressaisir.
 */
export async function basculerUtilisateur(id: string, actif: boolean): Promise<boolean> {
  const sql = await getDb();
  if (!sql) return false;
  try {
    await sql`UPDATE utilisateurs SET actif = ${actif} WHERE id = ${id}`;
    return true;
  } catch (e) {
    console.error("[crm] basculerUtilisateur:", e);
    return false;
  }
}

/**
 * Vérifie un couple e-mail / mot de passe. Renvoie le compte si tout concorde,
 * `null` sinon — sans jamais dire lequel des deux était faux.
 */
export async function authentifier(
  email: string,
  motDePasse: string,
): Promise<Utilisateur | null> {
  const sql = await getDb();
  if (!sql) return null;
  try {
    const [ligne] = await sql<(Utilisateur & { empreinte: string })[]>`
      SELECT id, email, nom, empreinte, role, actif, cree_le, derniere_connexion_le
      FROM utilisateurs
      WHERE email = ${email.trim().toLowerCase()} AND actif = TRUE
    `;
    if (!ligne) return null;
    if (!(await correspond(motDePasse, ligne.empreinte))) return null;

    await sql`UPDATE utilisateurs SET derniere_connexion_le = NOW() WHERE id = ${ligne.id}`;
    return {
      id: String(ligne.id),
      email: ligne.email,
      nom: ligne.nom,
      role: ligne.role,
      actif: ligne.actif,
      cree_le: ligne.cree_le,
      derniere_connexion_le: ligne.derniere_connexion_le,
    };
  } catch (e) {
    console.error("[crm] authentifier:", e);
    return null;
  }
}
