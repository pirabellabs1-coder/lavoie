import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DOC_SLUGS, getDocument } from "@/lib/documents";

export function generateStaticParams() {
  return DOC_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDocument(slug);
  if (!doc) return { title: "Document introuvable" };
  return {
    title: `${doc.title} — Cadre Déontologique`,
    description: doc.excerpt,
    alternates: { canonical: `/cadre-deontologique/${doc.slug}` },
  };
}

const MARINE = "linear-gradient(150deg, #142579 0%, #0f1d6e 50%, #0a1450 100%)";

function Arrow() {
  return (
    <svg className="arrow" width={14} height={14} viewBox="0 0 16 16" fill="none">
      <path d="M1 8h13M9 3l5 5-5 5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = getDocument(slug);
  if (!doc) notFound();

  return (
    <div className="page-fade">

      {/* HERO — marine */}
      <section className="sec-blue" style={{ background: MARINE, color: "var(--white)", padding: "clamp(48px, 8vw, 96px) 0 clamp(40px, 6vw, 72px)", position: "relative" }}>
        <div className="container-narrow">
          <Link
            href="/cadre-deontologique"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "var(--sans)", fontSize: 13, color: "rgba(255,255,255,0.75)", textDecoration: "none", marginBottom: 28 }}
          >
            <span aria-hidden="true">←</span> Retour au cadre déontologique
          </Link>
          <h1 className="display" style={{ fontSize: "clamp(28px, 3.6vw, 46px)", color: "var(--white)", margin: 0, lineHeight: 1.1 }}>
            {doc.title}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 28 }}>
            <span
              aria-hidden="true"
              style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--gold)", color: "var(--navy-ink)", display: "grid", placeItems: "center", fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 18, fontWeight: 600, flexShrink: 0 }}
            >
              D
            </span>
            <span style={{ lineHeight: 1.35 }}>
              <strong style={{ display: "block", fontFamily: "var(--sans)", fontSize: 14, fontWeight: 600, color: "var(--white)" }}>Domoïna</strong>
              <span style={{ fontFamily: "var(--sans)", fontSize: 12, color: "rgba(255,255,255,0.65)" }}>La Voie 2 la Conscience</span>
            </span>
          </div>
        </div>
      </section>

      {/* CONTENU */}
      <section className="section" style={{ background: "var(--white)" }}>
        <div className="container-narrow">
          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            {doc.blocks.map((b, i) =>
              b.type === "p" ? (
                <p
                  key={i}
                  style={{ fontSize: 16.5, lineHeight: 1.85, color: "var(--navy-ink)", margin: "0 0 22px" }}
                  dangerouslySetInnerHTML={{ __html: b.html }}
                />
              ) : (
                <ul key={i} style={{ listStyle: "none", padding: 0, margin: "0 0 22px" }}>
                  {b.items.map((item, j) => (
                    <li
                      key={j}
                      style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "12px 0", borderBottom: "1px solid var(--line)", fontSize: 16, lineHeight: 1.7, color: "var(--navy-ink)" }}
                    >
                      <span style={{ color: "var(--blue)", flexShrink: 0, fontSize: 11, marginTop: 6 }} aria-hidden="true">✦</span>
                      <span dangerouslySetInnerHTML={{ __html: item }} />
                    </li>
                  ))}
                </ul>
              ),
            )}

            {/* TÉLÉCHARGEMENT */}
            {doc.pdf && (
              <div
                style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", justifyContent: "space-between", border: "1px solid var(--line-dark)", borderRadius: 12, padding: "20px 24px", marginTop: 40 }}
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: 10, fontFamily: "var(--sans)", fontSize: 14.5, fontWeight: 500, color: "var(--navy)" }}>
                  <span aria-hidden="true" style={{ color: "var(--blue)" }}>⤓</span> Télécharger le document
                </span>
                <a href={doc.pdf} download target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ padding: "11px 24px" }}>
                  Télécharger
                </a>
              </div>
            )}

            {/* PARTAGE */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 36, paddingTop: 24, borderTop: "1px solid var(--line)" }}>
              <span style={{ fontFamily: "var(--sans)", fontSize: 13, color: "var(--mute)" }}>Partager ce document</span>
              <span aria-hidden="true" style={{ display: "grid", placeItems: "center", width: 34, height: 34, borderRadius: "50%", border: "1px solid var(--line-dark)", color: "var(--blue)" }}>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-tight" style={{ background: "var(--paper)", textAlign: "center" }}>
        <div className="container-narrow">
          <h3 className="display" style={{ fontSize: "clamp(26px, 3vw, 40px)", margin: "0 0 18px", color: "var(--navy)", lineHeight: 1.08 }}>
            Prêt à vous engager <em className="display-italic" style={{ color: "var(--blue)" }}>dans ce cadre&nbsp;?</em>
          </h3>
          <p style={{ fontSize: 16.5, lineHeight: 1.7, color: "var(--mute)", maxWidth: 520, margin: "0 auto 32px" }}>
            Contactez-nous pour discuter de votre accompagnement avec La Voie 2 la Conscience.
          </p>
          <Link href="/contact" className="btn btn-primary">
            Nous contacter <Arrow />
          </Link>
        </div>
      </section>

    </div>
  );
}
