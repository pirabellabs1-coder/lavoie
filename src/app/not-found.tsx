import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/**
 * La page des adresses qui n'existent pas.
 *
 * Elle vit à la racine et non dans le groupe `(site)` : Next ne consulte que
 * celle-ci pour une URL qui ne correspond à rien. Elle rappelle donc elle-même
 * la navigation et le pied de page, faute d'en hériter.
 *
 * Un lien mort n'est pas une faute du visiteur — souvent une vieille lettre,
 * un lien raccourci qui a changé, une adresse recopiée à la main. On le lui dit
 * ainsi, et on lui rouvre les portes principales plutôt que de le laisser
 * devant un mur.
 */

export const metadata: Metadata = {
  title: "Page introuvable",
  robots: { index: false, follow: true },
};

const PORTES = [
  { href: "/", titre: "L'accueil", texte: "Reprendre depuis le début." },
  { href: "/evenements", titre: "Les prochaines dates", texte: "Stages, cercles et rendez-vous à venir." },
  { href: "/cercles", titre: "Les cercles", texte: "Avancer à plusieurs, chaque mois." },
  { href: "/blog", titre: "Le journal", texte: "Les textes de Domoïna, en libre lecture." },
  { href: "/contact", titre: "Un appel découverte", texte: "Quarante-cinq minutes, offertes." },
  { href: "/temoignages", titre: "Les témoignages", texte: "Ce que d'autres en ont fait." },
];

export default function Introuvable() {
  return (
    <>
      <Navbar />
      <main>
        <div className="page-fade">
          <section
            className="page-hero"
            style={{
              background: "var(--white)",
              borderBottom: "1px solid var(--line)",
              paddingBottom: 56,
            }}
          >
            <div className="container-narrow" style={{ textAlign: "center" }}>
              <p className="eyebrow" style={{ margin: "0 0 30px", justifyContent: "center" }}>
                <span className="dot" />
                Page introuvable
                <span className="dot" />
              </p>
              <h1
                className="display"
                style={{
                  fontSize: "clamp(34px, 4.4vw, 62px)",
                  margin: "0 0 26px",
                  lineHeight: 1.03,
                }}
              >
                Cette adresse ne mène
                <br />
                <em className="display-italic">nulle part.</em>
              </h1>
              <hr className="filet" style={{ margin: "0 auto 30px" }} />
              <p
                style={{
                  fontSize: 17,
                  lineHeight: 1.75,
                  color: "var(--navy-ink)",
                  maxWidth: 580,
                  margin: "0 auto",
                }}
              >
                Ce n&apos;est pas vous : une page a dû être déplacée, ou le lien que vous avez
                suivi date un peu. Voici par où reprendre.
              </p>
            </div>
          </section>

          <section className="section" style={{ background: "var(--paper)", paddingTop: 72 }}>
            <div className="container">
              <div className="rg-3">
                {PORTES.map((p) => (
                  <Link
                    key={p.href}
                    href={p.href}
                    className="card-hover"
                    style={{ padding: 28, display: "block", textDecoration: "none" }}
                  >
                    <h2 className="display" style={{ fontSize: 20, margin: "0 0 8px" }}>
                      {p.titre}
                    </h2>
                    <p style={{ margin: 0, lineHeight: 1.7, color: "var(--navy-ink)", fontSize: 14.5 }}>
                      {p.texte}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
