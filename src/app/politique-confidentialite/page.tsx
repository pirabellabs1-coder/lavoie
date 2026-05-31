import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Politique de confidentialité et traitement des données personnelles — La Voie 2 la Conscience.",
};

function Eyebrow({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <p className="eyebrow" style={{ margin: 0, ...style }}>
      <span className="dot" />
      {children}
      <span className="dot" />
    </p>
  );
}

export default function PolitiqueConfidentialite() {
  return (
    <div className="page-fade">

      {/* HERO */}
      <section className="page-hero" style={{ background: "var(--white)", borderBottom: "1px solid var(--line)" }}>
        <div className="container-narrow" style={{ textAlign: "center" }}>
          <Eyebrow style={{ marginBottom: 32 }}>RGPD · Données personnelles</Eyebrow>
          <h1 className="display" style={{ fontSize: "clamp(44px, 6vw, 80px)", margin: "0 0 28px", lineHeight: 1.05 }}>
            Politique de<br /><em className="display-italic">confidentialité.</em>
          </h1>
          <hr className="filet" style={{ margin: "0 auto" }} />
        </div>
      </section>

      {/* CONTENT */}
      <section className="section">
        <div className="container-narrow">
          <div style={{ display: "grid", gap: 48 }}>

            <div>
              <h2 className="display" style={{ fontSize: 28, color: "var(--navy)", margin: "0 0 16px" }}>Responsable du traitement</h2>
              <hr className="filet" style={{ marginBottom: 20 }} />
              <p style={{ fontSize: 16, lineHeight: 1.8, color: "var(--navy-ink)" }}>
                La Voie 2 la Conscience, représentée par Domoina.<br />
                Contact : <strong style={{ fontWeight: 500 }}>contact@lavoie2laconscience.fr</strong>
              </p>
            </div>

            <div>
              <h2 className="display" style={{ fontSize: 28, color: "var(--navy)", margin: "0 0 16px" }}>Données collectées</h2>
              <hr className="filet" style={{ marginBottom: 20 }} />
              <p style={{ fontSize: 16, lineHeight: 1.8, color: "var(--navy-ink)" }}>
                Nous collectons uniquement les données nécessaires au traitement de vos demandes :
                nom, prénom, adresse email, numéro de téléphone (optionnel) et le contenu de vos messages.
              </p>
            </div>

            <div>
              <h2 className="display" style={{ fontSize: 28, color: "var(--navy)", margin: "0 0 16px" }}>Finalités du traitement</h2>
              <hr className="filet" style={{ marginBottom: 20 }} />
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 12 }}>
                {[
                  "Répondre à vos demandes de contact et de renseignements",
                  "Gérer les réservations d'appels découverte",
                  "Envoyer la newsletter (avec votre consentement)",
                  "Améliorer nos services et notre communication",
                ].map((item, i) => (
                  <li key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", fontSize: 16, lineHeight: 1.7, color: "var(--navy-ink)" }}>
                    <span style={{ color: "var(--gold)", flexShrink: 0, marginTop: 2 }}>✦</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="display" style={{ fontSize: 28, color: "var(--navy)", margin: "0 0 16px" }}>Conservation des données</h2>
              <hr className="filet" style={{ marginBottom: 20 }} />
              <p style={{ fontSize: 16, lineHeight: 1.8, color: "var(--navy-ink)" }}>
                Vos données sont conservées pendant 3 ans à compter de votre dernier contact avec nous,
                ou jusqu&apos;à votre demande de suppression.
              </p>
            </div>

            <div>
              <h2 className="display" style={{ fontSize: 28, color: "var(--navy)", margin: "0 0 16px" }}>Vos droits</h2>
              <hr className="filet" style={{ marginBottom: 20 }} />
              <p style={{ fontSize: 16, lineHeight: 1.8, color: "var(--navy-ink)", margin: "0 0 16px" }}>
                Conformément au RGPD, vous disposez des droits suivants :
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 16px", display: "grid", gap: 10 }}>
                {[
                  "Droit d'accès à vos données personnelles",
                  "Droit de rectification",
                  "Droit à l'effacement (« droit à l'oubli »)",
                  "Droit à la portabilité",
                  "Droit d'opposition au traitement",
                ].map((item, i) => (
                  <li key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", fontSize: 16, lineHeight: 1.7, color: "var(--navy-ink)" }}>
                    <span style={{ color: "var(--gold)", flexShrink: 0, marginTop: 2 }}>✦</span>
                    {item}
                  </li>
                ))}
              </ul>
              <p style={{ fontSize: 16, lineHeight: 1.8, color: "var(--navy-ink)" }}>
                Pour exercer ces droits : <strong style={{ fontWeight: 500 }}>contact@lavoie2laconscience.fr</strong>
              </p>
            </div>

            <div>
              <h2 className="display" style={{ fontSize: 28, color: "var(--navy)", margin: "0 0 16px" }}>Cookies</h2>
              <hr className="filet" style={{ marginBottom: 20 }} />
              <p style={{ fontSize: 16, lineHeight: 1.8, color: "var(--navy-ink)" }}>
                Ce site utilise des cookies techniques nécessaires à son bon fonctionnement.
                Aucun cookie publicitaire ou de traçage n&apos;est utilisé sans votre consentement.
              </p>
            </div>

            <div>
              <h2 className="display" style={{ fontSize: 28, color: "var(--navy)", margin: "0 0 16px" }}>Contact DPO</h2>
              <hr className="filet" style={{ marginBottom: 20 }} />
              <p style={{ fontSize: 16, lineHeight: 1.8, color: "var(--navy-ink)" }}>
                Pour toute question relative à la protection de vos données,
                contactez-nous à : <strong style={{ fontWeight: 500 }}>contact@lavoie2laconscience.fr</strong>
              </p>
            </div>

            <div style={{ paddingTop: 24, borderTop: "1px solid var(--line)" }}>
              <p style={{ fontSize: 12, color: "var(--mute)", margin: "0 0 24px" }}>
                Dernière mise à jour : mai 2026
              </p>
              <Link href="/contact" className="btn btn-ghost">
                Nous contacter
              </Link>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
