import type { Metadata } from "next";
import Link from "next/link";
import { after } from "next/server";
import { confirmer } from "@/lib/crm/optin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Confirmation de votre inscription",
  robots: { index: false, follow: false },
};

function Coquille({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-fade">
      <section className="section" style={{ paddingTop: 120 }}>
        <div className="container-narrow" style={{ maxWidth: 620, textAlign: "center" }}>
          {children}
        </div>
      </section>
    </div>
  );
}

export default async function ConfirmerPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  const { t } = await searchParams;
  const resultat = t ? await confirmer(t) : null;

  if (!resultat) {
    return (
      <Coquille>
        <h1 className="display" style={{ fontSize: 34, margin: "0 0 16px" }}>
          Ce lien n&apos;est plus valable.
        </h1>
        <p style={{ color: "var(--mute)", lineHeight: 1.75 }}>
          Les liens de confirmation expirent au bout de quelques jours. Réinscrivez-vous
          simplement depuis le site pour en recevoir un nouveau.
        </p>
        <p style={{ marginTop: 28 }}>
          <Link href="/" className="btn">Retour à l&apos;accueil</Link>
        </p>
      </Coquille>
    );
  }

  // Le premier e-mail de la séquence est dû tout de suite : on le traite après
  // la réponse, sans faire attendre la page.
  if (!resultat.deja) {
    after(async () => {
      const { traiterEcheances } = await import("@/lib/crm/sequences");
      await traiterEcheances(20);
    });
  }

  return (
    <Coquille>
      <p
        className="small"
        style={{ letterSpacing: ".2em", textTransform: "uppercase", fontSize: 10.5, color: "var(--gold)", margin: "0 0 18px" }}
      >
        Confirmé
      </p>
      <h1 className="display" style={{ fontSize: 36, margin: "0 0 16px", lineHeight: 1.05 }}>
        {resultat.deja ? "C'était déjà fait." : "Bienvenue,"}
        {resultat.prenom ? ` ${resultat.prenom}` : ""}.
      </h1>
      <p style={{ color: "var(--mute)", lineHeight: 1.75, fontSize: 17 }}>
        {resultat.deja
          ? "Votre inscription était déjà confirmée — vous n'avez rien à faire de plus."
          : "Votre inscription est confirmée. Vous allez recevoir un premier message d'ici quelques minutes. Merci de votre confiance."}
      </p>
      <p style={{ marginTop: 30 }}>
        <Link href="/" className="btn btn-primary">Découvrir le site</Link>
      </p>
    </Coquille>
  );
}
