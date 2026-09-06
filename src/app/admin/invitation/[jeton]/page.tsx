import type { Metadata } from "next";
import Link from "next/link";
import { INVITATION_JOURS, lireInvitation } from "@/lib/crm/utilisateurs";
import { actionActiverInvitation } from "./actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Votre accès — Tableau de bord",
  robots: { index: false, follow: false },
};

/**
 * L'écran où la personne invitée choisit son mot de passe.
 *
 * Il vit sous /admin mais reste public — c'est le seul endroit du tableau de
 * bord où l'on entre sans compte, et le proxy le laisse passer pour cette
 * raison. Ce qui tient lieu d'autorisation, c'est le jeton de l'adresse.
 */
export default async function InvitationPage({
  params,
  searchParams,
}: {
  params: Promise<{ jeton: string }>;
  searchParams: Promise<{ erreur?: string }>;
}) {
  const { jeton } = await params;
  const { erreur } = await searchParams;
  const invite = await lireInvitation(jeton);

  return (
    <div style={{ display: "grid", placeItems: "center", minHeight: "100vh", padding: 20 }}>
      <div className="adm-carte" style={{ width: "100%", maxWidth: 440, padding: 30 }}>
        <div className="adm-brand" style={{ padding: "0 0 20px" }}>
          La Voie 2 la Conscience
          <span>Tableau de bord</span>
        </div>

        {!invite ? (
          <div className="adm-alerte" style={{ margin: 0 }}>
            <strong>Ce lien n&apos;est plus valable.</strong>
            <br />
            Une invitation vaut {INVITATION_JOURS} jours et ne sert qu&apos;une fois — celle-ci
            a expiré, ou elle a déjà été utilisée. Demandez qu&apos;on vous en renvoie une, elle
            arrivera dans la minute.
          </div>
        ) : (
          <>
            <p style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 600 }}>
              Bienvenue, {invite.nom.split(/\s+/)[0]}.
            </p>
            <p style={{ margin: "0 0 20px", fontSize: 12.5, color: "var(--adm-mute)", lineHeight: 1.7 }}>
              Choisissez votre mot de passe. Vous serez la seule personne à le connaître : il
              ne s&apos;affiche nulle part, et personne ne peut le lire ni le remplacer — au
              mieux vous renvoyer un lien comme celui-ci.
            </p>

            {erreur && (
              <div className="adm-alerte" style={{ margin: "0 0 16px" }}>
                {erreur}
              </div>
            )}

            <form action={actionActiverInvitation} style={{ display: "grid", gap: 14 }}>
              <input type="hidden" name="jeton" value={jeton} />

              <label style={{ display: "block" }}>
                <span className="adm-label">Votre adresse de connexion</span>
                <input
                  type="email"
                  value={invite.email}
                  readOnly
                  className="adm-champ"
                  aria-label="Votre adresse de connexion"
                />
              </label>

              <label style={{ display: "block" }}>
                <span className="adm-label">Votre mot de passe — douze caractères au minimum</span>
                <input
                  type="password"
                  name="motDePasse"
                  required
                  minLength={12}
                  className="adm-champ"
                  autoComplete="new-password"
                  autoFocus
                />
              </label>

              <label style={{ display: "block" }}>
                <span className="adm-label">Le même, pour être sûr</span>
                <input
                  type="password"
                  name="confirmation"
                  required
                  minLength={12}
                  className="adm-champ"
                  autoComplete="new-password"
                />
              </label>

              <p style={{ margin: 0, fontSize: 11.5, color: "var(--adm-mute)", lineHeight: 1.6 }}>
                Ce tableau de bord donne accès au fichier des personnes accompagnées. Choisissez
                un mot de passe que vous n&apos;utilisez nulle part ailleurs.
              </p>

              <button type="submit" className="adm-btn">
                Ouvrir mon accès
              </button>
            </form>
          </>
        )}

        <p style={{ margin: "20px 0 0", fontSize: 12 }}>
          <Link href="/admin/login">Retour à la page de connexion</Link>
        </p>
      </div>
    </div>
  );
}
