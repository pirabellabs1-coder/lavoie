import Link from "next/link";
import { notFound } from "next/navigation";
import Cadre from "../../Cadre";
import { STATUTS, STATUT_LABEL, obtenirContact, nomAffiche } from "@/lib/crm/contacts";
import { actionChangerStatut, actionDefinirRdv, actionEnregistrerNote } from "./actions";
import { dernierQuestionnaire } from "@/lib/crm/questionnaires";
import { QUESTIONS } from "@/lib/questionnaire";
import { enClair, pourChamp } from "@/lib/heure";
import { exigerIdentite } from "@/lib/crm/session";
import { peut } from "@/lib/crm/utilisateurs";
import { ETATS, euros, offresDuContact } from "@/lib/crm/offres";
import { actionAnnulerOffre, actionCreerOffre, actionEnvoyerOffre } from "../../offres/actions";

export const dynamic = "force-dynamic";

function dateLongue(d: Date | string): string {
  const v = d instanceof Date ? d : new Date(d);
  return v.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function FicheContact({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const messages = await searchParams;
  const erreur = Array.isArray(messages.erreur) ? messages.erreur[0] : messages.erreur;
  const offreFaite = messages.offre === "creee" || messages.offre === "envoyee";
  if (!/^\d+$/.test(id)) notFound();

  const donnees = await obtenirContact(id);
  if (!donnees) notFound();
  const { contact, timeline } = donnees;
  const copie = await dernierQuestionnaire(id);
  const qui = await exigerIdentite();
  const commercial = peut(qui.role, "offres");
  const offres = commercial ? await offresDuContact(id) : [];

  return (
    <Cadre
      actif="/admin/contacts"
      titre={nomAffiche(contact)}
      sousTitre={contact.email}
      actions={
        <>
          <a href={`mailto:${contact.email}`} className="adm-btn">Écrire</a>
          <Link href="/admin/contacts" className="adm-btn fantome">Retour</Link>
        </>
      }
    >
      {erreur && <div className="adm-alerte">{erreur}</div>}
      {offreFaite && (
        <div className="adm-alerte">
          {messages.offre === "envoyee"
            ? "La proposition est partie."
            : "La proposition est prête. Elle ne partira que lorsque vous l'enverrez."}
        </div>
      )}

      {contact.desabonne_le && (
        <div className="adm-alerte">
          <strong>Ce contact s&apos;est désabonné</strong> le {dateLongue(contact.desabonne_le)}.
          Aucun e-mail automatique ne lui sera plus envoyé.
        </div>
      )}

      <div className="adm-grille adm-g2">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="adm-carte">
            <p className="adm-titre">Où en est-il dans le parcours</p>
            <form action={actionChangerStatut} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <input type="hidden" name="id" value={contact.id} />
              <select name="statut" className="adm-champ" defaultValue={contact.statut} style={{ flex: 1, minWidth: 180 }}>
                {STATUTS.map((s) => (
                  <option key={s.cle} value={s.cle}>{s.label} — {s.aide}</option>
                ))}
              </select>
              <button type="submit" className="adm-btn">Mettre à jour</button>
            </form>
            <p style={{ color: "var(--adm-mute)", fontSize: 12, margin: "12px 0 0" }}>
              Statut actuel :{" "}
              <span className="adm-tag" data-s={contact.statut}>
                {STATUT_LABEL[contact.statut] ?? contact.statut}
              </span>
            </p>
          </div>

          <div className="adm-carte">
            <p className="adm-titre">Coordonnées</p>
            <table className="adm-t">
              <tbody>
                <tr><td style={{ width: 130, color: "var(--adm-mute)" }}>E-mail</td><td>{contact.email}</td></tr>
                <tr><td style={{ color: "var(--adm-mute)" }}>Téléphone</td><td>{contact.telephone || "—"}</td></tr>
                <tr><td style={{ color: "var(--adm-mute)" }}>Source</td><td>{contact.source || "—"}</td></tr>
                <tr><td style={{ color: "var(--adm-mute)" }}>Intérêt</td><td>{contact.interet || "—"}</td></tr>
                <tr><td style={{ color: "var(--adm-mute)" }}>Arrivé le</td><td>{dateLongue(contact.cree_le)}</td></tr>
              </tbody>
            </table>
          </div>

          {(contact.utm_source || contact.utm_campaign || contact.referent || contact.page_entree) && (
            <div className="adm-carte">
              <p className="adm-titre">D&apos;où il vient</p>
              <table className="adm-t">
                <tbody>
                  {contact.utm_source ? (
                    <tr>
                      <td style={{ width: 130, color: "var(--adm-mute)" }}>Campagne</td>
                      <td>
                        {[contact.utm_source, contact.utm_medium, contact.utm_campaign]
                          .filter(Boolean)
                          .join(" · ")}
                      </td>
                    </tr>
                  ) : null}
                  {contact.referent ? (
                    <tr>
                      <td style={{ color: "var(--adm-mute)" }}>Site référent</td>
                      <td style={{ wordBreak: "break-all" }}>{contact.referent}</td>
                    </tr>
                  ) : null}
                  {contact.page_entree ? (
                    <tr>
                      <td style={{ color: "var(--adm-mute)" }}>Page d&apos;arrivée</td>
                      <td>{contact.page_entree}</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          )}

          {copie && (
            <div className="adm-carte">
              <p className="adm-titre">Questionnaire de préparation</p>

              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
                <span className="adm-tag" data-s={copie.eligible ? "client" : "nouveau"}>
                  {copie.score}/100 · {copie.eligible ? "Éligible" : "À orienter"}
                </span>
                <span style={{ fontSize: 12, color: "var(--adm-mute)" }}>
                  envoyé le {dateLongue(copie.cree_le)}
                </span>
              </div>

              <table className="adm-t" style={{ marginBottom: 16 }}>
                <tbody>
                  <tr>
                    <td style={{ width: 130, color: "var(--adm-mute)" }}>Prérequis</td>
                    <td>
                      {copie.prerequis_le ? (
                        <>Confirmés le {enClair(copie.prerequis_le)}</>
                      ) : (
                        <span style={{ color: "var(--adm-bad)" }}>Pas encore confirmés</span>
                      )}
                    </td>
                  </tr>
                  {copie.annule_le && (
                    <tr>
                      <td style={{ color: "var(--adm-mute)" }}>Annulation</td>
                      <td style={{ color: "var(--adm-bad)" }}>
                        Rendez-vous annulé le {enClair(copie.annule_le)}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td style={{ color: "var(--adm-mute)" }}>Lien personnel</td>
                    <td style={{ wordBreak: "break-all", fontSize: 12 }}>
                      /prerequis/{copie.jeton}
                    </td>
                  </tr>
                </tbody>
              </table>

              <form action={actionDefinirRdv} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <input type="hidden" name="contact" value={contact.id} />
                <input type="hidden" name="questionnaire" value={copie.id} />
                <input
                  type="datetime-local"
                  name="quand"
                  className="adm-champ"
                  defaultValue={pourChamp(copie.rdv_le)}
                  style={{ width: "auto", flex: "1 1 220px" }}
                />
                <button type="submit" className="adm-btn">
                  {copie.rdv_le ? "Modifier le rendez-vous" : "Fixer le rendez-vous"}
                </button>
              </form>
              <p style={{ color: "var(--adm-mute)", fontSize: 12, margin: "10px 0 0" }}>
                Heure de Paris. Sans prérequis confirmés la veille, le rendez-vous est
                annulé automatiquement et la personne prévenue.
              </p>

              <details style={{ marginTop: 18 }}>
                <summary style={{ cursor: "pointer", fontSize: 13, color: "var(--adm-mute)" }}>
                  Voir les {Object.keys(copie.reponses).length} réponses
                </summary>
                <dl style={{ margin: "14px 0 0", display: "grid", gap: 12 }}>
                  {QUESTIONS.filter((q) => copie.reponses[q.cle]).map((q) => (
                    <div key={q.cle}>
                      <dt style={{ fontSize: 12, color: "var(--adm-mute)" }}>{q.titre}</dt>
                      <dd style={{ margin: "2px 0 0", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                        {Array.isArray(copie.reponses[q.cle])
                          ? (copie.reponses[q.cle] as string[]).join(", ")
                          : (copie.reponses[q.cle] as string)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </details>
            </div>
          )}

          {commercial && (
            <div className="adm-carte">
              <p className="adm-titre">Propositions</p>

              {offres.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
                  {offres.map((o) => (
                    <div
                      key={o.id}
                      style={{
                        border: "1px solid var(--adm-line)",
                        borderRadius: 10,
                        padding: "12px 14px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline" }}>
                        <strong>{o.intitule}</strong>
                        <span style={{ fontWeight: 650, whiteSpace: "nowrap" }}>
                          {euros(o.montant_cents)}
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8, flexWrap: "wrap" }}>
                        <span className="adm-tag" data-s={(ETATS[o.statut] ?? ETATS.brouillon).ton}>
                          {(ETATS[o.statut] ?? { texte: o.statut }).texte}
                        </span>
                        <span style={{ fontSize: 11.5, color: "var(--adm-mute)" }}>
                          {o.probabilite} % de chances
                          {o.envoyee_le && ` · envoyée le ${enClair(o.envoyee_le)}`}
                          {o.vues > 0 && ` · ouverte ${o.vues} fois`}
                          {o.relances > 0 && ` · ${o.relances} relance${o.relances > 1 ? "s" : ""}`}
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                        {o.statut === "brouillon" && (
                          <form action={actionEnvoyerOffre}>
                            <input type="hidden" name="id" value={o.id} />
                            <input type="hidden" name="retour" value={`/admin/contacts/${contact.id}`} />
                            <button type="submit" className="adm-btn petit">Envoyer</button>
                          </form>
                        )}
                        {["brouillon", "envoyee", "vue"].includes(o.statut) && (
                          <form action={actionAnnulerOffre}>
                            <input type="hidden" name="id" value={o.id} />
                            <input type="hidden" name="retour" value={`/admin/contacts/${contact.id}`} />
                            <button type="submit" className="adm-btn fantome petit">Classer</button>
                          </form>
                        )}
                        {o.envoyee_le && (
                          <span style={{ fontSize: 11.5, color: "var(--adm-mute)", alignSelf: "center", wordBreak: "break-all" }}>
                            /proposition/{o.jeton.slice(0, 12)}…
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <details open={offres.length === 0}>
                <summary style={{ cursor: "pointer", fontSize: 13, color: "var(--adm-mute)", marginBottom: 12 }}>
                  Préparer une proposition
                </summary>

                <form action={actionCreerOffre} style={{ display: "grid", gap: 12 }}>
                  <input type="hidden" name="contact" value={contact.id} />

                  <label style={{ display: "block" }}>
                    <span className="adm-label">Intitulé</span>
                    <input
                      type="text"
                      name="intitule"
                      required
                      maxLength={200}
                      className="adm-champ"
                      placeholder="Immersion Expansion · 6 mois"
                      defaultValue={contact.interet ?? ""}
                    />
                  </label>

                  <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" }}>
                    <label style={{ display: "block" }}>
                      <span className="adm-label">Montant (€)</span>
                      <input type="text" name="montant" required className="adm-champ" placeholder="4800" inputMode="decimal" />
                    </label>
                    <label style={{ display: "block" }}>
                      <span className="adm-label">Chances (%)</span>
                      <input type="number" name="probabilite" min={0} max={100} step={5} defaultValue={50} className="adm-champ" />
                    </label>
                    <label style={{ display: "block" }}>
                      <span className="adm-label">Valable jusqu&apos;au</span>
                      <input type="date" name="validite" className="adm-champ" />
                    </label>
                  </div>

                  <label style={{ display: "block" }}>
                    <span className="adm-label">Échéancier</span>
                    <input
                      type="text"
                      name="echeancier"
                      maxLength={200}
                      className="adm-champ"
                      placeholder="1 600 € à l'inscription, puis 2 × 1 600 €"
                    />
                  </label>

                  <label style={{ display: "block" }}>
                    <span className="adm-label">Ce que vous lui dites</span>
                    <textarea
                      name="message"
                      rows={7}
                      className="adm-champ"
                      placeholder={"Ce que nous avons vu ensemble, ce que contient l'accompagnement, ce qu'il demande de vous…"}
                      style={{ lineHeight: 1.6 }}
                    />
                  </label>

                  <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13 }}>
                    <input type="checkbox" name="envoyer" />
                    Envoyer tout de suite
                  </label>

                  <div>
                    <button type="submit" className="adm-btn">Enregistrer la proposition</button>
                  </div>
                </form>
              </details>
            </div>
          )}

          {contact.message && (
            <div className="adm-carte">
              <p className="adm-titre">Son message</p>
              <p style={{ margin: 0, whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{contact.message}</p>
            </div>
          )}

          <div className="adm-carte">
            <p className="adm-titre">Vos notes</p>
            <form action={actionEnregistrerNote}>
              <input type="hidden" name="id" value={contact.id} />
              <textarea
                name="notes"
                className="adm-champ"
                defaultValue={contact.notes ?? ""}
                placeholder="Ce que vous voulez retenir : contexte, ce qui a été dit lors de l'appel, prochaine étape…"
              />
              <button type="submit" className="adm-btn" style={{ marginTop: 10 }}>
                Enregistrer la note
              </button>
            </form>
          </div>
        </div>

        <div className="adm-carte">
          <p className="adm-titre">Son historique</p>
          {timeline.length === 0 ? (
            <p className="adm-vide">Aucun événement.</p>
          ) : (
            <ul className="adm-chrono">
              {timeline.map((e) => (
                <li key={e.id}>
                  <time>{dateLongue(e.cree_le)}</time>
                  <span>{e.libelle}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Cadre>
  );
}
