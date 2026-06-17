import type { Metadata } from "next";
import Link from "next/link";
import Placeholder from "@/components/Placeholder";

export const metadata: Metadata = {
  title: "Domoïna Ramiadana — Thérapeute initiatique",
  description:
    "Domoïna Ramiadana, thérapeute initiatique et guide des dirigeants en quête d'excellence. Plus de 20 ans d'accompagnement holistique. Fondatrice du Centre HUT et de La Voie 2 la Conscience.",
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
    body: "Un voyage structuré pour une véritable transmutation intérieure : Bilan, Plongée, Libération, Souveraineté.",
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

const timeline = [
  { year: "2008", title: "Début de la pratique", body: "Premières années d'accompagnement en thérapie individuelle, formation continue en science initiatique." },
  { year: "2011", title: "Recherche sur l'eau", body: "Trois années de recherche personnelle sur les traditions rituelles de l'eau — du Japon au Maroc." },
  { year: "2014", title: "Création de V.I.E.", body: "Codification de la Voie Initiatique de l'Eau. Premières cohortes restreintes de huit personnes." },
  { year: "2017", title: "Ouverture du Centre HUT", body: "Acquisition et restauration du domaine de 1 100 hectares en Sarthe. Premier stage immersif." },
  { year: "2019", title: "Parcours AIME", body: "Formalisation du parcours signature en quatre phases — Bilan, Plongée, Libération, Souveraineté." },
  { year: "2022", title: "500 accompagnements", body: "Cap symbolique des cinq cents personnes accompagnées. Lancement de la communauté alumni." },
];

const certifications = [
  {
    titre: "Médecine Traditionnelle Chinoise",
    annee: "2008",
    lieu: "F.N.M.T.C.",
    detail:
      "Diplôme National (D.N.M.T.C.) — orientation Acupuncture & Moxibustion. Diplômée en Acupuncture Traditionnelle Chinoise (D.A.T.C.).",
    img: "/diplome-1.jpg",
  },
  {
    titre: "Sexothérapeute Sexogestalt",
    annee: "2016",
    lieu: "Formation & Prépapsy · Dr C. Gellman",
    detail:
      "160 h de théorie et de pratique + 100 h de supervision. Sexopathologie, thérapie de couple, santé et épanouissement de la vie sexuelle.",
    img: "/diplome-3.jpg",
  },
  {
    titre: "Access Bars® · Access Consciousness®",
    annee: "2016",
    lieu: "Certified Access Facilitator",
    detail:
      "Certificat de complétion du Bars Course — pratique de libération des mémoires et des schémas limitants.",
    img: "/diplome-2.jpg",
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
                Thérapeute initiatique des dirigeants en quête d&apos;excellence.
              </p>
              <hr className="filet" style={{ marginBottom: 32 }} />
              <p style={{ fontSize: 18, lineHeight: 1.7, color: "var(--navy-ink)", maxWidth: 480 }}>
                J&apos;accompagne les dirigeants à succès à transformer leurs blessures originelles
                et leurs schémas de compensation en leur zone d&apos;Excellence Authentique Unique (E.A.U.).
              </p>
            </div>
            <Placeholder
              mark="01"
              style={{ aspectRatio: "3/4", background: "var(--paper-alt)" }}
              src="/domoina.jpg"
              alt="Portrait de Domoïna Ramiadana — thérapeute initiatique"
              objectPosition="top center"
              sizes="(max-width: 768px) 100vw, 45vw"
            />
          </div>
        </div>
      </section>

      {/* BIOGRAPHY */}
      <section className="section">
        <div className="container-narrow">
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <Eyebrow>Qui suis-je&nbsp;?</Eyebrow>
            <h2 className="display" style={{ fontSize: 36, margin: "24px 0 0", lineHeight: 1.1 }}>
              Une guide au service de<br /><em className="display-italic">votre transformation consciente.</em>
            </h2>
          </div>

          <div style={{ display: "grid", gap: 28 }}>
            <p style={{ fontFamily: "var(--serif)", fontSize: 22, lineHeight: 1.55, color: "var(--navy)", margin: 0 }}>
              <span style={{ fontSize: 64, float: "left", lineHeight: 0.85, marginRight: 12, color: "var(--gold)" }}>J</span>
              e suis Domoïna Ramiadana, thérapeute initiatique et guide pour leaders et dirigeants
              à succès en quête de sens. Formatrice, fondatrice du Centre Holistique UnTout (HUT)
              et de La Voie 2 la Conscience, créatrice du Parcours AIME et du Cycle des Saisons.
            </p>
            <p style={{ fontSize: 16.5, lineHeight: 1.85, color: "var(--navy-ink)", margin: 0 }}>
              J&apos;accompagne les dirigeants à succès à transformer leurs blessures originelles et
              leurs schémas de compensation en zone d&apos;<strong style={{ fontWeight: 500 }}>Excellence
              Authentique Unique</strong> (E.A.U.), grâce à une voie initiatique unissant les Lois du
              Vivant, la sagesse ancestrale et la puissance transformatrice de l&apos;Eau.
            </p>
            <p style={{ fontSize: 16.5, lineHeight: 1.85, color: "var(--navy-ink)", margin: 0 }}>
              Nombre d&apos;entrepreneurs, dirigeants et leaders à succès vivent, derrière les apparences
              de réussite, une crise silencieuse&nbsp;: surcharge mentale, perte de sens, épuisement,
              ou simplement une impression de vide existentiel — malgré tout ce qu&apos;ils ont construit.
            </p>
            <p style={{ fontSize: 16.5, lineHeight: 1.85, color: "var(--navy-ink)", margin: 0 }}>
              Avec plus de <strong style={{ fontWeight: 500 }}>20 ans d&apos;expérience</strong> dans
              l&apos;accompagnement holistique, je me consacre aujourd&apos;hui à aider ces dirigeants à
              retrouver leur clarté, leur légitimité, leur puissance et leur Vision Intérieure Propre
              (V.I.P.), en revenant à leur zone d&apos;E.A.U.
            </p>
          </div>

          <div style={{ display: "flex", justifyContent: "center", marginTop: 56, gap: 60, flexWrap: "wrap" }}>
            {[{ n: "20+", label: "Années d'expérience" }, { n: "500+", label: "Vies transformées" }, { n: "4", label: "Piliers" }].map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <p className="num" style={{ fontSize: 56, color: "var(--navy)", margin: 0 }}>{s.n}</p>
                <p className="small muted" style={{ letterSpacing: ".16em", textTransform: "uppercase", margin: "4px 0 0", fontSize: 10.5 }}>{s.label}</p>
              </div>
            ))}
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
          <ul style={{ listStyle: "none", padding: 0, margin: "0 auto", maxWidth: 680 }}>
            {[
              "Une vision claire de votre mission et de vos priorités",
              "Une libération des blocages inconscients ou transgénérationnels",
              "Une connexion à votre énergie vitale (sexuelle et créatrice)",
              "Une productivité consciente, sans vous cramer",
              "Une réussite qui a du sens, au-delà du succès extérieur",
            ].map((g, i) => (
              <li key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start", padding: "18px 0", borderBottom: "1px solid var(--line)" }}>
                <span style={{ color: "var(--gold)", flexShrink: 0, fontSize: 14, marginTop: 3 }}>✦</span>
                <span style={{ fontSize: 16.5, lineHeight: 1.6, color: "var(--navy-ink)" }}>{g}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <hr className="filet-gold-full" />

      {/* LES 4 PILIERS */}
      <section className="section" style={{ background: "var(--navy)", color: "var(--white)" }}>
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

          <div className="rg-2" style={{ gap: 1, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.15)" }}>
            {piliers.map((v, i) => (
              <div key={i} data-reveal="" data-reveal-delay={String(i % 2)} style={{ padding: "44px 40px", background: "var(--navy)" }}>
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

          <div className="timeline" style={{ position: "relative", paddingLeft: 80 }}>
            <div className="timeline-line" style={{ position: "absolute", left: 100, top: 12, bottom: 12, width: 1, background: "var(--line)" }} />
            {timeline.map((t, i) => (
              <div key={i} data-reveal="" data-reveal-delay={String(i % 4)} className="timeline-item" style={{ paddingBottom: 56, position: "relative" }}>
                <div className="timeline-year" style={{ textAlign: "right", paddingRight: 60, position: "relative" }}>
                  <p className="num" style={{ fontSize: 44, color: "var(--gold)", margin: 0, lineHeight: 1 }}>{t.year}</p>
                  <div className="timeline-dot" style={{ position: "absolute", right: -3, top: 18, width: 7, height: 7, borderRadius: "50%", background: "var(--navy)", border: "2px solid var(--paper)" }} />
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

      {/* FORMATIONS & CERTIFICATIONS */}
      <section className="section" style={{ background: "var(--paper)" }}>
        <div className="container">
          <div className="section-head">
            <div>
              <Eyebrow style={{ marginBottom: 24 }}>Formations &amp; certifications</Eyebrow>
              <h2>Un socle<br /><em className="display-italic">certifié.</em></h2>
            </div>
            <p>
              Au-delà de la voie initiatique, Domoina s&apos;appuie sur des formations
              certifiantes&nbsp;: médecine traditionnelle chinoise, sexothérapie clinique
              et pratiques de libération.
            </p>
          </div>

          <div className="rg-3" style={{ gap: 24 }}>
            {certifications.map((c, i) => (
              <div
                key={i}
                data-reveal=""
                data-reveal-delay={String(i)}
                className="card-hover"
                style={{ background: "var(--white)", border: "1px solid var(--line)", display: "flex", flexDirection: "column" }}
              >
                <div style={{ borderBottom: "1px solid var(--line)", background: "var(--paper-alt)" }}>
                  <Placeholder
                    style={{ aspectRatio: "4/3" }}
                    src={c.img}
                    alt={`Certification de Domoina : ${c.titre}`}
                    objectFit="contain"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div style={{ padding: "26px 28px 30px", display: "flex", flexDirection: "column", flex: 1 }}>
                  <p style={{ fontFamily: "var(--sans)", fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--gold)", margin: "0 0 12px", fontWeight: 500 }}>
                    {c.annee} · {c.lieu}
                  </p>
                  <h3 className="display" style={{ fontSize: 22, color: "var(--navy)", margin: "0 0 12px", lineHeight: 1.2 }}>
                    {c.titre}
                  </h3>
                  <hr className="filet" style={{ marginBottom: 16 }} />
                  <p style={{ fontSize: 13.5, lineHeight: 1.65, color: "var(--mute)", margin: 0 }}>{c.detail}</p>
                </div>
              </div>
            ))}
          </div>
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
