import type { Metadata } from "next";
import Link from "next/link";
import { ARTICLES as articles } from "@/lib/articles";

export const metadata: Metadata = {
  title: "Blog — Articles & réflexions sur la transformation",
  description:
    "Articles, insights et réflexions de Domoïna sur la transformation personnelle, la conscience, les pratiques initiatiques et l'excellence authentique.",
  alternates: { canonical: "/blog" },
};

function Arrow() {
  return (
    <svg className="arrow" width={14} height={14} viewBox="0 0 16 16" fill="none">
      <path d="M1 8h13M9 3l5 5-5 5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function Eyebrow({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <p className="eyebrow" style={{ margin: 0, ...style }}>
      <span className="dot" />
      {children}
      <span className="dot" />
    </p>
  );
}

const categories = ["Tous", "Transformation", "Leadership", "Méthode V.I.E.", "Méthode AIME", "Cycle des Saisons"];

export default function Blog() {
  return (
    <div className="page-fade">

      {/* HERO */}
      <section className="page-hero" style={{ background: "var(--white)", borderBottom: "1px solid var(--line)" }}>
        <div className="container-narrow" style={{ textAlign: "center" }}>
          <Eyebrow style={{ marginBottom: 32 }}>Réflexions &amp; insights</Eyebrow>
          <h1 className="display" style={{ fontSize: "clamp(60px, 8vw, 112px)", margin: "0 0 28px", lineHeight: 0.98 }}>
            Le <em className="display-italic">Blog.</em>
          </h1>
          <hr className="filet" style={{ margin: "0 auto 32px" }} />
          <p style={{ fontSize: 18, lineHeight: 1.7, color: "var(--navy-ink)", maxWidth: 520, margin: "0 auto" }}>
            Articles, réflexions et pratiques pour nourrir votre chemin de transformation.
          </p>
        </div>
      </section>

      {/* ÉTAT VIDE — aucun article (le blog se remplit via automatisation) */}
      {articles.length === 0 && (
        <section className="section" style={{ background: "var(--white)", textAlign: "center" }}>
          <div className="container-narrow">
            <span style={{ fontSize: 56, color: "var(--gold)", display: "block", lineHeight: 1, marginBottom: 24 }}>✦</span>
            <h2 className="display" style={{ fontSize: "clamp(28px, 3.2vw, 46px)", margin: "0 0 18px", lineHeight: 1.06 }}>
              Les premiers articles<br /><em className="display-italic" style={{ color: "var(--blue)" }}>arrivent bientôt.</em>
            </h2>
            <p style={{ fontSize: 16.5, lineHeight: 1.7, color: "var(--mute)", maxWidth: 480, margin: "0 auto" }}>
              Le blog se prépare. Abonnez-vous ci-dessous pour être prévenu·e dès la première publication.
            </p>
          </div>
        </section>
      )}

      {articles.length > 0 && (
        <>
      {/* FILTRES */}
      <div style={{ position: "sticky", top: 0, zIndex: 30, background: "#0f1d6e", borderBottom: "1px solid rgba(255,255,255,0.15)", padding: "14px 0" }}>
        <div className="container">
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
            {categories.map((cat) => (
              <button
                key={cat}
                style={{
                  fontSize: 10.5,
                  letterSpacing: ".18em",
                  textTransform: "uppercase",
                  padding: "8px 16px",
                  flexShrink: 0,
                  border: "1px solid",
                  borderColor: cat === "Tous" ? "var(--gold)" : "rgba(255,255,255,0.2)",
                  background: cat === "Tous" ? "var(--gold)" : "transparent",
                  color: cat === "Tous" ? "var(--navy-ink)" : "rgba(255,255,255,0.65)",
                  fontFamily: "var(--mono)",
                  cursor: "pointer",
                  fontWeight: cat === "Tous" ? 600 : 400,
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ARTICLE FEATURED */}
      <section style={{ background: "var(--white)", padding: "56px 0 0" }}>
        <div className="container">
          <div className="rg-2" style={{ border: "1px solid var(--line)", marginBottom: 0 }}>
            <div className="blog-featured-img" style={{ background: "var(--paper)", display: "grid", placeItems: "center", minHeight: 320, borderRight: "1px solid var(--line)" }}>
              <div style={{ textAlign: "center" }}>
                <span style={{ fontSize: 64, color: "var(--gold)", lineHeight: 1 }}>✦</span>
                <p className="small" style={{ fontSize: 10.5, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--mute)", margin: "12px 0 0", fontFamily: "var(--mono)" }}>
                  Image de l&apos;article
                </p>
              </div>
            </div>
            <div style={{ padding: "48px 44px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <span className="pill pill-gold">{articles[0].categorie}</span>
                <span style={{ fontSize: 12, color: "var(--mute)", fontFamily: "var(--mono)" }}>{articles[0].lecture} de lecture</span>
              </div>
              <h2 className="display" style={{ fontSize: 32, color: "var(--navy)", margin: "0 0 18px", lineHeight: 1.2 }}>
                {articles[0].titre}
              </h2>
              <p style={{ fontSize: 15, lineHeight: 1.75, color: "var(--mute)", margin: "0 0 28px" }}>{articles[0].extrait}</p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: "var(--mute)", fontFamily: "var(--mono)" }}>{articles[0].date}</span>
                <Link href={`/blog/${articles[0].slug}`} className="btn btn-primary" style={{ fontSize: 13 }}>
                  Lire l&apos;article <Arrow />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GRILLE ARTICLES */}
      <section className="section" style={{ background: "var(--white)", paddingTop: 0 }}>
        <div className="container">
          <div className="rg-3" style={{ gap: 1, background: "var(--line)", border: "1px solid var(--line)", borderTop: 0 }}>
            {articles.slice(1).map((a, i) => (
              <div key={i} style={{ background: "var(--white)", display: "flex", flexDirection: "column" }}>
                <div style={{ aspectRatio: "16/9", background: "var(--paper)", display: "grid", placeItems: "center", borderBottom: "1px solid var(--line)" }}>
                  <span style={{ fontSize: 32, color: "var(--gold)" }}>✦</span>
                </div>
                <div style={{ padding: "28px 28px 32px", display: "flex", flexDirection: "column", flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                    <span className="pill" style={{ fontSize: 9.5 }}>{a.categorie}</span>
                    <span style={{ fontSize: 11, color: "var(--mute)", fontFamily: "var(--mono)" }}>{a.lecture}</span>
                  </div>
                  <h3 className="display" style={{ fontSize: 22, color: "var(--navy)", margin: "0 0 12px", lineHeight: 1.3 }}>{a.titre}</h3>
                  <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--mute)", margin: "0 0 20px", flex: 1 }}>{a.extrait}</p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 16, borderTop: "1px solid var(--line)" }}>
                    <span style={{ fontSize: 11, color: "var(--mute)", fontFamily: "var(--mono)" }}>{a.date}</span>
                    <Link href={`/blog/${a.slug}`} style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--gold)", display: "flex", alignItems: "center", gap: 6, textDecoration: "none" }}>
                      Lire <Arrow />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
        </>
      )}

      {/* NEWSLETTER */}
      <section className="section" style={{ background: "var(--paper)", textAlign: "center" }}>
        <div className="container-narrow">
          <Eyebrow style={{ marginBottom: 24 }}>Newsletter</Eyebrow>
          <h3 className="display" style={{ fontSize: 48, margin: "0 0 20px", lineHeight: 1.05 }}>
            Recevez les<br /><em className="display-italic">prochains articles.</em>
          </h3>
          <p style={{ fontSize: 16, color: "var(--mute)", margin: "0 0 36px", lineHeight: 1.7 }}>
            Insights, pratiques et réflexions de Domoïna, directement dans votre boîte mail.
          </p>
          <form style={{ display: "flex", gap: 10, maxWidth: 520, margin: "0 auto" }}>
            <input
              type="email"
              placeholder="votre@email.com"
              className="field"
              style={{ flex: 1, margin: 0 }}
            />
            <button type="submit" className="btn btn-primary" style={{ flexShrink: 0 }}>
              S&apos;abonner <Arrow />
            </button>
          </form>
          <p className="small" style={{ margin: "14px 0 0", color: "var(--mute)", fontSize: 12 }}>
            Désinscription en un clic · Confidentialité absolue
          </p>
        </div>
      </section>

    </div>
  );
}
