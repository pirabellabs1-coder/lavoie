import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { ARTICLE_SLUGS as BLOG_SLUGS } from "@/lib/articles";
import { DOC_SLUGS } from "@/lib/documents";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const routes: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "/", priority: 1.0, freq: "weekly" },
    { path: "/offre-gold", priority: 0.9, freq: "monthly" },
    { path: "/formations", priority: 0.8, freq: "monthly" },
    { path: "/methodes", priority: 0.8, freq: "monthly" },
    { path: "/domoina", priority: 0.8, freq: "monthly" },
    { path: "/centre-hut", priority: 0.8, freq: "monthly" },
    { path: "/temoignages", priority: 0.7, freq: "monthly" },
    { path: "/masterclass", priority: 0.7, freq: "monthly" },
    { path: "/blog", priority: 0.6, freq: "weekly" },
    { path: "/contact", priority: 0.7, freq: "monthly" },
    { path: "/faq", priority: 0.6, freq: "monthly" },
    { path: "/cadre-deontologique", priority: 0.3, freq: "yearly" },
    { path: "/mentions-legales", priority: 0.2, freq: "yearly" },
    { path: "/politique-confidentialite", priority: 0.2, freq: "yearly" },
  ];

  const staticEntries: MetadataRoute.Sitemap = routes.map((r) => ({
    url: `${SITE.url}${r.path}`,
    lastModified: now,
    changeFrequency: r.freq,
    priority: r.priority,
  }));

  const blogEntries: MetadataRoute.Sitemap = BLOG_SLUGS.map((slug) => ({
    url: `${SITE.url}/blog/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  const docEntries: MetadataRoute.Sitemap = DOC_SLUGS.map((slug) => ({
    url: `${SITE.url}/cadre-deontologique/${slug}`,
    lastModified: now,
    changeFrequency: "yearly",
    priority: 0.2,
  }));

  return [...staticEntries, ...blogEntries, ...docEntries];
}
