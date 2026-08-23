/**
 * Authentification du tableau de bord.
 *
 * Un seul utilisateur (Domoïna) : un mot de passe défini dans `ADMIN_PASSWORD`,
 * puis un cookie de session signé en HMAC-SHA256. Aucune dépendance externe,
 * et le code n'utilise que l'API Web Crypto pour rester compatible avec le
 * runtime Edge du middleware comme avec le runtime Node des routes.
 */

export const COOKIE_SESSION = "v2c_admin";
const DUREE_MS = 1000 * 60 * 60 * 12; // 12 heures

function secret(): string {
  // À défaut de secret dédié, on dérive du mot de passe : changer le mot de
  // passe invalide alors automatiquement toutes les sessions en cours.
  return process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || "";
}

export function authConfiguree(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

function versHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function signer(donnee: string): Promise<string> {
  const cle = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return versHex(await crypto.subtle.sign("HMAC", cle, new TextEncoder().encode(donnee)));
}

/** Comparaison à temps constant, pour ne pas fuiter le secret octet par octet. */
function egalConstant(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Vérifie le mot de passe saisi. */
export async function motDePasseValide(saisi: string): Promise<boolean> {
  const attendu = process.env.ADMIN_PASSWORD;
  if (!attendu) return false;
  // On compare les empreintes : longueurs égales, donc pas de fuite par timing.
  const [a, b] = await Promise.all([signer("pw:" + saisi), signer("pw:" + attendu)]);
  return egalConstant(a, b);
}

/** L'identité portée par le cookie. `"0"` désigne la clé de secours. */
export type Session = { utilisateurId: string; expiration: number };

export const ACCES_PRINCIPAL = "0";

export async function creerSession(
  utilisateurId: string = ACCES_PRINCIPAL,
): Promise<{ valeur: string; maxAge: number }> {
  const expiration = Date.now() + DUREE_MS;
  const charge = `${utilisateurId}.${expiration}`;
  const signature = await signer(charge);
  return { valeur: `${charge}.${signature}`, maxAge: Math.floor(DUREE_MS / 1000) };
}

/**
 * Relit le cookie. Deux formes sont acceptées : la nouvelle, qui porte
 * l'identifiant du compte, et l'ancienne (`expiration.signature`), le temps que
 * les sessions ouvertes avant la mise à jour arrivent à expiration.
 */
export async function lireSession(cookie: string | undefined): Promise<Session | null> {
  if (!cookie || !secret()) return null;
  // La signature est hexadécimale : découper sur les points est sans risque.
  const bouts = cookie.split(".");

  if (bouts.length === 3) {
    const [utilisateurId, expiration, signature] = bouts;
    if (!/^\d+$/.test(utilisateurId) || !/^\d+$/.test(expiration)) return null;
    if (Number(expiration) < Date.now()) return null;
    if (!egalConstant(await signer(`${utilisateurId}.${expiration}`), signature)) return null;
    return { utilisateurId, expiration: Number(expiration) };
  }

  if (bouts.length === 2) {
    const [expiration, signature] = bouts;
    if (!/^\d+$/.test(expiration)) return null;
    if (Number(expiration) < Date.now()) return null;
    if (!egalConstant(await signer(expiration), signature)) return null;
    return { utilisateurId: ACCES_PRINCIPAL, expiration: Number(expiration) };
  }

  return null;
}

export async function sessionValide(cookie: string | undefined): Promise<boolean> {
  return (await lireSession(cookie)) !== null;
}
