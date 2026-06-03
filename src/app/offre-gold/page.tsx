"use client";

import { useState } from "react";
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
    pitch: "Pour explorer. Un premier engagement court, dense, qui pose l'axe.",
    bullets: [
      "2 stages immersifs de 3 jours au Centre HUT",
      "Séances individuelles hebdomadaires (12 séances)",
      "Ligne WhatsApp privée avec Domoina",
      "Bibliothèque numérique de ressources initiatiques",
      "Bilan d'axe en fin de parcours",
    ],
  },
  {
    tag: "Niveau II",
    title: "Immersion Expansion",
    duration: "6 mois",
    featured: true,
    pitch: "Le format choisi par 6 personnes sur 10. La profondeur d'un cycle.",
    bullets: [
      "Tout le programme Immersion Essence",
      "3 stages immersifs saisonniers (Hiver · Printemps · Été)",
      "Séances individuelles hebdomadaires (24 séances)",
      "Coaching de groupe mensuel en cercle restreint",
      "Voyage initiatique optionnel (Maroc · Japon)",
      "Accès à la communauté alumni",
    ],
  },
  {
    tag: "Niveau III",
    title: "Immersion Royale",
    duration: "9 — 12 mois",
    pitch: "Pour celles et ceux qui choisissent la transformation totale.",
    bullets: [
      "Accompagnement individuel illimité",
      "4 stages saisonniers complets au Centre HUT",
      "Accès direct à Domoina 7j/7",
      "Suite privative au Centre HUT (10 nuitées)",
      "3 voyages initiatiques internationaux",
      "Programme entièrement sur mesure",
      "Cercle Royal — six personnes par an, maximum",
    ],
  },
];

const garanties = [
  { t: "Confidentialité absolue", b: "NDA signé · cohorte restreinte · discrétion sur le lieu" },
  { t: "Éthique de pratique", b: "Charte signée · supervision externe · droit de retrait" },
  { t: "Accès au Centre HUT", b: "1 100 hectares · stages immersifs · suites privatives" },
  { t: "Suivi entre les sessions", b: "Ligne WhatsApp · réponses sous 24h · présence réelle" },
  { t: "Bibliothèque initiatique", b: "Audio · textes · pratiques guidées · accès à vie" },
  { t: "Cercle alumni", b: "Réunions trimestrielles · réseau confidentiel · entraide" },
  { t: "Garantie de fit", b: "Appel découverte · audit d'alignement · pas de pression" },
  { t: "Modalités de paiement", b: "3, 6, ou 12 fois sans frais · facilités étudiées au cas par cas" },
];

const faqs = [
  {
    q: "Comment se déroule concrètement un accompagnement ?",
    a: "Tout commence par un appel découverte de trente minutes. Si nous décidons mutuellement de poursuivre, un audit d'alignement d'une heure permet de définir le niveau adapté, la cadence, et les premiers axes. Le parcours alterne séances individuelles à distance, stages immersifs au Centre HUT, et présence quotidienne par WhatsApp.",
  },
  {
    q: "Quels sont les tarifs des trois niveaux ?",
    a: "Les tarifs sont communiqués lors de l'appel découverte, après audit d'alignement. Nous travaillons sur devis personnalisé, car chaque parcours est calibré. Des facilités de paiement en 3, 6 ou 12 fois sont systématiquement proposées.",
  },
  {
    q: "Où se passent les stages immersifs ?",
    a: "Tous les stages se déroulent au Centre HUT, sanctuaire de 1 100 hectares situé en Sarthe — à deux heures de Paris en voiture ou en train. Les suites privatives sont incluses dans les niveaux Expansion et Royale.",
  },
  {
    q: "Peut-on suivre l'accompagnement à distance ?",
    a: "Les séances individuelles peuvent se faire à distance (visioconférence sécurisée), mais les stages immersifs au Centre HUT sont structurellement présentiels — l'eau, le silence, le lieu, font partie intégrante du dispositif.",
  },
];

