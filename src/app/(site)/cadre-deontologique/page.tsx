import type { Metadata } from "next";
import Link from "next/link";
import { DOCUMENTS } from "@/lib/documents";

export const metadata: Metadata = {
  title: "Cadre Déontologique — Chartes & engagements de La Voie 2 la Conscience",
  description:
    "Chartes, conditions d'accompagnement et engagement éthique de La Voie 2 la Conscience (V2C) : Bien-Finir, conditions d'usage et reconnaissance du parcours.",
};

function Arrow() {
  return (
    <svg className="arrow" width={14} height={14} viewBox="0 0 16 16" fill="none">
      <path d="M1 8h13M9 3l5 5-5 5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

const MARINE = "linear-gradient(150deg, #142579 0%, #0f1d6e 50%, #0a1450 100%)";

export default function CadreDeontologique() {
  const featured = DOCUMENTS.find((d) => d.featured);
  const autres = DOCUMENTS.filter((d) => !d.featured);

  return (
    <div className="page-fade">

      {/* HERO — marine */}
      <section className="page-hero sec-blue" style={{ background: MARINE, color: "var(--white)", position: "relative" }}>
        <div className="container-narrow" style={{ textAlign: "center" }}>
          <h1 className="display" style={{ fontSize: "clamp(30px, 3.4vw, 54px)", margin: "0 0 22px", lineHeight: 1.05, color: "var(--white)" }}>
            Cadre <em className="display-italic" style={{ color: "var(--gold)" }}>Déontologique.</em>
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.7, color: "rgba(255,255,255,0.85)", maxWidth: 600, margin: "0 auto" }}>
            Chartes, conditions d&apos;accompagnement et engagement éthique de
            La Voie 2 la Conscience.
          </p>
        </div>
      </section>

      {/* DOCUMENT EN VEDETTE */}
      {featured && (
        <section className="section" style={{ background: "var(--paper)" }}>
          <div className="container-narrow">
            <Link
              href={`/cadre-deontologique/${featured.slug}`}
              className="card card-hover"
              style={{ display: "block", padding: "clamp(28px, 4vw, 48px)", textDecoration: "none" }}
            >
              <p style={{ fontFamily: "var(--sans)", fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--blue)", fontWeight: 600, margin: "0 0 22px" }}>
                {featured.category}
              </p>
              <h2 className="display" style={{ fontSize: "clamp(22px, 2.4vw, 32px)", color: "var(--navy)", margin: "0 0 18px", lineHeight: 1.18 }}>
                {featured.title}
              </h2>
              <p style={{ fontSize: 15.5, lineHeight: 1.78, color: "var(--mute)", margin: "0 0 28px", maxWidth: 720 }}>
                {featured.excerpt}
              </p>
              <span className="link-underline" style={{ color: "var(--blue)", fontWeight: 500 }}>
                Lire le document <Arrow />
              </span>
            </Link>
          </div>
        </section>
      )}

      {/* TOUS LES DOCUMENTS */}
      <section className="section" style={{ background: "var(--paper-alt)" }}>
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 56px" }}>
            <h2 className="display" style={{ fontSize: "clamp(28px, 3vw, 44px)", margin: "0 0 14px", lineHeight: 1.06 }}>
              Tous les documents
            </h2>
            <p style={{ fontSize: 16, color: "var(--mute)", margin: "0 0 20px" }}>
              Consultez nos chartes et conditions
            </p>
            <hr style={{ width: 44, height: 2, border: 0, background: "var(--blue)", margin: "0 auto" }} />
          </div>

          <div className="rg-2" style={{ alignItems: "stretch" }}>
            {autres.map((doc) => (
              <Link
                key={doc.slug}
                href={`/cadre-deontologique/${doc.slug}`}
                className="card card-hover"
                style={{ display: "flex", flexDirection: "column", padding: "34px 34px 30px", textDecoration: "none" }}
              >
                <span className="pill" style={{ alignSelf: "flex-start", marginBottom: 22, background: "rgba(15,29,110,0.07)", color: "var(--blue)", borderColor: "rgba(15,29,110,0.18)" }}>
                  {doc.category}
                </span>
                <h3 className="display" style={{ fontSize: 22, color: "var(--navy)", margin: "0 0 14px", lineHeight: 1.22 }}>
                  {doc.title}
                </h3>
                <p style={{ fontSize: 14.5, lineHeight: 1.72, color: "var(--mute)", margin: "0 0 26px", flexGrow: 1 }}>
                  {doc.excerpt}
                </p>
                <span className="link-underline" style={{ color: "var(--blue)", fontWeight: 500, alignSelf: "flex-start" }}>
                  Consulter <Arrow />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — marine */}
      <section className="section-tight sec-blue" style={{ background: MARINE, textAlign: "center", position: "relative" }}>
        <div className="container-narrow">
          <h3 className="display" style={{ fontSize: "clamp(28px, 3.2vw, 46px)", margin: "0 0 20px", color: "var(--white)", lineHeight: 1.06 }}>
            Des questions sur <em className="display-italic" style={{ color: "var(--gold)" }}>notre cadre&nbsp;?</em>
          </h3>
          <p style={{ fontSize: 17, lineHeight: 1.7, color: "rgba(255,255,255,0.85)", maxWidth: 520, margin: "0 auto 36px" }}>
            Contactez-nous pour clarifier toute condition d&apos;accompagnement
            ou pour discuter de votre parcours.
          </p>
          <Link href="/contact" className="btn btn-primary">
            Nous contacter <Arrow />
          </Link>
        </div>
      </section>

    </div>
  );
}
