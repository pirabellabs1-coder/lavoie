import { SITE } from "./site";

const ORG_ID = `${SITE.url}/#organization`;
const WEBSITE_ID = `${SITE.url}/#website`;
const FOUNDER_ID = `${SITE.url}/#domoina`;

/** Organisation / entreprise locale — sert le SEO local ET le GEO (citations IA). */
export function organizationLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness", "ProfessionalService"],
    "@id": ORG_ID,
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    email: SITE.email,
    telephone: SITE.telephone,
    image: `${SITE.url}${SITE.ogImage}`,
    logo: `${SITE.url}${SITE.ogImage}`,
    priceRange: "€€€",
    founder: { "@id": FOUNDER_ID },
    address: {
      "@type": "PostalAddress",
      addressRegion: SITE.address.region,
      addressCountry: SITE.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: SITE.geo.latitude,
      longitude: SITE.geo.longitude,
    },
    areaServed: [
      { "@type": "Country", name: "France" },
      { "@type": "AdministrativeArea", name: "Sarthe" },
    ],
    knowsLanguage: ["fr"],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: SITE.rating.value,
      reviewCount: SITE.rating.count,
      bestRating: 5,
      worstRating: 1,
    },
    ...(SITE.sameAs.length ? { sameAs: SITE.sameAs } : {}),
  };
}

/** Fondatrice — entité Person reliée à l'organisation. */
export function founderLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": FOUNDER_ID,
    name: SITE.founder,
    jobTitle: "Guide initiatique · Fondatrice",
    worksFor: { "@id": ORG_ID },
    url: `${SITE.url}/domoina`,
    knowsAbout: [
      "Accompagnement initiatique",
      "Transformation personnelle",
      "Méthode AIME",
      "Voie Initiatique de l'Eau (V.I.E.)",
      "Cycle des Saisons",
      "Coaching de dirigeants",
    ],
  };
}

/** Site web + action de recherche. */
export function websiteLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE.url,
    name: SITE.name,
    description: SITE.description,
    inLanguage: "fr-FR",
    publisher: { "@id": ORG_ID },
  };
}

/** Fil d'Ariane. */
export function breadcrumbLd(items: { name: string; path: string }[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${SITE.url}${it.path}`,
    })),
  };
}

/** FAQ — déclenche les résultats enrichis Google et nourrit les moteurs IA. */
export function faqLd(faqs: { q: string; a: string }[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

/** Article de blog. */
export function articleLd(opts: {
  title: string;
  description: string;
  slug: string;
  datePublished?: string;
  image?: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.title,
    description: opts.description,
    url: `${SITE.url}/blog/${opts.slug}`,
    inLanguage: "fr-FR",
    author: { "@id": FOUNDER_ID },
    publisher: { "@id": ORG_ID },
    ...(opts.datePublished ? { datePublished: opts.datePublished } : {}),
    ...(opts.image ? { image: opts.image } : {}),
  };
}

/** Témoignage vidéo (VideoObject). */
export function videoLd(opts: {
  name: string;
  description: string;
  youtubeId: string;
  uploadDate?: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: opts.name,
    description: opts.description,
    thumbnailUrl: `https://i.ytimg.com/vi/${opts.youtubeId}/maxresdefault.jpg`,
    contentUrl: `https://www.youtube.com/watch?v=${opts.youtubeId}`,
    embedUrl: `https://www.youtube-nocookie.com/embed/${opts.youtubeId}`,
    uploadDate: opts.uploadDate ?? "2024-01-01",
    publisher: { "@id": ORG_ID },
  };
}
