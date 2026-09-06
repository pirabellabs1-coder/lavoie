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
    slogan: "De l'épuisement à l'équilibre — une réussite qui a du sens.",
    serviceType: [
      "Accompagnement initiatique",
      "Coaching de dirigeants",
      "Thérapie initiatique",
      "Retraites de transformation",
    ],
    founder: { "@id": FOUNDER_ID },
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.address.street,
      addressLocality: SITE.address.locality,
      postalCode: SITE.address.postalCode,
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
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "18:00",
      },
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Offre Gold — Immersions",
      itemListElement: [
        { "@type": "OfferCatalog", name: "Immersion Essence", description: "Accompagnement initiatique sur 3 mois." },
        { "@type": "OfferCatalog", name: "Immersion Expansion", description: "Accompagnement initiatique sur 6 mois." },
        { "@type": "OfferCatalog", name: "Immersion Royale", description: "Accompagnement initiatique sur 9 à 12 mois." },
      ],
    },
    // Pas d'`aggregateRating` ici : une note d'organisation déclarée par
    // l'organisation elle-même, sans source recoupable, n'a pas sa place dans
    // les données structurées. La note Google reste affichée sur la page des
    // témoignages, où le visiteur peut la vérifier d'un clic.
    ...(SITE.sameAs.length ? { sameAs: SITE.sameAs } : {}),
  };
}

/** Fondatrice — entité Person reliée à l'organisation. */
export function founderLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": FOUNDER_ID,
    name: "Domoïna Ramiadana",
    alternateName: SITE.founder,
    jobTitle: "Thérapeute initiatique · Fondatrice",
    description:
      "Thérapeute initiatique des dirigeants, cadres et thérapeutes. Fondatrice de La Voie 2 la Conscience et du Centre HUT. Plus de 21 ans d'accompagnement holistique.",
    worksFor: { "@id": ORG_ID },
    url: `${SITE.url}/domoina`,
    image: `${SITE.url}/domoina.jpg`,
    knowsLanguage: ["fr"],
    knowsAbout: [
      "Accompagnement initiatique",
      "Transformation personnelle",
      "Méthode AIME",
      "Voie Initiatique de l'Eau (V.I.E.)",
      "Cycle des Saisons",
      "Méthode Ki-Zola",
      "Coaching de dirigeants",
      "Blessure originelle",
    ],
    sameAs: ["https://www.linkedin.com/in/domoina-ramiadana/"],
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

/**
 * Événement (stage, jeûne, accompagnement) — vise les résultats enrichis
 * « Événements » de Google. `startDate` n'est émis que si la date est connue :
 * un Event sans date valide est rejeté par Google, mieux vaut l'omettre.
 */
export function eventLd(opts: {
  name: string;
  description: string;
  path: string;
  image: string;
  startDate?: string;
  endDate?: string;
  online?: boolean;
  lieu: string;
  offerUrl: string;
  price?: number;
  currency?: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: opts.name,
    description: opts.description,
    url: `${SITE.url}${opts.path}`,
    image: `${SITE.url}${opts.image}`,
    inLanguage: "fr-FR",
    organizer: { "@id": ORG_ID },
    performer: { "@id": FOUNDER_ID },
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: opts.online
      ? "https://schema.org/OnlineEventAttendanceMode"
      : "https://schema.org/OfflineEventAttendanceMode",
    location: opts.online
      ? { "@type": "VirtualLocation", url: opts.offerUrl }
      : {
          "@type": "Place",
          name: opts.lieu,
          address: {
            "@type": "PostalAddress",
            streetAddress: SITE.address.street,
            addressLocality: SITE.address.locality,
            postalCode: SITE.address.postalCode,
            addressRegion: SITE.address.region,
            addressCountry: SITE.address.country,
          },
        },
    ...(opts.startDate ? { startDate: opts.startDate } : {}),
    ...(opts.endDate ? { endDate: opts.endDate } : {}),
    offers: {
      "@type": "Offer",
      url: opts.offerUrl,
      availability: "https://schema.org/InStock",
      ...(opts.price !== undefined
        ? { price: opts.price, priceCurrency: opts.currency ?? "EUR" }
        : {}),
    },
  };
}

/** Programme en plusieurs sessions (Cycle des Saisons) — Course + ItemList. */
export function courseLd(opts: {
  name: string;
  description: string;
  path: string;
  sessions: { name: string; description: string; path: string }[];
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: opts.name,
    description: opts.description,
    url: `${SITE.url}${opts.path}`,
    inLanguage: "fr-FR",
    provider: { "@id": ORG_ID },
    hasCourseInstance: opts.sessions.map((s) => ({
      "@type": "CourseInstance",
      name: s.name,
      description: s.description,
      url: `${SITE.url}${s.path}`,
      courseMode: "Onsite",
      courseWorkload: "P4D",
    })),
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
