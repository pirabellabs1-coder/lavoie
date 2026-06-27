/**
 * Source UNIQUE des articles du blog.
 *
 * Utilisée par :
 *   - src/app/blog/page.tsx          (liste des articles)
 *   - src/app/blog/[slug]/page.tsx   (article détaillé)
 *   - src/app/sitemap.ts             (slugs du sitemap)
 *   - src/app/page.tsx               (section « Journal » de l'accueil)
 *
 * ─────────────────────────────────────────────────────────────────────────
 * AUTOMATISATION — Le tableau `ARTICLES` est volontairement VIDE.
 * Les articles seront publiés automatiquement. Chaque article doit respecter
 * le type `Article` ci-dessous. Il suffit d'ajouter des objets dans `ARTICLES`
 * (ou de regénérer ce fichier) : le blog, l'accueil et le sitemap se mettent
 * à jour tout seuls.
 *
 * Format du contenu (`content`) — un tableau de blocs :
 *   { k: "p",     t: "..." }            paragraphe (gras avec **texte**)
 *   { k: "h2",    t: "..." }            titre de section
 *   { k: "quote", t: "..." }            citation mise en exergue
 *   { k: "ul",    items: ["...", ...] } liste à puces
 *
 * Modèle d'article :
 *   {
 *     slug: "mon-article",
 *     categorie: "Transformation",
 *     titre: "Titre complet de l'article",
 *     titreLead: "Titre complet de",
 *     titreAccent: "l'article.",
 *     extrait: "Chapô / résumé (liste + meta description).",
 *     date: "12 mai 2026",
 *     dateISO: "2026-05-12",
 *     lecture: "8 min",
 *     image: "https://.../cover.jpg",   // optionnel
 *     lede: "Paragraphe d'introduction, en serif.",
 *     content: [
 *       { k: "p", t: "Premier paragraphe…" },
 *       { k: "h2", t: "Une section" },
 *       { k: "quote", t: "Une citation forte." },
 *       { k: "ul", items: ["point 1", "point 2"] },
 *     ],
 *   }
 */

export type Block =
  | { k: "p"; t: string }
  | { k: "h2"; t: string }
  | { k: "quote"; t: string }
  | { k: "ul"; items: string[] };

export type Article = {
  slug: string;
  categorie: string;
  /** Titre complet (liste, métadonnées, partages). */
  titre: string;
  /** Début du titre, affiché en clair dans le hero de l'article. */
  titreLead: string;
  /** Fin du titre, mise en valeur (or, italique) dans le hero. */
  titreAccent: string;
  /** Chapô / extrait (liste + meta description). */
  extrait: string;
  /** Date affichée (ex. « 12 mai 2026 »). */
  date: string;
  /** Date ISO pour le sitemap et les métadonnées (ex. « 2026-05-12 »). */
  dateISO: string;
  /** Temps de lecture (ex. « 8 min »). */
  lecture: string;
  /** Image de couverture (URL absolue ou /chemin local). Optionnel. */
  image?: string;
  /** Paragraphe d'introduction, en serif. */
  lede: string;
  content: Block[];
};

/**
 * Articles du blog — VIDE pour l'instant (rempli par automatisation).
 * Ajoutez des objets de type `Article` dans ce tableau.
 */
export const ARTICLES: Article[] = [];

/** Slugs (sitemap + generateStaticParams). */
export const ARTICLE_SLUGS = ARTICLES.map((a) => a.slug);

/** Récupère un article par son slug. */
export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

/** Les N articles les plus récents (section « Journal » de l'accueil). */
export function getRecentArticles(n = 3): Article[] {
  return ARTICLES.slice(0, n);
}
