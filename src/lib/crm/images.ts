import { getDb } from "./db";

/**
 * Les photos déposées depuis le tableau de bord.
 *
 * Elles vivent dans la base, et non dans un service de stockage : le projet en
 * compte quelques dizaines, une par stage, et une pièce jointe de plus dans
 * l'infrastructure serait une clé de plus à créer, à renouveler, et à oublier
 * le jour où elle expire. Une photo redimensionnée et convertie pèse deux
 * cents kilo-octets : la base le porte sans effort.
 *
 * Deux précautions rendent ce choix tenable :
 *
 *   · l'image est retaillée et convertie en WebP **avant** d'être stockée —
 *     jamais l'original de trois méga-octets sorti d'un téléphone ;
 *   · elle est servie par une adresse qui ne change pas et qui autorise un an
 *     de cache : le navigateur ne la redemande pas, la base n'est lue qu'une
 *     fois.
 *
 * Les sauvegardes n'emportent pas les images : une copie de la base resterait
 * lisible, mais reviendrait sans ses photos. C'est un compromis assumé pour ne
 * pas transformer un fichier de secours de deux méga-octets en archive de deux
 * cents. La restauration le sait et ne réinsère une référence de photo que si
 * la photo est encore là — sans quoi la clé étrangère ferait échouer la reprise
 * entière, au pire moment.
 */

/** Ce qu'on accepte de recevoir — tel que le navigateur l'annonce. */
const TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

/**
 * Ce que sharp doit *reconnaître* dans les octets. Le type annoncé par le
 * navigateur n'engage à rien : c'est une en-tête de requête, elle se change.
 * Sans ce second contrôle, le format réellement accepté serait tout ce que
 * libvips sait lire — SVG et TIFF compris, alors qu'aucun des deux n'a de
 * raison d'arriver ici.
 */
const FORMATS = ["jpeg", "png", "webp", "avif", "heif"];

/**
 * Au-delà, on refuse sans décoder. Quatre méga-octets, et non huit : chez
 * Vercel, le corps d'une requête de fonction est plafonné autour de quatre et
 * demi. Promettre huit, c'est promettre un échec sans message au moment où la
 * photo part.
 */
const TAILLE_MAX = 4 * 1024 * 1024;

/**
 * Le vrai danger n'est pas le poids du fichier mais le nombre de pixels qu'il
 * cache : un PNG de deux méga-octets peut annoncer 16 000 × 16 000 et demander
 * deux giga-octets de mémoire au décodage — de quoi tuer la fonction qui sert
 * aussi les formulaires publics. Trente méga-pixels couvrent tout appareil
 * raisonnable ; au-delà, on refuse à la lecture de l'en-tête, avant d'allouer.
 */
const PIXELS_MAX = 30_000_000;

/** Largeur maximale conservée — au-delà, l'écran n'en fait rien. */
const LARGEUR_MAX = 1600;

export type Image = {
  id: string;
  type_mime: string;
  octets: Buffer;
  largeur: number | null;
  hauteur: number | null;
  /** Ce que la photo montre, pour qui ne la voit pas. */
  alt: string | null;
};

export type Depot = { ok: true; id: string } | { ok: false; erreur: string };

/**
 * Reçoit un fichier, le retaille, le convertit, et renvoie son identifiant.
 * L'identifiant est tiré au sort : deviner l'adresse d'une photo ne doit pas
 * être possible en incrémentant un nombre.
 */
export async function deposerImage(fichier: File, alt?: string): Promise<Depot> {
  if (!fichier || fichier.size === 0) return { ok: false, erreur: "Aucun fichier reçu." };
  if (fichier.size > TAILLE_MAX) {
    return {
      ok: false,
      erreur: "Cette image dépasse quatre méga-octets : réduisez-la avant de l'envoyer.",
    };
  }
  if (!TYPES.includes(fichier.type)) {
    return {
      ok: false,
      erreur: "Format non accepté : envoyez un JPEG, un PNG, un WebP ou un AVIF.",
    };
  }

  try {
    const { default: sharp } = await import("sharp");
    const entree = Buffer.from(await fichier.arrayBuffer());

    // Deux dépôts simultanés ne doivent pas cumuler leurs pics de mémoire.
    sharp.concurrency(1);

    const image = sharp(entree, {
      failOn: "error",
      // Refusé dès l'en-tête, sans allouer la toile.
      limitInputPixels: PIXELS_MAX,
      // Une image, pas les trois cents trames d'un GIF animé.
      pages: 1,
    });

    // L'en-tête se lit sans décoder : le format réel est donc connu avant la
    // passe coûteuse. Un fichier qui prétend être une image sans en être une
    // ne passe pas, et une image d'un format qu'on ne veut pas non plus.
    const meta = await image.metadata();
    if (!meta.format || !FORMATS.includes(meta.format)) {
      return {
        ok: false,
        erreur: "Format non accepté : envoyez un JPEG, un PNG, un WebP ou un AVIF.",
      };
    }

    // `resolveWithObject` rend les dimensions de la sortie dans la même passe :
    // inutile de redécoder l'image qu'on vient d'écrire pour les relire.
    const { data: sortie, info } = await image
      .rotate()
      .resize({ width: LARGEUR_MAX, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer({ resolveWithObject: true });

    // La base n'est ouverte qu'une fois l'image acceptée : un fichier qu'on
    // va refuser ne doit pas coûter une connexion du pool.
    const sql = await getDb();
    if (!sql) return { ok: false, erreur: "Base de données indisponible." };

    const id = Buffer.from(crypto.getRandomValues(new Uint8Array(12))).toString("base64url");
    await sql`
      INSERT INTO images (id, type_mime, octets, largeur, hauteur, taille, alt)
      VALUES (${id}, ${"image/webp"}, ${sortie}, ${info.width ?? meta.width ?? null},
              ${info.height ?? meta.height ?? null}, ${info.size ?? sortie.byteLength},
              ${alt?.trim().slice(0, 300) || null})
    `;
    return { ok: true, id };
  } catch (e) {
    console.error("[crm] deposerImage:", e);
    return { ok: false, erreur: "Cette image n'a pas pu être lue." };
  }
}

export async function lireImage(id: string): Promise<Image | null> {
  // La forme d'abord : un identifiant manifestement faux ne doit pas coûter
  // une connexion du pool, qui sert aussi les formulaires publics.
  if (!/^[A-Za-z0-9_-]{1,32}$/.test(id)) return null;
  const sql = await getDb();
  if (!sql) return null;
  try {
    const [i] = await sql<Image[]>`
      SELECT id, type_mime, octets, largeur, hauteur, alt FROM images WHERE id = ${id}
    `;
    return i ?? null;
  } catch (e) {
    console.error("[crm] lireImage:", e);
    return null;
  }
}

/** L'adresse publique d'une image. Stable : elle peut être mise en cache un an. */
export function lienImage(id: string | null): string | null {
  return id ? `/api/images/${id}` : null;
}

/** Efface une image devenue inutile. Silencieux : rien n'en dépend. */
export async function effacerImage(id: string | null): Promise<void> {
  if (!id) return;
  const sql = await getDb();
  if (!sql) return;
  try {
    await sql`DELETE FROM images WHERE id = ${id}`;
  } catch (e) {
    console.error("[crm] effacerImage:", e);
  }
}
