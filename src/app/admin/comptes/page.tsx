import Cadre from "../Cadre";
import { isDbConfigured } from "@/lib/crm/db";
import { exigerDroit } from "@/lib/crm/session";
import { listerUtilisateurs, peut, ROLES } from "@/lib/crm/utilisateurs";
import { enClair } from "@/lib/heure";
import { compterAvantVidage } from "@/lib/crm/reinitialisation";
import {
  actionBasculerCompte,
  actionInviterCompte,
  actionRenvoyerInvitation,
  actionViderLeFichier,
} from "./actions";

export const dynamic = "force-dynamic";

type Params = Promise<Record<string, string | string[] | undefined>>;

function premier(v: string | string[] | undefined): string {
  return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
}

export default async function ComptesPage({ searchParams }: { searchParams: Params }) {
  const qui = await exigerDroit("comptes");
  const peutSauvegarder = peut(qui.role, "sauvegarde");

  const params = await searchParams;
  const erreur = premier(params.erreur);
  const invite = premier(params.invite);
  const vide = premier(params.vide);
  const restaure = premier(params.restaure);

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
      {invite && (
        <div className="adm-alerte">
          <strong>L&apos;invitation est partie à {invite}.</strong> Le lien vaut sept jours et
          ne sert qu&apos;une fois. Tant qu&apos;il n&apos;est pas suivi, le compte apparaît
          « invitation en attente » ci-dessous.
        </div>
      )}
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
                  <th>Accès</th>
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
                      {u.derniere_connexion_le
                        ? enClair(u.derniere_connexion_le)
                        : u.invitation_expire_le
                          ? "invitation en attente"
                          : "jamais"}
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
                      <form action={actionRenvoyerInvitation}>
                        <input type="hidden" name="id" value={u.id} />
                        <button type="submit" className="adm-btn fantome petit">
                          {u.invitation_expire_le ? "Renvoyer l'invitation" : "Envoyer un lien"}
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
        <p className="adm-titre">Inviter quelqu&apos;un</p>
        <p style={{ margin: "0 0 16px", fontSize: 12.5, color: "var(--adm-mute)", lineHeight: 1.7, maxWidth: 520 }}>
          Vous renseignez le nom, l&apos;adresse et le rôle — rien d&apos;autre. La personne
          reçoit un lien valable sept jours et choisit elle-même son mot de passe. Vous ne le
          verrez jamais : c&apos;est ce qui rend ses traces de connexion crédibles, et ce qui
          évite qu&apos;un mot de passe traîne dans une boîte mail.
        </p>
        <form action={actionInviterCompte} style={{ display: "grid", gap: 14, maxWidth: 520 }}>
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
            <button type="submit" className="adm-btn">Envoyer l&apos;invitation</button>
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

      {/* ─── Restaurer une sauvegarde ─── */}
      {peutSauvegarder && (
        <div className="adm-carte" id="restaurer" style={{ marginTop: 14 }}>
          <p className="adm-titre">Restaurer une sauvegarde</p>
          {restaure && (
            <div className="adm-alerte">
              <strong>La sauvegarde est en place.</strong> Restauré : {restaure}.
            </div>
          )}
          <p style={{ margin: "0 0 12px", lineHeight: 1.7 }}>
            Le fichier attendu est celui de la sauvegarde quotidienne, reçu par e-mail, ou
            celui que vous téléchargez ici :{" "}
            <a href="/api/admin/sauvegarde">prendre une copie maintenant</a>.
          </p>
          <p style={{ margin: "0 0 12px", lineHeight: 1.7 }}>
            <strong>La restauration remplace, elle ne complète pas.</strong> Les fiches, les
            séquences, les stages et les envois reviennent exactement tels qu&apos;ils étaient
            le jour de la copie — ce qui a été fait depuis est perdu. Tout se joue dans une
            seule transaction : au moindre accroc, la base reste comme avant.
          </p>
          <p style={{ margin: "0 0 14px", fontSize: 13, lineHeight: 1.7, color: "var(--adm-mute)" }}>
            Les comptes ci-dessus ne sont pas touchés (la sauvegarde ne contient pas les mots
            de passe), et le journal d&apos;audit garde son fil, cette restauration comprise.
          </p>

          <form
            action="/api/admin/restauration"
            method="post"
            encType="multipart/form-data"
            className="zone-rouge-form"
            style={{ borderTop: "1px solid var(--adm-line)" }}
          >
            <label style={{ flex: 1, minWidth: 220 }}>
              <span className="adm-label">Fichier de sauvegarde (.json)</span>
              <input
                type="file"
                name="fichier"
                accept="application/json,.json"
                required
                className="adm-champ"
              />
            </label>
            <label style={{ flex: 1, minWidth: 200 }}>
              <span className="adm-label">
                Écrivez <code>REMPLACER</code> pour confirmer
              </span>
              <input
                name="confirmation"
                className="adm-champ"
                autoComplete="off"
                placeholder="REMPLACER"
                required
              />
            </label>
            <button type="submit" className="adm-btn">
              Restaurer
            </button>
          </form>
        </div>
      )}

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
          <a href="/api/admin/sauvegarde">Télécharger la sauvegarde complète</a> — c&apos;est
          elle, et elle seule, qui se restaure ci-dessus. L&apos;
          <a href="/api/admin/export">export CSV</a> ne ramène que les contacts.
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
