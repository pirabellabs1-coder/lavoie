import type { Metadata } from "next";
import Link from "next/link";
import Placeholder from "@/components/Placeholder";
import Marquee from "@/components/Marquee";
import NewsletterForm from "@/components/NewsletterForm";

export const metadata: Metadata = {
  title: "La Voie 2 la Conscience — Accompagnement initiatique premium",
  description:
    "Accompagnement initiatique haut de gamme pour dirigeants, cadres supérieurs et thérapeutes. 500+ transformations en plus de 21 ans de pratique. Méthodes AIME, V.I.E. et Cycle des Saisons.",
};

function Arrow({ size = 14 }: { size?: number }) {
  return (
    <svg className="arrow" width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M1 8h13M9 3l5 5-5 5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function Eyebrow({
  children,
  style,
  gold,
  centered,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  gold?: boolean;
  centered?: boolean;
}) {
  return (
    <p
      className="eyebrow"
      style={{
        justifyContent: centered ? "center" : "flex-start",
        margin: 0,
        color: gold ? "var(--gold)" : "var(--navy)",
        ...style,
      }}
    >
      <span className="dot" />
      {children}
      <span className="dot" />
    </p>
  );
}

/* ─── DATA ───────────────────────────────────────────────── */

const stats = [
  { n: "500+", label: "Vies transformées" },
  { n: "21+",  label: "Années d'expérience" },
  { n: "100%", label: "Engagement" },
];

const pourQui = [
  {
    label: "Pour les dirigeants",
    title: "Quand le sommet ne suffit plus.",
    body:
      "Vous avez construit. Vous portez. Vous décidez. Et pourtant — une question en sourdine, plus tenace que l'épuisement, refuse de se laisser réduire.",
    stat: "38%",
    statLabel: "des accompagnés",
  },
  {
    label: "Pour les cadres supérieurs",
    title: "Quand la performance vide.",
    body:
      "Vous excellez dans ce que vous faites. Mais l'écart se creuse entre ce que vous produisez et ce qui vous tient debout. L'heure du retour intérieur a sonné.",
    stat: "34%",
    statLabel: "des accompagnés",
  },
  {
    label: "Pour les thérapeutes",
    title: "Quand le soignant a soif.",
    body:
      "Vous accompagnez d'autres traversées. La vôtre demande maintenant un cadre à votre hauteur — et un témoin qui sache tenir l'espace.",
    stat: "28%",
    statLabel: "des accompagnés",
  },
];

const methodes = [
  {
    num: "I.",
    tag: "Parcours signature",
    title: "Le Parcours AIME",
    sub: "Accompagnement Initiatique Mental et Émotionnel",
    body:
      "La méthode pour la guérison de la blessure originelle : Accueillir, Identifier, Métamorphoser, Émerger — vers votre Excellence Authentique Unique.",
    href: "/methodes",
  },
  {
    num: "II.",
    tag: "Voie de l'eau",
    title: "La V.I.E.",
    sub: "Voie Initiatique de l'Eau",
    body:
      "Purification et renaissance par l'élément Eau. L'eau comme mémoire vivante et transformatrice. Rituels de passage pour dirigeants.",
    href: "/methodes",
  },
  {
    num: "III.",
    tag: "Rythme naturel",
    title: "Le Cycle des Saisons",
    sub: "Automne · Hiver · Printemps · Été",
    body:
      "Une boussole vivante qui accompagne chaque transformation intérieure au rythme des saisons.",
    href: "/methodes",
  },
];

const offres = [
  {
    tag: "Niveau I",
    title: "Immersion Essence",
    duration: "3 mois",
    featured: false,
    desc:
      "Pour leaders, dirigeants et entrepreneurs en quête de sens profond. Une expérience immersive sur 3 mois, au-delà du développement personnel classique.",
    bullets: [
      "2 stages immersifs au Centre HUT",
      "1 séance individuelle / semaine",
      "Un cercle d'intimité sur WhatsApp (3 mois)",
      "Hébergement et restauration non inclus",
    ],
  },
  {
    tag: "Niveau II · Le plus choisi",
    title: "Immersion Expansion",
    duration: "6 mois",
    featured: true,
    desc:
      "Programme d'expansion intérieure et de réalignement stratégique sur 6 mois. Pour ceux qui ressentent que leur réussite ne peut plus se mesurer uniquement à l'extérieur.",
    bullets: [
      "Tout le contenu de l'Immersion Essence",
      "3 stages immersifs au Centre HUT",
      "2 sessions de coaching de groupe par mois",
      "1 voyage initiatique (optionnel)",
    ],
  },
  {
    tag: "Niveau III",
    title: "Immersion Royale",
    duration: "9 — 12 mois",
    featured: false,
    desc:
      "Une mutation souveraine. Une incarnation radicale. Programme initiatique de 9 à 12 mois pour dirigeants prêts à redevenir pleinement eux-mêmes.",
    bullets: [
      "Accompagnement individuel illimité pendant 12 mois",
      "4 stages immersifs au Centre HUT (1 par saison)",
      "Accès direct à Domoïna en privé (WhatsApp 7j/7)",
      "Suite privative & conciergerie lors des immersions",
      "3 Voyages Initiatiques d'exception (optionnels)",
    ],
  },
];

const parcours = [
  {
    step: "01",
    title: "Appel découverte",
    dur: "45 min · Offert",
    body:
      "Un premier échange sans engagement. Pour comprendre ce qui vous amène et envisager le bon point d'entrée.",
  },
  {
    step: "02",
    title: "Audit d'alignement",
    dur: "1 heure · Sur invitation",
    body:
      "Un bilan approfondi pour définir ensemble votre niveau d'entrée, votre cadence et vos axes prioritaires.",
  },
  {
    step: "03",
    title: "Première Immersion",
    dur: "3 jours · Centre HUT",
    body:
      "La pierre angulaire. Cohorte limitée à 8 personnes. Présence pleine, rituels initiatiques, travail avec l'eau.",
  },
  {
    step: "04",
    title: "Cycle continu",
    dur: "3 à 12 mois",
    body:
      "Séances hebdomadaires, stages saisonniers, suivi WhatsApp. La structure tient. Vous vous laissez transformer.",
  },
];

const temoignages = [
  {
    quote:
      "Domoïna est une thérapeute que je recommande vivement. Dès notre première rencontre, j'ai été frappée par son écoute attentive et sa capacité à déceler ce qui se passe réellement.",
    name: "Nora Hachelaf",
    source: "Avis Google vérifié",
  },
  {
    quote:
      "Cela fait maintenant 4 ans que je chemine avec le CDS au sein de LV2C, j'apprends, je comprends et je commence à intégrer les enseignements que je reçois. Aujourd'hui, je suis en capacité d'affirmer que la Voie Initiatique avec laquelle j'avance est profondément transformatrice.",
    name: "Sandrine Jeanne",
    source: "Avis Google vérifié",
  },
  {
    quote:
      "J'ai connu Domoïna via une amie pour une problématique bien précise. En découvrant son travail, j'étais loin de penser que l'accompagnement de groupe serait autant bénéfique. À aucun moment je n'aurais imaginé recevoir des miroirs à travers les autres participants.",
    name: "Mireille Tamarin",
    source: "Avis Google vérifié",
  },
];

/* ─── PAGE ───────────────────────────────────────────────── */

export default function Home() {
  return (
    <div className="page-fade home-poppins">

      {/* ══════════════════════════════════════════════════════
          01 · HERO — Full-bleed cinematic
          ══════════════════════════════════════════════════════ */}
      <section
        className="sec-blue"
        style={{
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(150deg, #142579 0%, #0f1d6e 50%, #0a1450 100%)",
        }}
      >
        {/* Halo lumineux (haut) */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(100% 70% at 78% 0%, rgba(255,255,255,0.12) 0%, transparent 55%)",
            pointerEvents: "none",
          }}
        />

        <div className="container hero-container" style={{ position: "relative", zIndex: 1, paddingTop: "clamp(88px, 11vh, 128px)", paddingBottom: "clamp(40px, 6vh, 76px)" }}>
          <div className="rg-split" style={{ gap: "clamp(40px, 6vw, 84px)", alignItems: "center" }}>

            {/* ── Texte ── */}
            <div>

            {/* Badge cible */}
            <span
              data-reveal=""
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 9,
                padding: "7px 16px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.22)",
                color: "var(--white)",
                fontFamily: "var(--sans)",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: ".12em",
                textTransform: "uppercase",
                marginBottom: 28,
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--gold)", flexShrink: 0 }} />
              Dirigeants · Cadres · Thérapeutes en quête de sens
            </span>

            {/* H1 */}
            <h1
              data-reveal=""
              style={{
                fontFamily: "var(--font-poppins), system-ui, sans-serif",
                fontSize: "clamp(33px, 4.3vw, 58px)",
                color: "var(--white)",
                margin: 0,
                lineHeight: 1.15,
                fontWeight: 600,
                letterSpacing: "-0.02em",
              }}
            >
              De l&apos;épuisement à l&apos;équilibre,{" "}
              <span
                style={{ color: "var(--gold)", fontWeight: 600 }}
              >
                dans votre vie, votre couple, votre famille.
              </span>
            </h1>

            {/* Subline */}
            <p
              data-reveal=""
              data-reveal-delay="1"
              style={{
                fontFamily: "var(--sans)",
                fontSize: "clamp(15px, 1.2vw, 17px)",
                lineHeight: 1.8,
                maxWidth: 540,
                margin: "28px 0 32px",
                color: "rgba(255,255,255,0.86)",
              }}
            >
              Un accompagnement{" "}
              <em style={{ fontFamily: "var(--serif)", fontStyle: "italic", color: "var(--white)" }}>
                initiatique et spirituel
              </em>
              {" "}pour les dirigeants, cadres et thérapeutes en quête de sens — celles et ceux
              qui réussissent extérieurement mais portent une{" "}
              <em style={{ fontFamily: "var(--serif)", fontStyle: "italic", color: "var(--gold)" }}>
                vision spirituelle de la vie
              </em>
              , et veulent l&apos;incarner pleinement.
            </p>

            {/* CTAs */}
            <div data-reveal="" data-reveal-delay="2">
              <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                <Link href="/contact" className="btn btn-primary btn-lg">
                  Réserver un appel <Arrow />
                </Link>
                <Link href="/domoina" className="btn btn-ghost-white">
                  Découverte Domoïna
                </Link>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginTop: 20,
                  fontFamily: "var(--sans)",
                  fontSize: 12.5,
                  color: "rgba(255,255,255,0.72)",
                  flexWrap: "wrap",
                }}
              >
                <span style={{ color: "var(--gold)", letterSpacing: 2, fontSize: 13 }}>★★★★★</span>
                <span>
                  <strong style={{ color: "var(--white)", fontWeight: 600 }}>4,9/5</strong> sur Google ·{" "}
                  <strong style={{ color: "var(--white)", fontWeight: 600 }}>500+</strong> accompagnés · Sans engagement
                </span>
              </div>
            </div>

            </div>

            {/* ── Image + étiquettes flottantes ── */}
            <div data-reveal="" data-reveal-delay="1" style={{ position: "relative", maxWidth: 540, width: "100%", margin: "0 auto" }}>
              <div className="img-zoom" style={{ position: "relative", border: "1px solid rgba(255,255,255,0.28)", boxShadow: "0 40px 90px -45px rgba(0,0,0,0.5)" }}>
                <Placeholder
                  style={{ aspectRatio: "4/5" }}
                  src="/domoina.jpg"
                  alt="Domoïna Ramiadana — thérapeute initiatique"
                  objectPosition="top center"
                  sizes="(max-width: 900px) 100vw, 48vw"
                />
              </div>
              {[
                { t: "Dépasser vos blocages", top: 26, left: 14 },
                { t: "Transformer votre stress", bottom: 104, right: 14 },
                { t: "Mieux-être émotionnel", bottom: 24, left: 24 },
              ].map((c, i) => (
                <span
                  key={i}
                  style={{
                    position: "absolute",
                    top: c.top,
                    bottom: c.bottom,
                    left: c.left,
                    right: c.right,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    background: "var(--white)",
                    border: "1px solid var(--line)",
                    borderRadius: 999,
                    padding: "8px 14px",
                    fontFamily: "var(--sans)",
                    fontSize: 11.5,
                    fontWeight: 500,
                    color: "var(--navy-ink)",
                    boxShadow: "0 16px 36px -16px rgba(20,40,120,0.28)",
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--gold)", flexShrink: 0 }} />
                  {c.t}
                </span>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          MARQUEE
          ══════════════════════════════════════════════════════ */}
      <Marquee
        duration={80}
        items={[
          "Bienveillance radicale",
          "L'Eau comme maître",
          "Excellence Authentique Unique",
          "Discrétion absolue",
          "Présence pleine",
          "Enracinement & élévation",
        ]}
      />

      {/* ══════════════════════════════════════════════════════
          01b · CENTRE HUT — bande immersive (4 visuels)
          ══════════════════════════════════════════════════════ */}
      <section
        style={{
          background: "#ffffff",
          color: "var(--navy-ink)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div className="container" style={{ textAlign: "center", paddingTop: 64, paddingBottom: 34 }}>
          <p className="eyebrow" data-reveal="" style={{ justifyContent: "center", color: "var(--navy)", margin: "0 0 14px" }}>
            <span className="dot" style={{ background: "var(--gold)" }} />Le Centre HUT · Sarthe<span className="dot" style={{ background: "var(--gold)" }} />
          </p>
          <h2
            data-reveal=""
            style={{
              fontFamily: "var(--font-poppins), system-ui, sans-serif",
              fontWeight: 600,
              fontSize: "clamp(24px, 3vw, 40px)",
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              margin: "0 auto",
              maxWidth: 720,
              color: "var(--navy-ink)",
            }}
          >
            Un écrin de nature pour se transformer
          </h2>
          <p
            data-reveal=""
            data-reveal-delay="1"
            style={{
              fontFamily: "var(--sans)",
              fontSize: 15,
              lineHeight: 1.7,
              color: "var(--mute)",
              maxWidth: 560,
              margin: "16px auto 0",
            }}
          >
            Microforêt, jardin zen, étang &amp; piscine — un lieu confidentiel où vivre vos
            immersions, à une heure de Paris.
          </p>
        </div>

        {/* Bande d'images pleine largeur */}
        <div className="hut-strip" data-reveal="" data-reveal-delay="1">
          {[
            { src: "/hut-jardin-zen.png", k: "Nature", t: "Jardin zen & piscine" },
            { src: "/hut-terrasse.png", k: "Extérieur", t: "Terrasse en pierre" },
            { src: "/hut-salle.png", k: "Convivialité", t: "Salle de vie" },
            { src: "/hut-chambre.png", k: "Repos", t: "Chambres apaisantes" },
          ].map((tile, i) => (
            <Link href="/centre-hut" className="hut-tile" key={i} aria-label={`Centre HUT — ${tile.t}`}>
              <Placeholder src={tile.src} alt={`${tile.t} — Centre HUT`} sizes="(max-width: 860px) 50vw, 25vw" />
              <span className="hut-cap">
                <span className="k">{tile.k}</span>
                <span className="t">{tile.t}</span>
              </span>
            </Link>
          ))}
        </div>

        <div className="container" style={{ textAlign: "center", paddingTop: 32, paddingBottom: 62 }}>
          <Link href="/centre-hut" className="btn btn-ghost" data-reveal="">
            Visiter le Centre HUT <Arrow />
          </Link>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          02 · PARTI PRIS — manifeste + repères chiffrés (fusion Stats)
          ══════════════════════════════════════════════════════ */}
      <section className="section sec-blue" style={{ background: "linear-gradient(150deg, #142579 0%, #0f1d6e 50%, #0a1450 100%)", color: "var(--white)", position: "relative", overflow: "hidden" }}>
        {/* Halo doré décoratif */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(70% 55% at 50% -8%, rgba(245,196,34,0.12) 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />
        <span className="section-num" style={{ color: "rgba(255,255,255,0.7)" }}>Notre parti pris</span>
        <div className="container" style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
          <p className="eyebrow" style={{ justifyContent: "center", color: "var(--gold)", margin: "0 0 22px" }}>
            <span className="dot" style={{ background: "var(--gold)" }} />Une autre manière de vivre le spirituel<span className="dot" style={{ background: "var(--gold)" }} />
          </p>
          {/* Guillemet décoratif */}
          <div aria-hidden="true" style={{ fontFamily: "var(--serif)", fontSize: "clamp(60px,7vw,104px)", lineHeight: 1, color: "var(--gold)", margin: "0 0 -14px" }}>&ldquo;</div>
          <p
            data-reveal=""
            className="mega"
            style={{ fontSize: "clamp(25px,3vw,44px)", lineHeight: 1.24, margin: "0 auto", maxWidth: 920, fontWeight: 300, color: "var(--white)" }}
          >
            Ici, la spiritualité ne se contemple pas&nbsp;:{" "}
            <em style={{ color: "var(--gold)", fontStyle: "italic" }}>elle s&apos;incarne.</em>
            {" "}Elle se vit, et se mesure à votre capacité à habiter vos relations —
            professionnelles, familiales, amoureuses — de manière consciente.
          </p>
          <p style={{ fontSize: 15.5, lineHeight: 1.8, color: "rgba(255,255,255,0.78)", maxWidth: 620, margin: "28px auto 34px" }}>
            Ni religion, ni développement personnel&nbsp;: un accompagnement spirituel et initiatique
            pensé pour les dirigeants, entrepreneurs et cadres qui ont déjà réussi — et qui sentent
            qu&apos;une autre dimension d&apos;eux-mêmes cherche à s&apos;incarner.
          </p>
          <Link href="/methodes" className="btn btn-gold btn-lg">
            Découvrir mon approche <Arrow />
          </Link>

          {/* Repères chiffrés (ex-section Stats, fusionnée) */}
          <div className="parti-stats">
            {stats.map((s, i) => (
              <div key={i} className="parti-stat" data-reveal="" data-reveal-delay={String(i)}>
                <div className="parti-stat-n">{s.n}</div>
                <p className="parti-stat-l">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="filet-gold-full" />

      {/* ══════════════════════════════════════════════════════
          04 · POUR QUI
          ══════════════════════════════════════════════════════ */}
      <section style={{ background: "var(--white)", position: "relative" }} className="section">
        <span className="section-num">04 — À qui ça parle</span>
        <div className="container">
          <div className="section-head">
            <div>
              <Eyebrow style={{ marginBottom: 24 }}>À qui ça parle</Eyebrow>
              <h2>
                Trois figures,
                <br />
                <em className="display-italic">un même vertige.</em>
              </h2>
            </div>
            <p>
              L&apos;accompagnement s&apos;adresse à celles et ceux dont la vie extérieure dit
              «&nbsp;réussite&nbsp;» — et dont la vie intérieure réclame autre chose.
              La forme du vertige diffère ; sa nature, jamais.
            </p>
          </div>

          <div className="pourqui-grid">
            {pourQui.map((p, i) => (
              <div
                key={i}
                data-reveal=""
                data-reveal-delay={String(i)}
                className="card-hover"
                style={{
                  padding: "48px 36px 40px",
                  background: "var(--white)",
                  position: "relative",
                  borderRight: i < 2 ? "1px solid var(--line)" : 0,
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: 22,
                    right: 28,
                    fontFamily: "var(--serif)",
                    fontStyle: "italic",
                    fontSize: 15,
                    color: "var(--gold)",
                    opacity: 0.65,
                  }}
                >
                  0{i + 1}.
                </span>
                <p
                  style={{
                    fontFamily: "var(--sans)",
                    fontSize: 10.5,
                    letterSpacing: ".2em",
                    textTransform: "uppercase",
                    color: "var(--gold)",
                    margin: "0 0 20px",
                    fontWeight: 500,
                  }}
                >
                  {p.label}
                </p>
                <h3
                  className="display"
                  style={{ fontSize: "clamp(24px,2.2vw,30px)", margin: "0 0 20px", lineHeight: 1.12 }}
                >
                  {p.title}
                </h3>
                <hr className="filet" style={{ marginBottom: 20 }} />
                <p style={{ fontSize: 14.5, lineHeight: 1.78, color: "var(--navy-ink)", margin: "0 0 32px" }}>
                  {p.body}
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 10,
                    paddingTop: 20,
                    borderTop: "1px solid var(--line)",
                  }}
                >
                  <span className="stat-n" style={{ fontSize: 32 }}>{p.stat}</span>
                  <span
                    style={{
                      fontFamily: "var(--sans)",
                      fontSize: 10,
                      letterSpacing: ".12em",
                      textTransform: "uppercase",
                      color: "var(--mute)",
                    }}
                  >
                    {p.statLabel}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          05 · DOMOINA
          ══════════════════════════════════════════════════════ */}
      <section className="section" style={{ background: "var(--paper)", position: "relative" }}>
        <span className="section-num">05 — La fondatrice</span>
        <div className="container">
          <div className="domoina-grid">
            {/* Portrait */}
            <div data-reveal="" style={{ position: "relative" }} className="img-zoom">
              <Placeholder
                mark="02"
                style={{ aspectRatio: "4/5", background: "var(--paper-alt)" }}
                src="/domoina.jpg"
                alt="Portrait de Domoïna Ramiadana, thérapeute initiatique"
                objectPosition="top center"
                sizes="(max-width: 768px) 100vw, 40vw"
              />
              {/* Gold badge overlay */}
              <div
                style={{
                  position: "absolute",
                  right: -24,
                  bottom: -24,
                  background: "var(--gold)",
                  padding: "20px 24px",
                  minWidth: 190,
                  zIndex: 3,
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--sans)",
                    fontSize: 9.5,
                    letterSpacing: ".18em",
                    textTransform: "uppercase",
                    margin: 0,
                    color: "var(--navy-ink)",
                    fontWeight: 500,
                    opacity: 0.7,
                  }}
                >
                  Méthode signature
                </p>
                <p
                  style={{
                    fontFamily: "var(--serif)",
                    fontSize: 26,
                    color: "var(--navy-ink)",
                    margin: "4px 0 0",
                    lineHeight: 1,
                    fontWeight: 300,
                  }}
                >
                  E.A.U.
                </p>
                <p
                  style={{
                    fontFamily: "var(--sans)",
                    fontSize: 11,
                    margin: "4px 0 0",
                    color: "var(--navy-ink)",
                    opacity: 0.7,
                  }}
                >
                  Excellence Authentique Unique
                </p>
              </div>
            </div>

            {/* Copy */}
            <div data-reveal="" data-reveal-delay="1">
              <Eyebrow style={{ marginBottom: 24 }}>La fondatrice</Eyebrow>
              <h2
                className="display"
                style={{ fontSize: "clamp(30px,3.2vw,52px)", margin: "0 0 24px", lineHeight: 1.05 }}
              >
                Domoïna,
                <br />
                <em style={{ fontWeight: 300 }}>thérapeute initiatique.</em>
              </h2>
              <hr className="filet" style={{ marginBottom: 28 }} />
              <p style={{ fontSize: 17, lineHeight: 1.8, color: "var(--navy-ink)", margin: "0 0 18px" }}>
                Une pratique qui repose sur trois piliers indissociables&nbsp;: la{" "}
                <strong style={{ fontWeight: 500 }}>science initiatique</strong>, la{" "}
                <strong style={{ fontWeight: 500 }}>sagesse ancestrale</strong> et la{" "}
                <strong style={{ fontWeight: 500 }}>puissance transformatrice de l&apos;eau</strong>.
              </p>
              <p style={{ fontSize: 15.5, lineHeight: 1.78, color: "var(--mute)", margin: "0 0 36px" }}>
                Quinze ans à accompagner celles et ceux qui ont tout réussi à l&apos;extérieur —
                et pour qui la vie intérieure réclame enfin sa part. Trois méthodes propriétaires.
                Un sanctuaire en pleine nature. Une promesse : l&apos;Excellence Authentique Unique.
              </p>
              <Link href="/domoina" className="link-underline">
                Lire son parcours <Arrow />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <hr className="filet-gold-full" />

      {/* ══════════════════════════════════════════════════════
          06 · MÉTHODES
          ══════════════════════════════════════════════════════ */}
      <section className="section" style={{ background: "var(--white)", position: "relative" }}>
        <span className="section-num">06 — Méthodes</span>
        <div className="container">
          <div className="section-head">
            <div>
              <Eyebrow style={{ marginBottom: 24 }}>Trois méthodes</Eyebrow>
              <h2>
                Un chemin tracé,
                <br />
                <em className="display-italic">jamais un protocole.</em>
              </h2>
            </div>
            <p>
              Trois méthodes propriétaires développées sur plus de vingt et un ans de pratique.
              Elles se combinent — jamais ne se substituent — au temps long du vivant.
            </p>
          </div>

          <div className="three-grid">
            {methodes.map((m, i) => (
              <div
                key={i}
                data-reveal=""
                data-reveal-delay={String(i)}
                className="card card-hover"
                style={{ paddingTop: 36, display: "flex", flexDirection: "column" }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    marginBottom: 28,
                  }}
                >
                  <span className="card-num">{m.num}</span>
                  <span className="pill" style={{ borderColor: "rgba(200,168,75,0.4)", color: "var(--gold)" }}>
                    {m.tag}
                  </span>
                </div>
                <h3 className="display" style={{ fontSize: "clamp(26px,2.6vw,36px)", margin: "0 0 6px" }}>
                  {m.title}
                </h3>
                <p
                  style={{
                    fontFamily: "var(--serif)",
                    fontStyle: "italic",
                    fontSize: 15.5,
                    color: "var(--mute)",
                    margin: "0 0 22px",
                  }}
                >
                  {m.sub}
                </p>
                <hr className="filet" style={{ marginBottom: 22 }} />
                <p style={{ fontSize: 14.5, lineHeight: 1.78, color: "var(--navy-ink)", margin: "0 0 28px", flexGrow: 1 }}>
                  {m.body}
                </p>
                <Link href={m.href} className="link-underline">
                  En savoir plus <Arrow size={12} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          07 · DÉROULÉ
          ══════════════════════════════════════════════════════ */}
      <section className="section" style={{ background: "var(--paper)", position: "relative" }}>
        <span className="section-num">07 — Parcours</span>
        <div className="container">
          <div className="section-head">
            <div>
              <Eyebrow style={{ marginBottom: 24 }}>Comment ça se passe</Eyebrow>
              <h2>
                De l&apos;appel
                <br />
                <em className="display-italic">à l&apos;Immersion.</em>
              </h2>
            </div>
            <p>
              Quatre temps clairement délimités — du premier échange à votre cycle complet.
              Chaque étape autorise la suivante et respecte la précédente.
            </p>
          </div>

          <div className="parcours-flow">
            {parcours.map((p, i) => (
              <div
                className="parcours-step"
                key={i}
                data-reveal=""
                data-reveal-delay={String(i)}
              >
                <div className="parcours-node"><span>{p.step}</span></div>
                <div className="parcours-card">
                  <span className="parcours-dur">{p.dur}</span>
                  <h4 className="parcours-title">{p.title}</h4>
                  <p className="parcours-body">{p.body}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 56 }}>
            <Link href="/contact" className="btn btn-primary btn-lg">
              Démarrer à l&apos;étape 01 <Arrow />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          08 · OFFRE GOLD
          ══════════════════════════════════════════════════════ */}
      <section
        className="section sec-blue"
        style={{ background: "linear-gradient(150deg, #142579 0%, #0f1d6e 50%, #0a1450 100%)", color: "var(--white)", position: "relative" }}
      >
        <span className="section-num" style={{ color: "rgba(255,255,255,0.7)" }}>08 — Offre Gold</span>
        <div className="container">
          <div className="section-head" style={{ alignItems: "end" }}>
            <div>
              <Eyebrow style={{ color: "rgba(255,255,255,0.85)", marginBottom: 24 }}>L&apos;Offre Gold</Eyebrow>
              <h2 style={{ color: "var(--white)" }}>
                Trois niveaux
                <br />
                <em className="display-italic" style={{ color: "var(--white)" }}>
                  d&apos;engagement.
                </em>
              </h2>
            </div>
            <p style={{ color: "rgba(255,255,255,0.62)" }}>
              Trois portes vers le même horizon. Chacune accueille un degré de profondeur
              et de présence différent. Le niveau se choisit lors de l&apos;appel découverte.
            </p>
          </div>

          <div className="offres-grid">
            {offres.map((o, i) => (
              <div
                key={i}
                data-reveal=""
                data-reveal-delay={String(i)}
                className={`offre-card${o.featured ? " offre-card--featured" : ""}`}
              >
                {/* Barre accent dorée — carte featured */}
                {o.featured && (
                  <div
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      top: 0, left: 0, right: 0,
                      height: 3,
                      background: "var(--gold)",
                    }}
                  />
                )}

                <div style={{ padding: "52px 36px 44px", flex: 1, display: "flex", flexDirection: "column" }}>
                  {/* Tag + pill */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                    <p
                      style={{
                        fontFamily: "var(--sans)",
                        fontSize: 10.5,
                        letterSpacing: ".2em",
                        textTransform: "uppercase",
                        color: o.featured ? "var(--gold)" : "rgba(255,255,255,0.38)",
                        margin: 0,
                        fontWeight: 500,
                      }}
                    >
                      {o.tag}
                    </p>
                    {o.featured && (
                      <span className="pill pill-gold" style={{ fontSize: 9 }}>★ Le plus choisi</span>
                    )}
                  </div>

                  <h3
                    className="display"
                    style={{ fontSize: "clamp(22px,2.2vw,34px)", color: "var(--white)", margin: "0 0 4px", lineHeight: 1.05 }}
                  >
                    {o.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: "var(--serif)",
                      fontStyle: "italic",
                      fontSize: 20,
                      color: o.featured ? "var(--gold)" : "rgba(200,168,75,0.75)",
                      margin: "0 0 18px",
                    }}
                  >
                    {o.duration}
                  </p>

                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: "rgba(255,255,255,0.7)", margin: "0 0 24px" }}>
                    {o.desc}
                  </p>

                  <hr style={{ height: 1, background: "rgba(255,255,255,0.1)", border: 0, marginBottom: 24 }} />

                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 auto", flex: 1 }}>
                    {o.bullets.map((b, j) => (
                      <li
                        key={j}
                        style={{
                          display: "flex",
                          gap: 12,
                          padding: "9px 0",
                          borderBottom: "1px solid rgba(255,255,255,0.07)",
                          fontSize: 13.5,
                          lineHeight: 1.55,
                          color: "rgba(255,255,255,0.78)",
                        }}
                      >
                        <span style={{ color: "var(--gold)", flexShrink: 0, fontSize: 10 }}>✦</span>
                        {b}
                      </li>
                    ))}
                  </ul>

                  {/* Footer carte */}
                  <div style={{ marginTop: 32, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                    <p
                      style={{
                        fontFamily: "var(--sans)",
                        fontSize: 10,
                        letterSpacing: ".12em",
                        textTransform: "uppercase",
                        color: "rgba(255,255,255,0.28)",
                        margin: "0 0 14px",
                      }}
                    >
                      Tarif sur devis
                    </p>
                    <Link
                      href="/offre-gold"
                      style={{
                        fontFamily: "var(--sans)",
                        fontSize: 11,
                        letterSpacing: ".14em",
                        textTransform: "uppercase",
                        color: o.featured ? "var(--gold)" : "rgba(255,255,255,0.5)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        textDecoration: "none",
                        transition: "color .25s",
                      }}
                    >
                      Voir les détails <Arrow size={11} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 52 }}>
            <Link href="/offre-gold" className="btn btn-gold">
              Découvrir l&apos;Offre Gold complète <Arrow />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          11 · TÉMOIGNAGES — on navy for contrast
          ══════════════════════════════════════════════════════ */}
      <section
        className="section"
        id="temoignages"
        style={{ background: "var(--paper)", position: "relative" }}
      >
        <span className="section-num">11 — Témoignages</span>
        <div className="container">
          <div className="section-head">
            <div>
              <Eyebrow style={{ marginBottom: 24 }}>Témoignages</Eyebrow>
              <h2>
                Ceux que j&apos;accompagne
                <br />
                <em className="display-italic">
                  témoignent.
                </em>
              </h2>
            </div>
            <p>
              Des avis Google vérifiés de celles et ceux qui cheminent avec La Voie 2 la Conscience.
            </p>
          </div>

          <div className="three-grid">
            {temoignages.map((t, i) => (
              <div
                key={i}
                data-reveal=""
                data-reveal-delay={String(i)}
                className="testi"
                style={{ display: "flex", flexDirection: "column" }}
              >
                <p
                  style={{
                    fontFamily: "var(--serif)",
                    fontSize: "clamp(15px,1.2vw,17px)",
                    lineHeight: 1.68,
                    color: "var(--navy-ink)",
                    margin: "0 0 24px",
                    fontStyle: "italic",
                    flexGrow: 1,
                    paddingTop: 26,
                  }}
                >
                  {t.quote}
                </p>
                <hr style={{ height: 1, background: "var(--line)", border: 0, marginBottom: 16 }} />
                <p style={{ margin: "0 0 6px", fontWeight: 600, fontSize: 13.5, color: "var(--navy)", fontFamily: "var(--sans)" }}>
                  {t.name}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontFamily: "var(--sans)",
                    fontSize: 10,
                    letterSpacing: ".1em",
                    textTransform: "uppercase",
                    color: "var(--gold)",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span style={{ fontSize: 11 }}>★★★★★</span>
                  {t.source}
                </p>
              </div>
            ))}
          </div>

          {/* Google rating bar */}
          <div
            style={{
              marginTop: 52,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 28,
              flexWrap: "wrap",
              padding: "24px 36px",
              background: "var(--white)",
              border: "1px solid var(--line)",
              maxWidth: 660,
              margin: "52px auto 0",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <p className="num" style={{ fontSize: 52, color: "var(--navy)", margin: 0, lineHeight: 1 }}>
                4.9
                <span style={{ fontSize: 20, color: "var(--mute)" }}>/5</span>
              </p>
              <p
                style={{
                  margin: "5px 0 0",
                  fontFamily: "var(--sans)",
                  color: "var(--gold)",
                  letterSpacing: ".04em",
                  fontSize: 13,
                }}
              >
                ★ ★ ★ ★ ★
              </p>
            </div>
            <div className="vdiv" style={{ height: 44, background: "var(--line-dark)" }} />
            <div>
              <p style={{ fontSize: 14.5, color: "var(--navy-ink)", margin: "0 0 4px", lineHeight: 1.5 }}>
                <strong style={{ fontWeight: 600 }}>142 avis Google</strong> · 100% recommandent
              </p>
              <p style={{ fontFamily: "var(--sans)", margin: 0, color: "var(--mute)", fontSize: 11.5 }}>
                Vérifiés · Anonymisés à la demande
              </p>
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: 44 }}>
            <Link href="/temoignages" className="btn btn-ghost">
              Lire tous les témoignages <Arrow />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          12 · MASTERCLASS
          ══════════════════════════════════════════════════════ */}
      <section
        id="masterclass"
        className="section sec-blue"
        style={{ background: "linear-gradient(150deg, #142579 0%, #0f1d6e 50%, #0a1450 100%)", color: "var(--white)", position: "relative" }}
      >
        <span className="section-num" style={{ color: "rgba(255,255,255,0.7)" }}>12 — Masterclass</span>
        <div className="container">
          <div className="masterclass-grid">
            {/* Copy */}
            <div data-reveal="">
              <Eyebrow style={{ color: "rgba(255,255,255,0.85)", marginBottom: 24 }}>Masterclass</Eyebrow>
              <h2
                className="display"
                style={{ fontSize: "clamp(26px,2.8vw,44px)", color: "var(--white)", margin: "0 0 24px", lineHeight: 1.05 }}
              >
                Pour celles qui
                <br />
                <em className="display-italic" style={{ color: "var(--white)" }}>
                  transmettent.
                </em>
              </h2>
              <hr style={{ height: 1, background: "rgba(255,255,255,0.09)", border: 0, marginBottom: 28 }} />
              <p style={{ fontSize: 16.5, lineHeight: 1.8, color: "rgba(255,255,255,0.78)", margin: "0 0 18px" }}>
                Une école sur invitation, pour thérapeutes et accompagnants confirmés qui souhaitent
                intégrer la{" "}
                <strong style={{ fontWeight: 500, color: "var(--white)" }}>
                  Voie Initiatique de l&apos;Eau
                </strong>{" "}
                à leur propre pratique.
              </p>
              <p style={{ fontSize: 15, lineHeight: 1.75, color: "rgba(255,255,255,0.5)", margin: "0 0 36px" }}>
                Quatre week-ends de formation par an. Promotion limitée à douze. Sélection
                sur dossier et entretien préalable avec Domoïna.
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Link href="/contact" className="btn btn-gold">
                  Candidater <Arrow />
                </Link>
                <Link href="/masterclass" className="btn btn-ghost-white">
                  Programme complet
                </Link>
              </div>
            </div>

            {/* Image */}
            <div data-reveal="" data-reveal-delay="1" style={{ position: "relative" }}>
              <div className="img-zoom">
                <Placeholder
                  mark="07"
                  style={{ aspectRatio: "4/5" }}
                  src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&q=80&auto=format&fit=crop"
                  alt="Masterclass — cercle de transmission"
                  sizes="(max-width: 768px) 100vw, 40vw"
                />
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: -24,
                  left: -24,
                  background: "var(--gold)",
                  padding: "18px 22px",
                  zIndex: 3,
                }}
              >
                <p className="display" style={{ fontSize: 36, color: "var(--navy-ink)", margin: 0, lineHeight: 1 }}>
                  12
                </p>
                <p
                  style={{
                    fontFamily: "var(--sans)",
                    fontSize: 10,
                    margin: "4px 0 0",
                    letterSpacing: ".16em",
                    textTransform: "uppercase",
                    color: "var(--navy-ink)",
                    opacity: 0.7,
                  }}
                >
                  places par an
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          14 · NEWSLETTER
          ══════════════════════════════════════════════════════ */}
      <section
        className="section"
        style={{ background: "var(--paper)", position: "relative", padding: "120px 0" }}
      >
        <span className="section-num">14 — Lettres</span>
        <div className="container">
          <div className="newsletter-grid">
            <div data-reveal="">
              <Eyebrow style={{ marginBottom: 24 }}>Les Lettres</Eyebrow>
              <h2 className="display" style={{ fontSize: "clamp(26px,2.8vw,44px)", margin: "0 0 24px", lineHeight: 1.05 }}>
                Une lettre par
                <br />
                <em className="display-italic">saison.</em>
              </h2>
              <hr className="filet" style={{ marginBottom: 24 }} />
              <p style={{ fontSize: 16, lineHeight: 1.8, color: "var(--navy-ink)", margin: 0 }}>
                Quatre fois par an, en accord avec le Cycle des Saisons — une lettre longue
                de Domoïna, des notes de pratique et l&apos;agenda des cohortes à venir.
                Pas de marketing, pas d&apos;algorithme, pas de fréquence imposée.
              </p>
            </div>
            <NewsletterForm />
          </div>
        </div>
      </section>

    </div>
  );
}
