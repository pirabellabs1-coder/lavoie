import Link from "next/link";
import Cadre from "../Cadre";
import { isDbConfigured } from "@/lib/crm/db";
import { exigerIdentite } from "@/lib/crm/session";
import { listerRendezVous } from "@/lib/crm/questionnaires";
import { enClair } from "@/lib/heure";

export const dynamic = "force-dynamic";

function nomAffiche(l: { prenom: string | null; nom: string | null; email: string }): string {
  return [l.prenom, l.nom].filter(Boolean).join(" ").trim() || l.email;
}

/** Combien d'heures nous séparent du rendez-vous. */
function dansCombien(quand: Date | string): number {
  const d = quand instanceof Date ? quand : new Date(quand);
  return (d.getTime() - Date.now()) / 3_600_000;
}

export default async function RendezVousPage() {
  await exigerIdentite();
  const lignes = isDbConfigured() ? await listerRendezVous() : [];

  const aVenir = lignes.filter((l) => l.rdv_le && dansCombien(l.rdv_le) > 0);
  const passes = lignes.filter((l) => l.rdv_le && dansCombien(l.rdv_le) <= 0);
  const menaces = aVenir.filter((l) => !l.prerequis_le && !l.annule_le && dansCombien(l.rdv_le!) < 48);

  return (
    <Cadre
      actif="/admin/rendez-vous"
      titre="Rendez-vous"
      sousTitre="Les entretiens fixés, et où en sont les prérequis de chacun."
    >
      {!isDbConfigured() && (
        <div className="adm-alerte">
          <strong>La base de données n&apos;est pas encore branchée.</strong> Ajoutez la
          variable <code>DATABASE_URL</code> dans les réglages Vercel, puis redéployez.
        </div>
      )}

      {menaces.length > 0 && (
        <div className="adm-alerte">
          <strong>
            {menaces.length} rendez-vous dans moins de 48 heures sans prérequis confirmés.
          </strong>{" "}
          Sans confirmation la veille, ils seront annulés automatiquement et la personne
          prévenue. Un mot personnel peut encore changer les choses.
        </div>
      )}

      <div className="adm-carte" style={{ marginBottom: 14 }}>
        <p className="adm-titre">
          À venir <span className="appoint">— {aVenir.length}</span>
        </p>
        {aVenir.length === 0 ? (
          <p className="adm-vide">
            Aucun rendez-vous fixé. La date se saisit dans la fiche du contact, sous son
            questionnaire.
          </p>
        ) : (
          <div className="adm-table-scroll">
            <table className="adm-t">
              <thead>
                <tr>
                  <th>Quand</th>
                  <th>Personne</th>
                  <th className="num">Score</th>
                  <th>Prérequis</th>
                  <th>État</th>
                </tr>
              </thead>
              <tbody>
                {aVenir.map((l) => {
                  const heures = dansCombien(l.rdv_le!);
                  const urgent = !l.prerequis_le && !l.annule_le && heures < 48;
                  return (
                    <tr key={l.id}>
                      <td style={{ whiteSpace: "nowrap", fontWeight: 600 }}>
                        {enClair(l.rdv_le)}
                        <div style={{ fontSize: 11.5, color: "var(--adm-mute)", fontWeight: 400 }}>
                          dans {heures < 24 ? `${Math.round(heures)} h` : `${Math.round(heures / 24)} j`}
                        </div>
                      </td>
                      <td>
                        <Link href={`/admin/contacts/${l.contact_id}`}>{nomAffiche(l)}</Link>
                        <div style={{ fontSize: 11.5, color: "var(--adm-mute)", marginTop: 2 }}>
                          {l.email}
                        </div>
                      </td>
                      <td className="num">{l.score}</td>
                      <td>
                        {l.prerequis_le ? (
                          <span style={{ color: "var(--adm-ok)" }}>confirmés</span>
                        ) : (
                          <span style={{ color: urgent ? "var(--adm-bad)" : "var(--adm-warn)" }}>
                            en attente
                          </span>
                        )}
                      </td>
                      <td>
                        <span
                          className="adm-tag"
                          data-s={l.annule_le ? "perdu" : l.prerequis_le ? "client" : "contacte"}
                        >
                          {l.annule_le ? "Annulé" : l.prerequis_le ? "Maintenu" : "À confirmer"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="adm-carte">
        <p className="adm-titre">
          Passés <span className="appoint">— trente derniers jours</span>
        </p>
        {passes.length === 0 ? (
          <p className="adm-vide">Aucun rendez-vous passé sur la période.</p>
        ) : (
          <div className="adm-table-scroll">
            <table className="adm-t">
              <thead>
                <tr>
                  <th>Quand</th>
                  <th>Personne</th>
                  <th>Prérequis</th>
                  <th>État</th>
                </tr>
              </thead>
              <tbody>
                {passes.map((l) => (
                  <tr key={l.id}>
                    <td style={{ whiteSpace: "nowrap", color: "var(--adm-mute)" }}>
                      {enClair(l.rdv_le)}
                    </td>
                    <td>
                      <Link href={`/admin/contacts/${l.contact_id}`}>{nomAffiche(l)}</Link>
                    </td>
                    <td style={{ color: "var(--adm-mute)" }}>
                      {l.prerequis_le ? "confirmés" : "jamais confirmés"}
                    </td>
                    <td>
                      <span className="adm-tag" data-s={l.annule_le ? "perdu" : "appel"}>
                        {l.annule_le ? "Annulé" : "Eu lieu"}
                      </span>
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
