import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mon Approche — 3 fondements, 4 piliers, la Zone d'E.A.U.",
  description:
    "L'approche de Domoïna Ramiadana : trois fondements (science initiatique, sagesse ancestrale, puissance de l'eau), quatre piliers (A.I.M.E., Cycle des Saisons, Ki-Zola, V.I.E.) et la Zone d'Excellence Authentique Unique.",
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

const fondements = [
  {
    num: "01",
    titre: "La Science Initiatique",
    role: "La compréhension",
    body: "Elle reconnaît qu'il existe des principes et des lois universelles du Vivant, qui agissent que nous les connaissions ou non. Lorsqu'elles sont transgressées — souvent dès l'enfance, ou à travers les blessures héritées de nos lignées — nous développons des stratégies de survie. Elles deviennent parfois nos talents ; mais derrière la performance se cache souvent une blessure qui cherche encore à être reconnue. La science initiatique rend visible l'invisible, pour retrouver cohérence, sens et liberté intérieure.",
  },
  {
    num: "02",
    titre: "La Sagesse Ancestrale",
    role: "L'ancrage",
    body: "Elle honore les savoirs transmis de génération en génération. Non pas des croyances, mais des connaissances éprouvées du corps, du lien, du rythme, de la nature et de la guérison. Bien avant les approches modernes, les peuples observaient les cycles du Vivant pour traverser les grandes étapes de l'existence. Cette sagesse nous rappelle que nous faisons partie d'un ensemble plus vaste, et que certaines réponses se trouvent dans la relation au Vivant lui-même.",
  },
  {
    num: "03",
    titre: "La Puissance Transformatrice de l'Eau",
    role: "La transformation",
    body: "L'eau est un élément vivant. Elle garde la mémoire. Elle révèle. Elle transforme. Depuis toujours, elle accompagne les grands passages de la vie : la naissance, les rituels de purification, les initiations, les renaissances. Elle permet au corps de relâcher ce que le mental ne peut parfois ni comprendre ni résoudre. Dans mon approche, l'eau n'est pas seulement un outil : elle est une alliée de la transformation.",
  },
];

const piliers = [
  {
    num: "I",
    titre: "Le Parcours A.I.M.E.",
    sub: "Accueillir · Identifier · Métamorphoser · Émerger",
    body: "La structure fondamentale du processus thérapeutique et initiatique — un voyage en quatre phases pour une véritable transmutation intérieure.",
  },
  {
    num: "II",
    titre: "Le Cycle des Saisons",
    sub: "Automne · Hiver · Printemps · Été",
    body: "Vivre en harmonie avec les rythmes naturels et reconnaître les étapes de son propre processus. Non plus lutter contre la vie, mais apprendre à coopérer avec elle.",
  },
  {
    num: "III",
    titre: "La Méthode Ki-Zola",
    sub: "Harmonisation émotionnelle & énergétique",
    body: "Une approche d'harmonisation émotionnelle, énergétique et relationnelle, qui restaure la circulation du Vivant dans les différentes dimensions de l'être et nourrit l'autonomie intérieure.",
  },
  {
    num: "IV",
    titre: "La V.I.E.",
    sub: "Voie Initiatique de l'Eau",
    body: "La renaissance, le passage, l'incarnation : une traversée par l'élément Eau — immersions, rituels intérieurs et voyages initiatiques (notamment à Madagascar).",
  },
];

const aimePhases = [
  { letter: "A", word: "Accueillir", sub: "Reconnaître ce qui est présent", body: "Accueillir ce qui est là, sans le fuir ni vouloir le réparer. Regarder en face ce qui se présente — tel quel." },
  { letter: "I", word: "Identifier", sub: "Mettre en lumière les mécanismes inconscients", body: "Rendre visibles les schémas, les loyautés invisibles et les stratégies de compensation héritées." },
  { letter: "M", word: "Métamorphoser", sub: "Transformer les blessures en ressources", body: "Le cœur du travail : transmuter la blessure en levier. Ce qui faisait souffrir devient force et finesse." },
  { letter: "É", word: "Émerger", sub: "Incarner une nouvelle manière d'être", body: "Non pas une arrivée, mais une naissance : incarner, au quotidien et dans ses relations, une manière d'être plus juste." },
];

