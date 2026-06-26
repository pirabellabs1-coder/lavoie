import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Challenge offert — De la Blessure Originelle à l'Équilibre de Vie",
  description:
    "Un challenge gratuit 100% en ligne sur 3 jours pour dirigeants : mettre en lumière votre blessure originelle et retrouver l'équilibre entre réussite et vie personnelle. Animé par Domoïna Ramiadana.",
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

const stats = [
  { n: "3", label: "Jours intensifs" },
  { n: "5h30", label: "De contenu" },
  { n: "+300", label: "Dirigeants accompagnés" },
];

const situations = [
  { t: "Tensions dans votre couple", b: "Vous donnez tout au travail, mais votre relation de couple s'effrite en silence." },
  { t: "Distance avec votre famille", b: "Vos enfants grandissent sans vous. Vous êtes présent physiquement et absent émotionnellement." },
  { t: "Fatigue profonde", b: "Malgré votre réussite, vous ressentez une fatigue qui ne part jamais, même après les vacances." },
  { t: "Mode survie-performance", b: "Toujours faire plus, tenir, contrôler… Vous fonctionnez en pilote automatique." },
  { t: "Addictions compensatoires", b: "Travail excessif, contrôle, sport intensif, alcool… Des refuges pour éviter de ressentir." },
  { t: "Sentiment de vide", b: "Vous avez tout réussi sur le papier, mais quelque chose manque profondément." },
];

const jours = [
  {
    jour: "01",
    duree: "Jour 1 — 1h30 de masterclass",
    titre: "Comprendre votre blessure originelle",
    desc: "Découvrez comment votre blessure originelle dirige en silence votre vie et vos réussites, et comment elle vous entraîne dans des formes de compensation (travail, contrôle, addictions…).",
    points: ["Identification de votre blessure profonde", "Compréhension de ses mécanismes", "Prise de conscience des compensations"],
  },
  {
    jour: "02",
    duree: "Jour 2 — 2h d'atelier",
    titre: "Cartographier vos schémas",
    desc: "Cartographiez vos schémas de compensation et commencez à transformer cette blessure en boussole intérieure, pour vous rapprocher de qui vous êtes vraiment — au-delà des masques et des rôles.",
    points: ["Cartographie de vos schémas", "Transformation de la blessure en boussole", "Reconnexion à votre authenticité"],
  },
  {
    jour: "03",
    duree: "Jour 3 — 2h d'atelier",
    titre: "Poser les premiers ajustements",
    desc: "Posez les premiers ajustements concrets dans les différents domaines de votre vie, afin de sortir du mode « survie–performance » et retrouver plus d'équilibre dans votre vie de couple, familiale et professionnelle.",
    points: ["3 à 5 ajustements concrets", "Plan d'action personnalisé", "Début de rééquilibrage de vie"],
  },
];

const obtenir = [
  "Une compréhension plus claire de votre blessure originelle et de la manière dont elle influence vos choix, vos relations et vos réussites.",
  "Une cartographie simple de vos schémas de compensation : là où vous sur-travaillez, sur-contrôlez, vous coupez de vous-même ou vous réfugiez dans des addictions.",
  "Une vision plus lucide de l'impact de ces schémas sur votre vie de couple, votre vie de famille et votre relation à vous-même.",
  "3 à 5 ajustements concrets à mettre en place pour sortir du mode « survie–performance » et remettre de l'équilibre dans les différents domaines de votre vie.",
];

const temoignages = [
  { name: "Nora Hachelaf", quote: "Domoïna est une thérapeute que je recommande vivement. Dès notre première rencontre, j'ai été frappée par son écoute attentive et sa capacité à déceler ce qui se passe réellement." },
  { name: "Nkodia Bervette", quote: "Le travail amorcé avec Domoïna m'a permis d'accéder à une part de ma mémoire qui m'empêchait pourtant d'avancer correctement dans mon quotidien. J'ai pu constater les progrès réalisés au fil des séances individuelles." },
  { name: "Bernard Joly", quote: "J'ai eu l'occasion de travailler avec Domoïna pour un problème que j'avais au dos. Dès la 1ʳᵉ séance j'ai été surpris du résultat, car cela faisait plusieurs mois que je ne dormais plus la nuit." },
  { name: "Ariel Zoalguidas", quote: "Faire le lien entre ce que je ne vois pas mais qui se manifeste et ce que je connais ou ce que je vis… ça n'a pas de prix ! J'ai appris à me comprendre et j'en apprends encore tous les jours." },
];

