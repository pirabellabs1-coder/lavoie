import type { Metadata } from "next";
import Link from "next/link";
import VideoTestimonial from "@/components/VideoTestimonial";
import JsonLd from "@/components/JsonLd";
import { videoLd, breadcrumbLd } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Témoignages — Paroles de transformation",
  description:
    "Découvrez les témoignages de clients accompagnés par Domoïna. Dirigeants, thérapeutes et cadres partagent leur expérience de transformation authentique.",
  alternates: { canonical: "/temoignages" },
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

const videos = [
  {
    id: "EGKceuaJgVA",
    name: "Dr Fernand D-C",
    role: "Participant · Cycle des Saisons",
    quote:
      "Une approche d'accompagnement de thérapie de groupe qui inscrit les Principes (Kybalion) de l'Univers au cœur de l'existence.",
  },
  {
    id: "u4n54oCawfs",
    name: "Cathy B.",
    role: "Participante · Cycle des Saisons",
    quote:
      "La valeur de l'engagement apporte des résultats. Un cheminement qui transforme en profondeur le rapport à soi et aux autres.",
  },
];

// Avis Google vérifiés (clients réels). Source unique de la page Témoignages.
const temoignages = [
  { nom: "Nora Hachelaf", date: "il y a un an", texte: "Domoïna est une thérapeute et sexothérapeute que je recommande vivement, même si j'ai dû interrompre mes consultations pour des raisons financières. Dès notre première rencontre, j'ai été frappée par son écoute attentive et sa capacité à déceler ce qui se passe réellement." },
  { nom: "Emilie G.", date: "il y a 2 ans", texte: "Cela fait déjà quatre ans que je chemine avec Domoïna et j'en suis ravie. Le terme « élargissement de la conscience » reflète vraiment mon ressenti lorsque je travaille avec elle. Une accompagnatrice hors pair." },
  { nom: "Dany GM", date: "il y a 3 ans", texte: "J'ai fait la connaissance de Domoïna il y a de cela juste quelques mois (2 pour être plus précis). Son accompagnement m'a permis d'avancer de manière significative et profonde." },
  { nom: "Cathy Brun", date: "il y a 2 ans", texte: "J'avais déjà publié un témoignage il y a plus de 2 ans. Avec ces années écoulées, je souhaite renouveler ma confiance envers Domoïna et son accompagnement. Un chemin de transformation remarquable." },
  { nom: "Josette Henry", date: "il y a 2 ans", texte: "Lorsque j'ai rencontré Domoïna pour la première fois, j'ai raconté à grande vitesse tout ce qui m'incombait. J'ai été stoppée net. À l'endroit où j'étais, j'ai pensé qu'elle manquait d'empathie… mais c'était tout le contraire : elle savait exactement ce dont j'avais besoin." },
  { nom: "Victoria Topenot", date: "il y a 4 ans", texte: "Deuxième année de participation aux stages de thérapie de groupe pour moi, après de nombreuses années de suivi thérapeutique divers et varié. Ces stages sont exigeants et éprouvants — sortir de sa zone de confort n'est jamais facile. Mais les résultats sont là." },
  { nom: "Bernard Joly", date: "il y a 3 ans", texte: "J'ai eu l'occasion de travailler avec Domoïna pour un problème que j'avais au dos. Dès la 1ère séance, j'ai été surpris du résultat car cela faisait plusieurs mois que je ne dormais plus la nuit. Je lui ai dit dès le lendemain ma surprise." },
  { nom: "Mireille Tamarin", date: "il y a 5 ans", texte: "J'ai connu Domoïna via une amie pour une problématique bien précise. En découvrant son travail, j'étais loin de penser que l'accompagnement de groupe serait autant bénéfique. À aucun moment je n'aurais imaginé recevoir des miroirs à travers les autres participants." },
  { nom: "Yona Bravo", date: "il y a 2 ans", texte: "Merci pour vos enseignements et votre qualité d'écoute. Pour moi, vous êtes vraiment une médium, même si vous ne voulez pas de ce qualificatif. Vous êtes un intermédiaire entre les différentes réalités du plan terrestre. Continuez à éclairer ceux qui veulent retrouver leur être profond." },
  { nom: "Sandrine Jeanne", date: "il y a un an", texte: "Cela fait maintenant 4 ans que je chemine avec le CDS au sein de LV2C : j'apprends, je comprends et je commence à intégrer les enseignements que je reçois. Aujourd'hui, je suis en capacité d'affirmer que la Voie Initiatique avec laquelle j'avance est profondément transformatrice." },
  { nom: "Alexandre Bonal", date: "il y a 3 ans", texte: "Au sortir de ma première séance, suite à une douleur à l'épaule, j'ai été surpris d'avoir senti le lâcher-prise — s'abandonner, se sentir vide de toutes charges. Une expérience que je n'attendais pas." },
  { nom: "Salhi Chamseddine", date: "il y a 7 mois", texte: "Thérapeute d'exception, avec un don inné pour lire l'inconscient comme si elle lisait le futur des gens." },
  { nom: "Martial Djaimba", date: "il y a 5 ans", texte: "Mille fois merci Domoïna ! Vous avez changé ma vie ! J'ai appris beaucoup de choses ! Je recommande vraiment. Une thérapeute très remarquable !" },
  { nom: "Brayan Peno", date: "il y a 2 ans", texte: "Je recommande son approche." },
  { nom: "Isabelle Labelle", date: "il y a 6 ans", texte: "Merci pour tout, beaucoup de belles choses dans ma vie depuis ma première séance. Je recommande." },
  { nom: "Aliou Diaby", date: "il y a un an", texte: "Merci pour votre professionnalisme. Que Dieu vous bénisse éternellement." },
  { nom: "Stéphanie Moreno Vaz", date: "il y a 5 ans", texte: "Accompagnement exceptionnel et holistique, je recommande fortement !" },
  { nom: "Patrick Gervais", date: "il y a 10 mois", texte: "Merci pour l'accompagnement." },
];