const saisons = [
  { season: "Automne", sub: "Lâcher-prise", isGold: false, body: "Le temps du discernement et du dépôt : on récolte, on rend, on laisse partir ce qui doit l'être.", glyph: "❦" },
  { season: "Hiver", sub: "Racines profondes", isGold: true, body: "Le temps du retrait et de la nuit longue : on descend vers la racine, on écoute, on se régénère.", glyph: "❄" },
  { season: "Printemps", sub: "Élan de vie", isGold: false, body: "Le temps du jaillissement : ce qui a mûri sous terre se déploie. On formule, on s'engage.", glyph: "✿" },
  { season: "Été", sub: "Rayonnement", isGold: true, body: "Le temps de la pleine lumière : incarnation, ampleur et rayonnement de ce qui est devenu juste.", glyph: "☀" },
];

const eauPromesses = [
  "L'être et l'action sont alignés",
  "Les talents naturels peuvent pleinement s'exprimer",
  "La réussite retrouve du sens",
  "La personne cesse de survivre pour commencer à vivre pleinement",
];

const relations = [
  "à soi",
  "au couple",
  "à la famille",
  "aux collaborateurs",
  "aux clients",
  "au Vivant",
];

export default function ApprochePage() {
  return (
    <div className="page-fade">

      {/* HERO */}
      <section className="page-hero" style={{ background: "var(--white)", borderBottom: "1px solid var(--line)" }}>
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: 920, margin: "0 auto" }}>
            <Eyebrow style={{ marginBottom: 32 }}>Mon approche</Eyebrow>
            <h1 className="display" style={{ fontSize: "clamp(32px, 4vw, 64px)", margin: "0 0 28px", lineHeight: 1.05 }}>
              Mon <em className="display-italic">Approche.</em>
            </h1>
            <hr className="filet" style={{ margin: "0 auto 32px" }} />
            <p style={{ fontFamily: "var(--serif)", fontSize: "clamp(20px, 2.2vw, 26px)", lineHeight: 1.5, color: "var(--navy)", maxWidth: 720, margin: "0 auto 24px", fontWeight: 300, fontStyle: "italic" }}>
              «&nbsp;Pourquoi certaines personnes réussissent extérieurement, mais continuent
              de souffrir intérieurement&nbsp;?&nbsp;»
            </p>
            <p style={{ fontSize: 17, lineHeight: 1.8, color: "var(--navy-ink)", maxWidth: 640, margin: "0 auto" }}>
              Depuis plus de vingt ans, j&apos;explore cette question. Au fil de mes recherches,
              de mes accompagnements et de mes propres traversées, une évidence s&apos;est imposée :
              la transformation durable ne peut reposer sur une seule approche. Elle réunit la
              compréhension, l&apos;expérience et la transformation. C&apos;est ainsi qu&apos;est née
              La Voie 2 la Conscience.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 56, flexWrap: "wrap" }}>
              <a href="#fondements" className="pill">Niveau 1 · 3 fondements</a>
              <a href="#piliers" className="pill">Niveau 2 · 4 piliers</a>
              <a href="#eau" className="pill">Niveau 3 · Zone d&apos;E.A.U.</a>
            </div>
          </div>
        </div>
      </section>

      {/* NIVEAU 1 — LES 3 FONDEMENTS */}
      <section id="fondements" className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <Eyebrow style={{ marginBottom: 24 }}>Niveau 1 · Le socle</Eyebrow>
              <h2>Les 3 fondements<br /><em className="display-italic">de mon approche.</em></h2>
            </div>
            <p>
              Trois axes qui ne se remplacent pas&nbsp;: ils se complètent. Ensemble, ils
              constituent le socle sur lequel repose l&apos;ensemble de mon travail.
            </p>
          </div>

          <div className="rg-3" style={{ gap: 1, background: "var(--line)", border: "1px solid var(--line)" }}>
            {fondements.map((f, i) => (
              <div key={i} data-reveal="" data-reveal-delay={String(i)} style={{ padding: "48px 36px", background: "var(--white)", display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 24 }}>
                  <span className="card-num" style={{ fontSize: 15 }}>{f.num}</span>
                  <span className="pill" style={{ borderColor: "rgba(200,168,75,0.4)", color: "var(--gold)" }}>{f.role}</span>
                </div>
                <h3 className="display" style={{ fontSize: 26, color: "var(--navy)", margin: "0 0 20px", lineHeight: 1.2 }}>{f.titre}</h3>
                <hr className="filet" style={{ marginBottom: 22 }} />
                <p style={{ fontSize: 14.5, lineHeight: 1.78, color: "var(--navy-ink)", margin: 0 }}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="filet-gold-full" />

      {/* NIVEAU 2 — LES 4 PILIERS */}
      <section id="piliers" className="section sec-blue" style={{ background: "linear-gradient(150deg, #142579 0%, #0f1d6e 50%, #0a1450 100%)", color: "var(--white)" }}>
        <div className="container">
          <div className="section-head">
            <div>
              <Eyebrow style={{ color: "var(--gold)", marginBottom: 24 }}>Niveau 2 · Comment</Eyebrow>
              <h2 style={{ color: "var(--white)" }}>Les 4 piliers<br /><em className="display-italic" style={{ color: "var(--gold)" }}>de transformation.</em></h2>
            </div>
            <p style={{ color: "rgba(255,255,255,0.72)" }}>
              Ces trois fondements donnent naissance à quatre piliers complémentaires — les
              principaux chemins d&apos;accompagnement. Une même intention&nbsp;: permettre à chacun de
              retrouver son alignement profond et sa juste place dans le Vivant.
            </p>
          </div>

          <div className="rg-2" style={{ gap: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}>
            {piliers.map((p, i) => (
              <div key={i} data-reveal="" data-reveal-delay={String(i % 2)} style={{ padding: "44px 40px", background: "rgba(255,255,255,0.03)" }}>
                <span className="card-num" style={{ fontSize: 16 }}>{p.num}</span>
                <h3 className="display" style={{ fontSize: 30, color: "var(--white)", margin: "18px 0 6px", lineHeight: 1.15 }}>{p.titre}</h3>
                <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 15, color: "var(--gold)", margin: "0 0 20px" }}>{p.sub}</p>
                <hr className="filet" style={{ marginBottom: 20 }} />
                <p style={{ fontSize: 14.5, lineHeight: 1.72, color: "rgba(255,255,255,0.78)", margin: 0 }}>{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DÉTAIL — A.I.M.E. */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="card-num" style={{ fontSize: 16, marginBottom: 16 }}>Pilier I.</p>
              <h2 style={{ fontSize: "clamp(48px, 7vw, 88px)" }}>A.I.M.E.</h2>
              <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 22, color: "var(--navy)", margin: "12px 0 0", fontWeight: 300 }}>
                Pour <strong style={{ fontWeight: 600, fontStyle: "normal", color: "var(--blue)" }}>A</strong>ccompagnement{" "}
                <strong style={{ fontWeight: 600, fontStyle: "normal", color: "var(--blue)" }}>I</strong>nitiatique{" "}
                <strong style={{ fontWeight: 600, fontStyle: "normal", color: "var(--blue)" }}>M</strong>ental et{" "}
                <strong style={{ fontWeight: 600, fontStyle: "normal", color: "var(--blue)" }}>É</strong>motionnel.
              </p>
              <p style={{ fontFamily: "var(--sans)", fontSize: 12.5, letterSpacing: ".06em", color: "var(--mute)", margin: "10px 0 0" }}>
                Le parcours signature, en quatre phases.
              </p>
            </div>
            <div>
              <hr className="filet" style={{ marginBottom: 24 }} />
              <p style={{ fontSize: 17, lineHeight: 1.7, color: "var(--navy-ink)", margin: 0 }}>
                <strong style={{ fontWeight: 500 }}>A</strong>ccueillir ·{" "}
                <strong style={{ fontWeight: 500 }}>I</strong>dentifier ·{" "}
                <strong style={{ fontWeight: 500 }}>M</strong>étamorphoser ·{" "}
                <strong style={{ fontWeight: 500 }}>É</strong>merger. Quatre phases qui ne se sautent
                pas, qui ne se forcent pas, et dont on ne revient jamais au même point après les
                avoir traversées.
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
                <h3 className="display" style={{ fontSize: 34, color: "var(--navy)", margin: "12px 0 4px", position: "relative" }}>{p.word}</h3>
                <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 14.5, color: "var(--gold)", margin: "0 0 24px", position: "relative", lineHeight: 1.4 }}>{p.sub}</p>
                <hr className="filet" style={{ marginBottom: 20 }} />
                <p style={{ fontSize: 14, lineHeight: 1.65, color: "var(--navy-ink)", margin: 0, position: "relative" }}>{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="filet-gold-full" />

      {/* DÉTAIL — CYCLE DES SAISONS */}
      <section className="section" style={{ background: "var(--paper)" }}>
        <div className="container">
          <div className="section-head">
            <div>
              <p className="card-num" style={{ fontSize: 16, marginBottom: 16 }}>Pilier II.</p>
              <h2>Cycle des<br /><em className="display-italic">Saisons.</em></h2>
            </div>
            <p>
              Vivre en harmonie avec les rythmes naturels. À travers l&apos;Automne, l&apos;Hiver, le
              Printemps et l&apos;Été, on apprend à reconnaître les étapes de son propre processus —
              non plus lutter contre la vie, mais coopérer avec elle.
            </p>
          </div>

          <div className="rg-4" style={{ gap: 0 }}>
            {saisons.map((s, i) => (
              <div key={i} style={{ padding: "56px 32px", background: s.isGold ? "var(--gold)" : "linear-gradient(150deg, #142579 0%, #0f1d6e 50%, #0a1450 100%)", color: s.isGold ? "var(--navy-ink)" : "var(--white)", position: "relative", minHeight: 360, display: "flex", flexDirection: "column" }}>
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

      {/* DÉTAIL — KI-ZOLA */}
      <section className="section" style={{ background: "var(--paper)" }}>
        <div className="container">
          <div className="section-head">
            <div>
              <p className="card-num" style={{ fontSize: 16, marginBottom: 16 }}>Pilier III.</p>
              <h2>
                La méthode <em className="display-italic">Ki-Zola.</em>
              </h2>
              <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 20, color: "var(--blue)", margin: "12px 0 0", fontWeight: 300 }}>
                Le corps se souvient — l&apos;eau libère.
              </p>
            </div>
            <div>
              <hr className="filet" style={{ marginBottom: 24 }} />
              <p style={{ fontSize: 17, lineHeight: 1.8, color: "var(--navy-ink)", margin: 0 }}>
                Dans l&apos;eau chaude, le mental lâche prise, le système nerveux se régule, et ce
                qui était figé se transforme.
              </p>
            </div>
          </div>

          <div className="rg-split" style={{ gap: "clamp(40px, 6vw, 80px)", alignItems: "center", marginTop: 16 }}>
            <div>
              <p style={{ fontSize: 16.5, lineHeight: 1.8, color: "var(--navy-ink)", margin: "0 0 28px" }}>
                Cette immersion vous permet&nbsp;:
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {[
                  "un accès direct aux mémoires logées dans le corps",
                  "une libération émotionnelle profonde mais sécurisée",
                  "la régulation du système nerveux",
                  "la réconciliation avec votre vécu intime",
                ].map((t, i) => (
                  <li key={i} data-reveal="" data-reveal-delay={String(i % 3)} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "13px 0", borderBottom: "1px solid var(--line)", fontSize: 16, lineHeight: 1.55, color: "var(--navy-ink)" }}>
                    <span style={{ color: "var(--blue)", flexShrink: 0, fontSize: 12, marginTop: 5 }}>✦</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ textAlign: "center" }}>
              <p style={{ fontFamily: "var(--sans)", fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--mute)", margin: "0 0 22px" }}>
                La porte d&apos;accès au vécu, pas au concept
              </p>
              <p className="display" style={{ fontSize: "clamp(26px, 3.2vw, 42px)", lineHeight: 1.25, color: "var(--navy)", margin: 0, fontWeight: 300 }}>
                Ce pilier transforme l&apos;expérience en{" "}
                <em className="display-italic" style={{ color: "var(--blue)" }}>intégration cellulaire.</em>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* DÉTAIL — LA V.I.E. */}
      <section className="section sec-blue" style={{ background: "linear-gradient(150deg, #142579 0%, #0f1d6e 50%, #0a1450 100%)", color: "var(--white)", position: "relative" }}>
        <div className="container">
          <div className="section-head">
            <div>
              <p className="card-num" style={{ fontSize: 16, marginBottom: 16 }}>Pilier IV.</p>
              <h2 style={{ color: "var(--white)" }}>
                La <em className="display-italic">V.I.E.</em>
              </h2>
              <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 20, color: "var(--gold)", margin: "12px 0 0", fontWeight: 300 }}>
                Voie Initiatique de l&apos;Eau.
              </p>
            </div>
            <div>
              <hr style={{ width: 48, height: 1, border: 0, background: "rgba(255,255,255,0.5)", marginBottom: 24 }} />
              <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: "clamp(20px, 2.4vw, 28px)", lineHeight: 1.4, color: "var(--white)", margin: 0 }}>
                La renaissance — Le passage — L&apos;incarnation.
              </p>
              <p style={{ fontSize: 16.5, lineHeight: 1.8, color: "rgba(255,255,255,0.78)", margin: "18px 0 0" }}>
                Ce pilier final n&apos;est plus une pratique. C&apos;est un <em style={{ fontStyle: "italic", color: "var(--gold)" }}>seuil</em>.
              </p>
            </div>
          </div>

          <div className="rg-split" style={{ gap: "clamp(40px, 6vw, 80px)", alignItems: "center", marginTop: 16 }}>
            <div>
              <p style={{ fontSize: 16.5, lineHeight: 1.8, color: "rgba(255,255,255,0.85)", margin: "0 0 28px" }}>
                À travers des immersions, des retraites et des voyages initiatiques — notamment à
                Madagascar —, l&apos;Eau devient transmission, mémoire, vérité. Ce processus vous
                reconnecte à&nbsp;:
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {[
                  "votre lignée",
                  "votre souveraineté intérieure",
                  "votre juste place",
                  "votre identité profonde",
                  "votre mission",
                ].map((t, i) => (
                  <li key={i} data-reveal="" data-reveal-delay={String(i % 3)} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "13px 0", borderBottom: "1px solid rgba(255,255,255,0.12)", fontSize: 16, lineHeight: 1.55, color: "var(--white)" }}>
                    <span style={{ color: "var(--gold)", flexShrink: 0, fontSize: 12, marginTop: 5 }}>✦</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ textAlign: "center" }}>
              <p style={{ fontFamily: "var(--sans)", fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)", margin: "0 0 22px" }}>
                C&apos;est là que s&apos;intègre définitivement
              </p>
              <p className="display" style={{ fontSize: "clamp(28px, 3.4vw, 46px)", lineHeight: 1.25, color: "var(--white)", margin: 0, fontWeight: 300 }}>
                Qui vous étiez{" "}
                <span style={{ color: "var(--gold)" }}>➜</span>
                <br />
                <em className="display-italic" style={{ color: "var(--gold)" }}>qui vous devenez.</em>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AU CŒUR DE V2C — SYNTHÈSE */}
      <section className="section" style={{ background: "var(--white)" }}>
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: 720, margin: "0 auto 64px" }}>
            <Eyebrow style={{ marginBottom: 24 }}>Au cœur de La Voie 2 la Conscience</Eyebrow>
            <h2 className="display" style={{ fontSize: "clamp(28px, 3vw, 44px)", margin: 0, lineHeight: 1.12 }}>
              Un <em className="display-italic">écosystème</em> cohérent.
            </h2>
          </div>

          <div className="rg-2" style={{ gap: 24 }}>
            <div className="card" style={{ background: "var(--paper)" }}>
              <p className="card-num" style={{ fontSize: 14, marginBottom: 14 }}>Les 3 fondements</p>
              <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 20, color: "var(--navy)", margin: "0 0 22px", lineHeight: 1.4 }}>
                «&nbsp;Sur quoi repose cette approche&nbsp;?&nbsp;»
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {[
                  ["La Science Initiatique", "la compréhension"],
                  ["La Sagesse Ancestrale", "l'ancrage"],
                  ["La Puissance de l'Eau", "la transformation"],
                ].map(([t, r], j) => (
                  <li key={j} style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "12px 0", borderBottom: j < 2 ? "1px solid var(--line)" : 0 }}>
                    <span style={{ fontSize: 15, color: "var(--navy-ink)" }}>{t}</span>
                    <span style={{ fontFamily: "var(--sans)", fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--gold)", whiteSpace: "nowrap" }}>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card" style={{ background: "#0f1d6e", border: "1px solid rgba(255,255,255,0.14)" }}>
              <p className="card-num" style={{ fontSize: 14, marginBottom: 14, color: "var(--gold)" }}>Les 4 piliers</p>
              <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 20, color: "var(--white)", margin: "0 0 22px", lineHeight: 1.4 }}>
                «&nbsp;Comment cette transformation est-elle vécue&nbsp;?&nbsp;»
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {["Le Parcours A.I.M.E.", "Le Cycle des Saisons", "La Méthode Ki-Zola", "La V.I.E."].map((t, j) => (
                  <li key={j} style={{ display: "flex", gap: 12, padding: "11px 0", borderBottom: j < 3 ? "1px solid rgba(255,255,255,0.12)" : 0, fontSize: 15, color: "rgba(255,255,255,0.85)" }}>
                    <span style={{ color: "var(--gold)", flexShrink: 0 }}>✦</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p style={{ textAlign: "center", fontSize: 16.5, lineHeight: 1.8, color: "var(--mute)", maxWidth: 640, margin: "48px auto 0" }}>
            Ensemble, ils forment un écosystème cohérent au service de l&apos;éveil de la conscience,
            de la restauration du lien au Vivant et de l&apos;incarnation de sa véritable nature.
          </p>
        </div>
      </section>

      {/* NIVEAU 3 — LA ZONE D'E.A.U. */}
      <section id="eau" className="section noise sec-blue" style={{ background: "linear-gradient(150deg, #142579 0%, #0f1d6e 50%, #0a1450 100%)", color: "var(--white)", position: "relative" }}>
        <div className="container">
          <div className="rg-split" style={{ gap: 80, alignItems: "center" }}>
            <div>
              <Eyebrow style={{ color: "var(--gold)", marginBottom: 24 }}>Niveau 3 · Vers quoi</Eyebrow>
              <h2 className="display" style={{ fontSize: "clamp(40px, 5vw, 72px)", color: "var(--white)", margin: "0 0 8px", lineHeight: 1 }}>
                La Zone<br /><em className="display-italic" style={{ color: "var(--gold)" }}>d&apos;E.A.U.</em>
              </h2>
              <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 18, color: "var(--gold)", margin: "12px 0 28px", fontWeight: 300 }}>
                Excellence Authentique Unique.
              </p>
              <hr className="filet" style={{ marginBottom: 28 }} />
              <p style={{ fontSize: 16.5, lineHeight: 1.8, color: "rgba(255,255,255,0.82)", margin: 0 }}>
                L&apos;intention ultime de cette démarche est d&apos;accompagner chacun vers sa Zone
                d&apos;E.A.U. — cet espace intérieur où l&apos;âme cesse d&apos;être en exil, et commence
                véritablement à agir.
              </p>
            </div>

            <div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {eauPromesses.map((g, i) => (
                  <li key={i} data-reveal="" data-reveal-delay={String(i)} style={{ display: "flex", gap: 16, alignItems: "flex-start", padding: "20px 0", borderBottom: i < eauPromesses.length - 1 ? "1px solid rgba(255,255,255,0.12)" : 0 }}>
                    <span style={{ color: "var(--gold)", flexShrink: 0, fontSize: 14, marginTop: 4 }}>✦</span>
                    <span style={{ fontSize: 17, lineHeight: 1.55, color: "rgba(255,255,255,0.9)" }}>{g}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* À QUI S'ADRESSE */}
      <section className="section" style={{ background: "var(--paper)" }}>
        <div className="container-narrow">
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <Eyebrow style={{ marginBottom: 24 }}>Pour qui</Eyebrow>
            <h2 className="display" style={{ fontSize: "clamp(28px, 3vw, 44px)", margin: 0, lineHeight: 1.12 }}>
              À qui s&apos;adresse<br /><em className="display-italic">cet accompagnement&nbsp;?</em>
            </h2>
          </div>

          <div style={{ display: "grid", gap: 24, fontSize: 16.5, lineHeight: 1.85, color: "var(--navy-ink)" }}>
            <p style={{ margin: 0 }}>
              La Voie 2 la Conscience s&apos;adresse principalement aux <strong style={{ fontWeight: 500 }}>dirigeants,
              entrepreneurs, cadres, thérapeutes</strong> et professionnels de l&apos;accompagnement qui
              ressentent l&apos;appel d&apos;une transformation intérieure profonde. À celles et ceux qui
              ont construit, développé une expertise, porté des responsabilités — mais qui perçoivent
              aujourd&apos;hui qu&apos;une autre dimension de leur existence cherche à émerger.
            </p>
            <p style={{ margin: 0 }}>
              Des personnes qui, malgré leur réussite extérieure, ressentent parfois une perte de
              sens, une fatigue intérieure, un sentiment de décalage, ou l&apos;intuition qu&apos;il existe
              une manière plus profonde, plus alignée et plus vivante d&apos;habiter leur vie.
            </p>
            <p style={{ margin: 0 }}>
              Cet accompagnement est destiné à celles et ceux qui sont ouverts à une dimension
              spirituelle de l&apos;existence, au-delà de toute religion, de tout dogme ou de tout
              système de croyance. <strong style={{ fontWeight: 500 }}>Je ne propose pas une religion.
              Je ne cherche pas à convaincre. Je propose un chemin d&apos;expérience</strong> — une voie
              qui invite chacun à explorer la conscience, le sens, la relation et le Vivant à travers
              son expérience directe.
            </p>
          </div>

          <blockquote style={{ margin: "44px 0", padding: "28px 36px", borderLeft: "3px solid var(--gold)", background: "var(--white)" }}>
            <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: "clamp(18px, 2vw, 23px)", color: "var(--navy)", margin: 0, lineHeight: 1.5 }}>
              «&nbsp;La relation est le lieu où la spiritualité cesse d&apos;être une idée pour devenir
              une expérience vivante.&nbsp;»
            </p>
          </blockquote>

          <div style={{ display: "grid", gap: 24, fontSize: 16.5, lineHeight: 1.85, color: "var(--navy-ink)" }}>
            <p style={{ margin: 0 }}>
              Une spiritualité vivante et incarnée trouve sa véritable profondeur lorsqu&apos;elle
              s&apos;incarne dans la vie quotidienne et dans nos relations&nbsp;:
            </p>
            <ul style={{ display: "flex", flexWrap: "wrap", gap: 10, listStyle: "none", padding: 0, margin: 0 }}>
              {relations.map((r, i) => (
                <li key={i} className="pill" style={{ borderColor: "rgba(200,168,75,0.4)", color: "var(--navy)" }}>
                  La relation {r}
                </li>
              ))}
            </ul>
            <p style={{ margin: "8px 0 0", fontFamily: "var(--serif)", fontSize: 19, color: "var(--navy)", lineHeight: 1.6 }}>
              Car ce n&apos;est pas ce que nous savons qui transforme notre existence&nbsp;: c&apos;est ce
              que nous sommes capables d&apos;incarner.
            </p>
            <p style={{ margin: 0 }}>
              Si vous êtes dirigeant, entrepreneur, cadre ou thérapeute, et que vous ressentez
              l&apos;appel d&apos;une démarche qui relie conscience, spiritualité incarnée et transformation
              concrète de votre vie, alors vous êtes probablement au bon endroit.
            </p>
            <p style={{ margin: 0, fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 21, color: "var(--gold)" }}>
              Bienvenue sur La Voie 2 la Conscience.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-tight" style={{ background: "var(--white)", textAlign: "center", borderTop: "3px solid var(--gold)" }}>
        <div className="container-narrow">
          <Eyebrow style={{ marginBottom: 24 }}>L&apos;approche s&apos;incarne dans l&apos;Offre Gold</Eyebrow>
          <h3 className="display" style={{ fontSize: 36, margin: "0 0 24px", lineHeight: 1.1 }}>
            Lire l&apos;offre<br /><em className="display-italic">qui la met en œuvre.</em>
          </h3>
          <p style={{ fontSize: 17, lineHeight: 1.7, color: "var(--mute)", maxWidth: 560, margin: "0 auto 36px" }}>
            Trois niveaux d&apos;accompagnement — Essence, Expansion, Royale — qui mobilisent les
            quatre piliers selon votre rythme et votre saison intérieure.
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
