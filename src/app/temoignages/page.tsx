import type { Metadata } from "next";
import Link from "next/link";
import VideoTestimonial from "@/components/VideoTestimonial";
import JsonLd from "@/components/JsonLd";
import { videoLd, breadcrumbLd } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Témoignages — Paroles de transformation",
  description:
    "Découvrez les témoignages de clients accompagnés par Domoina. Dirigeants, thérapeutes et cadres partagent leur expérience de transformation authentique.",
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

const temoignages = [
  {
    nom: "Isabelle M.",
    titre: "Directrice des Ressources Humaines",
    duree: "Immersion Expansion · 6 mois",
    texte: "En six mois avec Domoina, j'ai retrouvé un alignement profond que je cherchais depuis des années. Son approche unique mêle rigueur et profondeur — chaque séance m'a amenée à un nouveau niveau de compréhension de moi-même. Le Centre HUT est un lieu magique, hors du temps.",
  },
  {
    nom: "Pierre L.",
    titre: "Dirigeant d'entreprise",
    duree: "Immersion Royale · 12 mois",
    texte: "Le Centre HUT est un sanctuaire hors du temps. Les stages immersifs ont fondamentalement changé ma façon de diriger et d'être en relation. Domoina a une capacité rare à voir l'essence de chaque personne et à l'accompagner avec une précision chirurgicale.",
  },
  {
    nom: "Sophie D.",
    titre: "Thérapeute & Naturopathe",
    duree: "Immersion Essence · 3 mois",
    texte: "La méthode V.I.E. est extraordinaire. En tant que thérapeute moi-même, j'étais sceptique au départ. Mais l'approche de Domoina m'a dépassée par sa profondeur et son efficacité. J'ai recommandé La Voie 2 la Conscience à plusieurs de mes collègues.",
  },
  {
    nom: "Marc A.",
    titre: "Cadre supérieur, secteur bancaire",
    duree: "Immersion Expansion · 6 mois",
    texte: "Je suis arrivé au bout du rouleau après 20 ans dans la finance. Domoina m'a aidé à démêler ce qui m'appartenait vraiment de ce que j'avais intégré par pression sociale. Six mois plus tard, j'ai retrouvé un sens profond à mon travail.",
  },
  {
    nom: "Nathalie R.",
    titre: "Médecin généraliste",
    duree: "Immersion Royale · 9 mois",
    texte: "L'accompagnement de Domoina est d'une qualité rare. Sa capacité à créer un espace de sécurité totale, combinée à sa profondeur d'approche, produit des résultats que je n'aurais jamais imaginés. Le Cycle des Saisons m'a appris à me respecter selon mes propres rythmes.",
  },
  {
    nom: "Karim B.",
    titre: "Coach professionnel certifié",
    duree: "Immersion Expansion · 6 mois",
    texte: "En tant que coach moi-même, trouver un accompagnateur à la hauteur n'est pas une mince affaire. Domoina m'a surpris à chaque session par la finesse de son analyse et l'audace de ses interventions. Le parcours AIME est un outil extraordinaire.",
  },
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
      <section className="page-hero" style={{ background: "var(--navy)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
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
      <section className="section" style={{ background: "var(--navy)" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0, border: "1px solid rgba(255,255,255,0.15)" }}>
            {temoignages.map((t, i) => (
              <div key={i} data-reveal="" data-reveal-delay={String(i % 3)} style={{
                padding: "40px 32px",
                borderRight: (i + 1) % 3 !== 0 ? "1px solid rgba(255,255,255,0.15)" : 0,
                borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.15)" : 0,
                transition: "background .3s",
              }}>
                <div style={{ display: "flex", gap: 3, marginBottom: 20 }}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <span key={j} style={{ color: "var(--gold)", fontSize: 13 }}>★</span>
                  ))}
                </div>
                <p className="small" style={{ letterSpacing: ".14em", textTransform: "uppercase", color: "var(--gold)", margin: "0 0 20px", fontSize: 10.5 }}>{t.duree}</p>
                <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 16, lineHeight: 1.7, color: "rgba(255,255,255,0.8)", margin: "0 0 28px" }}>
                  &ldquo;{t.texte}&rdquo;
                </p>
                <div style={{ paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                  <p style={{ fontSize: 14, fontWeight: 500, color: "var(--white)", margin: "0 0 4px" }}>{t.nom}</p>
                  <p className="small" style={{ color: "rgba(255,255,255,0.5)", margin: 0 }}>{t.titre}</p>
                </div>
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
