import { datesOuvertes } from "@/lib/crm/dates-stages";
import { semerStages, stagePublic } from "@/lib/crm/stages";
import { SITE } from "@/lib/site";
import { evenementIcs } from "@/lib/ics";

/**
 * Un stage, dans l'agenda de la personne.
 *
 * Une date notée dans un e-mail se perd ; une date dans l'agenda se tient.
 * Le fichier ne contient que ce qui est déjà public — titre, lieu, horaires —
 * et n'identifie personne : on peut donc le servir sans jeton.
 *
 * `?d=<id>` choisit une date précise quand le stage en propose plusieurs ;
 * sinon c'est la prochaine ouverte.
 */

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  if (!/^[a-z0-9-]{1,120}$/.test(slug)) {
    return new Response("Introuvable", { status: 404 });
  }

  await semerStages();
  const stage = await stagePublic(slug);
  if (!stage || !stage.actif) return new Response("Introuvable", { status: 404 });

  const choisie = new URL(req.url).searchParams.get("d");
  const dates = await datesOuvertes(slug);
  const date = (choisie ? dates.find((d) => String(d.id) === choisie) : null) ?? dates[0];
  if (!date) return new Response("Aucune date ouverte", { status: 404 });

  const debut = new Date(date.debut_le);
  // Sans fin déclarée, on compte trois heures : mieux vaut un créneau honnête
  // qu'un événement sur toute la journée.
  const fin = date.fin_le ? new Date(date.fin_le) : new Date(debut.getTime() + 3 * 3_600_000);

  const corps = evenementIcs({
    uid: `stage-${slug}-${date.id}@lavoie2laconscience.com`,
    debut,
    fin,
    titre: stage.titre,
    description: stage.resume ?? `Le détail : ${SITE.url}/evenements/${slug}`,
    url: `${SITE.url}/evenements/${slug}`,
    lieu: stage.lieu,
  });

  return new Response(corps, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${slug}.ics"`,
      "Cache-Control": "public, max-age=600",
    },
  });
}
