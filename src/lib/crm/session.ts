import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACCES_PRINCIPAL, COOKIE_SESSION, lireSession } from "./auth";
import { obtenirUtilisateur, peut, type Droit } from "./utilisateurs";

/**
 * Qui est connecté, et à quoi a-t-il droit.
 *
 * Le proxy ne vérifie que la signature du cookie — il tourne sur le runtime
 * Edge, sans accès à la base. C'est ici, côté serveur Node, qu'on regarde si le
 * compte existe encore et ce qu'il a le droit de faire. Un compte désactivé
 * perd donc l'accès à la page suivante, sans attendre l'expiration de sa
 * session.
 */

export type Identite = {
  id: string;
  nom: string;
  role: string;
  /** Vrai pour la clé de secours `ADMIN_PASSWORD`, qui n'a pas de compte. */
  principal: boolean;
};

const CLE_DE_SECOURS: Identite = {
  id: ACCES_PRINCIPAL,
  nom: "Accès principal",
  role: "proprietaire",
  principal: true,
};

export async function identite(): Promise<Identite | null> {
  const jar = await cookies();
  const session = await lireSession(jar.get(COOKIE_SESSION)?.value);
  if (!session) return null;

  if (session.utilisateurId === ACCES_PRINCIPAL) return CLE_DE_SECOURS;

  const u = await obtenirUtilisateur(session.utilisateurId);
  if (!u || !u.actif) return null;
  return { id: u.id, nom: u.nom, role: u.role, principal: false };
}

/** Version courte pour les pages : renvoie l'identité ou renvoie à la connexion. */
export async function exigerIdentite(): Promise<Identite> {
  const qui = await identite();
  if (!qui) redirect("/admin/login");
  return qui;
}

/**
 * À appeler en tête de toute page ou action réservée. Le secrétariat qui tente
 * une adresse réservée est renvoyé à l'accueil du tableau de bord, pas sur une
 * erreur : il n'a rien fait de mal, cette page n'est simplement pas la sienne.
 */
export async function exigerDroit(droit: Droit): Promise<Identite> {
  const qui = await exigerIdentite();
  if (!peut(qui.role, droit)) redirect("/admin?refuse=1");
  return qui;
}

/** Variante pour les Server Actions : ne redirige pas, renvoie simplement null. */
export async function identiteAvecDroit(droit: Droit): Promise<Identite | null> {
  const qui = await identite();
  if (!qui || !peut(qui.role, droit)) return null;
  return qui;
}
