import { cookies } from "next/headers";
import { COOKIE_SESSION, authConfiguree, creerSession, motDePasseValide } from "@/lib/crm/auth";

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
  if (!(await motDePasseValide(motDePasse))) {
    const n = (etat && Date.now() < etat.jusqua ? etat.n : 0) + 1;
    tentatives.set(ip, { n, jusqua: Date.now() + BLOCAGE_MS });
    return Response.json({ error: "Mot de passe incorrect." }, { status: 401 });
  }

  tentatives.delete(ip);
  const session = await creerSession();
  const jar = await cookies();
  jar.set(COOKIE_SESSION, session.valeur, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: session.maxAge,
  });

  return Response.json({ ok: true });
}
