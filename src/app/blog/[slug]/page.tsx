import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ARTICLES, ARTICLE_SLUGS, getArticle, type Block } from "@/lib/articles";

export function generateStaticParams() {
  return ARTICLE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) {
    return { title: "Article introuvable" };
  }
  return {
    title: article.titre,
    description: article.extrait,
    alternates: { canonical: `/blog/${article.slug}` },
    openGraph: {
      type: "article",
      title: article.titre,
      description: article.extrait,
      publishedTime: article.dateISO,
    },
  };
}

/** Rend le gras inline écrit avec **double astérisque**. */
function renderInline(text: string) {
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} style={{ fontWeight: 600 }}>
        {part}
      </strong>
    ) : (
      part
    ),
  );
}

function ContentBlock({ block }: { block: Block }) {
  switch (block.k) {
    case "h2":
      return (
        <h2 className="display" style={{ fontSize: 32, color: "var(--navy)", margin: "48px 0 20px" }}>
          {block.t}
        </h2>
      );
    case "quote":
      return (
        <blockquote style={{ margin: "40px 0", padding: "28px 36px", borderLeft: "3px solid var(--gold)", background: "var(--paper)" }}>
          <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 22, color: "var(--navy)", margin: 0, lineHeight: 1.5 }}>
            &ldquo;{block.t}&rdquo;
          </p>
        </blockquote>
      );
    case "ul":
      return (
        <ul style={{ margin: "0 0 24px", padding: 0, listStyle: "none" }}>
          {block.items.map((item, i) => (
            <li key={i} style={{ display: "flex", gap: 14, padding: "10px 0", borderBottom: "1px solid var(--line)", lineHeight: 1.7 }}>
              <span style={{ color: "var(--gold)", flexShrink: 0, fontSize: 12, marginTop: 6 }}>✦</span>
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );
    default:
      return <p style={{ margin: "0 0 24px" }}>{renderInline(block.t)}</p>;
  }
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const index = ARTICLES.findIndex((a) => a.slug === article.slug);
  const prev = index > 0 ? ARTICLES[index - 1] : null;
  const next = index < ARTICLES.length - 1 ? ARTICLES[index + 1] : null;

  return (
    <div className="page-fade">

      {/* HERO ARTICLE */}
      <section className="page-hero sec-blue" style={{ background: "linear-gradient(150deg, #142579 0%, #0f1d6e 50%, #0a1450 100%)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="container-narrow">
          <Link
            href="/blog"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", textDecoration: "none", marginBottom: 40, fontFamily: "var(--sans)" }}
          >
            ← Retour au blog
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--gold)", fontFamily: "var(--sans)" }}>
              {article.categorie}
            </span>
            <span style={{ width: 1, height: 14, background: "rgba(255,255,255,0.2)" }} />
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", fontFamily: "var(--sans)" }}>{article.lecture} de lecture</span>
            <span style={{ width: 1, height: 14, background: "rgba(255,255,255,0.2)" }} />
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", fontFamily: "var(--sans)" }}>{article.date}</span>
          </div>

          <h1 className="display" style={{ fontSize: "clamp(24px, 3vw, 48px)", color: "var(--white)", margin: "0 0 36px", lineHeight: 1.1 }}>
            {article.titreLead}{" "}
            <em className="display-italic" style={{ color: "var(--gold)" }}>{article.titreAccent}</em>
          </h1>

          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(200,168,75,0.2)", display: "grid", placeItems: "center" }}>
              <span className="display" style={{ fontSize: 20, color: "var(--gold)" }}>D</span>
            </div>
            <div>
              <p style={{ fontSize: 14, color: "var(--white)", margin: 0, fontWeight: 500 }}>Domoïna</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", margin: 0, fontFamily: "var(--sans)", letterSpacing: ".05em" }}>Thérapeute initiatique</p>
            </div>
          </div>
        </div>
      </section>

      {/* COUVERTURE ARTICLE */}
      <div className="sec-blue" style={{ background: "linear-gradient(150deg, #142579 0%, #0f1d6e 50%, #0a1450 100%)", padding: "0 0 16px" }}>
        <div className="container-narrow">
          <div style={{ aspectRatio: "16/9", background: "repeating-linear-gradient(135deg, rgba(200,168,75,0.06) 0 14px, rgba(200,168,75,0.02) 14px 28px)", border: "1px solid rgba(255,255,255,0.08)", display: "grid", placeItems: "center" }}>
            <div style={{ textAlign: "center" }}>
              <span style={{ fontSize: 56, color: "var(--gold)", lineHeight: 1 }}>✦</span>
              <p style={{ fontSize: 10.5, letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", fontFamily: "var(--sans)", margin: "14px 0 0" }}>
                {article.categorie}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENU */}
      <article className="section" style={{ background: "var(--white)" }}>
        <div className="container-narrow">
          <div style={{ fontSize: 17, lineHeight: 1.8, color: "var(--navy-ink)" }}>

            <p style={{ fontFamily: "var(--serif)", fontSize: 22, lineHeight: 1.6, color: "var(--navy)", margin: "0 0 32px" }}>
              {article.lede}
            </p>

            {article.content.map((block, i) => (
              <ContentBlock key={i} block={block} />
            ))}
          </div>

          {/* AUTEUR */}
          <div style={{ marginTop: 64, paddingTop: 32, display: "flex", gap: 24, borderTop: "1px solid var(--line)" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--paper)", border: "1px solid var(--line)", display: "grid", placeItems: "center", flexShrink: 0 }}>
              <span className="display" style={{ fontSize: 28, color: "var(--gold)" }}>D</span>
            </div>
            <div>
              <p className="display" style={{ fontSize: 22, color: "var(--navy)", margin: "0 0 4px" }}>Domoïna</p>
              <p style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--gold)", margin: "0 0 12px", fontFamily: "var(--sans)" }}>
                Thérapeute initiatique · La Voie 2 la Conscience
              </p>
              <p style={{ fontSize: 14, lineHeight: 1.75, color: "var(--mute)", margin: 0 }}>
                15 ans dédiés à la transformation profonde des êtres en quête d&apos;excellence authentique.
              </p>
            </div>
          </div>

          {/* NAVIGATION — article précédent / suivant */}
          <div className="rg-2" style={{ marginTop: 48, gap: 12 }}>
            {prev ? (
              <Link href={`/blog/${prev.slug}`} style={{ padding: "22px 24px", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 8, textDecoration: "none" }}>
                <span style={{ fontSize: 10.5, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--gold)", fontFamily: "var(--sans)" }}>← Article précédent</span>
                <span className="display" style={{ fontSize: 18, color: "var(--navy)", lineHeight: 1.25 }}>{prev.titre}</span>
              </Link>
            ) : (
              <Link href="/blog" style={{ padding: "22px 24px", border: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M15 8H2M7 3L2 8l5 5" stroke="var(--gold)" strokeWidth="1.2" />
                </svg>
                <span style={{ fontSize: 14, color: "var(--navy-ink)" }}>Tous les articles</span>
              </Link>
            )}

            {next ? (
              <Link href={`/blog/${next.slug}`} style={{ padding: "22px 24px", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 8, textDecoration: "none", textAlign: "right" }}>
                <span style={{ fontSize: 10.5, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--gold)", fontFamily: "var(--sans)" }}>Article suivant →</span>
                <span className="display" style={{ fontSize: 18, color: "var(--navy)", lineHeight: 1.25 }}>{next.titre}</span>
              </Link>
            ) : (
              <Link href="/offre-gold" className="btn btn-primary" style={{ justifyContent: "flex-end", padding: "22px 24px" }}>
                Découvrir l&apos;Offre Gold
                <svg className="arrow" width={14} height={14} viewBox="0 0 16 16" fill="none">
                  <path d="M1 8h13M9 3l5 5-5 5" stroke="currentColor" strokeWidth="1.2" />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </article>

    </div>
  );
}
