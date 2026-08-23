import Link from "next/link";
import Cadre from "../Cadre";
import { Jauge } from "../Graphes";
import { isDbConfigured } from "@/lib/crm/db";
import { exigerIdentite } from "@/lib/crm/session";
import { peut } from "@/lib/crm/utilisateurs";
import {
  ETATS_PARTICIPATION,
  listerStages,
  participantsDuStage,
  type Participation,
} from "@/lib/crm/stages";
import { enClair } from "@/lib/heure";
import { actionReglerStage, actionStatutParticipation } from "./actions";

export const dynamic = "force-dynamic";

function nomAffiche(p: Participation): string {
  return [p.prenom, p.nom].filter(Boolean).join(" ").trim() || p.email;
}

/** Les suites possibles pour une place, selon là où elle en est. */
const SUITES: Record<string, { statut: string; libelle: string }[]> = {
  demande: [
    { statut: "confirmee", libelle: "Confirmer" },
    { statut: "attente", libelle: "Mettre en attente" },
    { statut: "annulee", libelle: "Annuler" },
  ],
  attente: [
    { statut: "confirmee", libelle: "Confirmer" },
    { statut: "annulee", libelle: "Annuler" },
  ],
  confirmee: [
    { statut: "venue", libelle: "Marquer venue" },
    { statut: "annulee", libelle: "Annuler" },
  ],
  venue: [],
  annulee: [{ statut: "demande", libelle: "Reprendre" }],
};

