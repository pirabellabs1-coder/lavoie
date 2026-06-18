import type { Metadata } from "next";
import Link from "next/link";
import Placeholder from "@/components/Placeholder";

export const metadata: Metadata = {
  title: "Les Méthodes — AIME, V.I.E., Cycle des Saisons",
  description:
    "Trois méthodes propriétaires codifiées sur quinze ans : AIME, la Voie Initiatique de l'Eau et le Cycle des Saisons.",
  alternates: { canonical: "/methodes" },
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

const aimePhases = [
  { letter: "A", word: "Accepter", sub: "Reconnaître ce qui est", body: "La première phase ne demande rien d'autre que de regarder. Sans réparer, sans projeter, sans rien vouloir d'autre que de voir ce qui se présente — tel quel." },
  { letter: "I", word: "Intégrer", sub: "Digérer le passé", body: "Ce que la vie a déposé — les héritages, les chocs, les loyautés invisibles — demande à être traversé, nommé, intégré. Le travail rituel et somatique soutient ce passage." },
  { letter: "M", word: "Manifester", sub: "Créer consciemment", body: "À mesure que l'axe se redresse, la capacité de manifester s'affine. Non plus produire pour combler, mais créer depuis l'essence — projets, liens, structures." },
  { letter: "E", word: "Élever", sub: "Rayonner son excellence", body: "La dernière phase n'est pas une arrivée mais une mise en circulation. Ce qui a été dénoué se met à servir — d'autres, plus grand que soi." },
];

const viePillars = [
  { t: "Purification", b: "Rituels d'eau hérités de plusieurs traditions — Japon, Maroc, Madagascar — adaptés au contexte contemporain." },
  { t: "Immersions rituelles", b: "Bains rituels en source naturelle au Centre HUT, encadrés et préparés selon un protocole précis." },
  { t: "Travail respiratoire", b: "Pranayama, holotropie douce, apnée méditative — la respiration comme pont entre corps et conscience." },
  { t: "Mémoire de l'eau", b: "Travail symbolique et somatique sur la mémoire portée par l'eau — héritages, lignées, archives corporelles." },
  { t: "Méditation aquatique", b: "Pratiques contemplatives en immersion partielle — flottaison, écoute, présence prolongée à l'élément." },
];

const saisons = [
  { season: "Automne", sub: "Lâcher-prise", isGold: false, body: "Le temps du discernement et du dépôt : on récolte, on rend, on laisse partir ce qui doit l'être.", glyph: "❦" },
  { season: "Hiver", sub: "Racines profondes", isGold: true, body: "Le temps du retrait et de la nuit longue : on descend vers la racine, on écoute, on se régénère.", glyph: "❄" },
  { season: "Printemps", sub: "Élan de vie", isGold: false, body: "Le temps du jaillissement : ce qui a mûri sous terre se déploie. On formule, on s'engage.", glyph: "✿" },
  { season: "Été", sub: "Rayonnement", isGold: true, body: "Le temps de la pleine lumière : incarnation, ampleur et rayonnement de ce qui est devenu juste.", glyph: "☀" },
];

export default function MethodesPage() {
  return (
    <div className="page-fade">

      {/* HERO */}
      <section className="page-hero" style={{ background: "var(--white)", borderBottom: "1px solid var(--line)" }}>
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: 980, margin: "0 auto" }}>
            <Eyebrow style={{ marginBottom: 32 }}>Trois méthodes propriétaires</Eyebrow>
            <h1 className="display" style={{ fontSize: "clamp(32px, 4vw, 64px)", margin: "0 0 28px", lineHeight: 1.05 }}>
              Les <em className="display-italic">Méthodes.</em>
            </h1>
            <hr className="filet" style={{ margin: "0 auto 32px" }} />
            <p style={{ fontSize: 18, lineHeight: 1.7, color: "var(--navy-ink)", maxWidth: 660, margin: "0 auto" }}>
              Trois constructions distinctes, complémentaires, codifiées sur quinze ans de pratique.
              Elles se combinent au sein des Immersions Gold — jamais ne se substituent au temps long du vivant.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 56, flexWrap: "wrap" }}>
              <a href="#aime" className="pill">I · AIME</a>
              <a href="#vie" className="pill">II · V.I.E.</a>
              <a href="#cycle" className="pill">III · Cycle des Saisons</a>
            </div>
          </div>
        </div>
      </section>

      {/* AIME */}
      <section id="aime" className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="card-num" style={{ fontSize: 16, marginBottom: 16 }}>Méthode I.</p>
              <h2 style={{ fontSize: 88 }}>AIME</h2>
              <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 24, color: "var(--navy)", margin: "12px 0 0", fontWeight: 300 }}>
                Le parcours signature en quatre phases.
              </p>
            </div>
            <div>
              <hr className="filet" style={{ marginBottom: 24 }} />
              <p style={{ fontSize: 17, lineHeight: 1.7, color: "var(--navy-ink)", margin: 0 }}>
                <strong style={{ fontWeight: 500 }}>A</strong>ccepter ·{" "}
                <strong style={{ fontWeight: 500 }}>I</strong>ntégrer ·{" "}
                <strong style={{ fontWeight: 500 }}>M</strong>anifester ·{" "}
                <strong style={{ fontWeight: 500 }}>É</strong>lever.
                Quatre phases qui ne se sautent pas, qui ne se forcent pas, et qui ne reviennent
                jamais au même point après les avoir traversées.
              </p>
            </div>
          </div>

          <div className="rg-4" style={{ gap: 1, background: "var(--line)", border: "1px solid var(--line)" }}>
            {aimePhases.map((p, i) => (
              <div key={i} data-reveal="" data-reveal-delay={String(i)} style={{ padding: "48px 32px", background: i % 2 === 0 ? "var(--white)" : "var(--paper)", position: "relative", overflow: "hidden" }}>
                <span className="display" style={{ fontSize: 200, color: "rgba(7,16,60,0.06)", position: "absolute", top: -30, right: 12, lineHeight: 1, fontWeight: 400, pointerEvents: "none" }}>
                  {p.letter}
                </span>
                <p className="card-num" style={{ fontSize: 14, marginBottom: 8 }}>Phase {i + 1}/4</p>
                <h3 className="display" style={{ fontSize: 38, color: "var(--navy)", margin: "12px 0 4px", position: "relative" }}>{p.word}</h3>
                <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 15, color: "var(--gold)", margin: "0 0 24px", position: "relative" }}>{p.sub}</p>
                <hr className="filet" style={{ marginBottom: 20 }} />
                <p style={{ fontSize: 14, lineHeight: 1.65, color: "var(--navy-ink)", margin: 0, position: "relative" }}>{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="filet-gold-full" />

      {/* V.I.E. */}
      <section id="vie" className="section" style={{ background: "var(--navy)", color: "var(--white)" }}>
        <div className="container">
          <div className="rg-split" style={{ gap: 80, alignItems: "center" }}>
            <div>
              <p className="card-num" style={{ fontSize: 16, marginBottom: 16, color: "var(--gold)" }}>Méthode II.</p>
              <h2 className="display" style={{ fontSize: 56, margin: "0 0 8px", color: "var(--white)", lineHeight: 1.05 }}>V.I.E.</h2>
              <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 17, color: "var(--gold)", margin: "0 0 32px", fontWeight: 300 }}>
                Voie Initiatique de l&apos;Eau.
              </p>
              <hr className="filet" style={{ marginBottom: 28 }} />
              <p style={{ fontSize: 16.5, lineHeight: 1.75, color: "rgba(255,255,255,0.85)", margin: "0 0 22px" }}>
                Codifiée en 2014 après trois années de recherche sur les traditions rituelles aquatiques.
                Une pratique fondée sur le pouvoir transformateur de l&apos;eau — médium ancestral, médiateur clinique, miroir somatique.
              </p>
              <p style={{ fontSize: 16.5, lineHeight: 1.75, color: "rgba(255,255,255,0.7)", margin: 0 }}>
                Cinq piliers, jamais isolés, toujours tissés ensemble dans la durée d&apos;une Immersion.
              </p>
            </div>
            <Placeholder
              mark="01"
              style={{ aspectRatio: "5/6", border: "1px solid rgba(255,255,255,0.15)" }}
              src="https://images.unsplash.com/photo-1540206395-68808572332f?w=900&q=80&auto=format&fit=crop"
              alt="Voie Initiatique de l'Eau — rituel au Centre HUT"
              sizes="(max-width: 768px) 100vw, 45vw"
            />
          </div>

          <div style={{ marginTop: 80 }}>
            <p className="eyebrow" style={{ color: "var(--gold)", marginBottom: 40 }}>
              <span className="dot" />Les cinq piliers<span className="dot" />
            </p>
            <div className="rg-5" style={{ gap: 1, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.15)" }}>
              {viePillars.map((v, i) => (
                <div key={i} data-reveal="" data-reveal-delay={String(i)} style={{ padding: "32px 24px", background: "var(--navy)" }}>
                  <span className="card-num" style={{ fontSize: 12 }}>0{i + 1}.</span>
                  <h4 className="display" style={{ fontSize: 24, color: "var(--white)", margin: "14px 0 16px", lineHeight: 1.15 }}>{v.t}</h4>
                  <hr className="filet" style={{ marginBottom: 18, width: 40 }} />
                  <p style={{ fontSize: 13.5, lineHeight: 1.65, color: "rgba(255,255,255,0.72)", margin: 0 }}>{v.b}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CYCLE DES SAISONS */}
      <section id="cycle" className="section" style={{ background: "var(--paper)" }}>
        <div className="container">
          <div className="section-head">
            <div>
              <p className="card-num" style={{ fontSize: 16, marginBottom: 16 }}>Méthode III.</p>
              <h2>Cycle des<br /><em className="display-italic">Saisons.</em></h2>
            </div>
            <p>
              Un accompagnement qui suit le rythme du vivant. Quatre temps, quatre qualités d&apos;énergie,
              quatre modes d&apos;être. Pas de progression linéaire — un cycle, qui repasse, qui s&apos;approfondit.
            </p>
          </div>

          <div className="rg-4" style={{ gap: 0 }}>
            {saisons.map((s, i) => (
              <div key={i} style={{ padding: "56px 32px", background: s.isGold ? "var(--gold)" : "var(--navy)", color: s.isGold ? "var(--navy-ink)" : "var(--white)", position: "relative", minHeight: 360, display: "flex", flexDirection: "column" }}>
                <p className="card-num" style={{ fontSize: 13, marginBottom: 12, color: s.isGold ? "var(--navy)" : "var(--gold)" }}>
                  {String(i + 1).padStart(2, "0")} / 04
                </p>
                <h3 className="display" style={{ fontSize: 36, margin: "0 0 6px", lineHeight: 1.1, color: s.isGold ? "var(--navy-ink)" : "var(--white)" }}>{s.season}</h3>
                <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 17, margin: "0 0 28px", color: s.isGold ? "var(--navy)" : "var(--gold)" }}>{s.sub}</p>
                <hr style={{ width: 40, height: 2, border: 0, background: s.isGold ? "var(--navy)" : "var(--gold)", marginBottom: 24 }} />
                <p style={{ fontSize: 14.5, lineHeight: 1.7, margin: 0, color: s.isGold ? "var(--navy-ink)" : "rgba(255,255,255,0.85)" }}>{s.body}</p>
                <div style={{ position: "absolute", top: 24, right: 24, width: 40, height: 40, borderRadius: "50%", border: `1px solid ${s.isGold ? "rgba(14,26,74,0.3)" : "rgba(255,255,255,0.3)"}`, display: "grid", placeItems: "center" }}>
                  <span style={{ fontSize: 18 }}>{s.glyph}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-tight" style={{ background: "var(--white)", textAlign: "center", borderTop: "3px solid var(--gold)" }}>
        <div className="container-narrow">
          <Eyebrow style={{ marginBottom: 24 }}>Les méthodes s&apos;incarnent dans l&apos;Offre Gold</Eyebrow>
          <h3 className="display" style={{ fontSize: 36, margin: "0 0 24px", lineHeight: 1.1 }}>
            Lire l&apos;offre<br /><em className="display-italic">qui les met en œuvre.</em>
          </h3>
          <p style={{ fontSize: 17, lineHeight: 1.7, color: "var(--mute)", maxWidth: 560, margin: "0 auto 36px" }}>
            Trois niveaux d&apos;accompagnement — Essence, Expansion, Royale — qui mobilisent
            AIME, V.I.E. et le Cycle des Saisons selon votre rythme.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/offre-gold" className="btn btn-primary">Découvrir l&apos;Offre Gold <Arrow /></Link>
            <Link href="/contact" className="btn btn-ghost">Réserver un appel</Link>
          </div>
        </div>
      </section>

    </div>
  );
}
