import type { Metadata } from "next";
import Link from "next/link";
import FormulaireConnexion from "./FormulaireConnexion";

export const metadata: Metadata = {
  title: "Connexion — Tableau de bord",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ suite?: string; active?: string }>;
}) {
  const { suite, active } = await searchParams;
  const configure = Boolean(process.env.ADMIN_PASSWORD);

  return (
    <div className="adm-connexion">
      <div className="adm-connexion-bac">
        <div className="adm-connexion-tete">
          <div className="adm-brand">
            La Voie 2 la Conscience
            <span>Tableau de bord</span>
          </div>
          <p>Les contacts, les stages et tout ce qui part par e-mail.</p>
        </div>

        <div className="adm-connexion-corps">
          {active === "1" && (
            <div className="adm-alerte" style={{ margin: "0 0 16px" }}>
              <strong>Votre accès est ouvert.</strong> Connectez-vous avec votre adresse et le
              mot de passe que vous venez de choisir.
            </div>
          )}

          {configure ? (
            <FormulaireConnexion suite={suite} />
          ) : (
            <div className="adm-alerte" style={{ margin: 0 }}>
              <strong>Tableau de bord pas encore activé.</strong>
              <br />
              Ajoutez la variable d&apos;environnement <code>ADMIN_PASSWORD</code> dans les
              réglages Vercel du projet, puis redéployez.
            </div>
          )}

          <p className="adm-connexion-pied">
            <Link href="/">Retour au site</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
