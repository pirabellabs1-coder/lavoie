/**
 * Constantes centralisées du site — utilisées par les métadonnées,
 * les données structurées JSON-LD, le sitemap et le robots.
 * Mettez à jour ces valeurs si le domaine ou les coordonnées changent.
 */
export const SITE = {
  url: "https://www.lavoie2laconscience.com",
  name: "La Voie 2 la Conscience",
  shortName: "La Voie 2 la Conscience",
  description:
    "Accompagnement initiatique haut de gamme pour dirigeants, cadres supérieurs et thérapeutes. 500+ personnes accompagnées par Domoïna en plus de 21 ans de pratique. Méthodes AIME, V.I.E. et Cycle des Saisons.",
  locale: "fr_FR",
  founder: "Domoïna",
  email: "contact@lavoie2laconscience.com",
  telephone: "+33764201524",
  // Centre HUT — Sarthe (48°10′ N · 0°06′ E)
  geo: { latitude: 48.1667, longitude: 0.1 },
  address: {
    region: "Sarthe",
    country: "FR",
  },
  rating: { value: 4.9, count: 142 },
  // Réseaux sociaux (sameAs) — enrichit le knowledge graph (SEO / GEO / AIEO).
  sameAs: [
    "https://www.instagram.com/voie2laconscience/",
    "https://www.facebook.com/v2csourcedeau",
    "https://www.linkedin.com/in/domoina-ramiadana/",
    "https://youtube.com/@lavoie2laconscience",
  ] as string[],
  // Image générée dynamiquement (src/app/opengraph-image.tsx)
  ogImage: "/opengraph-image",
} as const;

export type Site = typeof SITE;
