import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales du site La Voie 2 la Conscience.",
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

export default function MentionsLegales() {
  return (
    <div className="page-fade">

      {/* HERO */}
      <section className="page-hero" style={{ background: "var(--white)", borderBottom: "1px solid var(--line)" }}>
        <div className="container-narrow" style={{ textAlign: "center" }}>
          <Eyebrow style={{ marginBottom: 32 }}>Informations légales</Eyebrow>
          <h1 className="display" style={{ fontSize: "clamp(44px, 6vw, 80px)", margin: "0 0 28px", lineHeight: 1.05 }}>
            Mentions<br /><em className="display-italic">légales.</em>
          </h1>
          <hr className="filet" style={{ margin: "0 auto" }} />
        </div>
      </section>

      {/* CONTENT */}
      <section className="section">
        <div className="container-narrow">
          <div style={{ display: "grid", gap: 48 }}>

            <div>
              <h2 className="display" style={{ fontSize: 28, color: "var(--navy)", margin: "0 0 16px" }}>Éditeur du site</h2>
              <hr className="filet" style={{ marginBottom: 20 }} />
              <p style={{ fontSize: 16, lineHeight: 1.8, color: "var(--navy-ink)" }}>
                La Voie 2 la Conscience<br />
                Représentée par Domoïna<br />
                50 Rue Principale, 72110 Rouperroux-le-Coquet, Sarthe<br />
                Email : <strong style={{ fontWeight: 500 }}>contact@lavoie2laconscience.fr</strong><br />
                Téléphone : <strong style={{ fontWeight: 500 }}>07 64 20 15 24</strong>
              </p>
            </div>

            <div>
              <h2 className="display" style={{ fontSize: 28, color: "var(--navy)", margin: "0 0 16px" }}>Hébergement</h2>
              <hr className="filet" style={{ marginBottom: 20 }} />
              <p style={{ fontSize: 16, lineHeight: 1.8, color: "var(--navy-ink)" }}>
                Ce site est hébergé par Vercel Inc., 340 Pine Street, Suite 701,
                San Francisco, CA 94104, États-Unis.
              </p>
            </div>

            <div>
              <h2 className="display" style={{ fontSize: 28, color: "var(--navy)", margin: "0 0 16px" }}>Propriété intellectuelle</h2>
              <hr className="filet" style={{ marginBottom: 20 }} />
              <p style={{ fontSize: 16, lineHeight: 1.8, color: "var(--navy-ink)" }}>
                L&apos;ensemble du contenu de ce site (textes, images, logos, méthodes) est la propriété
                exclusive de La Voie 2 la Conscience. Toute reproduction, même partielle, est interdite
                sans autorisation préalable écrite.
              </p>
            </div>

            <div>
              <h2 className="display" style={{ fontSize: 28, color: "var(--navy)", margin: "0 0 16px" }}>Responsabilité</h2>
              <hr className="filet" style={{ marginBottom: 20 }} />
              <p style={{ fontSize: 16, lineHeight: 1.8, color: "var(--navy-ink)" }}>
                Les informations contenues sur ce site sont fournies à titre indicatif.
                La Voie 2 la Conscience ne saurait être tenue responsable des erreurs ou omissions,
                ni des résultats qui pourraient être obtenus par un mauvais usage de ces informations.
              </p>
            </div>

            <div>
              <h2 className="display" style={{ fontSize: 28, color: "var(--navy)", margin: "0 0 16px" }}>Loi applicable</h2>
              <hr className="filet" style={{ marginBottom: 20 }} />
              <p style={{ fontSize: 16, lineHeight: 1.8, color: "var(--navy-ink)" }}>
                Les présentes mentions légales sont soumises au droit français.
                En cas de litige, les tribunaux français seront seuls compétents.
              </p>
            </div>

            <div style={{ paddingTop: 24, borderTop: "1px solid var(--line)" }}>
              <Link href="/politique-confidentialite" className="btn btn-ghost">
                Politique de confidentialité
              </Link>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
