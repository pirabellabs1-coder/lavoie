import { datesOuvertes, etatDeLaDate, placesRestantesDate } from "@/lib/crm/dates-stages";
import { placesRestantes, semerStages, stagePublic } from "@/lib/crm/stages";

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
    return Response.json({ stage: null, dates: [] });
  }

  // Premier passage après un déploiement : c'est souvent ici que le catalogue
  // s'installe, avant même qu'on ait ouvert le tableau de bord.
  await semerStages();

  const [stage, dates, restantes] = await Promise.all([
    stagePublic(slug),
    datesOuvertes(slug),
    placesRestantes(slug),
  ]);

  return Response.json(
    {
      stage: stage
        ? {
            titre: stage.titre,
            lieu: stage.lieu,
            // En centimes : la mise en forme se fait à l'affichage.
            prixCents: stage.prix_cents,
            ouvert: stage.actif,
            // Sans date précise, c'est la jauge du stage entier qui parle.
            restantes: restantes ?? null,
          }
        : null,
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
