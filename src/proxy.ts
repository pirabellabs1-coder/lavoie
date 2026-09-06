import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_SESSION, sessionValide } from "@/lib/crm/auth";

/**
 * Protège le tableau de bord. Toute page /admin exige une session valide ;
 * deux adresses seulement restent publiques :
 *
 *   · /admin/login, forcément ;
 *   · /admin/invitation/<jeton>, où une personne invitée choisit son mot de
 *     passe — elle n'a par définition pas encore de compte, et c'est le jeton
 *     de l'adresse, vérifié en base, qui tient lieu d'autorisation.
 *
 * (En Next 16, la convention `middleware` est dépréciée au profit de `proxy`.)
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") return NextResponse.next();
  if (pathname.startsWith("/admin/invitation/")) return NextResponse.next();

  const cookie = request.cookies.get(COOKIE_SESSION)?.value;
  if (await sessionValide(cookie)) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = "/admin/login";
  url.search = pathname === "/admin" ? "" : `?suite=${encodeURIComponent(pathname)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
