import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Article — Blog La Voie 2 la Conscience",
};

function Eyebrow({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <p className="eyebrow" style={{ margin: 0, ...style }}>
      <span className="dot" />
      {children}
      <span className="dot" />
    </p>
  );
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  return (
    <div className="page-fade">

      {/* HERO ARTICLE */}
      <section className="page-hero" style={{ background: "var(--navy)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="container-narrow">
          <Link
            href="/blog"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", textDecoration: "none", marginBottom: 40, fontFamily: "var(--sans)" }}
          >
            ← Retour au blog
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28 }}>
            <span style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--gold)", fontFamily: "var(--sans)" }}>
              Transformation
            </span>
            <span style={{ width: 1, height: 14, background: "rgba(255,255,255,0.2)" }} />
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", fontFamily: "var(--sans)" }}>8 min de lecture</span>
            <span style={{ width: 1, height: 14, background: "rgba(255,255,255,0.2)" }} />
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", fontFamily: "var(--sans)" }}>12 mai 2026</span>
          </div>

          <h1 className="display" style={{ fontSize: "clamp(24px, 3vw, 48px)", color: "var(--white)", margin: "0 0 36px", lineHeight: 1.1 }}>
            Pourquoi vos blessures sont<br />vos plus grands <em className="display-italic" style={{ color: "var(--gold)" }}>atouts.</em>
          </h1>

          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(200,168,75,0.2)", display: "grid", placeItems: "center" }}>
              <span className="display" style={{ fontSize: 20, color: "var(--gold)" }}>D</span>
            </div>
            <div>
              <p style={{ fontSize: 14, color: "var(--white)", margin: 0, fontWeight: 500 }}>Domoina</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", margin: 0, fontFamily: "var(--sans)", letterSpacing: ".05em" }}>Guide initiatique</p>
            </div>
          </div>
        </div>
      </section>

      {/* IMAGE ARTICLE */}
      <div style={{ background: "var(--navy)", padding: "0 0 16px" }}>
        <div className="container-narrow">
          <div style={{ aspectRatio: "16/9", background: "repeating-linear-gradient(135deg, rgba(200,168,75,0.06) 0 14px, rgba(200,168,75,0.02) 14px 28px)", border: "1px solid rgba(255,255,255,0.08)", display: "grid", placeItems: "center" }}>
            <p style={{ fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", fontFamily: "var(--sans)" }}>Image de l&apos;article</p>
          </div>
        </div>
      </div>

      {/* CONTENU */}
      <article className="section" style={{ background: "var(--white)" }}>
        <div className="container-narrow">
          <div style={{ fontSize: 17, lineHeight: 1.8, color: "var(--navy-ink)" }}>

            <p style={{ fontFamily: "var(--serif)", fontSize: 22, lineHeight: 1.6, color: "var(--navy)", margin: "0 0 32px" }}>
              Ce que nous croyons devoir cacher — nos failles, nos peurs, nos blessures originelles —
              est souvent la source de notre puissance la plus profonde.
            </p>

            <p style={{ margin: "0 0 24px" }}>
              Depuis des années que j&apos;accompagne des dirigeants, des thérapeutes et des cadres en quête de sens,
              j&apos;observe un paradoxe constant : les personnes les plus accomplies en apparence sont souvent celles
              qui portent les blessures les plus profondes. Et c&apos;est précisément pour cela qu&apos;elles ont bâti
              autant — comme pour compenser, prouver, s&apos;élever au-dessus de quelque chose d&apos;indicible.
            </p>

            <h2 className="display" style={{ fontSize: 32, color: "var(--navy)", margin: "48px 0 20px" }}>
              La blessure comme moteur
            </h2>

            <p style={{ margin: "0 0 24px" }}>
              Le problème n&apos;est pas la blessure elle-même. C&apos;est le fait qu&apos;elle reste dans l&apos;ombre,
              non reconnue, non intégrée. Dans cet état, elle dirige notre vie à notre insu — guidant
              nos décisions, colorant nos relations, dictant nos peurs et nos élans.
            </p>

            <p style={{ margin: "0 0 24px" }}>
              Mais quand elle est regardée en face, acceptée dans toute sa profondeur, puis intégrée —
              la blessure se transforme. Elle devient la source d&apos;une empathie rare, d&apos;une intuition aiguisée,
              d&apos;une résilience que rien d&apos;autre n&apos;aurait pu forger.
            </p>

            <blockquote style={{ margin: "40px 0", padding: "28px 36px", borderLeft: "3px solid var(--gold)", background: "var(--paper)" }}>
              <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 22, color: "var(--navy)", margin: 0, lineHeight: 1.5 }}>
                &ldquo;La blessure non intégrée nous gouverne. La blessure transformée nous libère.&rdquo;
              </p>
            </blockquote>

            <h2 className="display" style={{ fontSize: 32, color: "var(--navy)", margin: "48px 0 20px" }}>
              Le Parcours AIME : un chemin concret
            </h2>

            <p style={{ margin: "0 0 24px" }}>
              C&apos;est de cette conviction que le Parcours AIME est né :{" "}
              <strong style={{ fontWeight: 600 }}>Accepter, Intégrer, Manifester, Élever</strong>.
              Pas une approche théorique, mais un chemin vécu, corporel, qui engage l&apos;être entier.
            </p>

            <p style={{ margin: 0 }}>
              L&apos;acceptation n&apos;est pas la résignation. C&apos;est le courage de regarder ce qui est vraiment là,
              sans le fuir, sans l&apos;embellir. C&apos;est le premier pas — et souvent le plus difficile.
            </p>
          </div>

          {/* AUTEUR */}
          <div style={{ marginTop: 64, paddingTop: 32, display: "flex", gap: 24, borderTop: "1px solid var(--line)" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--paper)", border: "1px solid var(--line)", display: "grid", placeItems: "center", flexShrink: 0 }}>
              <span className="display" style={{ fontSize: 28, color: "var(--gold)" }}>D</span>
            </div>
            <div>
              <p className="display" style={{ fontSize: 22, color: "var(--navy)", margin: "0 0 4px" }}>Domoina</p>
              <p style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--gold)", margin: "0 0 12px", fontFamily: "var(--sans)" }}>
                Guide initiatique · La Voie 2 la Conscience
              </p>
              <p style={{ fontSize: 14, lineHeight: 1.75, color: "var(--mute)", margin: 0 }}>
                15 ans dédiés à la transformation profonde des êtres en quête d&apos;excellence authentique.
              </p>
            </div>
          </div>

          {/* NAVIGATION */}
          <div className="rg-2" style={{ marginTop: 48, gap: 12 }}>
            <Link href="/blog" style={{ padding: "20px 24px", border: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M15 8H2M7 3L2 8l5 5" stroke="var(--gold)" strokeWidth="1.2" />
              </svg>
              <span style={{ fontSize: 14, color: "var(--navy-ink)" }}>Tous les articles</span>
            </Link>
            <Link href="/offre-gold" className="btn btn-primary" style={{ justifyContent: "flex-end", padding: "20px 24px" }}>
              Découvrir l&apos;Offre Gold
              <svg className="arrow" width={14} height={14} viewBox="0 0 16 16" fill="none">
                <path d="M1 8h13M9 3l5 5-5 5" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            </Link>
          </div>
        </div>
      </article>

    </div>
  );
}