export default function OffreGoldPage() {
  const [openFaq, setOpenFaq] = useState(0);

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
            <Eyebrow style={{ marginBottom: 32 }}>Offre signature · Trois niveaux</Eyebrow>
            <h1 className="display" style={{ fontSize: "clamp(32px, 4vw, 64px)", margin: "0 0 28px", lineHeight: 1.05 }}>
              L&apos;Offre <em className="display-italic" style={{ color: "var(--gold)" }}>Gold</em>
            </h1>
            <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 17, color: "var(--navy)", margin: "0 0 36px", fontWeight: 300 }}>
              Accompagnement premium · 3, 6, 9 ou 12 mois.
            </p>
            <hr className="filet" style={{ margin: "0 auto 32px" }} />
            <p style={{ fontSize: 17, lineHeight: 1.7, color: "var(--mute)", maxWidth: 620, margin: "0 auto" }}>
              Trois portes vers le même horizon. Le niveau adapté est défini ensemble lors de l&apos;appel découverte —
              il n&apos;y a pas d&apos;entrée meilleure qu&apos;une autre.
            </p>
          </div>
        </div>
      </section>

      {/* OFFRES */}
      <section className="section" style={{ paddingTop: 80 }}>
        <div className="container">
          <div className="rg-3" style={{ gap: 0 }}>
            {offres.map((o, i) => (
              <div key={i} className={o.featured ? "offre-pop" : undefined} style={{
                background: o.featured ? "var(--navy)" : "var(--white)",
                color: o.featured ? "var(--white)" : "var(--navy-ink)",
                padding: "56px 40px 48px",
                border: `1px solid ${o.featured ? "var(--navy)" : "var(--line)"}`,
                borderRight: i < 2 ? 0 : `1px solid ${o.featured ? "var(--navy)" : "var(--line)"}`,
                position: "relative",
                transform: o.featured ? "translateY(-20px)" : "none",
                boxShadow: o.featured ? "0 40px 80px -30px rgba(14,26,74,0.45)" : "none",
              }}>
                {o.featured && <div style={{ position: "absolute", top: -1, left: -1, right: -1, height: 6, background: "var(--gold)" }} />}
                {o.featured && (
                  <span className="pill pill-gold" style={{ position: "absolute", top: 28, right: 28 }}>★ Le plus choisi</span>
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
                <p className="small" style={{ letterSpacing: ".14em", textTransform: "uppercase", color: o.featured ? "rgba(255,255,255,0.6)" : "var(--mute)", margin: "0 0 20px", fontSize: 10.5 }}>
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

          <div className="rg-4" style={{ gap: 1, background: "var(--line)", border: "1px solid var(--line)" }}>
            {garanties.map((g, i) => (
              <div key={i} style={{ padding: "32px 28px", background: "var(--white)", transition: "background .3s" }}>
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

          <div style={{ borderTop: "1px solid var(--line)" }}>
            {faqs.map((f, i) => {
              const open = openFaq === i;
              return (
                <div key={i} style={{ borderBottom: "1px solid var(--line)" }}>
                  <button
                    onClick={() => setOpenFaq(open ? -1 : i)}
                    style={{ width: "100%", textAlign: "left", background: "transparent", border: 0, padding: "32px 0", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24, cursor: "pointer" }}
                  >
                    <span className="display" style={{ fontSize: 26, color: "var(--navy)" }}>{f.q}</span>
                    <span style={{ width: 36, height: 36, border: "1px solid var(--navy)", display: "grid", placeItems: "center", flexShrink: 0, transition: "transform .3s, background .3s, color .3s", transform: open ? "rotate(45deg)" : "none", background: open ? "var(--navy)" : "transparent", color: open ? "var(--gold)" : "var(--navy)", fontSize: 20 }}>+</span>
                  </button>
                  {open && (
                    <p style={{ fontSize: 16, lineHeight: 1.75, color: "var(--mute)", margin: "0 0 32px", maxWidth: 720 }}>{f.a}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-tight" style={{ background: "var(--navy)", color: "var(--white)", textAlign: "center" }}>
        <div className="container-narrow">
          <Eyebrow style={{ marginBottom: 24, color: "var(--gold)" }}>Premier pas</Eyebrow>
          <h3 className="display" style={{ fontSize: 56, margin: "0 0 24px", color: "var(--white)", lineHeight: 1.05 }}>
            Le bon niveau pour vous —<br /><em className="display-italic" style={{ color: "var(--gold)" }}>se découvre ensemble.</em>
          </h3>
          <p style={{ fontSize: 17, lineHeight: 1.7, color: "rgba(255,255,255,0.72)", maxWidth: 560, margin: "0 auto 36px" }}>
            Trente minutes pour comprendre où vous en êtes, et envisager la juste porte d&apos;entrée.
          </p>
          <Link href="/contact" className="btn btn-gold">
            Réserver mon appel offert <Arrow />
          </Link>
        </div>
      </section>

    </div>
  );
}
