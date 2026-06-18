import type { Metadata } from "next";
import Link from "next/link";
import Placeholder from "@/components/Placeholder";
import Marquee from "@/components/Marquee";
import NewsletterForm from "@/components/NewsletterForm";

export const metadata: Metadata = {
  title: "La Voie 2 la Conscience — Accompagnement initiatique premium",
  description:
    "Accompagnement initiatique haut de gamme pour dirigeants, cadres supérieurs et thérapeutes. 500+ transformations en 15 ans de pratique. Méthodes AIME, V.I.E. et Cycle des Saisons.",
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
  { n: "15+",  label: "Années d'expérience" },
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
      "La méthode pour la guérison de la blessure originelle : Accepter, Intégrer, Manifester, Élever votre Excellence Authentique Unique.",
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
    dur: "30 min · Offert",
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

const voyages = [
  {
    lieu: "Maroc",
    sub: "Atlas · Vallée des Roses",
    body:
      "Sept jours à la rencontre des sources, des hammams rituels et du silence des hauts plateaux.",
    month: "Mars / Octobre",
    img: "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=800&q=80&auto=format&fit=crop",
  },
  {
    lieu: "Japon",
    sub: "Kyoto · Onsens sacrés",
    body:
      "Dix jours dans la tradition des bains rituels japonais et des temples Zen — pratique du misogi.",
    month: "Avril / Novembre",
    img: "https://images.unsplash.com/photo-1480796927426-f609979314bd?w=800&q=80&auto=format&fit=crop",
  },
  {
    lieu: "Madagascar",
    sub: "Sources & Océan Indien",
    body:
      "Quatorze jours dans la terre d'origine de Domoina — rituels d'eau, héritage maternel, accompagnement intime.",
    month: "Janvier · Royale uniquement",
    img: "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=800&q=80&auto=format&fit=crop",
  },
];

const temoignages = [
  {
    quote:
      "Le travail amorcé avec Domoïna m'a permis d'accéder à une part de ma mémoire qui m'empêchait pourtant d'avancer correctement dans mon quotidien. J'ai pu constater les progrès réalisés au fil des séances individuelles.",
    name: "Nkodia Bervette",
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

const journal = [
  {
    cat: "Méthode V.I.E.",
    title: "L'eau comme élément de guérison : ce que la science dit.",
    date: "Avril 2026",
    read: "12 min",
    slug: "eau-element-guerison",
    img: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&q=80&auto=format&fit=crop",
  },
  {
    cat: "Leadership",
    title: "Diriger avec authenticité : la nouvelle compétence du XXIe siècle.",
    date: "Avril 2026",
    read: "10 min",
    slug: "diriger-authenticite",
    img: "https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=800&q=80&auto=format&fit=crop",
  },
  {
    cat: "Cycle des Saisons",
    title: "Retrouver ses rythmes naturels dans un monde qui s'accélère.",
    date: "Avril 2026",
    read: "7 min",
    slug: "cycle-saisons-rythmes-naturels",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80&auto=format&fit=crop",
  },
];

const presse = ["MADAME FIGARO", "LES ÉCHOS", "PSYCHOLOGIES", "L'OBS", "FORBES FR"];

/* ─── PAGE ───────────────────────────────────────────────── */

export default function Home() {
  return (
    <div className="page-fade">

      {/* ══════════════════════════════════════════════════════
          01 · HERO — Full-bleed cinematic
          ══════════════════════════════════════════════════════ */}
      <section
        className="hero-home"
        style={{
          position: "relative",
          height: "100svh",
          minHeight: 680,
          overflow: "hidden",
        }}
      >
        {/* Full-bleed background image */}
        <Placeholder
          style={{ position: "absolute", inset: 0 }}
          src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1800&q=90&auto=format&fit=crop"
          alt="Présence et transformation — La Voie 2 la Conscience"
          sizes="100vw"
        />

        {/* Bottom gradient — main text legibility */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(7,16,60,0.98) 0%, rgba(7,16,60,0.82) 30%, rgba(7,16,60,0.3) 65%, rgba(7,16,60,0.05) 100%)",
            zIndex: 1,
          }}
        />
        {/* Left scrim — contrast behind headline */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(110deg, rgba(7,16,60,0.55) 0%, rgba(7,16,60,0.15) 50%, transparent 100%)",
            zIndex: 1,
          }}
        />

        {/* ── Content anchored bottom-left ── */}
        <div
          className="hero-home-content"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            paddingBottom: "clamp(52px, 9vh, 108px)",
          }}
        >
          <div className="container">

            {/* Live badge */}
            <p
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontFamily: "var(--sans)",
                fontSize: 10,
                letterSpacing: ".28em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.48)",
                margin: "0 0 32px",
              }}
            >
              <span
                style={{
                  width: 5,
                  height: 5,
                  background: "var(--gold)",
                  borderRadius: "50%",
                  flexShrink: 0,
                  boxShadow: "0 0 10px rgba(200,168,75,0.8)",
                }}
              />
              Domoïna · Guide initiatique
            </p>

            {/* H1 — large Cormorant Garamond serif */}
            <h1
              className="mega"
              data-reveal=""
              style={{
                fontSize: "clamp(28px, 3.7vw, 54px)",
                color: "var(--white)",
                margin: 0,
                lineHeight: 1.1,
                fontWeight: 300,
                letterSpacing: "-0.01em",
                maxWidth: 860,
              }}
            >
              Guide initiatique pour dirigeants, cadres et thérapeutes{" "}
              <em
                className="display-italic"
                style={{ color: "var(--gold)", fontWeight: 300 }}
              >
                en quête de sens et d&apos;équilibre.
              </em>
            </h1>

            {/* Divider */}
            <div
              style={{
                width: 56,
                height: 1,
                background: "linear-gradient(90deg, rgba(200,168,75,0.8), transparent)",
                margin: "36px 0 28px",
              }}
            />

            {/* Subline */}
            <p
              data-reveal=""
              data-reveal-delay="2"
              style={{
                fontFamily: "var(--sans)",
                fontSize: "clamp(14px, 1.2vw, 16.5px)",
                lineHeight: 1.8,
                maxWidth: 640,
                margin: "0 0 44px",
                color: "rgba(255,255,255,0.72)",
              }}
            >
              J&apos;accompagne les dirigeants, cadres et thérapeutes à transformer leurs
              blessures originelles — traumatismes conscients ou inconscients — ainsi que leurs
              schémas de compensation en leur{" "}
              <em style={{ fontFamily: "var(--serif)", color: "rgba(255,255,255,0.95)" }}>
                zone d&apos;Excellence Authentique Unique (E.A.U.)
              </em>
              , grâce à une méthode fondée sur 3 axes — la science initiatique, la sagesse
              ancestrale et la puissance transformatrice de l&apos;Eau — et 4 piliers.
            </p>

            {/* CTAs */}
            <div data-reveal="" data-reveal-delay="3">
              <div
                className="hero-cta-row"
                style={{ display: "inline-flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}
              >
                <Link href="/contact" className="btn btn-gold btn-lg">
                  Réserver un appel <Arrow />
                </Link>
                <Link href="/domoina" className="btn btn-ghost-white">
                  Découverte Domoïna
                </Link>
              </div>
              <span
                style={{
                  display: "block",
                  marginTop: 18,
                  fontFamily: "var(--sans)",
                  fontSize: 10.5,
                  letterSpacing: ".1em",
                  color: "rgba(255,255,255,0.28)",
                }}
              >
                Appel offert · Sans engagement
              </span>
            </div>

          </div>
        </div>

        {/* ── Top-right coordinates ── */}
        <div
          style={{
            position: "absolute",
            top: 100,
            right: 52,
            zIndex: 2,
            textAlign: "right",
          }}
        >
          <p
            style={{
              fontFamily: "var(--sans)",
              fontSize: 9.5,
              letterSpacing: ".22em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.3)",
              margin: 0,
              lineHeight: 1.9,
            }}
          >
            Centre HUT · Sarthe
            <br />
            <span style={{ color: "var(--gold)", opacity: 0.55 }}>48°10′ N · 0°06′ E</span>
          </p>
        </div>

        {/* ── Scroll indicator ── */}
        <div
          style={{
            position: "absolute",
            bottom: "clamp(28px, 5vh, 52px)",
            right: 52,
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span
            style={{
              fontFamily: "var(--sans)",
              fontSize: 8.5,
              letterSpacing: ".32em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.28)",
              writingMode: "vertical-rl",
              transform: "rotate(180deg)",
            }}
          >
            Découvrir
          </span>
          <span
            style={{
              display: "block",
              width: 1,
              height: 44,
              background: "linear-gradient(to bottom, rgba(200,168,75,0.7), transparent)",
            }}
          />
        </div>

        {/* ── Bottom gold rule ── */}
        <hr
          className="filet-gold-full"
          style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 3, opacity: 0.5 }}
        />
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
          02 · STATS
          ══════════════════════════════════════════════════════ */}
      <section
        style={{ background: "var(--navy)", color: "var(--white)", padding: "80px 0", position: "relative" }}
        className="noise"
      >
        <span className="section-num">02 — Repères</span>
        <div className="container">
          <div className="stats-grid">
            {stats.map((s, i) => (
              <div
                key={i}
                data-reveal=""
                data-reveal-delay={String(i)}
                style={{
                  padding: "24px 32px",
                  textAlign: "center",
                  borderLeft: i === 0 ? 0 : "1px solid rgba(255,255,255,0.12)",
                }}
              >
                <div
                  className="stat-n"
                  style={{ fontSize: "clamp(36px,4vw,56px)", marginBottom: 10 }}
                >
                  {s.n}
                </div>
                <p
                  style={{
                    fontFamily: "var(--sans)",
                    margin: 0,
                    letterSpacing: ".14em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.6)",
                    fontSize: 11,
                  }}
                >
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          03 · MANIFESTE
          ══════════════════════════════════════════════════════ */}
      <section style={{ background: "var(--paper)", padding: "140px 0", position: "relative" }}>
        <span className="section-num">03 — La Voie 2 la Conscience</span>
        <div className="container-narrow" style={{ textAlign: "center" }}>
          <Eyebrow centered style={{ marginBottom: 36 }}>
            La Voie 2 la Conscience
          </Eyebrow>
          <p
            data-reveal=""
            className="mega"
            style={{
              fontSize: "clamp(22px,2.6vw,42px)",
              lineHeight: 1.18,
              margin: 0,
              fontWeight: 300,
              color: "var(--navy-ink)",
            }}
          >
            Un espace sacré dédié à votre transformation intérieure et à{" "}
            <em style={{ color: "var(--gold)", fontStyle: "italic" }}>
              l&apos;éveil de votre plein potentiel.
            </em>
          </p>
          <hr className="filet" style={{ margin: "44px auto 28px" }} />
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.85,
              color: "var(--navy-ink)",
              margin: "0 auto",
              maxWidth: 620,
            }}
          >
            La Voie 2 la Conscience est née d&apos;une vision profonde : créer un pont entre le
            monde matériel et spirituel, permettant à chaque âme de retrouver sa véritable essence.
            Fondée par Domoina, guide spirituelle reconnue, notre approche allie sagesse ancestrale
            et techniques modernes pour vous accompagner dans votre voyage de transformation.
          </p>
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
                alt="Portrait de Domoina Bockomba, guide initiatique"
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
                Domoina,
                <br />
                <em style={{ fontWeight: 300 }}>guide initiatique.</em>
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
              Trois méthodes propriétaires développées sur quinze ans de pratique.
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

          <div className="four-grid">
            {parcours.map((p, i) => (
              <div
                key={i}
                data-reveal=""
                data-reveal-delay={String(i)}
                style={{ position: "relative" }}
              >
                <div className="step-circle" style={{ marginBottom: 22 }}>
                  {p.step}
                </div>
                <h4
                  className="display"
                  style={{ fontSize: "clamp(22px,2.2vw,28px)", color: "var(--navy)", margin: "0 0 8px", lineHeight: 1.15 }}
                >
                  {p.title}
                </h4>
                <p
                  style={{
                    fontFamily: "var(--serif)",
                    fontStyle: "italic",
                    fontSize: 13.5,
                    color: "var(--gold)",
                    margin: "0 0 16px",
                  }}
                >
                  {p.dur}
                </p>
                <p style={{ fontSize: 14, lineHeight: 1.72, color: "var(--navy-ink)", margin: 0 }}>
                  {p.body}
                </p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 60 }}>
            <Link href="/contact" className="btn btn-ghost">
              Démarrer à l&apos;étape 01 <Arrow />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          08 · OFFRE GOLD
          ══════════════════════════════════════════════════════ */}
      <section
        className="section"
        style={{ background: "var(--navy)", color: "var(--white)", position: "relative" }}
      >
        <span className="section-num">08 — Offre Gold</span>
        <div className="container">
          <div className="section-head" style={{ alignItems: "end" }}>
            <div>
              <Eyebrow gold style={{ marginBottom: 24 }}>L&apos;Offre Gold</Eyebrow>
              <h2 style={{ color: "var(--white)" }}>
                Trois niveaux
                <br />
                <em className="display-italic" style={{ color: "var(--gold)" }}>
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
                style={{
                  borderRight: i < 2 ? "1px solid rgba(255,255,255,0.15)" : 0,
                  background: o.featured ? "rgba(200,168,75,0.07)" : "transparent",
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                }}
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
          09 · CENTRE HUT
          ══════════════════════════════════════════════════════ */}
      <section className="section" style={{ position: "relative" }}>
        <span className="section-num">09 — Centre HUT</span>
        <div className="container">
          <div className="hut-grid">
            {/* Gallery */}
            <div data-reveal="">
              <div className="img-zoom" style={{ marginBottom: 12 }}>
                <Placeholder
                  style={{ aspectRatio: "14/10" }}
                  src="/hut-jardin-zen.png"
                  alt="Jardin zen du Centre HUT au crépuscule — bassin, lavandes et olivier"
                  sizes="(max-width: 768px) 100vw, 55vw"
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="img-zoom">
                  <Placeholder
                    style={{ aspectRatio: "4/3" }}
                    src="/hut-terrasse.png"
                    alt="Terrasse et bâtisse en pierre du Centre HUT"
                    sizes="(max-width: 768px) 50vw, 27vw"
                  />
                </div>
                <div className="img-zoom">
                  <Placeholder
                    style={{ aspectRatio: "4/3" }}
                    src="/hut-salle.png"
                    alt="Salle à manger conviviale du Centre HUT"
                    sizes="(max-width: 768px) 50vw, 27vw"
                  />
                </div>
              </div>
            </div>

            {/* Copy */}
            <div data-reveal="" data-reveal-delay="1">
              <Eyebrow style={{ marginBottom: 24 }}>Un sanctuaire de reconnexion à soi</Eyebrow>
              <h2
                className="display"
                style={{ fontSize: "clamp(28px,3vw,46px)", margin: "0 0 24px", lineHeight: 1.05 }}
              >
                Le Centre HUT,
                <br />
                <em style={{ fontWeight: 300 }}>un sanctuaire</em>
                <br />
                de reconnexion à soi.
              </h2>
              <hr className="filet" style={{ marginBottom: 28 }} />
              <p style={{ fontSize: 16.5, lineHeight: 1.8, color: "var(--navy-ink)", margin: "0 0 22px" }}>
                Vous n&apos;y venez pas par hasard. Il y a des lieux qui marquent une étape&nbsp;:
                HUT en fait partie. Ce centre ne vous accueille pas, il vous reconnaît — et vous
                offre le cadre juste pour aller là où vous n&apos;êtes encore jamais allé.
              </p>
              <p style={{ fontSize: 15, lineHeight: 1.78, color: "var(--mute)", margin: "0 0 32px" }}>
                À deux heures de Paris, niché dans une nature vibrante et préservée, le Centre HUT
                est un espace vivant, pensé comme un cocon initiatique pour vos processus de
                guérison, de transformation et de renaissance.
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                  paddingTop: 28,
                  borderTop: "1px solid var(--line)",
                }}
              >
                {[
                  { n: "2h", label: "de Paris" },
                  { n: "8", label: "Personnes max" },
                ].map((s, i) => (
                  <div key={i}>
                    <p className="num" style={{ fontSize: "clamp(26px,2.8vw,36px)", color: "var(--navy)", margin: "0 0 4px" }}>
                      {s.n}
                    </p>
                    <p
                      style={{
                        fontFamily: "var(--sans)",
                        fontSize: 10,
                        margin: 0,
                        letterSpacing: ".12em",
                        textTransform: "uppercase",
                        color: "var(--mute)",
                      }}
                    >
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          10 · VOYAGES INITIATIQUES
          ══════════════════════════════════════════════════════ */}
      <section className="section" style={{ background: "var(--white)", position: "relative" }}>
        <span className="section-num">10 — Voyages</span>
        <div className="container">
          <div className="section-head">
            <div>
              <Eyebrow style={{ marginBottom: 24 }}>Voyages initiatiques</Eyebrow>
              <h2>
                Trois destinations,
                <br />
                <em className="display-italic">une même eau.</em>
              </h2>
            </div>
            <p>
              Inclus dans l&apos;Immersion Royale, optionnels en Expansion. Chaque voyage
              prolonge le travail du Centre HUT dans une géographie qui ajoute son propre enseignement.
            </p>
          </div>

          <div className="three-grid">
            {voyages.map((v, i) => (
              <div
                key={i}
                data-reveal=""
                data-reveal-delay={String(i)}
                className="card-hover"
                style={{ background: "var(--paper)", border: "1px solid var(--line)" }}
              >
                <div className="img-zoom" style={{ borderBottom: "1px solid var(--line)" }}>
                  <Placeholder
                    mark={"0" + (i + 6)}
                    style={{ aspectRatio: "16/10" }}
                    src={v.img}
                    alt={"Voyage initiatique · " + v.lieu}
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div style={{ padding: "26px 30px 32px" }}>
                  <p
                    style={{
                      fontFamily: "var(--sans)",
                      fontSize: 10.5,
                      letterSpacing: ".2em",
                      textTransform: "uppercase",
                      color: "var(--gold)",
                      margin: "0 0 10px",
                      fontWeight: 500,
                    }}
                  >
                    {v.month}
                  </p>
                  <h3
                    className="display"
                    style={{ fontSize: "clamp(22px,2.2vw,32px)", color: "var(--navy)", margin: "0 0 4px", lineHeight: 1.1 }}
                  >
                    {v.lieu}
                  </h3>
                  <p
                    style={{
                      fontFamily: "var(--serif)",
                      fontStyle: "italic",
                      fontSize: 15,
                      color: "var(--mute)",
                      margin: "0 0 18px",
                    }}
                  >
                    {v.sub}
                  </p>
                  <hr className="filet" style={{ marginBottom: 18 }} />
                  <p style={{ fontSize: 14, lineHeight: 1.72, color: "var(--navy-ink)", margin: 0 }}>
                    {v.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="filet-gold-full" />

      {/* ══════════════════════════════════════════════════════
          11 · TÉMOIGNAGES — on navy for contrast
          ══════════════════════════════════════════════════════ */}
      <section
        className="section"
        id="temoignages"
        style={{ background: "var(--navy)", position: "relative" }}
      >
        <span className="section-num">11 — Témoignages</span>
        <div className="container">
          <div className="section-head">
            <div>
              <Eyebrow gold style={{ marginBottom: 24 }}>Témoignages</Eyebrow>
              <h2 style={{ color: "var(--white)" }}>
                Ceux que j&apos;accompagne
                <br />
                <em className="display-italic" style={{ color: "var(--gold)" }}>
                  témoignent.
                </em>
              </h2>
            </div>
            <p style={{ color: "rgba(255,255,255,0.58)" }}>
              Des avis Google vérifiés de celles et ceux qui cheminent avec La Voie 2 la Conscience.
            </p>
          </div>

          <div className="three-grid">
            {temoignages.map((t, i) => (
              <div
                key={i}
                data-reveal=""
                data-reveal-delay={String(i)}
                className="testi-dark"
                style={{ display: "flex", flexDirection: "column" }}
              >
                <p
                  style={{
                    fontFamily: "var(--serif)",
                    fontSize: "clamp(15px,1.2vw,17px)",
                    lineHeight: 1.68,
                    color: "rgba(255,255,255,0.88)",
                    margin: "0 0 24px",
                    fontStyle: "italic",
                    flexGrow: 1,
                    paddingTop: 26,
                  }}
                >
                  {t.quote}
                </p>
                <hr style={{ height: 1, background: "rgba(255,255,255,0.1)", border: 0, marginBottom: 16 }} />
                <p style={{ margin: "0 0 6px", fontWeight: 500, fontSize: 13.5, color: "var(--white)", fontFamily: "var(--sans)" }}>
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
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              maxWidth: 660,
              margin: "52px auto 0",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <p className="num" style={{ fontSize: 52, color: "var(--white)", margin: 0, lineHeight: 1 }}>
                4.9
                <span style={{ fontSize: 20, color: "rgba(255,255,255,0.35)" }}>/5</span>
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
            <div className="vdiv" style={{ height: 44 }} />
            <div>
              <p style={{ fontSize: 14.5, color: "rgba(255,255,255,0.82)", margin: "0 0 4px", lineHeight: 1.5 }}>
                <strong style={{ fontWeight: 500 }}>142 avis Google</strong> · 100% recommandent
              </p>
              <p style={{ fontFamily: "var(--sans)", margin: 0, color: "rgba(255,255,255,0.38)", fontSize: 11.5 }}>
                Vérifiés · Anonymisés à la demande
              </p>
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: 44 }}>
            <Link href="/temoignages" className="btn btn-ghost-white">
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
        className="section"
        style={{ background: "var(--navy-ink)", color: "var(--white)", position: "relative" }}
      >
        <span className="section-num">12 — Masterclass</span>
        <div className="container">
          <div className="masterclass-grid">
            {/* Copy */}
            <div data-reveal="">
              <Eyebrow gold style={{ marginBottom: 24 }}>Masterclass</Eyebrow>
              <h2
                className="display"
                style={{ fontSize: "clamp(26px,2.8vw,44px)", color: "var(--white)", margin: "0 0 24px", lineHeight: 1.05 }}
              >
                Pour celles qui
                <br />
                <em className="display-italic" style={{ color: "var(--gold)" }}>
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
                sur dossier et entretien préalable avec Domoina.
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
          13 · JOURNAL
          ══════════════════════════════════════════════════════ */}
      <section id="journal" className="section" style={{ background: "var(--paper)", position: "relative" }}>
        <span className="section-num">13 — Journal</span>
        <div className="container">
          <div className="section-head">
            <div>
              <Eyebrow style={{ marginBottom: 24 }}>Journal</Eyebrow>
              <h2>
                Lire,
                <br />
                <em className="display-italic">avant de venir.</em>
              </h2>
            </div>
            <p>
              Textes, notes de pratique et témoignages — pour donner à lire ce qui ne se résume pas.
            </p>
          </div>

          <div className="three-grid">
            {journal.map((j, i) => (
              <Link
                key={i}
                href={`/blog/${j.slug}`}
                data-reveal=""
                data-reveal-delay={String(i)}
                className="card-hover"
                style={{ display: "block", background: "var(--white)", border: "1px solid var(--line)", textDecoration: "none" }}
              >
                <div className="img-zoom" style={{ borderBottom: "1px solid var(--line)" }}>
                  <Placeholder
                    mark={"0" + (i + 8)}
                    style={{ aspectRatio: "16/10" }}
                    src={j.img}
                    alt={j.title}
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div style={{ padding: "22px 26px 28px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <span className="pill">{j.cat}</span>
                    <span style={{ fontFamily: "var(--sans)", fontSize: 11, color: "var(--mute)" }}>
                      {j.read} lecture
                    </span>
                  </div>
                  <h3
                    className="display"
                    style={{ fontSize: "clamp(19px,1.9vw,26px)", color: "var(--navy)", margin: "0 0 16px", lineHeight: 1.28 }}
                  >
                    {j.title}
                  </h3>
                  <hr className="filet" style={{ marginBottom: 16 }} />
                  <p style={{ fontFamily: "var(--sans)", fontSize: 12, margin: 0, color: "var(--mute)", letterSpacing: ".04em" }}>
                    <span style={{ color: "var(--gold)", marginRight: 6 }}>—</span>
                    {j.date}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 52 }}>
            <Link href="/blog" className="link-underline">
              Lire tout le journal <Arrow />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          14 · PRESSE
          ══════════════════════════════════════════════════════ */}
      <section
        style={{
          padding: "52px 0",
          background: "var(--white)",
          borderTop: "1px solid var(--line)",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <div className="container">
          <p
            style={{
              textAlign: "center",
              fontFamily: "var(--sans)",
              fontSize: 10.5,
              letterSpacing: ".22em",
              textTransform: "uppercase",
              color: "var(--mute)",
              margin: "0 0 32px",
            }}
          >
            Une pratique citée dans
          </p>
          <div className="presse-grid">
            {presse.map((m, i) => (
              <div
                key={i}
                style={{
                  textAlign: "center",
                  fontFamily: "var(--serif)",
                  fontStyle: "italic",
                  fontSize: "clamp(14px,1.8vw,22px)",
                  color: "var(--navy)",
                  opacity: 0.35,
                  padding: "8px 0",
                  borderLeft: i === 0 ? 0 : "1px solid var(--line)",
                  transition: "opacity 0.3s",
                }}
              >
                {m}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          15 · NEWSLETTER
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
                de Domoina, des notes de pratique et l&apos;agenda des cohortes à venir.
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