const bioStats = [
  { n: "+300", label: "Dirigeants accompagnés" },
  { n: "15+", label: "Années d'expérience" },
  { n: "98%", label: "Taux de satisfaction" },
];

const inscription = [
  { t: "100% offert", b: "Aucun paiement requis. Accès complet aux 3 jours." },
  { t: "5h30 de contenu", b: "Masterclass + ateliers pratiques sur 3 jours." },
  { t: "Données protégées", b: "Vos informations restent strictement confidentielles." },
];

export default function MasterclassChallenge() {
  return (
    <div className="page-fade">

      {/* HERO */}
      <section className="page-hero sec-blue" style={{ background: "linear-gradient(150deg, #142579 0%, #0f1d6e 50%, #0a1450 100%)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="container-narrow" style={{ textAlign: "center" }}>
          <Eyebrow style={{ marginBottom: 32, color: "var(--gold)" }}>
            Challenge offert · 100% en ligne · 3 jours
          </Eyebrow>
          <h1 className="display" style={{ fontSize: "clamp(32px, 4.4vw, 68px)", margin: "0 0 24px", lineHeight: 1.05, color: "var(--white)" }}>
            De la Blessure Originelle<br />
            <em className="display-italic" style={{ color: "var(--gold)" }}>à l&apos;Équilibre de Vie.</em>
          </h1>
          <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 20, color: "rgba(255,255,255,0.9)", margin: "0 0 20px" }}>
            Vous avez réussi. Mais à quel prix&nbsp;?
          </p>
          <p style={{ fontSize: 17, lineHeight: 1.75, color: "rgba(255,255,255,0.7)", maxWidth: 600, margin: "0 auto 40px" }}>
            Ce challenge 100% en ligne est pour vous si vous sentez que votre vie personnelle paie
            le prix de votre réussite extérieure.
          </p>
          <Link href="/contact" className="btn btn-gold btn-lg">
            Je m&apos;inscris gratuitement <Arrow />
          </Link>

          <div style={{ display: "flex", justifyContent: "center", gap: 56, flexWrap: "wrap", marginTop: 56 }}>
            {stats.map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <p className="stat-n" style={{ fontSize: 44, color: "var(--gold)", margin: 0 }}>{s.n}</p>
                <p style={{ fontFamily: "var(--sans)", fontSize: 10.5, letterSpacing: ".16em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)", margin: "4px 0 0" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SITUATIONS */}
      <section className="section" style={{ background: "var(--white)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <Eyebrow>Vous reconnaissez-vous&nbsp;?</Eyebrow>
            <h2 className="display" style={{ fontSize: 40, margin: "24px 0 16px", lineHeight: 1.1 }}>
              Vous reconnaissez-vous dans <em className="display-italic">ces situations&nbsp;?</em>
            </h2>
            <p style={{ fontSize: 16.5, lineHeight: 1.7, color: "var(--mute)", maxWidth: 600, margin: "0 auto" }}>
              Vous avez «&nbsp;réussi&nbsp;» sur le papier. Mais votre vie personnelle paie le prix de cette réussite extérieure.
            </p>
          </div>

          <div className="rg-3" style={{ gap: 1, background: "var(--line)", border: "1px solid var(--line)" }}>
            {situations.map((s, i) => (
              <div key={i} data-reveal="" data-reveal-delay={String(i % 3)} style={{ padding: "36px 32px", background: "var(--white)" }}>
                <div style={{ width: 30, height: 30, border: "1px solid var(--gold)", borderRadius: "50%", display: "grid", placeItems: "center", color: "var(--gold)", fontSize: 14, marginBottom: 18 }}>✕</div>
                <h3 className="display" style={{ fontSize: 22, color: "var(--navy)", margin: "0 0 12px", lineHeight: 1.2 }}>{s.t}</h3>
                <p style={{ fontSize: 14.5, lineHeight: 1.65, color: "var(--mute)", margin: 0 }}>{s.b}</p>
              </div>
            ))}
          </div>

          <p style={{ textAlign: "center", marginTop: 48, fontFamily: "var(--serif)", fontStyle: "italic", fontSize: "clamp(20px, 2.4vw, 30px)", color: "var(--navy)", lineHeight: 1.4 }}>
            Tout cela a une origine commune&nbsp;: <span style={{ color: "var(--gold)" }}>votre blessure originelle.</span>
          </p>
        </div>
      </section>

      {/* PROGRAMME */}
      <section className="section sec-blue" style={{ background: "linear-gradient(150deg, #142579 0%, #0f1d6e 50%, #0a1450 100%)", color: "var(--white)" }}>
        <div className="container">
          <div className="section-head">
            <div>
              <Eyebrow style={{ marginBottom: 24, color: "var(--gold)" }}>Programme du challenge</Eyebrow>
              <h2 style={{ color: "var(--white)" }}>
                3 jours pour<br /><em className="display-italic" style={{ color: "var(--gold)" }}>transformer votre vie.</em>
              </h2>
            </div>
            <p style={{ color: "rgba(255,255,255,0.72)" }}>
              Un parcours progressif et intense pour mettre en lumière votre blessure originelle et
              commencer à retrouver l&apos;équilibre dans votre vie de couple, familiale et professionnelle.
            </p>
          </div>

          <div style={{ display: "grid", gap: 16 }}>
            {jours.map((j, i) => (
              <div key={i} data-reveal="" data-reveal-delay={String(i)} className="rg-split-fixed" style={{ gap: 40, padding: "40px 44px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", alignItems: "start" }}>
                <div>
                  <p className="display" style={{ fontSize: 64, color: "rgba(200,168,75,0.45)", margin: 0, lineHeight: 1 }}>{j.jour}</p>
                  <p style={{ fontFamily: "var(--sans)", fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--gold)", margin: "12px 0 0" }}>{j.duree}</p>
                </div>
                <div>
                  <h3 className="display" style={{ fontSize: 28, color: "var(--white)", margin: "0 0 14px", lineHeight: 1.2 }}>{j.titre}</h3>
                  <p style={{ fontSize: 15, lineHeight: 1.7, color: "rgba(255,255,255,0.72)", margin: "0 0 22px" }}>{j.desc}</p>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                    {j.points.map((p, k) => (
                      <li key={k} style={{ display: "flex", gap: 12, fontSize: 14, color: "rgba(255,255,255,0.85)" }}>
                        <span style={{ color: "var(--gold)", flexShrink: 0 }}>✦</span>{p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CE QUE TU VAS OBTENIR */}
      <section className="section" style={{ background: "var(--paper)" }}>
        <div className="container-narrow">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <Eyebrow>Ce que vous allez obtenir</Eyebrow>
            <h2 className="display" style={{ fontSize: 40, margin: "24px 0 0", lineHeight: 1.1 }}>
              À l&apos;issue de <em className="display-italic">ces 3 jours.</em>
            </h2>
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: "0 auto 44px", maxWidth: 720 }}>
            {obtenir.map((o, i) => (
              <li key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start", padding: "20px 0", borderBottom: "1px solid var(--line)" }}>
                <span style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--gold)", color: "var(--navy-ink)", display: "grid", placeItems: "center", flexShrink: 0, fontSize: 13, marginTop: 2 }}>✓</span>
                <span style={{ fontSize: 16, lineHeight: 1.65, color: "var(--navy-ink)" }}>{o}</span>
              </li>
            ))}
          </ul>
          <div style={{ textAlign: "center" }}>
            <Link href="/contact" className="btn btn-primary btn-lg">
              Je veux ces résultats <Arrow />
            </Link>
          </div>
        </div>
      </section>

      {/* QUI SUIS-JE */}
      <section className="section" style={{ background: "var(--white)" }}>
        <div className="container-narrow">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <Eyebrow>Qui suis-je&nbsp;?</Eyebrow>
            <h2 className="display" style={{ fontSize: 36, margin: "24px 0 8px", lineHeight: 1.1 }}>
              Domoïna Ramiadana
            </h2>
            <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 16, color: "var(--gold)", margin: 0 }}>
              Guide initiatique des dirigeants, cadres et thérapeutes en quête d&apos;excellence.
            </p>
          </div>

          <div style={{ display: "grid", gap: 22, maxWidth: 720, margin: "0 auto" }}>
            <p style={{ fontFamily: "var(--serif)", fontSize: 20, lineHeight: 1.55, color: "var(--navy)", margin: 0 }}>
              Mon intention n&apos;est pas de vous aider à «&nbsp;performer plus&nbsp;», mais à revenir à l&apos;essentiel.
            </p>
            <p style={{ fontSize: 16, lineHeight: 1.8, color: "var(--navy-ink)", margin: 0 }}>
              J&apos;accompagne des dirigeants, cadres, entrepreneurs et thérapeutes qui ont déjà réussi à
              «&nbsp;tout cocher&nbsp;» à l&apos;extérieur… mais qui sentent que quelque chose se fissure à l&apos;intérieur&nbsp;:
              une fatigue qui ne passe plus, des tensions dans le couple ou la famille, le sentiment de vivre
              en pilote automatique — et parfois des mécanismes d&apos;évitement ou d&apos;addiction qu&apos;ils ne s&apos;expliquent pas.
            </p>
            <p style={{ fontSize: 16, lineHeight: 1.8, color: "var(--navy-ink)", margin: 0 }}>
              Mon travail consiste à vous aider à mettre en lumière et à commencer à guérir votre blessure
              originelle — cette blessure profonde qui a façonné qui vous êtes et vos talents, mais qui, tant
              qu&apos;elle n&apos;est pas apaisée, vous entraîne dans des mécanismes de compensation qui déséquilibrent votre vie.
            </p>
            <p style={{ fontSize: 16, lineHeight: 1.8, color: "var(--mute)", margin: 0 }}>
              Quand cette blessure commence à être reconnue et apaisée, les compensations se relâchent,
              les masques tombent, l&apos;équilibre se réinstalle. Le rayonnement dans votre activité et votre
              leadership devient alors une conséquence de cet équilibre — et non un objectif à atteindre
              coûte que coûte.
            </p>
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: 60, flexWrap: "wrap", marginTop: 52 }}>
            {bioStats.map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <p className="num" style={{ fontSize: 52, color: "var(--navy)", margin: 0 }}>{s.n}</p>
                <p className="small muted" style={{ letterSpacing: ".16em", textTransform: "uppercase", margin: "4px 0 0", fontSize: 10.5 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TÉMOIGNAGES */}
      <section className="section sec-blue" style={{ background: "linear-gradient(150deg, #142579 0%, #0f1d6e 50%, #0a1450 100%)" }}>
        <div className="container">
          <div className="section-head">
            <div>
              <Eyebrow style={{ marginBottom: 24, color: "var(--gold)" }}>Témoignages clients</Eyebrow>
              <h2 style={{ color: "var(--white)" }}>
                Ils en parlent<br /><em className="display-italic" style={{ color: "var(--gold)" }}>mieux que nous.</em>
              </h2>
            </div>
            <p style={{ color: "rgba(255,255,255,0.58)" }}>
              Des avis vérifiés de celles et ceux qui ont cheminé avec Domoïna.
            </p>
          </div>

          <div className="rg-2" style={{ gap: 16 }}>
            {temoignages.map((t, i) => (
              <div key={i} data-reveal="" data-reveal-delay={String(i % 2)} className="testi-dark" style={{ display: "flex", flexDirection: "column" }}>
                <p style={{ fontFamily: "var(--serif)", fontSize: 16, lineHeight: 1.65, color: "rgba(255,255,255,0.88)", fontStyle: "italic", margin: "26px 0 22px", flexGrow: 1 }}>
                  {t.quote}
                </p>
                <hr style={{ height: 1, background: "rgba(255,255,255,0.1)", border: 0, marginBottom: 16 }} />
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(200,168,75,0.2)", color: "var(--gold)", display: "grid", placeItems: "center", fontFamily: "var(--serif)", fontSize: 16, flexShrink: 0 }}>
                    {t.name.charAt(0)}
                  </span>
                  <span style={{ fontWeight: 500, fontSize: 13.5, color: "var(--white)", fontFamily: "var(--sans)" }}>{t.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INSCRIPTION */}
      <section className="section" style={{ background: "var(--paper)" }}>
        <div className="container-narrow" style={{ textAlign: "center" }}>
          <Eyebrow style={{ marginBottom: 24 }}>Inscrivez-vous · c&apos;est offert</Eyebrow>
          <h2 className="display" style={{ fontSize: "clamp(30px, 3.4vw, 52px)", margin: "0 0 20px", lineHeight: 1.05 }}>
            Rejoignez le challenge<br /><em className="display-italic">et commencez votre transformation.</em>
          </h2>
          <p style={{ fontSize: 17, lineHeight: 1.7, color: "var(--mute)", maxWidth: 540, margin: "0 auto 44px" }}>
            Trois jours pour amorcer un vrai changement — sans paiement, sans engagement.
          </p>

          <div className="rg-3" style={{ gap: 16, marginBottom: 44 }}>
            {inscription.map((g, i) => (
              <div key={i} style={{ background: "var(--white)", border: "1px solid var(--line)", padding: "32px 24px" }}>
                <div style={{ width: 30, height: 30, border: "1px solid var(--gold)", display: "grid", placeItems: "center", color: "var(--gold)", fontSize: 14, margin: "0 auto 18px" }}>✦</div>
                <h3 style={{ fontFamily: "var(--sans)", fontSize: 14, fontWeight: 600, color: "var(--navy)", margin: "0 0 8px" }}>{g.t}</h3>
                <p className="small muted" style={{ margin: 0, lineHeight: 1.55, fontSize: 12.5 }}>{g.b}</p>
              </div>
            ))}
          </div>

          <Link href="/contact" className="btn btn-gold btn-lg">
            Je rejoins le challenge gratuit <Arrow />
          </Link>
          <p className="small" style={{ margin: "16px 0 0", color: "var(--mute)", fontSize: 11.5, letterSpacing: ".08em" }}>
            Challenge 100% offert · Places limitées
          </p>
        </div>
      </section>

      {/* CALENDRIER — DATES (Calendly) */}
      <section className="section" style={{ background: "var(--white)" }}>
        <div className="container-narrow" style={{ textAlign: "center" }}>
          <Eyebrow style={{ marginBottom: 24 }}>Prochaines dates</Eyebrow>
          <h2 className="display" style={{ fontSize: "clamp(28px, 3vw, 44px)", margin: "0 0 16px", lineHeight: 1.06 }}>
            Choisissez votre <em className="display-italic" style={{ color: "var(--blue)" }}>créneau.</em>
          </h2>
          <p style={{ fontSize: 16.5, lineHeight: 1.7, color: "var(--mute)", maxWidth: 540, margin: "0 auto 40px" }}>
            Voici les dates où je propose le challenge. Réservez la session qui vous convient.
          </p>
          <div
            className="calendly-inline-widget"
            data-url="https://calendly.com/lavoie2laconscience/nouvelle-reunion"
            style={{ minWidth: 320, height: 700 }}
          />
        </div>
      </section>

      <Script
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="lazyOnload"
      />

    </div>
  );
}
