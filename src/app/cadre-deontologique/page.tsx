import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cadre Déontologique — Engagements éthiques de Domoina",
  description:
    "Découvrez le cadre éthique et déontologique qui guide la pratique de Domoina : confidentialité, bienveillance, limites professionnelles et engagements envers les accompagnés.",
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

const principes = [
  {
    glyph: "🔒",
    titre: "Confidentialité absolue",
    texte: "Tout ce qui est partagé dans le cadre de l'accompagnement est strictement confidentiel. Aucune information personnelle ne sera divulguée sans votre consentement explicite.",
  },
  {
    glyph: "♡",
    titre: "Bienveillance & non-jugement",
    texte: "Chaque personne est accueillie avec une présence totale et sans jugement. L'espace d'accompagnement est un lieu de sécurité absolue où chacun peut être pleinement lui-même.",
  },
  {
    glyph: "◎",
    titre: "Clarté des limites",
    texte: "Mon rôle est celui d'une guide, non d'une thérapeute clinique ou d'une médecin. Je travaille en complémentarité avec les professionnels de santé et n'empiète pas sur leurs domaines.",
  },
  {
    glyph: "◈",
    titre: "Intégrité & transparence",
    texte: "Je m'engage à une totale transparence sur mes méthodes, mes intentions et mes limites de compétences. Je ne ferai jamais de promesses que je ne peux pas tenir.",
  },
];

const details = [
  {
    titre: "Consentement éclairé",
    corps: "Chaque accompagnement débute par une présentation claire des méthodes, des objectifs et du cadre de travail. Vous consentez explicitement à chaque étape de votre parcours. Vous pouvez interrompre ou modifier l'accompagnement à tout moment.",
  },
  {
    titre: "Complémentarité médicale",
    corps: "Mon travail est complémentaire — et non substitutif — d'un suivi médical ou psychologique. En cas de détresse sévère, de trouble psychiatrique diagnostiqué ou de crise aiguë, je vous oriente vers les professionnels de santé compétents et maintiens ce suivi en parallèle si vous le souhaitez.",
  },
  {
    titre: "Relation d'accompagnement",
    corps: "La relation entre Domoina et les personnes accompagnées est une relation professionnelle. Elle ne peut en aucun cas évoluer vers une relation personnelle, affective ou financière autre que celle définie dans le contrat d'accompagnement.",
  },
  {
    titre: "Supervision & formation continue",
    corps: "Je suis moi-même supervisée régulièrement et maintiens une démarche de formation continue pour garantir la qualité et l'évolution de ma pratique.",
  },
  {
    titre: "Traitement des données personnelles",
    corps: "Les données personnelles collectées dans le cadre de l'accompagnement sont traitées conformément au RGPD. Elles ne sont jamais partagées avec des tiers. Vous disposez d'un droit d'accès, de rectification et de suppression de vos données.",
  },
];

export default function CadreDeontologique() {
  return (
    <div className="page-fade">

      {/* HERO */}
      <section className="page-hero" style={{ background: "var(--white)", borderBottom: "1px solid var(--line)" }}>
        <div className="container-narrow" style={{ textAlign: "center" }}>
          <Eyebrow style={{ marginBottom: 32 }}>Éthique &amp; engagements</Eyebrow>
          <h1 className="display" style={{ fontSize: "clamp(28px, 3.2vw, 52px)", margin: "0 0 28px", lineHeight: 1.05 }}>
            Cadre<br /><em className="display-italic">Déontologique.</em>
          </h1>
          <hr className="filet" style={{ margin: "0 auto 32px" }} />
          <p style={{ fontSize: 18, lineHeight: 1.7, color: "var(--navy-ink)", maxWidth: 600, margin: "0 auto" }}>
            L&apos;accompagnement de Domoina repose sur une éthique rigoureuse.
            Voici les engagements qui structurent notre relation.
          </p>
        </div>
      </section>

      {/* PRINCIPES */}
      <section className="section">
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 0, border: "1px solid var(--line)", marginBottom: 80 }}>
            {principes.map((p, i) => (
              <div key={i} data-reveal="" data-reveal-delay={String(i % 2)} style={{
                padding: "44px 40px",
                borderRight: i % 2 === 0 ? "1px solid var(--line)" : 0,
                borderBottom: i < 2 ? "1px solid var(--line)" : 0,
                background: "var(--white)",
              }}>
                <div style={{ width: 40, height: 40, border: "1px solid var(--gold)", display: "grid", placeItems: "center", marginBottom: 24, color: "var(--gold)", fontSize: 18 }}>
                  ✦
                </div>
                <h3 className="display" style={{ fontSize: 26, color: "var(--navy)", margin: "0 0 16px", lineHeight: 1.2 }}>{p.titre}</h3>
                <hr className="filet" style={{ marginBottom: 18 }} />
                <p style={{ fontSize: 15, lineHeight: 1.7, color: "var(--mute)", margin: 0 }}>{p.texte}</p>
              </div>
            ))}
          </div>

          {/* DÉTAIL */}
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <Eyebrow style={{ marginBottom: 24 }}>La pratique en détail</Eyebrow>
              <h2 className="display" style={{ fontSize: 48, margin: 0, lineHeight: 1.05 }}>
                Cinq engagements,<br /><em className="display-italic">sans exception.</em>
              </h2>
            </div>

            <div style={{ display: "grid", gap: 0, border: "1px solid var(--line)" }}>
              {details.map((d, i) => (
                <div key={i} style={{ padding: "36px 40px", borderBottom: i < details.length - 1 ? "1px solid var(--line)" : 0 }}>
                  <h4 className="display" style={{ fontSize: 22, color: "var(--navy)", margin: "0 0 14px" }}>{d.titre}</h4>
                  <p style={{ fontSize: 15.5, lineHeight: 1.8, color: "var(--mute)", margin: 0 }}>{d.corps}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-tight" style={{ background: "var(--gold)", textAlign: "center" }}>
        <div className="container-narrow">
          <h3 className="display" style={{ fontSize: 48, margin: "0 0 20px", color: "var(--navy-ink)", lineHeight: 1.05 }}>
            Des questions sur<br /><em className="display-italic">le cadre ?</em>
          </h3>
          <p style={{ fontSize: 17, lineHeight: 1.7, color: "var(--navy)", maxWidth: 500, margin: "0 auto 36px" }}>
            Domoina répond à toutes vos questions avant le début d&apos;un accompagnement.
          </p>
          <Link href="/contact" className="btn btn-primary">
            Prendre contact <Arrow />
          </Link>
        </div>
      </section>

    </div>
  );
}
