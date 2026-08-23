import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { desinscrire } from "@/lib/crm/contacts";

export const metadata: Metadata = {
  title: "Désinscription",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Désinscription en un clic depuis le lien présent dans chaque e-mail.
 * Le formulaire confirme l'action pour qu'un simple préchargement du lien
 * par une messagerie ne désinscrive personne par accident.
 */
async function confirmer(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "");
  if (email) await desinscrire(email);
  redirect("/desinscription?fait=1");
}

export default async function DesinscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ e?: string; fait?: string }>;
}) {
  const { e, fait } = await searchParams;
  const email = (e ?? "").trim();

  return (
    <div className="page-fade">
      <section className="page-hero" style={{ background: "var(--white)" }}>
        <div className="container-narrow" style={{ textAlign: "center", maxWidth: 560 }}>
          <h1 className="display" style={{ fontSize: "clamp(28px, 3.6vw, 44px)", margin: "0 0 24px", lineHeight: 1.06 }}>
            Ne plus recevoir<br /><em className="display-italic">mes e-mails.</em>
          </h1>
          <hr className="filet" style={{ margin: "0 auto 30px" }} />

          {fait === "1" ? (
            <p style={{ fontSize: 16.5, lineHeight: 1.8, color: "var(--navy-ink)" }}>
              C&apos;est fait. Vous ne recevrez plus d&apos;e-mail automatique de notre part.
              <br />
              <span style={{ color: "var(--mute)", fontSize: 15 }}>
                Merci d&apos;avoir cheminé un bout de route avec nous.
              </span>
            </p>
          ) : !email ? (
            <p style={{ fontSize: 16.5, lineHeight: 1.8, color: "var(--mute)" }}>
              Ce lien est incomplet. Utilisez celui figurant en bas de l&apos;e-mail que vous
              avez reçu, ou écrivez-nous et nous nous en occupons.
            </p>
          ) : (
            <>
              <p style={{ fontSize: 16.5, lineHeight: 1.8, color: "var(--navy-ink)", margin: "0 0 28px" }}>
                Confirmez la désinscription de <strong>{email}</strong>. Vous ne recevrez plus
                aucun e-mail automatique de La Voie 2 la Conscience.
              </p>
              <form action={confirmer}>
                <input type="hidden" name="email" value={email} />
                <button type="submit" className="btn btn-primary btn-lg">
                  Confirmer ma désinscription
                </button>
              </form>
            </>
          )}

          <p style={{ marginTop: 34 }}>
            <Link href="/" className="link-underline" style={{ color: "var(--blue)", fontSize: 14 }}>
              Retour au site
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
