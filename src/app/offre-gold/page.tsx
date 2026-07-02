import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { faqLd, breadcrumbLd } from "@/lib/jsonld";

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

const offres = [
  {
    tag: "Niveau I",
    title: "Immersion Essence",
    duration: "3 mois",
    pitch: "Pour leaders, dirigeants et entrepreneurs en quête de sens profond. Une expérience immersive sur 3 mois, au-delà du développement personnel classique.",
    bullets: [
      "2 stages immersifs au Centre HUT",
      "1 séance individuelle / semaine",
      "Un cercle d'intimité sur WhatsApp (3 mois)",
      "Hébergement et restauration non inclus",
    ],
  },
  {
    tag: "Niveau II",
    title: "Immersion Expansion",
    duration: "6 mois",
    featured: true,
    pitch: "Programme d'expansion intérieure et de réalignement stratégique sur 6 mois. Pour ceux qui ressentent que leur réussite ne peut plus se mesurer uniquement à l'extérieur.",
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
    pitch: "Une mutation souveraine. Une incarnation radicale. Programme initiatique de 9 à 12 mois pour dirigeants prêts à redevenir pleinement eux-mêmes.",
    bullets: [
      "Accompagnement individuel illimité pendant 12 mois",
      "4 stages immersifs au Centre HUT (1 par saison)",
      "Accès direct à Domoïna en privé (WhatsApp 7j/7)",
      "Suite privative & conciergerie lors des immersions",
      "3 Voyages Initiatiques d'exception (optionnels)",
    ],
  },
];

const garanties = [
  { t: "Confidentialité absolue", b: "Engagement de confidentialité signé · groupe restreint · discrétion sur le lieu" },
  { t: "Éthique de pratique", b: "Charte signée · supervision externe · droit de retrait" },
  { t: "Accès au Centre HUT", b: "Sanctuaire en Sarthe · stages immersifs · suites privatives" },
  { t: "Suivi entre les sessions", b: "Ligne WhatsApp · réponses sous 24h · présence réelle" },
  { t: "Bibliothèque initiatique", b: "Audio · textes · pratiques guidées · accès à vie" },
  { t: "Communauté & entraide", b: "Retrouvailles trimestrielles · réseau bienveillant · soutien entre accompagnés" },
  { t: "Aucune pression", b: "Appel découverte offert · on s'assure ensemble que c'est le bon moment · vous restez libre" },
  { t: "Modalités de paiement", b: "3, 6, ou 12 fois sans frais · facilités étudiées au cas par cas" },
];

const faqs = [
  {
    q: "Comment se déroule concrètement un accompagnement ?",
    a: "Tout commence par un appel découverte de quarante-cinq minutes. Si nous décidons mutuellement de poursuivre, un audit d'alignement d'une heure permet de définir le niveau adapté, la cadence, et les premiers axes. Le parcours alterne séances individuelles à distance, stages immersifs au Centre HUT, et présence quotidienne par WhatsApp.",
  },
  {
    q: "Quels sont les tarifs des trois niveaux ?",
    a: "Les tarifs sont communiqués lors de l'appel découverte, après audit d'alignement. Nous travaillons sur devis personnalisé, car chaque parcours est calibré. Des facilités de paiement en 3, 6 ou 12 fois sont systématiquement proposées.",
  },
  {
    q: "Où se passent les stages immersifs ?",
    a: "Tous les stages se déroulent au Centre HUT, sanctuaire situé en Sarthe — à deux heures de Paris en voiture ou en train. Les suites privatives sont incluses dans les niveaux Expansion et Royale.",
  },
  {
    q: "Peut-on suivre l'accompagnement à distance ?",
    a: "Les séances individuelles peuvent se faire à distance (visioconférence sécurisée), mais les stages immersifs au Centre HUT sont structurellement présentiels — l'eau, le silence, le lieu, font partie intégrante du dispositif.",
  },
];

