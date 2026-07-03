import type { Metadata } from "next";
import Link from "next/link";
import Placeholder from "@/components/Placeholder";

export const metadata: Metadata = {
  title: "Domoïna Ramiadana — Thérapeute initiatique",
  description:
    "Domoïna Ramiadana, thérapeute initiatique des dirigeants, cadres et thérapeutes en quête d'excellence. Plus de 21 ans d'accompagnement holistique. Fondatrice du Centre HUT et de La Voie 2 la Conscience.",
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

const piliers = [
  {
    num: "I.",
    title: "Le Parcours AIME",
    sub: "Accompagnement Initiatique Mental et Émotionnel",
    body: "Un voyage structuré pour une véritable transmutation intérieure : Accueillir, Identifier, Métamorphoser, Émerger.",
  },
  {
    num: "II.",
    title: "Le Cycle des Saisons",
    sub: "La boussole du vivant",
    body: "Automne (lâcher-prise), Hiver (racines profondes), Printemps (élan de vie), Été (rayonnement).",
  },
  {
    num: "III.",
    title: "La Méthode Ki-Zola",
    sub: "Approche sensorielle & énergétique dans l'Eau",
    body: "Une écoute des cinq éléments — eau, feu, terre, air, éther — pratiquée dans l'élément Eau.",
  },
  {
    num: "IV.",
    title: "La V.I.E.",
    sub: "Voie Initiatique de l'Eau",
    body: "Purification et renaissance par l'élément Eau, libération des empreintes émotionnelles.",
  },
];

export default function DomoinaPage() {
  return (
    <div className="page-fade">

      {/* HERO */}
      <section className="page-hero" style={{ background: "var(--white)", borderBottom: "1px solid var(--line)" }}>
        <div className="container">
          <div className="rg-split" style={{ gap: 100, alignItems: "center" }}>
            <div>
              <Eyebrow style={{ marginBottom: 32 }}>La fondatrice · Thérapeute initiatique</Eyebrow>
              <h1 className="display" style={{ fontSize: "clamp(34px, 4.2vw, 64px)", margin: "0 0 24px", lineHeight: 1.05 }}>
                Domoïna Ramiadana
              </h1>
              <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 17, color: "var(--navy)", margin: "0 0 32px", fontWeight: 300 }}>
                Fondatrice de La Voie 2 la Conscience &amp; du Centre HUT.
              </p>
              <hr className="filet" style={{ marginBottom: 32 }} />
              <p style={{ fontSize: 17.5, lineHeight: 1.72, color: "var(--navy-ink)", maxWidth: 520 }}>
                Un accompagnement <em style={{ fontStyle: "italic", color: "var(--navy)" }}>initiatique et spirituel</em> pour
                les dirigeants, cadres et thérapeutes en quête de sens — celles et ceux qui
                réussissent extérieurement mais portent une vision spirituelle de la vie, et veulent
                l&apos;incarner pleinement. Depuis plus de vingt et un ans, j&apos;accompagne ces dirigeants et
                thérapeutes vers une réussite qui ne s&apos;oppose plus à leur vie intérieure. Là où
                d&apos;autres voient une faille, je vois un point de passage&nbsp;: ce que vous avez
                appris à cacher devient la source de votre{" "}
                <em style={{ fontStyle: "italic", color: "var(--navy)" }}>Excellence Authentique Unique</em>.
              </p>
            </div>
            <Placeholder
              mark="01"
              style={{ aspectRatio: "1/1.05", background: "var(--paper-alt)" }}
              src="/domoina.jpg"
              alt="Portrait de Domoïna Ramiadana — thérapeute initiatique"
              objectPosition="top center"
              sizes="(max-width: 768px) 100vw, 45vw"
            />
          </div>
        </div>
      </section>

      {/* BIOGRAPHY — 2 colonnes : texte + portrait */}
      <section className="section">
        <div className="container">
          <div className="rg-split-bias" style={{ alignItems: "start", gap: "clamp(40px, 6vw, 80px)" }}>
            {/* Texte */}
            <div>
              <Eyebrow style={{ marginBottom: 24 }}>Qui suis-je&nbsp;?</Eyebrow>
              <h2 className="display" style={{ fontSize: "clamp(28px, 3vw, 42px)", margin: "0 0 28px", lineHeight: 1.12 }}>
                Une thérapeute au service de <em className="display-italic">votre transformation consciente.</em>
              </h2>
              <hr className="filet" style={{ marginBottom: 28 }} />

              <p style={{ fontFamily: "var(--serif)", fontSize: 20, lineHeight: 1.55, color: "var(--navy)", margin: "0 0 22px" }}>
                <span style={{ fontSize: 60, float: "left", lineHeight: 0.85, marginRight: 12, color: "var(--gold)" }}>J</span>
                e suis Domoïna Ramiadana, thérapeute initiatique pour leaders et dirigeants
                à succès en quête de sens. Formatrice, fondatrice du Centre Holistique UnTout (HUT)
                et de La Voie 2 la Conscience, créatrice du Parcours AIME et du Cycle des Saisons.
              </p>
              <p style={{ fontSize: 15.5, lineHeight: 1.82, color: "var(--navy-ink)", margin: "0 0 18px" }}>
                J&apos;accompagne les dirigeants à succès à transformer leurs blessures originelles et
                leurs schémas de compensation en zone d&apos;<strong style={{ fontWeight: 500 }}>Excellence
                Authentique Unique</strong> (E.A.U.), grâce à une voie initiatique unissant les Lois du
                Vivant, la sagesse ancestrale et la puissance transformatrice de l&apos;Eau.
              </p>
              <p style={{ fontSize: 15.5, lineHeight: 1.82, color: "var(--navy-ink)", margin: "0 0 18px" }}>
                Nombre d&apos;entrepreneurs, dirigeants et leaders à succès vivent, derrière les apparences
                de réussite, une crise silencieuse&nbsp;: surcharge mentale, perte de sens, épuisement,
                ou simplement une impression de vide existentiel — malgré tout ce qu&apos;ils ont construit.
              </p>
              <p style={{ fontSize: 15.5, lineHeight: 1.82, color: "var(--navy-ink)", margin: 0 }}>
                Avec plus de <strong style={{ fontWeight: 500 }}>21 ans d&apos;expérience</strong> dans
                l&apos;accompagnement holistique, je me consacre aujourd&apos;hui à aider ces dirigeants à
                retrouver leur clarté, leur légitimité, leur puissance et leur Vision Intérieure Propre
                (V.I.P.), en revenant à leur zone d&apos;E.A.U.
              </p>

              <div style={{ display: "flex", gap: 48, flexWrap: "wrap", marginTop: 40, paddingTop: 28, borderTop: "1px solid var(--line)" }}>
                {[{ n: "21+", label: "Années d'expérience" }, { n: "500+", label: "Vies transformées" }, { n: "4", label: "Piliers" }].map((s, i) => (
                  <div key={i}>
                    <p className="num" style={{ fontSize: 48, color: "var(--navy)", margin: 0 }}>{s.n}</p>
                    <p className="small muted" style={{ letterSpacing: ".16em", textTransform: "uppercase", margin: "4px 0 0", fontSize: 10.5 }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Image d'ambiance (à remplacer par la photo de ton choix) */}
            <div className="img-zoom" style={{ position: "relative" }}>
              <Placeholder
                style={{ aspectRatio: "4/5", border: "1px solid var(--line)" }}
                src="/hut-jardin-zen.png"
                alt="Eau, nature et silence — l'esprit de l'accompagnement"
                sizes="(max-width: 900px) 100vw, 45vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CE QUE VOUS GAGNEZ */}
      <section className="section" style={{ background: "var(--paper)" }}>
        <div className="container-narrow">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <Eyebrow>Mon expertise</Eyebrow>
            <h2 className="display" style={{ fontSize: 36, margin: "24px 0 20px", lineHeight: 1.1 }}>
              Ce que vous <em className="display-italic">gagnez.</em>
            </h2>
            <p style={{ fontSize: 16.5, lineHeight: 1.8, color: "var(--mute)", maxWidth: 620, margin: "0 auto" }}>
              J&apos;aide chaque dirigeant·e à transformer ses blessures, souvent inconscientes, en
              leviers de croissance — en intégrant toutes les dimensions de l&apos;être&nbsp;: physique,
              énergétique, émotionnelle et mentale.
            </p>
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: "0 auto", maxWidth: 680, display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              "Une vision claire de votre mission et de vos priorités",
              "Une libération des blocages inconscients ou transgénérationnels",
              "Une connexion à votre énergie vitale (sexuelle et créatrice)",
              "Une productivité consciente, sans vous cramer",
              "Une réussite qui a du sens, au-delà du succès extérieur",
            ].map((g, i) => (
              <li key={i} className="card-hover" style={{ display: "flex", gap: 16, alignItems: "flex-start", padding: "20px 24px", background: "var(--white)", border: "1px solid var(--line)", borderRadius: 14 }}>
                <span style={{ color: "var(--gold)", flexShrink: 0, fontSize: 14, marginTop: 3 }}>✦</span>
                <span style={{ fontSize: 16.5, lineHeight: 1.6, color: "var(--navy-ink)" }}>{g}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <hr className="filet-gold-full" />

      {/* LES 4 PILIERS */}
      <section className="section sec-blue" style={{ background: "linear-gradient(150deg, #142579 0%, #0f1d6e 50%, #0a1450 100%)", color: "var(--white)" }}>
        <div className="container">
          <div className="section-head">
            <div>
              <Eyebrow style={{ color: "var(--gold)" }}>Quatre piliers</Eyebrow>
              <h2 style={{ color: "var(--white)", marginTop: 24 }}>
                <em className="display-italic" style={{ color: "var(--gold)" }}>Les 4 piliers</em><br />de mon approche.
              </h2>
            </div>
            <p style={{ color: "rgba(255,255,255,0.72)" }}>
              Mon chemin allie spiritualité vivante, thérapies traditionnelles et sciences
              initiatiques — pour transformer la blessure en levier de croissance.
            </p>
          </div>

          <div className="rg-2" style={{ gap: 18 }}>
            {piliers.map((v, i) => (
              <div key={i} className="card-marine" data-reveal="" data-reveal-delay={String(i % 2)} style={{ padding: "42px 38px" }}>
                <span className="card-num" style={{ fontSize: 16 }}>{v.num}</span>
                <h3 className="display" style={{ fontSize: 32, color: "var(--white)", margin: "20px 0 6px", lineHeight: 1.1 }}>{v.title}</h3>
                <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 15, color: "var(--gold)", margin: "0 0 20px" }}>{v.sub}</p>
                <hr className="filet" style={{ marginBottom: 20 }} />
                <p style={{ fontSize: 15, lineHeight: 1.7, color: "rgba(255,255,255,0.78)", margin: 0 }}>{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PARCOURS & FORMATIONS — renvoi LinkedIn */}
      <section className="section" style={{ background: "var(--paper)" }}>
        <div className="container-narrow" style={{ textAlign: "center" }}>
          <Eyebrow style={{ marginBottom: 24 }}>Parcours &amp; formations</Eyebrow>
          <h2 className="display" style={{ fontSize: 36, margin: "0 0 20px", lineHeight: 1.1 }}>
            Un parcours <em className="display-italic">pluridisciplinaire.</em>
          </h2>
          <p style={{ fontSize: 16.5, lineHeight: 1.8, color: "var(--mute)", maxWidth: 600, margin: "0 auto 36px" }}>
            Au-delà de la voie initiatique, mon chemin s&apos;appuie sur de nombreuses traditions,
            formations, certifications et expériences. Vous en trouverez le détail complet — mon CV,
            mon parcours et mes accréditations — sur mon profil LinkedIn.
          </p>
          <a
            href="https://www.linkedin.com/in/domoina-ramiadana"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            Voir mon parcours sur LinkedIn <Arrow />
          </a>
        </div>
      </section>

      {/* CTA */}
      <section className="section-tight" style={{ background: "var(--white)", borderTop: "3px solid var(--gold)", borderBottom: "1px solid var(--line)" }}>
        <div className="container-narrow" style={{ textAlign: "center" }}>
          <Eyebrow style={{ marginBottom: 24 }}>Envie d&apos;aller plus loin&nbsp;?</Eyebrow>
          <h3 className="display" style={{ fontSize: 36, margin: "0 0 24px", lineHeight: 1.1 }}>
            La transformation consciente<br /><em className="display-italic">débute dès à présent.</em>
          </h3>
          <p style={{ fontSize: 17, lineHeight: 1.7, color: "var(--mute)", maxWidth: 580, margin: "0 auto 36px" }}>
            La véritable réussite s&apos;enracine dans l&apos;équilibre entre ce que vous réalisez et ce
            que vous êtes profondément. Si ces mots résonnent, sachez que vous n&apos;êtes pas
            seul·e&nbsp;: La Voie 2 la Conscience existe pour vous accompagner.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/contact" className="btn btn-primary">
              Je suis prêt·e à me transformer <Arrow />
            </Link>
            <Link href="/offre-gold" className="btn btn-ghost">
              Découvrir les programmes
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
