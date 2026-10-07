import { cookies } from "next/headers";
import { COOKIE_SESSION, authConfiguree, creerSession, motDePasseValide } from "@/lib/crm/auth";
import { authentifier } from "@/lib/crm/utilisateurs";
import { tracer } from "@/lib/crm/journal";

/** Petit garde-fou anti force brute, par instance. */
const tentatives = new Map<string, { n: number; jusqua: number }>();
const MAX_TENTATIVES = 8;
const BLOCAGE_MS = 10 * 60 * 1000;

function cle(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "inconnu"
  );
}

export async function POST(req: Request) {
  if (!authConfiguree()) {
    return Response.json(
      { error: "Tableau de bord non configuré (ADMIN_PASSWORD manquant)." },
      { status: 503 },
    );
  }

  const ip = cle(req);
  const etat = tentatives.get(ip);
  if (etat && etat.n >= MAX_TENTATIVES && Date.now() < etat.jusqua) {
    return Response.json(
      { error: "Trop de tentatives. Réessayez dans quelques minutes." },
      { status: 429 },
    );
  }

  let data: Record<string, unknown>;
  try {
    data = await req.json();
  } catch {
    return Response.json({ error: "Requête invalide." }, { status: 400 });
  }

  const motDePasse = String(data.motDePasse ?? "");
  const email = String(data.email ?? "").trim();

  // Deux portes, et une seule à la fois.
  //
  // Une adresse renseignée veut dire « j'entre avec mon compte » : seul ce
  // compte peut alors ouvrir la session. La clé de secours ne prend pas le
  // relais — elle ouvrirait une session de propriétaire à qui demandait la
  // sienne. Ce mot de passe a circulé avant l'arrivée des comptes nominatifs,
  // et quelqu'un du secrétariat qui le saisit par habitude, avec sa propre
  // adresse, héritait en silence de tous les droits.
  //
  // Sans adresse, la clé de secours reste le seul moyen d'entrer quand la
  // base est momentanément injoignable. C'est sa raison d'être.
  let utilisateurId: string | null = null;
  let nomActeur = "Accès principal";
  let entre = false;

  if (email) {
    const compte = await authentifier(email, motDePasse);
    if (compte) {
      utilisateurId = compte.id;
      nomActeur = compte.nom;
      entre = true;
    }
  } else {
    entre = await motDePasseValide(motDePasse);
  }

  if (!entre) {
    const n = (etat && Date.now() < etat.jusqua ? etat.n : 0) + 1;
    tentatives.set(ip, { n, jusqua: Date.now() + BLOCAGE_MS });
    return Response.json(
      { error: email ? "Identifiants incorrects." : "Mot de passe incorrect." },
      { status: 401 },
    );
  }

  tentatives.delete(ip);
  const session = await creerSession(utilisateurId ?? undefined);
  const jar = await cookies();
  jar.set(COOKIE_SESSION, session.valeur, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: session.maxAge,
  });

  await tracer(
    { id: utilisateurId ?? "0", nom: nomActeur, role: "", principal: !utilisateurId },
    "connexion",
    null,
    utilisateurId ? null : "via le mot de passe principal",
  );

  return Response.json({ ok: true });
}
