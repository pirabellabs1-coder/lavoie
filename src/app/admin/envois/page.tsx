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

export default async function EnvoisPage() {
  const envois = isDbConfigured() ? await listerEnvois(300) : [];
  const echecs = envois.filter((e) => e.statut === "echec").length;

  return (
    <Cadre
      actif="/admin/envois"
      titre="Envois"
      sousTitre={
        isDbConfigured()
          ? `${envois.length} e-mail${envois.length > 1 ? "s" : ""} · ${echecs} en échec`
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
                      <span className="adm-tag" data-s={e.statut === "envoye" ? "client" : "perdu"}>
                        {e.statut === "envoye" ? "Envoyé" : "Échec"}
                      </span>
                      {e.erreur && (
                        <div style={{ fontSize: 11, color: "var(--adm-bad)", marginTop: 3 }}>
                          {e.erreur}
                        </div>
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
