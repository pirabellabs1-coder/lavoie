import Link from "next/link";
import Cadre from "../Cadre";
import { isDbConfigured } from "@/lib/crm/db";
import { listerEnvois } from "@/lib/crm/sequences";

export const dynamic = "force-dynamic";

function dateLongue(d: Date | string): string {
  const v = d instanceof Date ? d : new Date(d);
  return v.toLocaleString("fr-FR", {
    day: "2-digit", month: "short", year: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
}

/** Libellé et couleur de chaque état d'envoi. */
const ETATS: Record<string, { texte: string; ton: string }> = {
  envoye: { texte: "Envoyé", ton: "lead" },
  livre: { texte: "Livré", ton: "client" },
  echec: { texte: "Échec", ton: "perdu" },
  rejete: { texte: "Rejeté", ton: "perdu" },
  plainte: { texte: "Indésirable", ton: "perdu" },
};

function pourcentage(part: number, total: number): string {
  if (!total) return "—";
  return `${Math.round((part / total) * 100)} %`;
}

export default async function EnvoisPage() {
  const envois = isDbConfigured() ? await listerEnvois(300) : [];
  const echecs = envois.filter((e) => e.statut === "echec").length;
  // Le taux se calcule sur les seuls e-mails effectivement partis.
  const partis = envois.filter((e) => e.statut !== "echec").length;
  const ouverts = envois.filter((e) => e.ouvert_le).length;
  const cliques = envois.filter((e) => e.clique_le).length;

  return (
    <Cadre
      actif="/admin/envois"
      titre="Envois"
      sousTitre={
        isDbConfigured()
          ? `${envois.length} e-mail${envois.length > 1 ? "s" : ""} · ${echecs} en échec · ` +
            `${pourcentage(ouverts, partis)} ouverts · ${pourcentage(cliques, partis)} cliqués`
          : undefined
      }
    >
      {!isDbConfigured() && (
        <div className="adm-alerte">
          <strong>La base de données n&apos;est pas encore branchée.</strong> Ajoutez la
          variable <code>DATABASE_URL</code> dans les réglages Vercel, puis redéployez.
        </div>
      )}

      {echecs > 0 && (
        <div className="adm-alerte">
          <strong>{echecs} envoi{echecs > 1 ? "s ont" : " a"} échoué.</strong> Une nouvelle
          tentative est faite automatiquement toutes les 6 heures. Si l&apos;échec persiste,
          vérifiez que le domaine d&apos;expédition est bien validé dans Resend.
        </div>
      )}

      <div className="adm-carte">
        {envois.length === 0 ? (
          <p className="adm-vide">Aucun e-mail automatique envoyé pour l&apos;instant.</p>
        ) : (
          <div className="adm-table-scroll">
            <table className="adm-t">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Destinataire</th>
                  <th>Sujet</th>
                  <th>État</th>
                  <th>Suivi</th>
                </tr>
              </thead>
              <tbody>
                {envois.map((e) => (
                  <tr key={e.id}>
                    <td style={{ color: "var(--adm-mute)", whiteSpace: "nowrap" }}>
                      {dateLongue(e.envoye_le)}
                    </td>
                    <td>
                      {e.contact_id ? (
                        <Link href={`/admin/contacts/${e.contact_id}`}>{e.destinataire}</Link>
                      ) : (
                        e.destinataire
                      )}
                    </td>
                    <td>{e.sujet}</td>
                    <td>
                      <span className="adm-tag" data-s={(ETATS[e.statut] ?? ETATS.echec).ton}>
                        {(ETATS[e.statut] ?? { texte: e.statut }).texte}
                      </span>
                      {e.erreur && (
                        <div style={{ fontSize: 11, color: "var(--adm-bad)", marginTop: 3 }}>
                          {e.erreur}
                        </div>
                      )}
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      {e.clique_le ? (
                        <span className="adm-tag" data-s="appel">Cliqué</span>
                      ) : e.ouvert_le ? (
                        <span className="adm-tag" data-s="contacte">Ouvert</span>
                      ) : (
                        <span style={{ color: "var(--adm-mute)", fontSize: 12 }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Cadre>
  );
}
