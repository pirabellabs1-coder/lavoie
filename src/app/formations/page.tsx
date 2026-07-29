import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd } from "@/lib/jsonld";
import { FORMATIONS } from "@/lib/formations";
import LeadMagnetForm from "@/components/LeadMagnetForm";

export const metadata: Metadata = {
  title: "Formations en ligne — Se transformer à votre rythme",
  description:
    "Les formations numériques de Domoïna Ramiadana, à partir de ~10 € : blessures originelles, couple & désir, cycles des saisons, pardon, leadership. Accès immédiat. Plus un guide gratuit à télécharger.",
  alternates: { canonical: "/formations" },
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

export default function FormationsPage() {
  return (
    <div className="page-fade">
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "Accueil", path: "/" },
            { name: "Formations", path: "/formations" },
          ]),
        ]}
      />

      {/* HERO */}
      <section className="page-hero" style={{ background: "var(--white)", borderBottom: "1px solid var(--line)" }}>
        <div className="container-narrow" style={{ textAlign: "center" }}>
          <Eyebrow style={{ justifyContent: "center", marginBottom: 32 }}>Formations en ligne · dès 10 €</Eyebrow>
          <h1 className="display" style={{ fontSize: "clamp(34px, 4.4vw, 64px)", margin: "0 0 28px", lineHeight: 1.04 }}>
            Vous transformer,<br /><em className="display-italic">à votre rythme.</em>
          </h1>
          <hr className="filet" style={{ margin: "0 auto 32px" }} />
          <p style={{ fontSize: 18, lineHeight: 1.7, color: "var(--navy-ink)", maxWidth: 620, margin: "0 auto" }}>
            Les enseignements de Domoïna en format numérique — pour explorer un sujet, à votre
            rythme, chez vous, avant même de venir en immersion. Accès immédiat.
          </p>
        </div>
      </section>

      {/* LEAD MAGNET — guide gratuit */}
      <section className="section sec-blue" style={{ background: MARINE, color: "var(--white)", position: "relative", overflow: "hidden" }}>
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

      {/* CATALOGUE */}
      <section className="section" style={{ background: "var(--paper)" }}>
        <div className="container">
          <div className="section-head">
            <div>
              <Eyebrow style={{ marginBottom: 24 }}>Le catalogue</Eyebrow>
              <h2>Neuf formations<br /><em className="display-italic">pour avancer.</em></h2>
            </div>
            <p>
              Chaque formation ouvre une porte : couple, désir, blessure originelle, cycles de vie,
              pardon, leadership. Un point d&apos;entrée simple vers un travail plus profond.
            </p>
          </div>

          <div className="rg-3" style={{ gap: 20, alignItems: "stretch" }}>
            {FORMATIONS.map((f, i) => (
              <a
                key={i}
                href={f.url}
                target="_blank"
                rel="noopener noreferrer"
                className="card-hover"
                style={{ display: "flex", flexDirection: "column", background: "var(--white)", border: "1px solid var(--line)", borderRadius: 16, textDecoration: "none", position: "relative", overflow: "hidden" }}
              >
                <div style={{ position: "relative", aspectRatio: "1 / 1", background: "var(--paper-alt)" }}>
                  <Image
                    src={f.image}
                    alt={`Couverture — ${f.titre}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    style={{ objectFit: "cover" }}
                  />
                  {f.featured && (
                    <span className="pill pill-gold" style={{ position: "absolute", top: 14, left: 14, fontSize: 9, zIndex: 2 }}>★ Le plus complet</span>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", flexGrow: 1, padding: "22px 24px 24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
                    <span className="pill" style={{ background: "rgba(15,29,110,0.06)", color: "var(--blue)", borderColor: "rgba(15,29,110,0.18)" }}>{f.tag}</span>
                    {f.livre && <span className="pill" style={{ fontSize: 9 }}>Aussi en livre</span>}
                  </div>
                  <h3 className="display" style={{ fontSize: 20, color: "var(--navy)", margin: "0 0 10px", lineHeight: 1.25 }}>{f.titre}</h3>
                  <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--mute)", margin: "0 0 22px", flexGrow: 1 }}>{f.benefice}</p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 16, borderTop: "1px solid var(--line)" }}>
                    <span style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 16, color: "var(--navy)" }}>Dès 10 €</span>
                    <span className="link-underline" style={{ color: "var(--blue)", fontWeight: 500, fontSize: 13 }}>Découvrir <Arrow size={12} /></span>
                  </div>
                </div>
              </a>
            ))}
          </div>

          <p className="small" style={{ textAlign: "center", margin: "40px 0 0", color: "var(--mute)", fontSize: 12.5, letterSpacing: ".04em" }}>
            ✦ Accès immédiat · Paiement sécurisé (carte & Mobile Money) · Garantie 30 jours ✦
          </p>
        </div>
      </section>

      {/* LIAISON — vivre en présentiel */}
      <section className="section-tight sec-blue" style={{ background: MARINE, color: "var(--white)", textAlign: "center", position: "relative" }}>
        <div className="container-narrow">
          <Eyebrow gold style={{ justifyContent: "center", marginBottom: 22 }}>Et si vous le viviez en vrai&nbsp;?</Eyebrow>
          <h3 className="display" style={{ fontSize: "clamp(26px, 3.2vw, 44px)", margin: "0 0 20px", color: "var(--white)", lineHeight: 1.08 }}>
            La formation vous donne les clés.<br /><em className="display-italic" style={{ color: "var(--gold)" }}>Le stage vous les fait traverser.</em>
          </h3>
          <p style={{ fontSize: 17, lineHeight: 1.75, color: "rgba(255,255,255,0.78)", maxWidth: 600, margin: "0 auto 36px" }}>
            Quatre fois par an, au Centre HUT (à une heure de Paris), Domoïna accompagne huit personnes
            seulement pendant trois jours — pour vivre le passage d&apos;une saison intérieure à la suivante.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/contact" className="btn btn-gold">
              Réserver un appel offert <Arrow />
            </Link>
            <Link href="/centre-hut" className="btn btn-ghost-white">
              Découvrir le Centre HUT
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
