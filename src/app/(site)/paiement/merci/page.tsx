import type { Metadata } from "next";
import Link from "next/link";
import { euros, sessionReglee } from "@/lib/crm/paiements";

export const metadata: Metadata = {
  title: "Votre règlement est bien arrivé",
  robots: { index: false, follow: false },
};

const MARINE = "linear-gradient(150deg, #142579 0%, #0f1d6e 50%, #0a1450 100%)";

/**
 * La page qui suit un paiement.
 *
 * Elle n'encaisse rien : c'est le webhook qui fait foi. Elle se contente de
 * dire à la personne que c'est passé, et ce qu'il se passe ensuite — parce
 * qu'un virement qui disparaît dans le silence est la meilleure façon de faire
 * douter quelqu'un de ce qu'il vient d'acheter.
 */
export default async function MerciPage({
  searchParams,
}: {
  searchParams: Promise<{ s?: string }>;
}) {
  const { s } = await searchParams;
  const regle = s ? await sessionReglee(s) : null;

  return (
    <div className="page-fade">
      <section className="page-hero sec-blue" style={{ background: MARINE }}>
        <div className="container-narrow" style={{ textAlign: "center" }}>
          <p className="eyebrow" style={{ justifyContent: "center", color: "var(--gold)", marginBottom: 28 }}>
            <span className="dot" style={{ background: "var(--gold)" }} />
            Règlement reçu
            <span className="dot" style={{ background: "var(--gold)" }} />
          </p>
          <h1 className="display" style={{ fontSize: "clamp(30px, 4vw, 54px)", margin: "0 0 24px", lineHeight: 1.06, color: "var(--white)" }}>
            Merci, votre place<br />
            <em className="display-italic" style={{ color: "var(--gold)" }}>est retenue.</em>
          </h1>
          <hr className="filet" style={{ margin: "0 auto 28px" }} />
          <p style={{ fontSize: 17, lineHeight: 1.75, color: "rgba(255,255,255,0.84)", maxWidth: 560, margin: "0 auto" }}>
            {regle ? (
              <>
                Votre règlement de <strong style={{ color: "var(--white)" }}>{euros(regle.montant)}</strong> pour
                « {regle.titre} » nous est bien parvenu.
              </>
            ) : (
              <>Votre règlement nous est bien parvenu.</>
            )}
          </p>
        </div>
      </section>

      <section className="section" style={{ background: "var(--paper)" }}>
        <div className="container-narrow">
          <div
            style={{
              background: "var(--white)",
              border: "1px solid var(--line)",
              borderRadius: 18,
              padding: "clamp(28px, 4vw, 48px)",
            }}
          >
            <h2 className="display" style={{ fontSize: "clamp(22px, 2.6vw, 30px)", margin: "0 0 20px", lineHeight: 1.15 }}>
              Ce qui se passe maintenant.
            </h2>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 18 }}>
              {[
                "Un reçu arrive dans votre boîte, envoyé par notre prestataire de paiement.",
                "Le secrétariat vous écrit sous 48 heures ouvrées avec les détails pratiques : horaires, accès, ce qu'il faut apporter.",
                "Une semaine avant le stage, vous recevez la logistique complète.",
              ].map((t, i) => (
                <li key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start", fontSize: 16, lineHeight: 1.7, color: "var(--navy-ink)" }}>
                  <span style={{ color: "var(--gold)", flexShrink: 0, marginTop: 2 }}>✦</span>
                  {t}
                </li>
              ))}
            </ul>

            <p style={{ fontSize: 15, lineHeight: 1.7, color: "var(--mute)", margin: "28px 0 0" }}>
              Une question d&apos;ici là ? Répondez simplement à l&apos;un de nos e-mails, ou
              écrivez-nous depuis la page contact.
            </p>

            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 28 }}>
              <Link href="/evenements" className="btn btn-primary">
                Les autres rendez-vous
              </Link>
              <Link href="/contact" className="btn btn-ghost">
                Nous écrire
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
