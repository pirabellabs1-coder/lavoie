import type { Metadata } from "next";
import Link from "next/link";
import Placeholder from "@/components/Placeholder";

export const metadata: Metadata = {
  title: "Domoina — Guide initiatique & thérapeute",
  description:
    "Quinze ans de pratique, trois méthodes propriétaires, cinq cents personnes accompagnées. Découvrez le parcours de Domoina, fondatrice de La Voie 2 la Conscience.",
  alternates: { canonical: "/domoina" },
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

const valeurs = [
  {
    num: "I.",
    title: "Bienveillance radicale",
    body: "Aucun jugement, aucune complaisance. Une présence qui accueille ce qui est, et qui ne renonce pas à ce qui pourrait devenir.",
  },
  {
    num: "II.",
    title: "L'eau comme maître",
    body: "L'eau enseigne la patience, la mémoire, l'adaptation. Elle est le matériau, le médium et le miroir du travail initiatique.",
  },
  {
    num: "III.",
    title: "Enracinement & élévation",
    body: "Pas d'envol sans ancrage. Pas d'ancrage sans verticalité. Toute transformation profonde se joue dans cette double tension.",
  },
];

const timeline = [
  { year: "2008", title: "Début de la pratique", body: "Premières années d'accompagnement en thérapie individuelle, formation continue en science initiatique." },
  { year: "2011", title: "Recherche sur l'eau", body: "Trois années de recherche personnelle sur les traditions rituelles de l'eau — du Japon au Maroc." },
  { year: "2014", title: "Création de V.I.E.", body: "Codification de la Voie Initiatique de l'Eau. Premières cohortes restreintes de huit personnes." },
  { year: "2017", title: "Ouverture du Centre HUT", body: "Acquisition et restauration du domaine de 1 100 hectares en Sarthe. Premier stage immersif." },
  { year: "2019", title: "Méthode AIME", body: "Formalisation du parcours signature en quatre phases — Accepter, Intégrer, Manifester, Élever." },
  { year: "2022", title: "500 accompagnements", body: "Cap symbolique des cinq cents personnes accompagnées. Lancement de la communauté alumni." },
];

export default function DomoinaPage() {
  return (
    <div className="page-fade">

      {/* HERO */}
      <section className="page-hero" style={{ background: "var(--white)", borderBottom: "1px solid var(--line)" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 100, alignItems: "center" }}>
            <div>
              <Eyebrow style={{ marginBottom: 32 }}>La fondatrice · Guide initiatique</Eyebrow>
              <h1 className="display" style={{ fontSize: "clamp(36px, 4.5vw, 72px)", margin: "0 0 24px", lineHeight: 1.05 }}>
                Domoina
              </h1>
              <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 17, color: "var(--navy)", margin: "0 0 32px", fontWeight: 300 }}>
                Guide initiatique &amp; thérapeute.
              </p>
              <hr className="filet" style={{ marginBottom: 32 }} />
              <p style={{ fontSize: 18, lineHeight: 1.7, color: "var(--navy-ink)", maxWidth: 480 }}>
                Quinze ans de pratique. Trois méthodes propriétaires. Cinq cents personnes accompagnées.
                Une promesse, toujours la même&nbsp;: vous ramener à votre essence.
              </p>
            </div>
            <Placeholder
              mark="01"
              style={{ aspectRatio: "3/4" }}
              src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=900&q=80&auto=format&fit=crop"
              alt="Portrait de Domoina — guide initiatique"
              sizes="(max-width: 768px) 100vw, 45vw"
            />
          </div>
        </div>
      </section>

      {/* BIOGRAPHY */}
      <section className="section">
        <div className="container-narrow">
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <Eyebrow>Le parcours</Eyebrow>
            <h2 className="display" style={{ fontSize: 36, margin: "24px 0 0", lineHeight: 1.1 }}>
              <em className="display-italic">Une vocation</em> qui<br />n&apos;a pas eu d&apos;autre choix.
            </h2>
          </div>

          <div style={{ display: "grid", gap: 28 }}>
            <p style={{ fontFamily: "var(--serif)", fontSize: 22, lineHeight: 1.55, color: "var(--navy)", margin: 0 }}>
              <span style={{ fontSize: 64, float: "left", lineHeight: 0.85, marginRight: 12, color: "var(--gold)" }}>D</span>
              omoina a grandi entre deux îles, deux langues, deux héritages. De son enfance,
              elle a gardé le sens du rituel et l&apos;attention donnée à ce qui ne se dit pas.
              De sa formation occidentale en psychologie clinique, la rigueur clinique du regard.
            </p>
            <p style={{ fontSize: 16.5, lineHeight: 1.85, color: "var(--navy-ink)", margin: 0 }}>
              Sa pratique s&apos;est construite à l&apos;endroit où ces deux mondes se rencontrent —
              entre la science initiatique et la sagesse ancestrale, entre le cabinet et le sanctuaire,
              entre le mot juste et le silence qui le précède.
            </p>
            <p style={{ fontSize: 16.5, lineHeight: 1.85, color: "var(--navy-ink)", margin: 0 }}>
              En 2014, elle codifie la <strong style={{ fontWeight: 500 }}>Voie Initiatique de l&apos;Eau</strong> —
              fruit de trois années de recherche sur les traditions rituelles aquatiques. En 2017,
              elle ouvre le <strong style={{ fontWeight: 500 }}>Centre HUT</strong>, sanctuaire de 1&nbsp;100 hectares en Sarthe,
              destiné aux stages immersifs.
            </p>
            <p style={{ fontSize: 16.5, lineHeight: 1.85, color: "var(--navy-ink)", margin: 0 }}>
              Aujourd&apos;hui, plus de cinq cents personnes — dirigeants, cadres supérieurs, thérapeutes —
              ont traversé l&apos;une de ses Immersions. Sa pratique reste volontairement restreinte&nbsp;:
              une cohorte limitée, un accompagnement long, un engagement total.
            </p>
          </div>

          <div style={{ display: "flex", justifyContent: "center", marginTop: 56, gap: 60, flexWrap: "wrap" }}>
            {[{ n: "15", label: "Années de pratique" }, { n: "3", label: "Méthodes propriétaires" }, { n: "500+", label: "Accompagnements" }].map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <p className="num" style={{ fontSize: 56, color: "var(--navy)", margin: 0 }}>{s.n}</p>
                <p className="small muted" style={{ letterSpacing: ".16em", textTransform: "uppercase", margin: "4px 0 0", fontSize: 10.5 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="filet-gold-full" />

      {/* VALEURS */}
      <section className="section" style={{ background: "var(--navy)", color: "var(--white)" }}>
        <div className="container">
          <div className="section-head">
            <div>
              <Eyebrow style={{ color: "var(--gold)" }}>Trois principes</Eyebrow>
              <h2 style={{ color: "var(--white)", marginTop: 24 }}>
                <em className="display-italic" style={{ color: "var(--gold)" }}>Les valeurs</em><br />de la pratique.
              </h2>
            </div>
            <p style={{ color: "rgba(255,255,255,0.72)" }}>
              Trois principes qui guident chaque rencontre, chaque rituel, chaque silence.
              Ils ne se discutent pas — ils s&apos;éprouvent.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0, border: "1px solid rgba(255,255,255,0.15)" }}>
            {valeurs.map((v, i) => (
              <div key={i} data-reveal="" data-reveal-delay={String(i)} style={{ padding: "50px 40px", borderRight: i < 2 ? "1px solid rgba(255,255,255,0.15)" : 0 }}>
                <span className="card-num" style={{ fontSize: 16 }}>{v.num}</span>
                <h3 className="display" style={{ fontSize: 38, color: "var(--white)", margin: "24px 0 24px", lineHeight: 1.1 }}>{v.title}</h3>
                <hr className="filet" style={{ marginBottom: 24 }} />
                <p style={{ fontSize: 15, lineHeight: 1.7, color: "rgba(255,255,255,0.78)", margin: 0 }}>{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <Eyebrow style={{ marginBottom: 24 }}>Chronologie</Eyebrow>
              <h2>2008 — 2022,<br /><em className="display-italic">les jalons.</em></h2>
            </div>
            <p>
              Quinze années de construction patiente. Pas de virage spectaculaire — la lente fidélité
              d&apos;un travail qui se laisse approfondir par le temps.
            </p>
          </div>

          <div style={{ position: "relative", paddingLeft: 80 }}>
            <div style={{ position: "absolute", left: 100, top: 12, bottom: 12, width: 1, background: "var(--line)" }} />
            {timeline.map((t, i) => (
              <div key={i} data-reveal="" data-reveal-delay={String(i % 4)} style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 60, paddingBottom: 56, position: "relative" }}>
                <div style={{ textAlign: "right", paddingRight: 60, position: "relative" }}>
                  <p className="num" style={{ fontSize: 44, color: "var(--gold)", margin: 0, lineHeight: 1 }}>{t.year}</p>
                  <div style={{ position: "absolute", right: -3, top: 18, width: 7, height: 7, borderRadius: "50%", background: "var(--navy)", border: "2px solid var(--paper)" }} />
                </div>
                <div style={{ paddingTop: 6 }}>
                  <h4 className="display" style={{ fontSize: 28, color: "var(--navy)", margin: "0 0 12px", lineHeight: 1.2 }}>{t.title}</h4>
                  <p style={{ fontSize: 15.5, lineHeight: 1.75, color: "var(--mute)", margin: 0, maxWidth: 540 }}>{t.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-tight" style={{ background: "var(--white)", borderTop: "3px solid var(--gold)", borderBottom: "1px solid var(--line)" }}>
        <div className="container-narrow" style={{ textAlign: "center" }}>
          <Eyebrow style={{ marginBottom: 24 }}>Premier pas</Eyebrow>
          <h3 className="display" style={{ fontSize: 36, margin: "0 0 24px", lineHeight: 1.1 }}>
            Rencontrer Domoina,<br /><em className="display-italic">trente minutes.</em>
          </h3>
          <p style={{ fontSize: 17, lineHeight: 1.7, color: "var(--mute)", maxWidth: 560, margin: "0 auto 36px" }}>
            Un appel découverte de trente minutes, offert et sans engagement. C&apos;est ainsi que tout commence.
          </p>
          <Link href="/contact" className="btn btn-primary">
            Réserver un appel découverte <Arrow />
          </Link>
        </div>
      </section>

    </div>
  );
}