export default function Temoignages() {
  return (
    <div className="page-fade">
      <JsonLd
        data={[
          ...videos.map((v) =>
            videoLd({ name: `Témoignage de ${v.name}`, description: v.quote, youtubeId: v.id })
          ),
          breadcrumbLd([
            { name: "Accueil", path: "/" },
            { name: "Témoignages", path: "/temoignages" },
          ]),
        ]}
      />

      {/* HERO */}
      <section className="page-hero sec-blue" style={{ background: "linear-gradient(150deg, #142579 0%, #0f1d6e 50%, #0a1450 100%)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="container-narrow" style={{ textAlign: "center" }}>
          <Eyebrow style={{ marginBottom: 32, color: "var(--gold)" }}>Ils l&apos;ont vécu</Eyebrow>
          <h1 className="display" style={{ fontSize: "clamp(28px, 3.5vw, 56px)", margin: "0 0 28px", lineHeight: 1.05, color: "var(--white)" }}>
            Paroles de<br /><em className="display-italic" style={{ color: "var(--gold)" }}>transformation.</em>
          </h1>
          <hr className="filet" style={{ margin: "0 auto 48px" }} />

          <div style={{ display: "flex", justifyContent: "center", gap: 60, flexWrap: "wrap" }}>
            {[
              { n: "500+", label: "Personnes accompagnées" },
              { n: "4.9/5", label: "Note Google" },
              { n: "100 %", label: "Recommandent" },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <p className="num" style={{ fontSize: 36, color: "var(--gold)", margin: 0, lineHeight: 1 }}>{s.n}</p>
                <p className="small" style={{ letterSpacing: ".16em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", margin: "6px 0 0", fontSize: 10.5 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TÉMOIGNAGES VIDÉO */}
      <section className="section" style={{ background: "var(--paper)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <Eyebrow style={{ marginBottom: 24 }}>Témoignages vidéo</Eyebrow>
            <h2 className="display" style={{ fontSize: "clamp(30px, 3.4vw, 54px)", margin: 0, lineHeight: 1.04 }}>
              Ils racontent,<br /><em className="display-italic">face caméra.</em>
            </h2>
            <hr className="filet" style={{ margin: "28px auto 24px" }} />
            <p style={{ fontSize: 16, lineHeight: 1.7, color: "var(--mute)", maxWidth: 540, margin: "0 auto" }}>
              Participants au processus du Cycle des Saisons (CDS).
            </p>
          </div>

          <div className="video-grid">
            {videos.map((v) => (
              <VideoTestimonial key={v.id} {...v} />
            ))}
          </div>
        </div>
      </section>

      {/* GRILLE */}
      <section className="section sec-blue" style={{ background: "linear-gradient(150deg, #142579 0%, #0f1d6e 50%, #0a1450 100%)" }}>
        <div className="container">
          <div className="rg-3" style={{ gap: 16 }}>
            {temoignages.map((t, i) => (
              <div key={i} className="card-marine" data-reveal="" data-reveal-delay={String(i % 3)} style={{
                padding: "30px 28px",
                display: "flex",
                flexDirection: "column",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                  <span style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--gold)", color: "var(--navy-ink)", display: "grid", placeItems: "center", fontFamily: "var(--serif)", fontWeight: 600, fontSize: 17, flexShrink: 0 }}>
                    {t.nom.charAt(0)}
                  </span>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 500, color: "var(--white)", margin: 0 }}>{t.nom}</p>
                    <p className="small" style={{ color: "rgba(255,255,255,0.5)", margin: 0, fontSize: 11.5 }}>{t.date}</p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 3, marginBottom: 14 }}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <span key={j} style={{ color: "var(--gold)", fontSize: 13 }}>★</span>
                  ))}
                </div>
                <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 15.5, lineHeight: 1.7, color: "rgba(255,255,255,0.82)", margin: 0 }}>
                  &ldquo;{t.texte}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NOTE GOOGLE */}
      <section style={{ background: "var(--white)", padding: "64px 0", textAlign: "center", borderBottom: "1px solid var(--line)" }}>
        <div className="container-narrow">
          <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 16 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} style={{ color: "var(--gold)", fontSize: 24 }}>★</span>
            ))}
          </div>
          <p className="num" style={{ fontSize: 44, color: "var(--navy)", margin: "0 0 8px" }}>4.9 / 5</p>
          <p style={{ fontSize: 15, color: "var(--mute)", margin: "0 0 8px" }}>Basé sur les avis Google vérifiés</p>
          <p className="small" style={{ letterSpacing: ".16em", textTransform: "uppercase", color: "var(--gold)", margin: 0, fontSize: 10.5 }}>✓ Avis certifiés Google</p>
        </div>
      </section>

      {/* CTA */}
      <section className="section-tight" style={{ background: "var(--gold)", textAlign: "center" }}>
        <div className="container-narrow">
          <h3 className="display" style={{ fontSize: 34, margin: "0 0 20px", color: "var(--navy-ink)", lineHeight: 1.1 }}>
            Écrivez votre<br /><em className="display-italic">propre histoire.</em>
          </h3>
          <p style={{ fontSize: 17, lineHeight: 1.7, color: "var(--navy)", maxWidth: 480, margin: "0 auto 36px" }}>
            Rejoignez les 500+ personnes transformées. Premier appel offert, sans engagement.
          </p>
          <Link href="/contact" className="btn btn-primary">
            Commencer ma transformation <Arrow />
          </Link>
        </div>
      </section>

    </div>
  );
}
