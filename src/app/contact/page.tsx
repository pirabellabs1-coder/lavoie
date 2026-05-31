"use client";

import { useState } from "react";
import Link from "next/link";

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

type FormState = {
  prenom: string;
  nom: string;
  email: string;
  tel: string;
  situation: string;
  niveau: string;
  rgpd: boolean;
};

export default function ContactPage() {
  const [form, setForm] = useState<FormState>({
    prenom: "", nom: "", email: "", tel: "",
    situation: "", niveau: "", rgpd: false,
  });
  const [submitted, setSubmitted] = useState(false);

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const val = e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
    setForm({ ...form, [k]: val });
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (submitted) {
    return (
      <div className="page-fade">
        <section style={{ minHeight: "calc(100vh - 78px)", display: "grid", placeItems: "center", padding: "160px 0 80px", background: "var(--white)" }}>
          <div style={{ textAlign: "center", maxWidth: 640, padding: "0 40px" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--gold)", display: "grid", placeItems: "center", margin: "0 auto 32px" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M4 12l5 5 11-11" stroke="var(--navy-ink)" strokeWidth="2" />
              </svg>
            </div>
            <Eyebrow style={{ marginBottom: 24 }}>Demande reçue</Eyebrow>
            <h1 className="display" style={{ fontSize: 64, margin: "0 0 24px", lineHeight: 1.05 }}>
              Merci, <em className="display-italic">{form.prenom || "à très bientôt"}.</em>
            </h1>
            <hr className="filet" style={{ margin: "0 auto 32px" }} />
            <p style={{ fontSize: 17, lineHeight: 1.7, color: "var(--navy-ink)", margin: "0 0 36px" }}>
              Votre demande nous parvient. Domoina ou son équipe vous recontactera
              sous <strong style={{ fontWeight: 500 }}>24 heures ouvrées</strong> à l&apos;adresse{" "}
              <strong style={{ fontWeight: 500 }}>{form.email || "votre adresse"}</strong> pour fixer
              ensemble votre appel découverte.
            </p>
            <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 20, color: "var(--mute)", margin: "0 0 36px" }}>
              « Le premier appel — trente minutes pour se reconnaître. »
            </p>
            <Link href="/" className="btn btn-ghost">
              Retour à l&apos;accueil
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="page-fade">

      {/* HERO */}
      <section className="page-hero" style={{ background: "var(--white)", borderBottom: "1px solid var(--line)", paddingBottom: 60 }}>
        <div className="container-narrow" style={{ textAlign: "center" }}>
          <Eyebrow style={{ marginBottom: 32 }}>Premier pas · 30 minutes offertes</Eyebrow>
          <h1 className="display" style={{ fontSize: "clamp(36px, 4.6vw, 68px)", margin: "0 0 28px", lineHeight: 1.02 }}>
            Réservez votre<br /><em className="display-italic">appel découverte.</em>
          </h1>
          <hr className="filet" style={{ margin: "0 auto 32px" }} />
          <p style={{ fontSize: 18, lineHeight: 1.7, color: "var(--navy-ink)", maxWidth: 620, margin: "0 auto" }}>
            Trente minutes, offertes et sans engagement. Une conversation simple
            pour comprendre où vous en êtes — et envisager le chemin juste.
          </p>
        </div>
      </section>

      {/* FORM + INFOS */}
      <section className="section" style={{ paddingTop: 100 }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 80, alignItems: "start" }}>

            {/* FORM */}
            <form onSubmit={onSubmit} style={{ background: "var(--white)", padding: 56, border: "1px solid var(--line)" }}>
              <Eyebrow style={{ marginBottom: 28 }}>Formulaire confidentiel</Eyebrow>
              <h2 className="display" style={{ fontSize: 36, margin: "0 0 40px", lineHeight: 1.15 }}>
                Vos coordonnées,<br />
                <em className="display-italic" style={{ color: "var(--gold)", fontSize: 32 }}>votre intention.</em>
              </h2>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                <div className="field">
                  <label>Prénom *</label>
                  <input required type="text" value={form.prenom} onChange={set("prenom")} placeholder="Marie" />
                </div>
                <div className="field">
                  <label>Nom *</label>
                  <input required type="text" value={form.nom} onChange={set("nom")} placeholder="Dupont" />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                <div className="field">
                  <label>Email *</label>
                  <input required type="email" value={form.email} onChange={set("email")} placeholder="m.dupont@email.com" />
                </div>
                <div className="field">
                  <label>Téléphone *</label>
                  <input required type="tel" value={form.tel} onChange={set("tel")} placeholder="06 00 00 00 00" />
                </div>
              </div>

              <div className="field" style={{ marginBottom: 20 }}>
                <label>Niveau souhaité</label>
                <select value={form.niveau} onChange={set("niveau")}>
                  <option value="">— Je ne sais pas encore —</option>
                  <option value="essence">Immersion Essence · 3 mois</option>
                  <option value="expansion">Immersion Expansion · 6 mois</option>
                  <option value="royale">Immersion Royale · 9–12 mois</option>
                  <option value="conseil">J&apos;aimerais en discuter</option>
                </select>
              </div>

              <div className="field" style={{ marginBottom: 28 }}>
                <label>Votre situation &amp; votre intention *</label>
                <textarea required value={form.situation} onChange={set("situation")} placeholder="Quelques mots sur ce qui vous amène, et ce que vous cherchez à dénouer ou à approfondir…" />
              </div>

              <label style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 32, cursor: "pointer" }}>
                <input required type="checkbox" checked={form.rgpd} onChange={set("rgpd")} style={{ marginTop: 4, width: 16, height: 16, accentColor: "var(--navy)", flexShrink: 0 }} />
                <span style={{ fontSize: 13, lineHeight: 1.6, color: "var(--mute)" }}>
                  J&apos;accepte que mes données soient utilisées dans le cadre exclusif de ma demande
                  d&apos;appel découverte. Conservation 12 mois · Droit d&apos;accès, rectification, suppression
                  selon le RGPD.{" "}
                  <Link href="/politique-confidentialite" style={{ color: "var(--navy)", textDecoration: "underline" }}>
                    Politique de confidentialité
                  </Link>.
                </span>
              </label>

              <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                Envoyer ma demande <Arrow />
              </button>
              <p className="small" style={{ textAlign: "center", margin: "20px 0 0", color: "var(--mute)", fontSize: 12 }}>
                ✦ Réponse sous 24h ouvrées · Confidentialité absolue ✦
              </p>
            </form>

            {/* INFOS */}
            <div style={{ position: "sticky", top: 100 }}>
              <Eyebrow style={{ marginBottom: 28 }}>Nous joindre</Eyebrow>
              <h3 className="display" style={{ fontSize: 36, margin: "0 0 32px", lineHeight: 1.15 }}>
                <em className="display-italic">Trois façons</em><br />de prendre contact.
              </h3>
              <hr className="filet" style={{ marginBottom: 36 }} />

              <div style={{ display: "grid", gap: 32 }}>
                <div>
                  <p className="small" style={{ letterSpacing: ".18em", textTransform: "uppercase", color: "var(--gold)", margin: "0 0 10px", fontSize: 10.5 }}>Par email</p>
                  <p style={{ fontFamily: "var(--serif)", fontSize: 22, color: "var(--navy)", margin: 0 }}>contact@lavoie2laconscience.fr</p>
                </div>

                <div>
                  <p className="small" style={{ letterSpacing: ".18em", textTransform: "uppercase", color: "var(--gold)", margin: "0 0 10px", fontSize: 10.5 }}>Par téléphone</p>
                  <p style={{ fontFamily: "var(--serif)", fontSize: 22, color: "var(--navy)", margin: 0 }}>07 64 20 15 24</p>
                  <p className="small muted" style={{ margin: "4px 0 0" }}>Lundi à vendredi · 9h–18h</p>
                </div>

                <div>
                  <p className="small" style={{ letterSpacing: ".18em", textTransform: "uppercase", color: "var(--gold)", margin: "0 0 10px", fontSize: 10.5 }}>Au cabinet</p>
                  <p style={{ fontFamily: "var(--serif)", fontSize: 22, color: "var(--navy)", margin: 0, lineHeight: 1.3 }}>
                    50 Rue Principale<br />
                    72110 Rouperroux-le-Coquet<br />
                    Sarthe, France
                  </p>
                  <p className="small muted" style={{ margin: "10px 0 0" }}>Sur rendez-vous uniquement</p>
                </div>

                <div style={{ paddingTop: 28, borderTop: "1px solid var(--line)" }}>
                  <p className="small" style={{ letterSpacing: ".18em", textTransform: "uppercase", color: "var(--gold)", margin: "0 0 14px", fontSize: 10.5 }}>Réseaux</p>
                  <div className="social" style={{ marginTop: 0 }}>
                    {[["IG", "Instagram"], ["IN", "LinkedIn"], ["YT", "YouTube"], ["TT", "TikTok"]].map(([abbr, name]) => (
                      <a key={abbr} href="#" style={{ borderColor: "var(--line)", color: "var(--navy)" }} title={name}>{abbr}</a>
                    ))}
                  </div>
                </div>

                <div style={{ background: "var(--paper)", padding: 28, borderLeft: "3px solid var(--gold)" }}>
                  <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 18, color: "var(--navy)", margin: 0, lineHeight: 1.5 }}>
                    « Nous accordons à chaque demande l&apos;attention qu&apos;elle mérite. C&apos;est la première
                    promesse, avant toutes les autres. »
                  </p>
                  <p className="small" style={{ margin: "14px 0 0", letterSpacing: ".16em", textTransform: "uppercase", color: "var(--mute)", fontSize: 10.5 }}>Domoina</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
