import { datesOuvertes, etatDeLaDate, placesRestantesDate } from "@/lib/crm/dates-stages";

/**
 * Les dates encore proposées pour un stage.
 *
 * Publique et en lecture seule : elle ne dit rien de personne, seulement quand
 * le stage a lieu et s'il reste de la place. Elle est appelée depuis le
 * navigateur pour que les pages d'événements restent servies en statique — la
 * disponibilité bouge, le texte du stage non.
 */
export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get("slug") ?? "";
  if (!/^[a-z0-9-]{1,120}$/.test(slug)) {
    return Response.json({ dates: [] });
  }

  const dates = await datesOuvertes(slug);
  return Response.json(
    {
      dates: dates.map((d) => ({
        id: String(d.id),
        debut: new Date(d.debut_le).toISOString(),
        fin: d.fin_le ? new Date(d.fin_le).toISOString() : null,
        etat: etatDeLaDate(d),
        restantes: placesRestantesDate(d),
      })),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
