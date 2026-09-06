import type { Metadata } from "next";
import Link from "next/link";
import Placeholder from "@/components/Placeholder";

export const metadata: Metadata = {
  title: "Centre HUT — Sanctuaire de transformation en Sarthe",
  description:
    "Découvrez le Centre HUT, un sanctuaire de nature préservée en Sarthe. Un lieu hors du temps pour vos stages immersifs et retraites de transformation.",
  alternates: { canonical: "/centre-hut" },
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

const espaces = [
  {
    glyph: "❧",
    nom: "La Microforêt de charme",
    description: "Une microforêt constituée de charmes — un véritable espace de charme pour méditer, se reposer et profiter de la fraîcheur du lieu, surtout en été.",
  },
  {
    glyph: "〜",
    nom: "L'Étang",
    description: "Autour du Centre HUT, un étang peuplé de poissons abrite tout un écosystème aquatique vivant — un point d'eau naturel propice au calme et à la contemplation.",
  },
  {
    glyph: "≈",
    nom: "La Piscine",
    description: "Une piscine dédiée à la purification, à l'immersion et au travail énergétique par l'eau — au cœur de la méthode Ki-Zola.",
  },
  {
    glyph: "✦",
    nom: "Les Espaces de Silence",
    description: "Plusieurs sanctuaires de méditation en plein air, construits en harmonie avec les éléments et les points d'énergie du lieu.",
  },
];

const infos = [
  { label: "Cadre", valeur: "Domaine en pleine nature" },
  { label: "Localisation", valeur: "Rouperroux-le-Coquet, Sarthe (72)" },
  { label: "Distance Paris", valeur: "2 heures (TGV Le Mans + transfert)" },
  { label: "Hébergement", valeur: "Suites privées & dortoirs qualitatifs" },
  { label: "Restauration", valeur: "Cuisine biologique et locale" },
  { label: "Capacité", valeur: "Petits groupes (6–12 personnes)" },
];

export default function CentreHut() {
  return (
    <div className="page-fade">

      {/* HERO */}
      <section className="page-hero sec-blue" style={{ background: "linear-gradient(150deg, #142579 0%, #0f1d6e 50%, #0a1450 100%)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="container">
          <div className="rg-split" style={{ gap: 100, alignItems: "center" }}>
            <div>
              <Eyebrow style={{ marginBottom: 32, color: "var(--gold)" }}>Le lieu · Sarthe, France</Eyebrow>
              <h1 className="display" style={{ fontSize: "clamp(32px, 4vw, 64px)", margin: "0 0 24px", lineHeight: 1.05, color: "var(--white)" }}>
                Centre<br /><em className="display-italic" style={{ color: "var(--gold)" }}>HUT</em>
              </h1>
              <hr className="filet" style={{ marginBottom: 32 }} />
              <p style={{ fontSize: 18, lineHeight: 1.7, color: "rgba(255,255,255,0.75)", maxWidth: 480 }}>
                Un sanctuaire en pleine nature où silence, présence et beauté
                créent les conditions idéales de la transformation.
              </p>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", margin: "16px 0 0", fontFamily: "var(--sans)", letterSpacing: ".05em" }}>
                ◎ 50 Rue Principale, 72110 Rouperroux-le-Coquet
              </p>
            </div>
            <Placeholder
              style={{ aspectRatio: "1/1", border: "1px solid rgba(255,255,255,0.15)" }}
              src="/hut-jardin-zen.webp"
              alt="Jardin zen du Centre HUT au crépuscule"
              sizes="(max-width: 768px) 100vw, 45vw"
            />
          </div>
        </div>
      </section>

      {/* GALERIE */}
      <section className="sec-blue" style={{ background: "linear-gradient(150deg, #142579 0%, #0f1d6e 50%, #0a1450 100%)", padding: "4px 16px 16px" }}>
        <div className="container">
          <div className="rg-split-2-1" style={{ gap: 8 }}>
            <Placeholder
            style={{ aspectRatio: "16/9", border: "1px solid rgba(255,255,255,0.08)" }}
            src="/hut-terrasse.webp"
            alt="Terrasse et bâtisse en pierre du Centre HUT"
            sizes="(max-width: 768px) 100vw, 66vw"
          />
            <div style={{ display: "grid", gap: 8 }}>
              <Placeholder
                style={{ aspectRatio: "16/9", border: "1px solid rgba(255,255,255,0.08)" }}
                src="/hut-salle.webp"
                alt="Salle à manger conviviale du Centre HUT"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <Placeholder
                style={{ aspectRatio: "16/9", border: "1px solid rgba(255,255,255,0.08)" }}
                src="/hut-chambre.webp"
                alt="Chambre du Centre HUT"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
          </div>
          <div className="rg-img" style={{ gap: 8, marginTop: 8 }}>
            <Placeholder
              style={{ aspectRatio: "1/1", border: "1px solid rgba(255,255,255,0.08)" }}
              src="/hut-salle.webp"
              alt="Salle à manger du Centre HUT"
              objectPosition="center"
              sizes="25vw"
            />
            <Placeholder
              style={{ aspectRatio: "1/1", border: "1px solid rgba(255,255,255,0.08)" }}
              src="/hut-chambre.webp"
              alt="Chambre du Centre HUT"
              sizes="25vw"
            />
            <Placeholder
              style={{ aspectRatio: "1/1", border: "1px solid rgba(255,255,255,0.08)" }}
              src="/hut-terrasse.webp"
              alt="Terrasse en pierre du Centre HUT"
              sizes="25vw"
            />
            <Placeholder
              style={{ aspectRatio: "1/1", border: "1px solid rgba(255,255,255,0.08)" }}
              src="/hut-jardin-zen.webp"
              alt="Jardin zen du Centre HUT"
              sizes="25vw"
            />
          </div>
        </div>
      </section>

      {/* DESCRIPTION + INFOS */}
      <section className="section" style={{ background: "var(--white)" }}>
        <div className="container">
          <div className="rg-split" style={{ gap: 80, alignItems: "start" }}>

            <div>
              <Eyebrow style={{ marginBottom: 28 }}>Un lieu unique</Eyebrow>
              <h2 className="display" style={{ fontSize: 36, margin: "0 0 28px", lineHeight: 1.1 }}>
                La nature comme<br /><em className="display-italic">espace thérapeutique.</em>
              </h2>
              <hr className="filet" style={{ marginBottom: 28 }} />
              <div style={{ display: "grid", gap: 20 }}>
                <p style={{ fontSize: 17, lineHeight: 1.8, color: "var(--navy-ink)", margin: 0 }}>
                  Le Centre HUT n&apos;est pas un simple lieu d&apos;hébergement. C&apos;est un organisme vivant,
                  un partenaire de la transformation. Sa nature préservée, en Sarthe,
                  vibre d&apos;une énergie particulière, propice au lâcher-prise et à la reconnexion profonde.
                </p>
                <p style={{ fontSize: 16, lineHeight: 1.8, color: "var(--mute)", margin: 0 }}>
                  Ici, le temps s&apos;arrête. Les téléphones s&apos;éteignent. Les écrans disparaissent.
                  Il ne reste que l&apos;essentiel : soi, les autres, et la nature.
                </p>
                <p style={{ fontSize: 16, lineHeight: 1.8, color: "var(--mute)", margin: 0 }}>
                  Chaque stage immersif au Centre HUT est conçu pour maximiser l&apos;impact
                  de votre transformation — par le cadre, les pratiques, et l&apos;énergie collective du groupe.
                </p>
              </div>
            </div>

            {/* INFOS PRATIQUES */}
            <div style={{ background: "var(--paper)", padding: 40, border: "1px solid var(--line)", borderRadius: 18 }}>
              <Eyebrow style={{ marginBottom: 24 }}>Informations pratiques</Eyebrow>
              <div style={{ borderTop: "1px solid var(--line)" }}>
                {infos.map((info, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16, padding: "16px 0", borderBottom: "1px solid var(--line)" }}>
                    <span style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--gold)", fontFamily: "var(--sans)" }}>{info.label}</span>
                    <span style={{ fontSize: 14, color: "var(--navy-ink)", textAlign: "right", maxWidth: "55%" }}>{info.valeur}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 28 }}>
                <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 16, color: "var(--navy)", margin: "0 0 20px", lineHeight: 1.5 }}>
                  « Accessible exclusivement dans le cadre de l&apos;Offre Gold. »
                </p>
                <Link href="/contact" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                  Réserver mon appel <Arrow />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* VIDÉO */}
      <section className="section" style={{ background: "var(--white)" }}>
        <div className="container-narrow" style={{ textAlign: "center" }}>
          <Eyebrow style={{ marginBottom: 24 }}>En vidéo</Eyebrow>
          <h2 className="display" style={{ fontSize: "clamp(28px, 3.2vw, 46px)", margin: "0 0 16px", lineHeight: 1.06 }}>
            Découvrez le <em className="display-italic" style={{ color: "var(--blue)" }}>Centre HUT.</em>
          </h2>
          <p style={{ fontSize: 16.5, lineHeight: 1.7, color: "var(--mute)", maxWidth: 520, margin: "0 auto 40px" }}>
            Une immersion en images dans le sanctuaire de reconnexion.
          </p>
          <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9", borderRadius: 14, overflow: "hidden", border: "2px solid var(--line-dark)", boxShadow: "0 24px 60px -28px rgba(20,40,120,0.3)" }}>
            <iframe
              src="https://www.youtube.com/embed/2jr7ZopO8ME"
              title="Découvrir le Centre HUT"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      {/* ESPACES */}
      <section className="section" style={{ background: "var(--paper)" }}>
        <div className="container">
          <div className="section-head">
            <div>
              <Eyebrow style={{ marginBottom: 24 }}>Les espaces</Eyebrow>
              <h2>Un lieu,<br /><em className="display-italic">mille visages.</em></h2>
            </div>
            <p>
              Chaque espace du Centre HUT a été pensé pour accueillir une qualité particulière
              de présence. Ensemble, ils forment un écosystème de transformation.
            </p>
          </div>

          <div className="rg-2" style={{ gap: 18 }}>
            {espaces.map((e, i) => (
              <div key={i} className="card-hover" data-reveal="" data-reveal-delay={String(i % 2)} style={{ padding: "44px 34px", background: "var(--white)", border: "1px solid var(--line)", borderRadius: 16 }}>
                <div style={{ width: 48, height: 48, border: "1px solid var(--blue)", display: "grid", placeItems: "center", marginBottom: 28, color: "var(--blue)", fontSize: 22 }}>
                  {e.glyph}
                </div>
                <h3 className="display" style={{ fontSize: 28, color: "var(--navy)", margin: "0 0 16px", lineHeight: 1.2 }}>{e.nom}</h3>
                <hr className="filet" style={{ marginBottom: 18 }} />
                <p style={{ fontSize: 15, lineHeight: 1.65, color: "var(--mute)", margin: 0 }}>{e.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-tight sec-blue" style={{ background: "linear-gradient(150deg, #142579 0%, #0f1d6e 50%, #0a1450 100%)", textAlign: "center" }}>
        <div className="container-narrow">
          <Eyebrow style={{ marginBottom: 24, color: "var(--gold)" }}>Premier pas</Eyebrow>
          <h3 className="display" style={{ fontSize: 36, margin: "0 0 24px", color: "var(--white)", lineHeight: 1.1 }}>
            Venez vivre<br /><em className="display-italic" style={{ color: "var(--gold)" }}>le Centre HUT.</em>
          </h3>
          <p style={{ fontSize: 17, lineHeight: 1.7, color: "rgba(255,255,255,0.72)", maxWidth: 520, margin: "0 auto 36px" }}>
            Le Centre HUT est accessible dans le cadre de l&apos;Offre Gold.
            Réservez votre appel découverte pour en savoir plus.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/contact" className="btn btn-gold">
              Réserver un appel <Arrow />
            </Link>
            <Link href="/offre-gold" className="btn btn-ghost" style={{ color: "var(--white)", borderColor: "rgba(255,255,255,0.3)" }}>
              Découvrir l&apos;Offre Gold
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
