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
    street: "50 Rue Principale",
    locality: "Rouperroux-le-Coquet",
    postalCode: "72110",
    region: "Sarthe",
    country: "FR",
  },
  // La note affichée sur la page des témoignages. C'est une affirmation
  // humaine, vérifiable sur la fiche Google ci-dessous — elle n'est plus
  // injectée dans les données structurées : une note d'entreprise que Google
  // ne peut pas recouper, il l'ignore au mieux, la sanctionne au pire.
  noteGoogle: 4.9,
  // La fiche Google, où l'on peut aussi déposer un avis public. Elle est
  // proposée après le témoignage, jamais à la place : un avis Google ne se
  // relit pas et ne se retire pas.
  avisGoogle: "https://maps.app.goo.gl/cgxbmUAhb8BN4oWH9",
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
