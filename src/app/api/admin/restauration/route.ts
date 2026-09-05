import { identiteAvecDroit } from "@/lib/crm/session";
import { restaurerSauvegarde } from "@/lib/crm/restauration";
import { tracer } from "@/lib/crm/journal";

/**
 * La restauration d'une sauvegarde, réservée au propriétaire.
 *
 * Elle passe par une route et non par une Server Action : un fichier de
 * sauvegarde pèse vite plusieurs mégaoctets, au-delà de ce qu'une action
 * accepte par défaut. Le formulaire est un formulaire HTML ordinaire, qui
 * revient sur la page des comptes avec le compte rendu dans l'adresse.
 */

/** Au-delà, l'hébergeur refuse le corps de la requête avant même de nous le passer. */
const TAILLE_MAX = 4 * 1024 * 1024;

export async function POST(req: Request) {
  const qui = await identiteAvecDroit("sauvegarde");
  if (!qui) return new Response("Non autorisé", { status: 401 });

  const base = new URL(req.url).origin;
  const versComptes = (params: Record<string, string>) =>
    Response.redirect(`${base}/admin/comptes?${new URLSearchParams(params)}#restaurer`, 303);

  let contenu: string;
  try {
    const donnees = await req.formData();
    if (String(donnees.get("confirmation") ?? "").trim() !== "REMPLACER") {
      return versComptes({
        erreur: "Pour restaurer, écrivez REMPLACER en majuscules dans le champ.",
      });
    }
    const fichier = donnees.get("fichier");
    if (!(fichier instanceof File) || fichier.size === 0) {
      return versComptes({ erreur: "Choisissez un fichier de sauvegarde." });
    }
    if (fichier.size > TAILLE_MAX) {
      return versComptes({
        erreur: "Ce fichier dépasse 4 Mo : la restauration doit alors se faire à la main.",
      });
    }
    contenu = await fichier.text();
  } catch {
    return versComptes({ erreur: "Le fichier n'a pas pu être lu." });
  }

  const resultat = await restaurerSauvegarde(contenu);
  await tracer(
    qui,
    "sauvegarde_restauree",
    "base complète",
    resultat.ok
      ? resultat.tables.map((t) => `${t.lignes} ${t.table}`).join(", ")
      : resultat.erreur,
  );

  if (!resultat.ok) return versComptes({ erreur: resultat.erreur });
  return versComptes({
    restaure:
      resultat.tables
        .filter((t) => t.lignes > 0)
        .map((t) => `${t.lignes} ${t.table}`)
        .join(", ") || "sauvegarde vide",
  });
}
