import { cookies } from "next/headers";
import { COOKIE_SESSION } from "@/lib/crm/auth";

export async function POST() {
  const jar = await cookies();
  jar.delete(COOKIE_SESSION);
  return Response.json({ ok: true });
}
