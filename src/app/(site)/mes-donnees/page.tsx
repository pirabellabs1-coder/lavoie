import type { Metadata } from "next";
import DemandeRgpd from "@/components/DemandeRgpd";

export const metadata: Metadata = {
  title: "Accéder à mes données ou les effacer",
  description:
    "Exercez vos droits : obtenez une copie de vos données personnelles ou demandez leur effacement.",
  alternates: { canonical: "/mes-donnees" },
};

export default function MesDonneesPage() {
  return (
    <div className="page-fade">
      <section
        className="page-hero"
        style={{ background: "var(--white)", borderBottom: "1px solid var(--line)", paddingBottom: 50 }}
      >
        <div className="container-narrow" style={{ textAlign: "center" }}>
          <p className="eyebrow" style={{ margin: "0 0 28px", justifyContent: "center" }}>
            <span className="dot" />
            Vos données · RGPD
            <span className="dot" />
          </p>
          <h1
            className="display"
            style={{ fontSize: "clamp(32px, 4.2vw, 58px)", margin: "0 0 24px", lineHeight: 1.05 }}
          >
            Vos données vous <em className="display-italic">appartiennent.</em>
          </h1>
          <hr className="filet" style={{ margin: "0 auto 28px" }} />
          <p style={{ fontSize: 17, lineHeight: 1.75, color: "var(--navy-ink)", maxWidth: 600, margin: "0 auto" }}>
            Vous pouvez à tout moment obtenir une copie de tout ce que nous savons de vous,
            ou demander son effacement complet. Indiquez votre adresse : nous vous envoyons
            un lien personnel pour agir en toute sécurité.
          </p>
        </div>
      </section>

      <section className="section" style={{ background: "var(--paper)", paddingTop: 70 }}>
        <div className="container-narrow" style={{ maxWidth: 560 }}>
          <DemandeRgpd />
          <p style={{ color: "var(--mute)", fontSize: 13, lineHeight: 1.7, marginTop: 24, textAlign: "center" }}>
            Une question sur vos données ? Écrivez à contact@lavoie2laconscience.com. Le
            détail de ce que nous collectons est dans notre{" "}
            <a href="/politique-confidentialite" style={{ color: "var(--blue)", textDecoration: "underline" }}>
              politique de confidentialité
            </a>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
