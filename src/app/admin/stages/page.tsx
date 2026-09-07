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
import {
  datesDuStage,
  etatDeLaDate,
  placesRestantesDate,
  type DateStage,
} from "@/lib/crm/dates-stages";
import {
  actionAjouterDate,
  actionBasculerDate,
  actionCreerStage,
  actionReglerStage,
  actionRetirerDate,
  actionStatutParticipation,
} from "./actions";

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

/** L'état d'une date, dit en français et en couleur. */
const ETATS_DATE: Record<string, { texte: string; ton: string }> = {
  libre: { texte: "Places libres", ton: "client" },
  dernieres: { texte: "Dernières places", ton: "contacte" },
  complet: { texte: "Complet", ton: "perdu" },
  fermee: { texte: "Fermée", ton: "perdu" },
  passee: { texte: "Passée", ton: "nouveau" },
};

function jourEtHeure(d: Date | string): string {
  const v = d instanceof Date ? d : new Date(d);
  return v.toLocaleString("fr-FR", {
    timeZone: "Europe/Paris",
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function euros(cents: number | null): string {
  if (cents == null) return "";
  return (cents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

type Params = Promise<Record<string, string | string[] | undefined>>;

export default async function StagesPage({ searchParams }: { searchParams: Params }) {
  const qui = await exigerIdentite();
  const reglable = peut(qui.role, "sequences");

  const params = await searchParams;
  const erreur = Array.isArray(params.erreur) ? params.erreur[0] : params.erreur;
  const cree = (Array.isArray(params.cree) ? params.cree[0] : params.cree) === "1";

  const branchee = isDbConfigured();
  const stages = branchee ? await listerStages() : [];
  const participants = await Promise.all(
    stages.map((s) => (branchee ? participantsDuStage(s.id) : Promise.resolve([]))),
  );
  // Les jours de disponibilité, stage par stage : c'est la date qui se remplit.
  const dates: DateStage[][] = await Promise.all(
    stages.map((s) => (branchee ? datesDuStage(s.id) : Promise.resolve([]))),
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

      {erreur && <div className="adm-alerte">{erreur}</div>}
      {cree && <div className="adm-alerte">Le stage est créé. Ajoutez-lui ses dates ci-dessous.</div>}

      {reglable && (
        <div className="adm-carte" id="creer" style={{ marginBottom: 14 }}>
          <details>
            <summary style={{ cursor: "pointer", fontSize: 13.5, fontWeight: 600 }}>
              Créer un stage
            </summary>
            <p style={{ margin: "10px 0 14px", fontSize: 12.5, color: "var(--adm-mute)", lineHeight: 1.7 }}>
              Pour un stage qui n&apos;est pas au catalogue du site : une session
              supplémentaire, un atelier en ligne, une date exceptionnelle. Les quatre stages
              du Cycle des Saisons, eux, ont leur page et arrivent tout seuls.
            </p>
            <form action={actionCreerStage} style={{ display: "grid", gap: 12, maxWidth: 620 }}>
              <label>
                <span className="adm-label">Titre</span>
                <input name="titre" required maxLength={200} className="adm-champ"
                  placeholder="Atelier en ligne — Poser ses intentions" />
              </label>
              <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
                <label>
                  <span className="adm-label">Lieu</span>
                  <input name="lieu" maxLength={200} className="adm-champ" placeholder="En ligne, ou Centre HUT" />
                </label>
                <label>
                  <span className="adm-label">Places</span>
                  <input type="number" name="places" min={1} max={500} defaultValue={12} className="adm-champ" />
                </label>
                <label>
                  <span className="adm-label">Tarif (euros)</span>
                  <input name="prix" className="adm-champ" placeholder="500" inputMode="decimal" />
                </label>
              </div>
              <label>
                <span className="adm-label">En une phrase</span>
                <textarea name="resume" rows={2} maxLength={2000} className="adm-champ"
                  placeholder="Ce que la personne vient y chercher." style={{ resize: "vertical" }} />
              </label>
              <div>
                <button type="submit" className="adm-btn">Créer le stage</button>
              </div>
            </form>
          </details>
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
            const jours = dates[i];
            const restantes = Math.max(0, s.places - s.confirmees - s.demandes);
            const complet = restantes === 0;

            return (
              <div className="adm-carte" key={s.id} id={`stage-${s.id}`}>
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
                      {jours.length
                        ? `${jours.length} date${jours.length > 1 ? "s" : ""} proposée${jours.length > 1 ? "s" : ""}`
                        : s.debut_le
                          ? enClair(s.debut_le)
                          : "date à confirmer"}
                      {s.lieu ? ` · ${s.lieu}` : ""}
                      {s.prix_cents != null ? ` · ${euros(s.prix_cents)}` : ""}
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

                {/* ─── Les jours où ce stage est disponible ─── */}
                <div style={{ marginTop: 18, borderTop: "1px solid var(--adm-line)", paddingTop: 14 }}>
                  <p className="adm-titre" style={{ marginBottom: 10 }}>
                    Dates disponibles{" "}
                    <span className="appoint">
                      — {jours.length ? `${jours.length} proposée${jours.length > 1 ? "s" : ""}` : "aucune pour l'instant"}
                    </span>
                  </p>

                  {jours.length > 0 && (
                    <div className="stage-dates">
                      {jours.map((d) => {
                        const etat = etatDeLaDate(d);
                        const info = ETATS_DATE[etat];
                        const restantes = placesRestantesDate(d);
                        return (
                          <div className="stage-date" key={d.id}>
                            <div>
                              <div className="quand">{jourEtHeure(d.debut_le)}</div>
                              <div className="etat">
                                <span className="adm-tag" data-s={info.ton}>
                                  {info.texte}
                                </span>
                                <span>
                                  {d.prises}/{d.places} pris
                                  {restantes > 0 ? ` · ${restantes} libre${restantes > 1 ? "s" : ""}` : ""}
                                </span>
                              </div>
                            </div>
                            {reglable && (
                              <div className="boutons">
                                <form action={actionBasculerDate}>
                                  <input type="hidden" name="id" value={d.id} />
                                  <input type="hidden" name="ouverte" value={d.ouverte ? "0" : "1"} />
                                  <button type="submit" className="adm-btn fantome petit">
                                    {d.ouverte ? "Fermer" : "Rouvrir"}
                                  </button>
                                </form>
                                <form action={actionRetirerDate}>
                                  <input type="hidden" name="id" value={d.id} />
                                  <input type="hidden" name="stage" value={s.id} />
                                  <button type="submit" className="adm-btn fantome petit">
                                    Retirer
                                  </button>
                                </form>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {reglable && (
                    <form action={actionAjouterDate} className="stage-date-neuve">
                      <input type="hidden" name="stage" value={s.id} />
                      <label>
                        <span className="adm-label">Début</span>
                        <input type="datetime-local" name="debut" required className="adm-champ" />
                      </label>
                      <label>
                        <span className="adm-label">Fin (facultatif)</span>
                        <input type="datetime-local" name="fin" className="adm-champ" />
                      </label>
                      <label>
                        <span className="adm-label">Places</span>
                        <input
                          type="number"
                          name="places"
                          min={1}
                          max={500}
                          className="adm-champ"
                          placeholder={String(s.places)}
                          style={{ width: 100 }}
                        />
                      </label>
                      <button type="submit" className="adm-btn petit">
                        Ajouter cette date
                      </button>
                    </form>
                  )}

                  {jours.length === 0 && (
                    <p style={{ margin: "10px 0 0", fontSize: 12, color: "var(--adm-mute)", lineHeight: 1.6 }}>
                      Sans date, le stage reste ouvert aux demandes : la personne écrit sans
                      choisir de jour, comme aujourd&apos;hui. Dès qu&apos;une date existe, le
                      site propose de choisir.
                    </p>
                  )}
                </div>

                {reglable && (
                  <details style={{ marginTop: 16 }}>
                    <summary style={{ cursor: "pointer", fontSize: 13, color: "var(--adm-mute)" }}>
                      Régler ce stage
                    </summary>
                    <form action={actionReglerStage} style={{ display: "grid", gap: 12, marginTop: 14 }}>
                      <input type="hidden" name="id" value={s.id} />
                      <label style={{ display: "block" }}>
                        <span className="adm-label">Titre</span>
                        <input name="titre" defaultValue={s.titre} maxLength={200} className="adm-champ" />
                      </label>
                      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
                        <label>
                          <span className="adm-label">Lieu</span>
                          <input name="lieu" defaultValue={s.lieu ?? ""} maxLength={200} className="adm-champ" />
                        </label>
                        <label>
                          <span className="adm-label">Tarif (euros)</span>
                          <input
                            name="prix"
                            defaultValue={s.prix_cents != null ? String(s.prix_cents / 100) : ""}
                            className="adm-champ"
                            inputMode="decimal"
                          />
                        </label>
                      </div>
                      <label style={{ display: "block" }}>
                        <span className="adm-label">En une phrase</span>
                        <textarea
                          name="resume"
                          rows={2}
                          defaultValue={s.resume ?? ""}
                          maxLength={2000}
                          className="adm-champ"
                          style={{ resize: "vertical" }}
                        />
                      </label>
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
