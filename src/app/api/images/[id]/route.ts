import { lireImage } from "@/lib/crm/images";

/**
 * Sert une photo déposée depuis le tableau de bord.
 *
 * L'adresse porte un identifiant tiré au sort et ne change jamais pour une
 * image donnée : on peut donc autoriser un an de cache, chez le visiteur comme
 * sur le réseau de diffusion. La base n'est lue qu'une fois par image et par
 * région, ce qui rend le stockage en base parfaitement tenable.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const image = await lireImage(id);

  if (!image) {
    // Cinq minutes de cache même sur l'absence : sans quoi une adresse tirée
    // au hasard, répétée, coûte une requête en base à chaque fois.
    return new Response("Introuvable", {
      status: 404,
      headers: { "Cache-Control": "public, max-age=300" },
    });
  }

  return new Response(new Uint8Array(image.octets), {
    headers: {
      // Le type est celui de la conversion, pas celui du fichier reçu :
      // `deposerImage` ré-encode tout en WebP avant de stocker. On ne relit
      // donc pas la colonne — une valeur en base ne doit pas pouvoir décider
      // du type servi sur une adresse publique mise en cache un an.
      "Content-Type": "image/webp",
      "Content-Length": String(image.octets.byteLength),
      "Cache-Control": "public, max-age=31536000, immutable",
      // Des octets téléversés servis depuis l'origine du site : le navigateur
      // ne doit jamais deviner leur type à la place du serveur.
      "X-Content-Type-Options": "nosniff",
    },
  });
}
