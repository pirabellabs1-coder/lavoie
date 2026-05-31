import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Masterclass — Formations & ateliers de transformation",
  description:
    "Masterclasses en ligne et en présentiel animées par Domoina. Plongez dans les méthodes AIME, V.I.E. et Cycle des Saisons à travers des formations intensives.",
  alternates: { canonical: "/masterclass" },
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

const masterclasses = [
  {
    type: "En ligne",
    titre: "Les 5 Blessures Originelles : les reconnaître et les transformer",
    description: "Une masterclass intense de 3h pour identifier vos blessures fondamentales et entamer le chemin de leur transformation. Théorie, pratique et exercices en direct.",
    date: "15 juin 2026",
    heure: "14h – 17h",
    places: "25 places",
    prix: "197 €",
    tag: "Parcours AIME",
  },
  {
    type: "En ligne",
    titre: "Introduction à la Voie Initiatique de l'Eau",
    description: "Découvrez les fondements de la méthode V.I.E., son ancrage scientifique et ancestral, et les premières pratiques que vous pouvez intégrer chez vous dès ce soir.",
    date: "2 juillet 2026",
    heure: "18h30 – 20h30",
    places: "40 places",
    prix: "97 €",
    tag: "Méthode V.I.E.",
  },
  {
    type: "Présentiel",
    titre: "Journée Immersive : Cycle des Saisons — L'Été",
    description: "Une journée entière au Centre HUT pour explorer l'énergie de l'été — expansion, action, rayonnement. Pratiques en nature, méditations guidées et partages en groupe.",
    date: "19 juillet 2026",
    heure: "9h – 18h",
    places: "12 places",
    prix: "350 €",
    tag: "Cycle des Saisons",
  },
];

const replays = [
  {
    titre: "Leadership et blessures : comment votre passé dirige votre équipe",
    duree: "2h 45min",
    date: "Mars 2026",
    tag: "Leadership",
    prix: "47 €",
  },
  {
    titre: "L'eau et la mémoire émotionnelle : une approche scientifique",
    duree: "1h 30min",
    date: "Février 2026",
    tag: "Méthode V.I.E.",
    prix: "37 €",
  },
  {
    titre: "Hiver intérieur : s'autoriser le repos pour mieux renaître",
    duree: "2h 10min",
    date: "Janvier 2026",
    tag: "Cycle des Saisons",
    prix: "37 €",
  },
];

