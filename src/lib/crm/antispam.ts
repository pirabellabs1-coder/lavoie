/**
 * Protection des formulaires publics.
 *
 * Trois filets, du plus discret au plus visible :
 *   1. un champ piège invisible — seuls les robots le remplissent ;
 *   2. un délai minimal entre l'affichage du formulaire et son envoi ;
 *   3. un plafond de soumissions par adresse IP.
 *
 * Les deux premiers renvoient un faux succès : inutile d'apprendre au robot
 * ce qui l'a trahi. Le troisième répond franchement 429, parce qu'un humain
 * pressé peut le déclencher.
 *
 * Le compteur vit en mémoire, par instance : il ne prétend pas être un rempart
 * distribué, seulement couper les campagnes automatisées les plus grossières.
 */

const FENETRE_MS = 10 * 60 * 1000;
const MAX_PAR_IP = 6;
const DELAI_MINIMAL_MS = 1200;

const compteur = new Map<string, { n: number; depuis: number }>();

export type Verdict =
  | { ok: true }
  | { ok: false; silencieux: true }
  | { ok: false; silencieux: false; statut: number; erreur: string };

/** Adresse de l'appelant, telle que Vercel la transmet. */
export function adresseIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "inconnu"
  );
}

function purger(maintenant: number): void {
  for (const [cle, etat] of compteur) {
    if (maintenant - etat.depuis > FENETRE_MS) compteur.delete(cle);
  }
}

/**
 * Contrôle une soumission. À appeler avant tout enregistrement et tout envoi.
 * `data` est le corps JSON reçu : on y cherche `_piege` et `_delai`, posés par
 * le composant `useProtection` côté navigateur.
 */
export function controlerFormulaire(
  req: Request,
  data: Record<string, unknown>,
): Verdict {
  const piege = String(data._piege ?? "").trim();
  if (piege) return { ok: false, silencieux: true };

  const delai = Number(data._delai ?? 0);
  // Un délai absent (formulaire hors navigateur) passe : on ne pénalise que
  // les envois manifestement instantanés.
  if (delai > 0 && delai < DELAI_MINIMAL_MS) return { ok: false, silencieux: true };

  const maintenant = Date.now();
  purger(maintenant);

  const cle = adresseIp(req);
  const etat = compteur.get(cle);
  if (!etat || maintenant - etat.depuis > FENETRE_MS) {
    compteur.set(cle, { n: 1, depuis: maintenant });
    return { ok: true };
  }

  etat.n += 1;
  if (etat.n > MAX_PAR_IP) {
    return {
      ok: false,
      silencieux: false,
      statut: 429,
      erreur: "Trop d'envois depuis cette connexion. Réessayez dans quelques minutes.",
    };
  }

  return { ok: true };
}

/**
 * Réponse à renvoyer quand le verdict est négatif. Le faux succès est
 * volontaire : le robot croit avoir réussi et ne cherche pas d'autre voie.
 */
export function reponseRefus(verdict: Extract<Verdict, { ok: false }>): Response {
  if (verdict.silencieux) return Response.json({ ok: true });
  return Response.json({ error: verdict.erreur }, { status: verdict.statut });
}
