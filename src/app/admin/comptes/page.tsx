import Cadre from "../Cadre";
import { isDbConfigured } from "@/lib/crm/db";
import { exigerDroit } from "@/lib/crm/session";
import { listerUtilisateurs, ROLES } from "@/lib/crm/utilisateurs";
import { enClair } from "@/lib/heure";
import { compterAvantVidage } from "@/lib/crm/reinitialisation";
import {
  actionBasculerCompte,
  actionChangerMotDePasse,
  actionCreerCompte,
  actionViderLeFichier,
} from "./actions";

export const dynamic = "force-dynamic";

type Params = Promise<Record<string, string | string[] | undefined>>;

function premier(v: string | string[] | undefined): string {
  return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
}

export default async function ComptesPage({ searchParams }: { searchParams: Params }) {
  await exigerDroit("comptes");

  const params = await searchParams;
  const erreur = premier(params.erreur);
  const cree = premier(params.cree) === "1";
  const modifie = premier(params.modifie) === "1";
  const vide = premier(params.vide);

  const comptes = isDbConfigured() ? await listerUtilisateurs() : [];
  // Ce qu'emporterait la remise à zéro, compté avant de rien toucher.
  const aVider = isDbConfigured() ? await compterAvantVidage() : null;
  const totalAVider = (aVider ?? []).reduce((n, l) => n + l.lignes, 0);

  return (
    <Cadre
      actif="/admin/comptes"
      titre="Comptes"
      sousTitre="Qui peut entrer dans le tableau de bord, et jusqu'où."
    >
      {erreur && <div className="adm-alerte">{erreur}</div>}
      {cree && <div className="adm-alerte">Le compte a été créé.</div>}
      {modifie && <div className="adm-alerte">Le mot de passe a été remplacé.</div>}
      {vide && (
        <div className="adm-alerte">
          <strong>Le fichier est vide.</strong> Retiré : {vide}. Les séquences, le catalogue
          des stages, les comptes et le journal d&apos;audit sont restés en place.
        </div>
      )}

      <div className="adm-carte" style={{ marginBottom: 14 }}>
        <p className="adm-titre">Les accès en place</p>

        {comptes.length === 0 ? (
          <p className="adm-vide">
            Aucun compte nominatif pour l&apos;instant : tout le monde entre avec le mot de
            passe principal. Créez-en un par personne ci-dessous.
          </p>
        ) : (
          <div className="adm-table-scroll">
            <table className="adm-t">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>E-mail</th>
                  <th>Rôle</th>
                  <th>Dernière visite</th>
                  <th>État</th>
                  <th>Nouveau mot de passe</th>
                </tr>
              </thead>
              <tbody>
                {comptes.map((u) => (
                  <tr key={u.id} style={{ opacity: u.actif ? 1 : 0.55 }}>
                    <td>{u.nom}</td>
                    <td style={{ wordBreak: "break-all" }}>{u.email}</td>
                    <td>
                      {ROLES.find((r) => r.cle === u.role)?.label ?? u.role}
                    </td>
                    <td style={{ color: "var(--adm-mute)", whiteSpace: "nowrap" }}>
                      {u.derniere_connexion_le ? enClair(u.derniere_connexion_le) : "jamais"}
                    </td>
                    <td>
                      <form action={actionBasculerCompte}>
                        <input type="hidden" name="id" value={u.id} />
                        <input type="hidden" name="actif" value={u.actif ? "0" : "1"} />
                        <button type="submit" className="adm-btn fantome petit">
                          {u.actif ? "Retirer l'accès" : "Rendre l'accès"}
                        </button>
                      </form>
                    </td>
                    <td>
                      <form action={actionChangerMotDePasse} style={{ display: "flex", gap: 6 }}>
                        <input type="hidden" name="id" value={u.id} />
                        <input
                          type="password"
                          name="motDePasse"
                          className="adm-champ"
                          placeholder="12 caractères minimum"
                          minLength={12}
                          required
                          autoComplete="new-password"
                          style={{ width: 180 }}
                        />
                        <button type="submit" className="adm-btn fantome petit">
                          Remplacer
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="adm-carte" style={{ marginBottom: 14 }}>
        <p className="adm-titre">Ajouter quelqu&apos;un</p>
        <form action={actionCreerCompte} style={{ display: "grid", gap: 14, maxWidth: 520 }}>
          <label style={{ display: "block" }}>
            <span style={{ display: "block", fontSize: 12, color: "var(--adm-mute)", marginBottom: 6 }}>
              Nom
            </span>
            <input type="text" name="nom" required className="adm-champ" placeholder="Domoïna Ramiadana" />
          </label>

          <label style={{ display: "block" }}>
            <span style={{ display: "block", fontSize: 12, color: "var(--adm-mute)", marginBottom: 6 }}>
              E-mail — c&apos;est l&apos;identifiant de connexion
            </span>
            <input type="email" name="email" required className="adm-champ" autoComplete="off" />
          </label>

          <label style={{ display: "block" }}>
            <span style={{ display: "block", fontSize: 12, color: "var(--adm-mute)", marginBottom: 6 }}>
              Mot de passe provisoire — douze caractères au minimum
            </span>
            <input
              type="password"
              name="motDePasse"
              required
              minLength={12}
              className="adm-champ"
              autoComplete="new-password"
            />
          </label>

          <fieldset style={{ border: "1px solid var(--adm-line)", borderRadius: 8, padding: 14 }}>
            <legend style={{ fontSize: 12, color: "var(--adm-mute)", padding: "0 6px" }}>Rôle</legend>
            <div style={{ display: "grid", gap: 10 }}>
              {ROLES.map((r, i) => (
                <label key={r.cle} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <input
                    type="radio"
                    name="role"
                    value={r.cle}
                    defaultChecked={i === ROLES.length - 1}
                    style={{ marginTop: 3 }}
                  />
                  <span>
                    <strong>{r.label}</strong>
                    <span style={{ display: "block", fontSize: 12, color: "var(--adm-mute)" }}>
                      {r.aide}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <button type="submit" className="adm-btn">Créer le compte</button>
          </div>
        </form>
      </div>

      <div className="adm-carte">
        <p className="adm-titre">Le mot de passe principal</p>
        <p style={{ margin: 0, lineHeight: 1.7 }}>
          La variable <code>ADMIN_PASSWORD</code> reste valable : elle ouvre le tableau de
          bord en laissant le champ e-mail vide, avec tous les droits. C&apos;est la clé de
          secours — sans elle, une base momentanément injoignable enfermerait tout le monde
          dehors.
        </p>
        <p style={{ margin: "12px 0 0", lineHeight: 1.7, color: "var(--adm-mute)" }}>
          Elle doit donc rester entre les mains de Domoïna seule. Le secrétariat se connecte
          avec son propre compte, dont l&apos;accès se retire ici en un clic, sans rien
          changer pour les autres.
        </p>
      </div>

      {/* ─── La remise à zéro. Sans retour possible. ─── */}
      <div className="adm-carte zone-rouge" id="vider" style={{ marginTop: 14 }}>
        <p className="adm-titre">Remettre le fichier à zéro</p>
        <p style={{ margin: "0 0 12px", lineHeight: 1.7 }}>
          Pour effacer les essais avant la mise en service. <strong>Sans retour possible</strong> :
          il n&apos;y a pas de corbeille, et ce qui part ne se récupère que dans une
          sauvegarde.
        </p>

        {totalAVider > 0 ? (
          <>
            <p style={{ margin: "0 0 8px", fontSize: 13, color: "var(--adm-mute)" }}>
              Partiraient aujourd&apos;hui — <strong>{totalAVider}</strong> ligne
              {totalAVider > 1 ? "s" : ""} en tout :
            </p>
            <ul className="zone-rouge-liste">
              {(aVider ?? [])
                .filter((l) => l.lignes > 0)
                .map((l) => (
                  <li key={l.table}>
                    <b>{l.lignes}</b> {l.table}
                  </li>
                ))}
            </ul>
          </>
        ) : (
          <p style={{ margin: "0 0 12px", fontSize: 13, color: "var(--adm-mute)" }}>
            Le fichier est déjà vide : il n&apos;y a rien à retirer.
          </p>
        )}

        <p style={{ margin: "12px 0", fontSize: 13, lineHeight: 1.7 }}>
          Restent en place : les <strong>séquences</strong> et leurs e-mails, le
          <strong> catalogue des stages</strong> avec ses places et sa logistique, les{" "}
          <strong>comptes</strong> ci-dessus, et le <strong>journal d&apos;audit</strong>, où
          cette opération s&apos;inscrira.
        </p>

        <p style={{ margin: "0 0 14px", fontSize: 13, lineHeight: 1.7 }}>
          <strong>Prenez une copie d&apos;abord.</strong>{" "}
          <a href="/api/admin/export">Exporter les contacts en CSV</a> — et la sauvegarde
          complète part chaque jour par e-mail, en pièce jointe.
        </p>

        <form action={actionViderLeFichier} className="zone-rouge-form">
          <label style={{ flex: 1, minWidth: 220 }}>
            <span className="adm-label">
              Écrivez <code>VIDER</code> pour confirmer
            </span>
            <input
              name="confirmation"
              className="adm-champ"
              autoComplete="off"
              placeholder="VIDER"
              required
            />
          </label>
          <button type="submit" className="adm-btn danger">
            Vider le fichier
          </button>
        </form>
      </div>
    </Cadre>
  );
}
