import Cadre from "../Cadre";
import { isDbConfigured } from "@/lib/crm/db";
import { listerSequences, type SequenceVue } from "@/lib/crm/sequences";
import { exigerDroit } from "@/lib/crm/session";
import { actionBasculer, actionMajEtape } from "./actions";

export const dynamic = "force-dynamic";

/**
 * Chaque séquence appartient à une catégorie de personnes, avec sa couleur.
 * `groupe` sert à regrouper la vue d'ensemble ; `cat` décrit qui reçoit la
 * séquence ; `cond` dit ce qui la déclenche ; `ton` est la couleur du fil.
 */
const CATEGORIES: Record<
  string,
  { groupe: string; cat: string; cond: string; ton: string; ordre: number }
> = {
  guide: {
    groupe: "Aimants gratuits",
    cat: "A téléchargé le guide",
    cond: "téléchargement du guide « Sortir de la crise silencieuse »",
    ton: "#3b5bd0",
    ordre: 1,
  },
  lettres: {
    groupe: "Aimants gratuits",
    cat: "S'est inscrit aux Lettres",
    cond: "inscription aux Lettres depuis le site",
    ton: "#3b5bd0",
    ordre: 2,
  },
  appel: {
    groupe: "Demande directe",
    cat: "A demandé un appel",
    cond: "formulaire de contact rempli",
    ton: "#8a5a06",
    ordre: 3,
  },
  prerequis: {
    groupe: "Questionnaire de préparation",
    cat: "Qualifié → appel avec Domoïna",
    cond: "questionnaire au-dessus du seuil d'éligibilité",
    ton: "#b98900",
    ordre: 4,
  },
  stages: {
    groupe: "Questionnaire de préparation",
    cat: "Revenu > 2 000 € → stages",
    cond: "questionnaire, non qualifié, revenu supérieur à 2 000 €",
    ton: "#17654c",
    ordre: 5,
  },
  formations: {
    groupe: "Questionnaire de préparation",
    cat: "Revenu ≤ 2 000 € → formations",
    cond: "questionnaire, revenu modeste",
    ton: "#93304f",
    ordre: 6,
  },
  suivi_entretien: {
    groupe: "Après l'entretien",
    cat: "L'appel a eu lieu",
    cond: "statut passé à « Appel fait »",
    ton: "#5b32b5",
    ordre: 7,
  },
  orientation: {
    groupe: "Anciennes",
    cat: "Orientation (remplacée)",
    cond: "ancienne route, conservée pour l'historique",
    ton: "#6b7590",
    ordre: 99,
  },
};

function cat(cle: string) {
  return (
    CATEGORIES[cle] ?? {
      groupe: "Autres",
      cat: cle,
      cond: cle,
      ton: "#6b7590",
      ordre: 50,
    }
  );
}

function jour(n: number): string {
  return n === 0 ? "immédiat" : `+${n} j`;
}

export default async function SequencesPage() {
  await exigerDroit("sequences");

  const sequences = isDbConfigured() ? await listerSequences() : [];
  const triees = [...sequences].sort((a, b) => cat(a.cle).ordre - cat(b.cle).ordre);

  // Regroupement pour la vue « qui reçoit quoi ».
  const groupes: { titre: string; seqs: SequenceVue[] }[] = [];
  for (const s of triees) {
    const g = cat(s.cle).groupe;
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
      {!isDbConfigured() && (
        <div className="adm-alerte">
          <strong>La base de données n&apos;est pas encore branchée.</strong> Ajoutez la
          variable <code>DATABASE_URL</code> dans les réglages Vercel, puis redéployez : les
          séquences par défaut s&apos;installeront automatiquement.
        </div>
      )}

      {sequences.length === 0 && isDbConfigured() && (
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
                    const c = cat(s.cle);
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
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            <p style={{ margin: "16px 0 0", fontSize: 12, color: "var(--adm-mute)", lineHeight: 1.6 }}>
              Dans le sujet et le texte, <code>{"{{prenom}}"}</code> devient le prénom du
              destinataire. Le délai se compte en jours depuis l&apos;entrée dans la séquence, et
              un lien de désinscription est ajouté à chaque envoi.
            </p>
          </div>

          {/* ─── Un pipeline par séquence ─── */}
          {triees.map((s) => {
            const c = cat(s.cle);
            return (
              <div className="adm-carte" key={s.id} style={{ marginBottom: 14 }}>
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
