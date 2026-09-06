import type { Metadata } from "next";
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
    <div style={{ display: "grid", placeItems: "center", minHeight: "100vh", padding: 20 }}>
      <div className="adm-carte" style={{ width: "100%", maxWidth: 400, padding: 30 }}>
        <div className="adm-brand" style={{ padding: "0 0 20px" }}>
          La Voie 2 la Conscience
          <span>Tableau de bord</span>
        </div>

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
      </div>
    </div>
  );
}