export default function Masterclass() {
  return (
    <div className="page-fade">

      {/* HERO */}
      <section className="page-hero" style={{ background: "var(--navy)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="container-narrow" style={{ textAlign: "center" }}>
          <Eyebrow style={{ marginBottom: 32, color: "var(--gold)" }}>Formations · Ateliers</Eyebrow>
          <h1 className="display" style={{ fontSize: "clamp(32px, 4vw, 64px)", margin: "0 0 28px", lineHeight: 1.05, color: "var(--white)" }}>
            Master<em className="display-italic" style={{ color: "var(--gold)" }}>class.</em>
          </h1>
          <hr className="filet" style={{ margin: "0 auto 32px" }} />
          <p style={{ fontSize: 18, lineHeight: 1.7, color: "rgba(255,255,255,0.72)", maxWidth: 560, margin: "0 auto" }}>
            Des formations intenses pour approfondir les méthodes de Domoina,
            en ligne ou au cœur du Centre HUT.
          </p>
        </div>
      </section>

      {/* MASTERCLASSES À VENIR */}
      <section className="section" style={{ background: "var(--white)" }}>
        <div className="container">
          <div className="section-head">
            <div>
              <Eyebrow style={{ marginBottom: 24 }}>Prochaines sessions</Eyebrow>
              <h2>Masterclass<br /><em className="display-italic">à venir.</em></h2>
            </div>
            <p>
              Trois formats, trois profondeurs. Chaque masterclass est conçue pour
              être une expérience complète en elle-même.
            </p>
          </div>

          <div style={{ display: "grid", gap: 0, border: "1px solid var(--line)" }}>
            {masterclasses.map((m, i) => (
              <div key={i} style={{ padding: "44px 48px", borderBottom: i < masterclasses.length - 1 ? "1px solid var(--line)" : 0 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 40, alignItems: "start" }}>
                  <div>
                    <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                      <span className="pill pill-gold">{m.tag}</span>
                      <span className="pill">{m.type}</span>
                    </div>
                    <h3 className="display" style={{ fontSize: 28, color: "var(--navy)", margin: "0 0 14px", lineHeight: 1.2 }}>{m.titre}</h3>
                    <p style={{ fontSize: 15, lineHeight: 1.7, color: "var(--mute)", margin: "0 0 20px" }}>{m.description}</p>
                    <div style={{ display: "flex", gap: 28 }}>
                      <span style={{ fontSize: 12, fontFamily: "var(--sans)", color: "var(--mute)", letterSpacing: ".05em" }}>
                        📅 {m.date} · {m.heure}
                      </span>
                      <span style={{ fontSize: 12, fontFamily: "var(--sans)", color: "var(--mute)", letterSpacing: ".05em" }}>
                        ◉ {m.places}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p className="num" style={{ fontSize: 40, color: "var(--navy)", margin: "0 0 16px" }}>{m.prix}</p>
                    <Link href="/contact" className="btn btn-primary">
                      S&apos;inscrire <Arrow />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REPLAYS */}
      <section className="section" style={{ background: "var(--paper)" }}>
        <div className="container">
          <div className="section-head">
            <div>
              <Eyebrow style={{ marginBottom: 24 }}>Disponibles maintenant</Eyebrow>
              <h2>Replays des<br /><em className="display-italic">masterclass.</em></h2>
            </div>
            <p>
              Revivez les sessions passées à votre rythme. Accès illimité après achat,
              contenu de même niveau que les sessions en direct.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0, border: "1px solid var(--line)" }}>
            {replays.map((r, i) => (
              <div key={i} style={{ background: "var(--white)", borderRight: i < 2 ? "1px solid var(--line)" : 0, overflow: "hidden" }}>
                {/* Thumbnail */}
                <div style={{ aspectRatio: "16/9", background: "var(--navy)", display: "grid", placeItems: "center", position: "relative" }}>
                  <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--gold)", display: "grid", placeItems: "center" }}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M5 3l12 7-12 7V3z" fill="var(--navy-ink)" />
                    </svg>
                  </div>
                  <span style={{ position: "absolute", bottom: 12, right: 12, fontSize: 11, fontFamily: "var(--sans)", background: "rgba(14,26,74,0.85)", color: "var(--white)", padding: "4px 8px" }}>
                    {r.duree}
                  </span>
                </div>
                <div style={{ padding: "28px 28px 32px" }}>
                  <span className="pill pill-gold" style={{ marginBottom: 16, display: "inline-block" }}>{r.tag}</span>
                  <h3 className="display" style={{ fontSize: 22, color: "var(--navy)", margin: "0 0 20px", lineHeight: 1.25 }}>{r.titre}</h3>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 16, borderTop: "1px solid var(--line)" }}>
                    <span style={{ fontSize: 12, color: "var(--mute)", fontFamily: "var(--sans)" }}>{r.date}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <span className="display" style={{ fontSize: 24, color: "var(--navy)" }}>{r.prix}</span>
                      <Link href="/contact" className="btn btn-ghost" style={{ padding: "8px 16px", fontSize: 12 }}>Acheter</Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SUR MESURE */}
      <section className="section-tight" style={{ background: "var(--navy)", textAlign: "center" }}>
        <div className="container-narrow">
          <Eyebrow style={{ marginBottom: 24, color: "var(--gold)" }}>Sur mesure</Eyebrow>
          <h3 className="display" style={{ fontSize: 36, margin: "0 0 24px", color: "var(--white)", lineHeight: 1.1 }}>
            Une formation pour<br /><em className="display-italic" style={{ color: "var(--gold)" }}>votre équipe ?</em>
          </h3>
          <p style={{ fontSize: 17, lineHeight: 1.7, color: "rgba(255,255,255,0.72)", maxWidth: 520, margin: "0 auto 36px" }}>
            Domoina propose des masterclass et ateliers sur mesure pour les entreprises.
            Contactez-nous pour en discuter.
          </p>
          <Link href="/contact" className="btn btn-gold">
            Discuter d&apos;un projet <Arrow />
          </Link>
        </div>
      </section>

    </div>
  );
}
