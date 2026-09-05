import Cadre from "../Cadre";
import { isDbConfigured } from "@/lib/crm/db";
import { listerSequences, type SequenceVue } from "@/lib/crm/sequences";
import { categorie } from "@/lib/crm/categories";
import { compterSegment, nettoyerSegment, type Segment } from "@/lib/crm/campagnes";
import { MAXIMUM_COLLE, MAXIMUM_MASSE } from "@/lib/crm/ajouts";
import { STATUTS } from "@/lib/crm/contacts";
import { exigerDroit } from "@/lib/crm/session";
import {
  actionAjouterExistants,
  actionAjouterPersonnes,
  actionBasculer,
  actionCompterCible,
  actionMajEtape,
} from "./actions";

export const dynamic = "force-dynamic";

type Params = Promise<Record<string, string | string[] | undefined>>;

function premier(v: string | string[] | undefined): string {
  return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
}

function jour(n: number): string {
  return n === 0 ? "immédiat" : `+${n} j`;
}

export default async function SequencesPage({ searchParams }: { searchParams: Params }) {
  await exigerDroit("sequences");

  const params = await searchParams;
  const branchee = isDbConfigured();
  const sequences = branchee ? await listerSequences() : [];
  const triees = [...sequences].sort(
    (a, b) => categorie(a.cle).ordre - categorie(b.cle).ordre,
  );

  // La catégorie dont le panneau d'ajout est ouvert, et le compte rendu du
  // dernier ajout — tout passe par l'URL, donc la page se recharge telle quelle.
  const cible = premier(params.cat);
  const fait = premier(params.fait);
  const souci = premier(params.souci);
  const apercu = premier(params.apercu) === "1";
  const segment: Segment = nettoyerSegment({
    statuts: premier(params.statut) ? [premier(params.statut)] : [],
    source: premier(params.source),
    depuis_jours: premier(params.depuis_jours),
  });
  const nombre = apercu && cible && branchee ? await compterSegment(segment) : null;

  // Regroupement pour la vue « qui reçoit quoi ».
  const groupes: { titre: string; seqs: SequenceVue[] }[] = [];
  for (const s of triees) {
    const g = categorie(s.cle).groupe;
    const dernier = groupes[groupes.length - 1];
    if (dernier && dernier.titre === g) dernier.seqs.push(s);
    else groupes.push({ titre: g, seqs: [s] });
  }

  return (
    <Cadre
      actif="/admin/sequences"
      titre="Séquences d'e-mails"
      sousTitre="Le parcours de chaque catégorie de personnes, e-mail par e-mail."
    >
      {!branchee && (
        <div className="adm-alerte">
          <strong>La base de données n&apos;est pas encore branchée.</strong> Ajoutez la
          variable <code>DATABASE_URL</code> dans les réglages Vercel, puis redéployez : les
          séquences par défaut s&apos;installeront automatiquement.
        </div>
      )}

      {sequences.length === 0 && branchee && (
        <div className="adm-carte">
          <p className="adm-vide">Aucune séquence.</p>
        </div>
      )}

      {sequences.length > 0 && (
        <>
          {/* ─── Vue d'ensemble : qui reçoit quoi ─── */}
          <div className="adm-carte" style={{ marginBottom: 16 }}>
            <p className="adm-titre">Qui reçoit quoi</p>
            <div className="seq-routes">
              {groupes.map((g) => (
                <div key={g.titre} style={{ display: "contents" }}>
                  <p className="seq-groupe-titre">{g.titre}</p>
                  {g.seqs.map((s) => {
                    const c = categorie(s.cle);
                    return (
                      <div className="seq-route" key={s.id}>
                        <span className="liseré" style={{ background: c.ton }} />
                        <div>
                          <div className="cat">
                            {c.cat}
                            {!s.active && (
                              <span className="adm-tag" data-s="perdu" style={{ marginLeft: 8 }}>
                                En pause
                              </span>
                            )}
                          </div>
                          <div className="cond">Déclencheur : {c.cond}</div>
                          <div className="vers">
                            <b>{s.nom}</b> · {s.etapes.length} e-mail{s.etapes.length > 1 ? "s" : ""}
                          </div>
                        </div>
                        <div className="compte">
                          <div className="n">{s.inscrits}</div>
                          <div className="l">en cours</div>
                          {c.manuel && (
                            <a className="seq-lien-ajout" href={`?cat=${s.cle}#cat-${s.cle}`}>
                              Ajouter des personnes
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            <p style={{ margin: "16px 0 0", fontSize: 12, color: "var(--adm-mute)", lineHeight: 1.6 }}>
              Chaque catégorie se remplit toute seule depuis le site. Pour les personnes
              rencontrées ailleurs — un stage, un appel, une ancienne liste —, chaque séquence
              a son panneau <strong>« Ajouter des personnes »</strong>&nbsp;: on y entre par la
              catégorie, jamais par une séquence nue.
            </p>
            <p style={{ margin: "8px 0 0", fontSize: 12, color: "var(--adm-mute)", lineHeight: 1.6 }}>
              Dans le sujet et le texte, <code>{"{{prenom}}"}</code> devient le prénom du
              destinataire. Le délai se compte en jours depuis l&apos;entrée dans la séquence, et
              un lien de désinscription est ajouté à chaque envoi.
            </p>
          </div>

          {/* ─── Un pipeline par séquence ─── */}
          {triees.map((s) => {
            const c = categorie(s.cle);
            const ouvert = cible === s.cle;
            return (
              <div className="adm-carte" key={s.id} id={`cat-${s.cle}`} style={{ marginBottom: 14 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 16,
                    flexWrap: "wrap",
                    alignItems: "flex-start",
                    marginBottom: 6,
                  }}
                >
                  <div style={{ minWidth: 240 }}>
                    <h2 style={{ fontSize: 16, margin: "0 0 4px", display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 10, height: 10, borderRadius: 3, background: c.ton, flex: "none" }} />
                      {s.nom}
                      <span className="adm-tag" data-s={s.active ? "client" : "perdu"}>
                        {s.active ? "Active" : "En pause"}
                      </span>
                    </h2>
                    <p style={{ margin: 0, fontSize: 12, color: "var(--adm-mute)" }}>
                      {c.cat} · <strong>{s.inscrits}</strong> en cours · {s.termines} terminé
                      {s.termines > 1 ? "s" : ""}
                    </p>
                  </div>
                  <form action={actionBasculer}>
                    <input type="hidden" name="id" value={s.id} />
                    <input type="hidden" name="active" value={s.active ? "0" : "1"} />
                    <button type="submit" className="adm-btn fantome petit">
                      {s.active ? "Mettre en pause" : "Activer"}
                    </button>
                  </form>
                </div>

                {ouvert && fait && (
                  <div className="adm-alerte" style={{ marginBottom: 12 }}>
                    <strong>Ajout effectué&nbsp;:</strong> {fait}.
                  </div>
                )}
                {ouvert && souci && (
                  <div className="adm-alerte" style={{ marginBottom: 12 }}>
                    {souci}
                  </div>
                )}

                {/* Le pipeline visuel */}
                <div className="seq-pipe">
                  <div className="seq-decl">
                    <span className="t">Déclencheur</span>
                    <span className="q">{c.cond}</span>
                  </div>

                  {s.etapes.map((e) => (
                    <div key={e.id} style={{ display: "contents" }}>
                      <div className="seq-conn">
                        <span className="ligne" />
                        <span className="delai">{jour(e.delai_jours)}</span>
                      </div>
                      <div className="seq-mail" style={{ ["--seq-ton" as string]: c.ton }}>
                        <span className="rang">E-mail {e.ordre}</span>
                        <span className="obj">{e.sujet}</span>
                        <span className="stats">
                          <span>
                            <b>{e.envoyes}</b> envoyé{e.envoyes > 1 ? "s" : ""}
                          </span>
                          {e.envoyes > 0 && (
                            <span>
                              <b>{Math.round((e.ouverts / e.envoyes) * 100)}%</b> ouverts
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  ))}

                  <div className="seq-conn">
                    <span className="ligne" />
                  </div>
                  <div className="seq-fin">Fin</div>
                </div>

                {/* Ajouter des personnes dans cette catégorie */}
                {c.manuel ? (
                  <details className="seq-edit seq-ajout" open={ouvert}>
                    <summary>Ajouter des personnes dans « {c.cat} »</summary>

                    <p className="seq-ajout-aide">{c.aide}</p>
                    {c.avertissement && <p className="seq-ajout-avert">{c.avertissement}</p>}

                    <div className="seq-ajout-grille">
                      {/* À la main, une liste collée */}
                      <form action={actionAjouterPersonnes} className="adm-carte" style={{ background: "var(--adm-surface-2)" }}>
                        <input type="hidden" name="cle" value={s.cle} />
                        <strong style={{ fontSize: 13 }}>Une liste de personnes</strong>
                        <p className="seq-ajout-note">
                          Une par ligne, sous la forme{" "}
                          <code>e-mail, prénom, nom</code>. La virgule, le point-virgule et la
                          tabulation font séparateur : un copier-coller de tableur passe tel
                          quel. Jusqu&apos;à {MAXIMUM_COLLE} personnes à la fois.
                        </p>
                        <textarea
                          name="liste"
                          required
                          rows={6}
                          className="adm-champ"
                          placeholder={"marie@exemple.fr, Marie, Durand\njean@exemple.fr"}
                          style={{ resize: "vertical", lineHeight: 1.6, fontFamily: "inherit" }}
                        />
                        <label className="seq-ajout-accord">
                          <input type="checkbox" name="accord" required />
                          <span>
                            Ces personnes ont accepté de recevoir ces e-mails. Cet accord est
                            consigné au journal avec mon nom.
                          </span>
                        </label>
                        <button type="submit" className="adm-btn petit">
                          Ajouter à cette séquence
                        </button>
                      </form>

                      {/* Des contacts déjà dans le fichier */}
                      <form className="adm-carte" style={{ background: "var(--adm-surface-2)" }}>
                        <input type="hidden" name="cle" value={s.cle} />
                        <strong style={{ fontSize: 13 }}>Des contacts déjà dans le fichier</strong>
                        <p className="seq-ajout-note">
                          Pour rattraper une catégorie entière, ou reprendre une liste importée.
                          Les désabonnés sont toujours écartés. Comptez d&apos;abord&nbsp;: un envoi
                          de masse ne se rattrape pas.
                        </p>

                        <div className="seq-ajout-cible">
                          <label>
                            <span className="adm-label">Statut</span>
                            <select
                              name="statut"
                              className="adm-champ"
                              defaultValue={ouvert ? premier(params.statut) : ""}
                            >
                              <option value="">Tous</option>
                              {STATUTS.map((st) => (
                                <option key={st.cle} value={st.cle}>
                                  {st.label}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label>
                            <span className="adm-label">Source</span>
                            <input
                              name="source"
                              className="adm-champ"
                              placeholder="Lettres"
                              defaultValue={ouvert ? premier(params.source) : ""}
                            />
                          </label>
                          <label>
                            <span className="adm-label">Arrivés depuis moins de</span>
                            <input
                              name="depuis_jours"
                              type="number"
                              min={1}
                              max={3650}
                              className="adm-champ"
                              placeholder="jours"
                              defaultValue={ouvert ? premier(params.depuis_jours) : ""}
                            />
                          </label>
                        </div>

                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginTop: 10 }}>
                          {/* `formNoValidate` : recompter ne doit pas buter sur
                              la case d'accord, qui ne concerne que l'ajout. */}
                          <button
                            type="submit"
                            formAction={actionCompterCible}
                            formNoValidate
                            className="adm-btn fantome petit"
                          >
                            Compter les personnes
                          </button>
                          {ouvert && nombre !== null && (
                            <span style={{ fontSize: 12.5, color: "var(--adm-mute)" }}>
                              <strong style={{ color: "var(--adm-ink)" }}>{nombre}</strong>{" "}
                              personne{nombre > 1 ? "s" : ""} correspond
                              {nombre > 1 ? "ent" : ""} à ce ciblage
                              {nombre > MAXIMUM_MASSE
                                ? ` — seules les ${MAXIMUM_MASSE} premières seront ajoutées`
                                : ""}
                              .
                            </span>
                          )}
                        </div>

                        {ouvert && nombre !== null && nombre > 0 && (
                          <>
                            {/* Le ciblage qui a été compté. S'il ne correspond
                                plus aux champs au moment d'ajouter, l'action
                                refuse et redemande un comptage. */}
                            <input type="hidden" name="compte_statut" value={premier(params.statut)} />
                            <input type="hidden" name="compte_source" value={premier(params.source)} />
                            <input
                              type="hidden"
                              name="compte_depuis_jours"
                              value={premier(params.depuis_jours)}
                            />
                            <label className="seq-ajout-accord">
                              <input type="checkbox" name="accord" required />
                              <span>
                                Ces personnes ont accepté de recevoir ces e-mails. Les premiers
                                envois partiront au prochain passage du worker, par paquets de
                                200 par jour.
                              </span>
                            </label>
                            <button type="submit" formAction={actionAjouterExistants} className="adm-btn petit">
                              Ajouter ces {Math.min(nombre, MAXIMUM_MASSE)} personne
                              {Math.min(nombre, MAXIMUM_MASSE) > 1 ? "s" : ""}
                            </button>
                          </>
                        )}
                      </form>
                    </div>
                  </details>
                ) : (
                  <p className="seq-ajout-aide" style={{ marginTop: 12 }}>
                    {c.aide}
                  </p>
                )}

                {/* L'éditeur, replié */}
                <details className="seq-edit">
                  <summary>Modifier les {s.etapes.length} e-mails de cette séquence</summary>
                  <div className="seq-edit-grille">
                    {s.etapes.map((e) => (
                      <form key={e.id} action={actionMajEtape} className="adm-carte" style={{ background: "var(--adm-surface-2)" }}>
                        <input type="hidden" name="id" value={e.id} />
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                          <strong style={{ fontSize: 13 }}>E-mail {e.ordre}</strong>
                          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--adm-mute)" }}>
                            envoyé
                            <input
                              type="number"
                              name="delai_jours"
                              className="adm-champ"
                              defaultValue={e.delai_jours}
                              min={0}
                              max={365}
                              style={{ width: 70, padding: "4px 8px" }}
                            />
                            jour(s) après l&apos;entrée
                          </label>
                        </div>
                        <label className="adm-label">Sujet</label>
                        <input name="sujet" className="adm-champ" defaultValue={e.sujet} style={{ marginBottom: 10 }} />
                        <label className="adm-label">Message</label>
                        <textarea name="corps" className="adm-champ" defaultValue={e.corps} style={{ minHeight: 150 }} />
                        <button type="submit" className="adm-btn petit" style={{ marginTop: 10 }}>
                          Enregistrer cet e-mail
                        </button>
                      </form>
                    ))}
                  </div>
                </details>
              </div>
            );
          })}
        </>
      )}
    </Cadre>
  );
}
