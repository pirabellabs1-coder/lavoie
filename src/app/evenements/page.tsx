import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd } from "@/lib/jsonld";
import { EVENEMENTS } from "@/lib/evenements";
import EvenementCard from "@/components/EvenementCard";
import LeadMagnetForm from "@/components/LeadMagnetForm";

export const metadata: Metadata = {
  title: "Événements — Les prochains rendez-vous",
  description:
    "Ateliers, conférences et journées d'immersion animés par Domoïna Ramiadana. Réservez votre place en ligne. Plus un guide gratuit à télécharger.",
  alternates: { canonical: "/evenements" },
};

const MARINE = "linear-gradient(150deg, #142579 0%, #0f1d6e 50%, #0a1450 100%)";

function Arrow({ size = 14 }: { size?: number }) {
  return (
    <svg className="arrow" width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M1 8h13M9 3l5 5-5 5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function Eyebrow({ children, gold, style }: { children: React.ReactNode; gold?: boolean; style?: React.CSSProperties }) {
  return (
    <p className="eyebrow" style={{ margin: 0, color: gold ? "var(--gold)" : "var(--navy)", ...style }}>
      <span className="dot" style={gold ? { background: "var(--gold)" } : undefined} />
      {children}
      <span className="dot" style={gold ? { background: "var(--gold)" } : undefined} />
    </p>
  );
}

export default function EvenementsPage() {
  return (
    <div className="page-fade">
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "Accueil", path: "/" },
            { name: "Événements", path: "/evenements" },
          ]),
        ]}
      />

      {/* HERO */}
      <section className="page-hero" style={{ background: "var(--white)", borderBottom: "1px solid var(--line)" }}>
        <div className="container-narrow" style={{ textAlign: "center" }}>
          <Eyebrow style={{ justifyContent: "center", marginBottom: 32 }}>Événements · réservation en ligne</Eyebrow>
          <h1 className="display" style={{ fontSize: "clamp(34px, 4.4vw, 64px)", margin: "0 0 28px", lineHeight: 1.04 }}>
            Les prochains<br /><em className="display-italic">rendez-vous.</em>
          </h1>
          <hr className="filet" style={{ margin: "0 auto 32px" }} />
          <p style={{ fontSize: 18, lineHeight: 1.7, color: "var(--navy-ink)", maxWidth: 620, margin: "0 auto" }}>
            Ateliers, conférences et journées d&apos;immersion animés par Domoïna. Des moments
            à vivre en groupe — places limitées, réservation en ligne.
          </p>
        </div>
      </section>

      {/* AGENDA */}
      <section className="section" style={{ background: "var(--paper)" }}>
        <div className="container">
          <div className="section-head">
            <div>
              <Eyebrow style={{ marginBottom: 24 }}>L&apos;agenda</Eyebrow>
              <h2>Nos événements<br /><em className="display-italic">à venir.</em></h2>
            </div>
            <p>
              Chaque rendez-vous ouvre une porte : couple, désir, blessure originelle, cycles de vie,
              pardon, leadership. Un premier pas concret, vécu en groupe.
            </p>
          </div>

          {EVENEMENTS.length > 0 ? (
            <>
              <div className="rg-3" style={{ gap: 20, alignItems: "stretch" }}>
                {EVENEMENTS.map((e, i) => (
                  <EvenementCard key={i} e={e} />
                ))}
              </div>

              <p className="small" style={{ textAlign: "center", margin: "40px 0 0", color: "var(--mute)", fontSize: 12.5, letterSpacing: ".04em" }}>
                ✦ Places limitées · Réservation &amp; paiement sécurisés via la billetterie ✦
              </p>
            </>
          ) : (
            <div
              style={{
                background: "var(--white)",
                border: "1px solid var(--line)",
                borderRadius: 16,
                padding: "clamp(40px, 6vw, 72px) clamp(24px, 4vw, 56px)",
                textAlign: "center",
              }}
            >
              <p className="display" style={{ fontSize: 24, color: "var(--navy)", margin: "0 0 14px", lineHeight: 1.25 }}>
                Les prochaines dates arrivent.
              </p>
              <p style={{ fontSize: 15.5, lineHeight: 1.7, color: "var(--mute)", maxWidth: 460, margin: "0 auto 28px" }}>
                Aucun événement n&apos;est ouvert à la réservation pour le moment. Recevez le guide
                ci-dessous pour être prévenu·e de la prochaine session — ou échangeons de vive voix.
              </p>
              <Link href="/contact" className="btn btn-primary">
                Réserver un appel offert <Arrow />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* LIAISON — le Cycle des Saisons */}
      <section className="section-tight" style={{ background: "var(--white)" }}>
        <div className="container">
          <div
            style={{
              background: "var(--paper)",
              border: "1px solid var(--line)",
              borderRadius: 18,
              padding: "clamp(30px, 4vw, 52px)",
              display: "flex",
              gap: 32,
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
            }}
          >
            <div style={{ flex: 1, minWidth: 300 }}>
              <Eyebrow style={{ marginBottom: 18 }}>Le programme phare</Eyebrow>
              <h2 className="display" style={{ fontSize: "clamp(24px, 2.8vw, 36px)", margin: "0 0 14px", lineHeight: 1.12 }}>
                Quatre stages qui n&apos;en font<br /><em className="display-italic">qu&apos;un seul chemin.</em>
              </h2>
              <p style={{ fontSize: 16, lineHeight: 1.75, color: "var(--mute)", margin: 0, maxWidth: 560 }}>
                Automne, Hiver, Printemps, Été&nbsp;: les quatre rendez-vous du Cycle des Saisons
                composent une année initiatique complète. Comprendre la progression avant de
                choisir une date.
              </p>
            </div>
            <Link href="/cycle-des-saisons" className="btn btn-primary btn-lg">
              Découvrir le Cycle des Saisons <Arrow />
            </Link>
          </div>
        </div>
      </section>

      {/* LEAD MAGNET — guide gratuit */}
      <section id="guide" className="section sec-blue" style={{ background: MARINE, color: "var(--white)", position: "relative", overflow: "hidden", scrollMarginTop: 90 }}>
        <div
          aria-hidden="true"
          style={{ position: "absolute", inset: 0, background: "radial-gradient(70% 55% at 50% -8%, rgba(245,196,34,0.12) 0%, transparent 60%)", pointerEvents: "none" }}
        />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div className="rg-split-bias" style={{ gap: "clamp(36px, 5vw, 72px)", alignItems: "center" }}>
            <div>
              <Eyebrow gold style={{ marginBottom: 22 }}>Guide offert</Eyebrow>
              <h2 className="display" style={{ color: "var(--white)", fontSize: "clamp(28px, 3.2vw, 46px)", lineHeight: 1.08, margin: "0 0 22px" }}>
                Sortir de la<br /><em className="display-italic" style={{ color: "var(--gold)" }}>crise silencieuse.</em>
              </h2>
              <p style={{ fontSize: 16.5, lineHeight: 1.8, color: "rgba(255,255,255,0.82)", margin: "0 0 26px", maxWidth: 520 }}>
                De l&apos;extérieur tout va bien, mais quelque chose s&apos;est éteint&nbsp;? Recevez le
                guide gratuit et faites le premier pas — sans engagement.
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  "Les 6 signaux d'une réussite qui vous épuise",
                  "Ce que révèle votre blessure originelle",
                  "Les 3 premiers pas pour retrouver l'équilibre",
                ].map((t, i) => (
                  <li key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", fontSize: 15.5, lineHeight: 1.55, color: "var(--white)" }}>
                    <span style={{ color: "var(--gold)", flexShrink: 0, marginTop: 2 }}>✦</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ background: "var(--white)", borderRadius: 18, padding: "clamp(28px, 3vw, 40px)", boxShadow: "0 40px 90px -45px rgba(0,0,0,0.5)" }}>
              <p className="small" style={{ letterSpacing: ".2em", textTransform: "uppercase", color: "var(--gold)", margin: "0 0 6px", fontSize: 10.5 }}>
                Le guide, offert
              </p>
              <p className="display" style={{ fontSize: 24, color: "var(--navy)", margin: "0 0 22px", lineHeight: 1.2 }}>
                Recevez-le par e-mail.
              </p>
              <LeadMagnetForm source="Guide — Sortir de la crise silencieuse" />
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