export default async function StagesPage() {
  const qui = await exigerIdentite();
  const reglable = peut(qui.role, "sequences");

  const branchee = isDbConfigured();
  const stages = branchee ? await listerStages() : [];
  const participants = await Promise.all(
    stages.map((s) => (branchee ? participantsDuStage(s.id) : Promise.resolve([]))),
  );

  return (
    <Cadre
      actif="/admin/stages"
      titre="Stages"
      sousTitre="Qui vient, qui attend, et ce qui part avant et après."
    >
      {!branchee && (
        <div className="adm-alerte">
          <strong>La base de données n&apos;est pas encore branchée.</strong> Ajoutez la
          variable <code>DATABASE_URL</code> dans les réglages Vercel, puis redéployez.
        </div>
      )}

      {stages.length === 0 ? (
        <div className="adm-carte">
          <p className="adm-vide">Aucun stage au catalogue.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {stages.map((s, i) => {
            const gens = participants[i];
            const restantes = Math.max(0, s.places - s.confirmees - s.demandes);
            const complet = restantes === 0;

            return (
              <div className="adm-carte" key={s.id}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 16,
                    alignItems: "baseline",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <p style={{ margin: 0, fontWeight: 650, fontSize: 15 }}>{s.titre}</p>
                    <p style={{ margin: "2px 0 0", color: "var(--adm-mute)", fontSize: 12.5 }}>
                      {s.debut_le ? enClair(s.debut_le) : "date à confirmer"}
                      {!s.actif && " · fermé aux demandes"}
                    </p>
                  </div>
                  <Link href={`/evenements/${s.slug}`} className="adm-btn fantome petit">
                    Voir la page
                  </Link>
                </div>

                <div style={{ margin: "16px 0 6px", display: "flex", gap: 14, flexWrap: "wrap", alignItems: "baseline" }}>
                  <span style={{ fontWeight: 650, fontVariantNumeric: "tabular-nums" }}>
                    {s.confirmees}/{s.places}
                  </span>
                  <span style={{ color: "var(--adm-mute)", fontSize: 12.5 }}>
                    confirmées
                    {s.demandes > 0 && ` · ${s.demandes} demande${s.demandes > 1 ? "s" : ""} à traiter`}
                    {s.attente > 0 && ` · ${s.attente} en attente`}
                    {complet ? " · complet" : ` · ${restantes} place${restantes > 1 ? "s" : ""} libre${restantes > 1 ? "s" : ""}`}
                  </span>
                </div>
                <Jauge part={s.places ? (s.confirmees / s.places) * 100 : 0} />

                {gens.length > 0 && (
                  <div className="adm-table-scroll" style={{ marginTop: 18 }}>
                    <table className="adm-t">
                      <thead>
                        <tr>
                          <th>Personne</th>
                          <th>État</th>
                          <th>Demandé le</th>
                          <th>Suite</th>
                        </tr>
                      </thead>
                      <tbody>
                        {gens.map((p) => (
                          <tr key={p.id}>
                            <td>
                              <Link href={`/admin/contacts/${p.contact_id}`}>{nomAffiche(p)}</Link>
                              <div style={{ fontSize: 11.5, color: "var(--adm-mute)", marginTop: 2 }}>
                                {p.email}
                                {p.telephone && ` · ${p.telephone}`}
                              </div>
                              {p.message && (
                                <div style={{ fontSize: 12, color: "var(--adm-mute)", marginTop: 6, maxWidth: 420 }}>
                                  « {p.message} »
                                </div>
                              )}
                            </td>
                            <td>
                              <span
                                className="adm-tag"
                                data-s={(ETATS_PARTICIPATION[p.statut] ?? ETATS_PARTICIPATION.demande).ton}
                              >
                                {(ETATS_PARTICIPATION[p.statut] ?? { texte: p.statut }).texte}
                              </span>
                            </td>
                            <td style={{ color: "var(--adm-mute)", whiteSpace: "nowrap" }}>
                              {enClair(p.cree_le)}
                            </td>
                            <td>
                              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                {(SUITES[p.statut] ?? []).map((suite) => (
                                  <form action={actionStatutParticipation} key={suite.statut}>
                                    <input type="hidden" name="id" value={p.id} />
                                    <input type="hidden" name="statut" value={suite.statut} />
                                    <button
                                      type="submit"
                                      className={`adm-btn petit ${suite.statut === "confirmee" ? "" : "fantome"}`}
                                    >
                                      {suite.libelle}
                                    </button>
                                  </form>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {gens.length === 0 && (
                  <p className="adm-vide" style={{ padding: "22px 10px" }}>
                    Personne n&apos;a encore demandé de place pour ce stage.
                  </p>
                )}

                {reglable && (
                  <details style={{ marginTop: 16 }}>
                    <summary style={{ cursor: "pointer", fontSize: 13, color: "var(--adm-mute)" }}>
                      Régler ce stage
                    </summary>
                    <form action={actionReglerStage} style={{ display: "grid", gap: 12, marginTop: 14 }}>
                      <input type="hidden" name="id" value={s.id} />
                      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
                        <label style={{ display: "block" }}>
                          <span className="adm-label">Places</span>
                          <input
                            type="number"
                            name="places"
                            min={0}
                            max={500}
                            defaultValue={s.places}
                            className="adm-champ"
                            style={{ width: 110 }}
                          />
                        </label>
                        <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, paddingBottom: 9 }}>
                          <input type="checkbox" name="actif" defaultChecked={s.actif} />
                          Ouvert aux demandes
                        </label>
                      </div>
                      <label style={{ display: "block" }}>
                        <span className="adm-label">
                          Logistique envoyée sept jours avant, aux personnes confirmées
                        </span>
                        <textarea
                          name="logistique"
                          rows={5}
                          className="adm-champ"
                          defaultValue={s.logistique ?? ""}
                          placeholder={"Comment venir, ce qu'il faut apporter, l'heure d'arrivée…"}
                          style={{ lineHeight: 1.6 }}
                        />
                      </label>
                      <div>
                        <button type="submit" className="adm-btn">Enregistrer</button>
                      </div>
                    </form>
                  </details>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p style={{ color: "var(--adm-mute)", fontSize: 12, marginTop: 16, lineHeight: 1.7 }}>
        Une demande n&apos;est pas une place : c&apos;est vous qui confirmez, et la
        confirmation fait passer la personne en client. Sept jours avant le stage, les
        personnes confirmées reçoivent la logistique ; deux jours après, un mot de retour.
      </p>
    </Cadre>
  );
}