export default function OffreGoldPage() {
  return (
    <div className="page-fade">
      <JsonLd
        data={[
          faqLd(faqs.map((f) => ({ q: f.q, a: f.a }))),
          breadcrumbLd([
            { name: "Accueil", path: "/" },
            { name: "Offre Gold", path: "/offre-gold" },
          ]),
        ]}
      />

      {/* HERO */}
      <section className="page-hero" style={{ background: "var(--white)", borderBottom: "1px solid var(--line)" }}>
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: 920, margin: "0 auto" }}>
            <Eyebrow style={{ marginBottom: 32 }}>Programmes premium</Eyebrow>
            <h1 className="display" style={{ fontSize: "clamp(28px, 3.4vw, 52px)", margin: "0 0 28px", lineHeight: 1.12 }}>
              Et si votre crise intérieure n&apos;était pas une chute…{" "}
              <em className="display-italic" style={{ color: "var(--gold)" }}>mais une ascension déguisée&nbsp;?</em>
            </h1>
            <hr className="filet" style={{ margin: "0 auto 32px" }} />
            <p style={{ fontSize: 17, lineHeight: 1.75, color: "var(--mute)", maxWidth: 660, margin: "0 auto 36px" }}>
              Un accompagnement rare, réservé aux entrepreneurs accomplis qui sentent qu&apos;il est
              temps d&apos;honorer une autre forme de puissance&nbsp;: plus libre, plus incarnée, plus essentielle.
            </p>
            <Link href="/contact" className="btn btn-primary">
              Réserver un appel confidentiel <Arrow />
            </Link>
          </div>
        </div>
      </section>

      {/* OFFRES */}
      <section id="offres" className="section" style={{ paddingTop: 80 }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <Eyebrow style={{ marginBottom: 20 }}>Choisissez votre voyage</Eyebrow>
            <p style={{ fontSize: 16.5, lineHeight: 1.7, color: "var(--mute)", maxWidth: 560, margin: "0 auto" }}>
              Chaque programme est une porte vers une transformation unique et profonde.
            </p>
          </div>
          <div className="rg-3" style={{ gap: 22, alignItems: "stretch" }}>
            {offres.map((o, i) => (
              <div key={i} className={`og-card${o.featured ? " og-card--featured" : ""}`}>
                {o.featured && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 5, background: "var(--gold)" }} />}
                {o.featured && (
                  <span className="pill pill-gold" style={{ position: "absolute", top: 26, right: 26 }}>★ Le plus choisi</span>
                )}
                <p className="small" style={{ letterSpacing: ".2em", textTransform: "uppercase", color: o.featured ? "var(--gold)" : "var(--mute)", margin: "0 0 18px", fontSize: 10.5 }}>{o.tag}</p>
                <h3 className="display" style={{ fontSize: 44, color: o.featured ? "var(--white)" : "var(--navy)", margin: "0 0 6px", lineHeight: 1.05 }}>{o.title}</h3>
                <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 20, color: o.featured ? "var(--gold)" : "var(--navy)", margin: "0 0 28px" }}>{o.duration}</p>
                <p style={{ fontSize: 15, lineHeight: 1.6, color: o.featured ? "rgba(255,255,255,0.78)" : "var(--mute)", margin: "0 0 32px", minHeight: 60 }}>{o.pitch}</p>
                <hr className="filet" style={{ marginBottom: 28 }} />
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 36px" }}>
                  {o.bullets.map((b, j) => (
                    <li key={j} style={{ display: "flex", gap: 14, padding: "11px 0", borderBottom: `1px solid ${o.featured ? "rgba(255,255,255,0.1)" : "var(--line)"}`, fontSize: 14, lineHeight: 1.5 }}>
                      <span style={{ color: "var(--gold)", flexShrink: 0 }}>✦</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <p className="small" style={{ letterSpacing: ".14em", textTransform: "uppercase", color: o.featured ? "rgba(255,255,255,0.6)" : "var(--mute)", margin: "auto 0 20px", fontSize: 10.5 }}>
                  Tarif sur devis · facilités 3-12 fois
                </p>
                <Link href="/contact" className={o.featured ? "btn btn-gold" : "btn btn-ghost"} style={{ width: "100%", justifyContent: "center" }}>
                  Réserver mon appel <Arrow />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LA SOLUTION PROFONDE */}
      <section className="section" style={{ background: "var(--paper)" }}>
        <div className="container-narrow">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <Eyebrow>Au-delà du coaching</Eyebrow>
            <h2 className="display" style={{ fontSize: 40, margin: "24px 0 0", lineHeight: 1.1 }}>
              La solution profonde<br /><em className="display-italic">pour retrouver le sens.</em>
            </h2>
          </div>
          <div className="rg-2" style={{ gap: 16 }}>
            {[
              "Explorer vos blessures invisibles pour en faire des ressources",
              "Reconnecter à votre énergie vitale, émotionnelle et créatrice",
              "Vous recentrer sur l'essentiel, avec clarté, paix et puissance intérieure",
              "Un espace sécurisé, confidentiel et profondément transformateur",
              "Accompagnement sur mesure adapté à votre saison intérieure",
              "Un chemin de bascule, pas une méthode standard",
            ].map((s, i) => (
              <div key={i} className="card-hover" style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "22px 26px", background: "var(--white)", border: "1px solid var(--line)", borderRadius: 14 }}>
                <span style={{ color: "var(--gold)", flexShrink: 0, fontSize: 15, marginTop: 2 }}>✓</span>
                <span style={{ fontSize: 15.5, lineHeight: 1.6, color: "var(--navy-ink)" }}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GARANTIES */}
      <section className="section" style={{ background: "var(--white)" }}>
        <div className="container">
          <div className="section-head">
            <div>
              <Eyebrow style={{ marginBottom: 24 }}>Inclus dans chaque niveau</Eyebrow>
              <h2>Huit garanties,<br /><em className="display-italic">aucune option.</em></h2>
            </div>
            <p>
              Quel que soit le niveau choisi, ces huit fondations sont présentes. Elles définissent
              le standard de l&apos;Offre Gold.
            </p>
          </div>

          <div className="rg-4" style={{ gap: 16 }}>
            {garanties.map((g, i) => (
              <div key={i} className="card-hover" style={{ padding: "30px 26px", background: "var(--white)", border: "1px solid var(--line)", borderRadius: 14 }}>
                <div style={{ width: 28, height: 28, border: "1px solid var(--gold)", display: "grid", placeItems: "center", marginBottom: 20, color: "var(--gold)", fontSize: 14 }}>✦</div>
                <h4 style={{ fontFamily: "var(--sans)", fontSize: 14, fontWeight: 600, color: "var(--navy)", margin: "0 0 8px" }}>{g.t}</h4>
                <p className="small muted" style={{ margin: 0, lineHeight: 1.55, fontSize: 12.5 }}>{g.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section" style={{ background: "var(--paper)" }}>
        <div className="container-narrow">
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <Eyebrow>Questions fréquentes</Eyebrow>
            <h2 className="display" style={{ fontSize: 56, margin: "24px 0 0", lineHeight: 1.05 }}>
              Ce qu&apos;on nous demande<br /><em className="display-italic">le plus souvent.</em>
            </h2>
          </div>

          <div className="faq-list">
            {faqs.map((f, i) => (
              <details className="faq-item" key={i}>
                <summary className="faq-q">
                  <span>{f.q}</span>
                  <span className="faq-icon" aria-hidden="true" />
                </summary>
                <div className="faq-a">{f.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-tight sec-blue" style={{ background: "linear-gradient(150deg, #142579 0%, #0f1d6e 50%, #0a1450 100%)", color: "var(--white)", textAlign: "center" }}>
        <div className="container-narrow">
          <Eyebrow style={{ marginBottom: 24, color: "var(--gold)" }}>L&apos;Offre Gold est faite pour vous</Eyebrow>
          <h3 className="display" style={{ fontSize: 48, margin: "0 0 24px", color: "var(--white)", lineHeight: 1.08 }}>
            Si ces mots résonnent,<br /><em className="display-italic" style={{ color: "var(--gold)" }}>franchissez le seuil.</em>
          </h3>
          <p style={{ fontSize: 17, lineHeight: 1.75, color: "rgba(255,255,255,0.72)", maxWidth: 620, margin: "0 auto 36px" }}>
            Vous avez tout essayé pour retrouver de l&apos;élan — coaching, retraites, stratégies… mais
            rien n&apos;a réellement transformé ce qui se joue en profondeur. Réservez votre appel
            confidentiel pour identifier le parcours parfaitement adapté à votre situation.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/contact" className="btn btn-gold">
              Réserver un appel confidentiel <Arrow />
            </Link>
            <Link href="#offres" className="btn btn-ghost-white">
              Voir le comparatif
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
