import Cadre from "../Cadre";
import { isDbConfigured } from "@/lib/crm/db";
import { exigerDroit } from "@/lib/crm/session";
import { STATUTS } from "@/lib/crm/contacts";
import {
  compterSegment,
  decrireSegment,
  ETATS_STAGE,
  listerCampagnes,
  nettoyerSegment,
  type Segment,
} from "@/lib/crm/campagnes";
import { ETATS_PARTICIPATION, listerStages } from "@/lib/crm/stages";
import { enClair } from "@/lib/heure";
import { actionArreterCampagne, actionCompter, actionCreerCampagne } from "./actions";

export const dynamic = "force-dynamic";

const ETATS: Record<string, { texte: string; ton: string }> = {
  brouillon: { texte: "Brouillon", ton: "nouveau" },
  programmee: { texte: "Programmée", ton: "contacte" },
  en_cours: { texte: "En cours d'envoi", ton: "appel" },
  envoyee: { texte: "Envoyée", ton: "client" },
};

type Params = Promise<Record<string, string | string[] | undefined>>;

function premier(v: string | string[] | undefined): string {
  return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
}

export default async function CampagnesPage({ searchParams }: { searchParams: Params }) {
  await exigerDroit("campagnes");

  const params = await searchParams;
  const branchee = isDbConfigured();
  const campagnes = branchee ? await listerCampagnes() : [];
  // Les stages servent de critère de ciblage : on peut être venu à un stage
  // sans être « client », et vouloir écrire à ce groupe-là.
  const stages = branchee ? await listerStages() : [];
  const titresDesStages = Object.fromEntries(stages.map((s) => [s.slug, s.titre]));

  // Le formulaire se recharge tel quel après un comptage : rien n'est perdu.
  const apercu = premier(params.apercu) === "1";
  const statutsChoisis = Array.isArray(params.statuts)
    ? params.statuts
    : params.statuts
      ? [String(params.statuts)]
      : [];
  const etatsChoisis = Array.isArray(params.stage_etats)
    ? params.stage_etats
    : params.stage_etats
      ? [String(params.stage_etats)]
      : [];
  const segment: Segment = nettoyerSegment({
    statuts: statutsChoisis,
    source: premier(params.source),
    utm_source: premier(params.utm_source),
    depuis_jours: premier(params.depuis_jours),
    jamais_ouvert: premier(params.jamais_ouvert) === "on",
    stage: premier(params.stage),
    stage_etats: etatsChoisis,
  });
  const nombre = apercu && branchee ? await compterSegment(segment) : null;

  return (
    <Cadre
      actif="/admin/campagnes"
      titre="Campagnes"
      sousTitre="Les e-mails que vous décidez d'écrire, par opposition aux séquences automatiques."
    >
      {!branchee && (
        <div className="adm-alerte">
          <strong>La base de données n&apos;est pas encore branchée.</strong> Ajoutez la
          variable <code>DATABASE_URL</code> dans les réglages Vercel, puis redéployez.
        </div>
      )}

      <div className="adm-carte" style={{ marginBottom: 14 }}>
        <p className="adm-titre">Nouvelle campagne</p>

        <form action={actionCreerCampagne} style={{ display: "grid", gap: 16 }}>
          <label style={{ display: "block" }}>
            <span style={{ display: "block", fontSize: 12, color: "var(--adm-mute)", marginBottom: 6 }}>
              Objet
            </span>
            <input
              type="text"
              name="sujet"
              required
              maxLength={200}
              className="adm-champ"
              defaultValue={premier(params.sujet)}
              placeholder="Les dates du Stage Hiver sont ouvertes"
            />
          </label>

          <label style={{ display: "block" }}>
            <span style={{ display: "block", fontSize: 12, color: "var(--adm-mute)", marginBottom: 6 }}>
              Message — <code>{"{{prenom}}"}</code> est remplacé par le prénom du destinataire
            </span>
            <textarea
              name="corps"
              required
              rows={10}
              className="adm-champ"
              defaultValue={premier(params.corps)}
              placeholder={"Bonjour {{prenom}},\n\n…"}
              style={{ resize: "vertical", lineHeight: 1.6 }}
            />
          </label>

          <fieldset style={{ border: "1px solid var(--adm-line)", borderRadius: 8, padding: 16 }}>
            <legend style={{ fontSize: 12, color: "var(--adm-mute)", padding: "0 6px" }}>
              À qui ?
            </legend>

            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 14 }}>
              {STATUTS.map((s) => (
                <label key={s.cle} style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 13 }}>
                  <input
                    type="checkbox"
                    name="statuts"
                    value={s.cle}
                    defaultChecked={statutsChoisis.includes(s.cle)}
                  />
                  {s.label}
                </label>
              ))}
            </div>

            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
              <label style={{ display: "block" }}>
                <span style={{ display: "block", fontSize: 12, color: "var(--adm-mute)", marginBottom: 6 }}>
                  Source du formulaire
                </span>
                <input
                  type="text"
                  name="source"
                  className="adm-champ"
                  defaultValue={premier(params.source)}
                  placeholder="Lettres"
                />
              </label>
              <label style={{ display: "block" }}>
                <span style={{ display: "block", fontSize: 12, color: "var(--adm-mute)", marginBottom: 6 }}>
                  Campagne d&apos;origine (utm_source)
                </span>
                <input
                  type="text"
                  name="utm_source"
                  className="adm-champ"
                  defaultValue={premier(params.utm_source)}
                  placeholder="instagram"
                />
              </label>
              <label style={{ display: "block" }}>
                <span style={{ display: "block", fontSize: 12, color: "var(--adm-mute)", marginBottom: 6 }}>
                  Arrivés depuis moins de (jours)
                </span>
                <input
                  type="number"
                  name="depuis_jours"
                  min={1}
                  max={3650}
                  className="adm-champ"
                  defaultValue={premier(params.depuis_jours)}
                />
              </label>
            </div>

            <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--adm-line)" }}>
              <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
                <label style={{ display: "block" }}>
                  <span style={{ display: "block", fontSize: 12, color: "var(--adm-mute)", marginBottom: 6 }}>
                    Inscrits à un stage
                  </span>
                  <select name="stage" className="adm-champ" defaultValue={premier(params.stage)}>
                    <option value="">Peu importe</option>
                    <option value="*">N&apos;importe quel stage</option>
                    {stages.map((st) => (
                      <option key={st.id} value={st.slug}>
                        {st.titre}
                      </option>
                    ))}
                  </select>
                </label>
                <div>
                  <span style={{ display: "block", fontSize: 12, color: "var(--adm-mute)", marginBottom: 6 }}>
                    Où en est leur place — sans coche, tous les états
                  </span>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {ETATS_STAGE.map((e) => (
                      <label key={e} style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 13 }}>
                        <input
                          type="checkbox"
                          name="stage_etats"
                          value={e}
                          defaultChecked={etatsChoisis.includes(e)}
                        />
                        {ETATS_PARTICIPATION[e]?.texte ?? e}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              {stages.length === 0 && branchee && (
                <p style={{ fontSize: 12, color: "var(--adm-mute)", margin: "8px 0 0" }}>
                  Aucun stage en base pour l&apos;instant : le catalogue s&apos;installe au premier
                  passage dans l&apos;onglet Stages.
                </p>
              )}
            </div>

            <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, marginTop: 14 }}>
              <input
                type="checkbox"
                name="jamais_ouvert"
                defaultChecked={premier(params.jamais_ouvert) === "on"}
              />
              Seulement ceux qui n&apos;ont jamais ouvert un e-mail
            </label>

            <p style={{ fontSize: 12, color: "var(--adm-mute)", margin: "14px 0 0" }}>
              Sans aucun critère, la campagne part à toute la liste. Les désabonnés sont
              toujours exclus.
            </p>
          </fieldset>

          <label style={{ display: "block" }}>
            <span style={{ display: "block", fontSize: 12, color: "var(--adm-mute)", marginBottom: 6 }}>
              Départ — vide pour envoyer tout de suite (heure de Paris)
            </span>
            <input
              type="datetime-local"
              name="quand"
              className="adm-champ"
              defaultValue={premier(params.quand)}
              style={{ width: "auto" }}
            />
          </label>

          {nombre !== null && (
            <div className="adm-alerte" style={{ margin: 0 }}>
              <strong>
                {nombre} destinataire{nombre > 1 ? "s" : ""}
              </strong>{" "}
              pour ce ciblage : {decrireSegment(segment, titresDesStages)}.
            </div>
          )}

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button type="submit" formAction={actionCompter} className="adm-btn fantome">
              Compter les destinataires
            </button>
            <button type="submit" className="adm-btn">
              {premier(params.quand) ? "Programmer l'envoi" : "Envoyer maintenant"}
            </button>
          </div>
        </form>
      </div>

      <div className="adm-carte">
        <p className="adm-titre">Historique</p>
        {campagnes.length === 0 ? (
          <p className="adm-vide">Aucune campagne pour l&apos;instant.</p>
        ) : (
          <div className="adm-table-scroll">
            <table className="adm-t">
              <thead>
                <tr>
                  <th>Objet</th>
                  <th>Ciblage</th>
                  <th>État</th>
                  <th>Partis</th>
                  <th>Ouverts</th>
                  <th>Cliqués</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {campagnes.map((c) => (
                  <tr key={c.id}>
                    <td>
                      {c.sujet}
                      <div style={{ fontSize: 11, color: "var(--adm-mute)", marginTop: 2 }}>
                        {c.envoyee_le
                          ? `terminée le ${enClair(c.envoyee_le)}`
                          : c.programmee_le
                            ? `départ le ${enClair(c.programmee_le)}`
                            : `créée le ${enClair(c.cree_le)}`}
                      </div>
                    </td>
                    <td style={{ fontSize: 12, color: "var(--adm-mute)" }}>
                      {decrireSegment((c.segment ?? {}) as Segment, titresDesStages)}
                    </td>
                    <td>
                      <span className="adm-tag" data-s={(ETATS[c.statut] ?? ETATS.brouillon).ton}>
                        {(ETATS[c.statut] ?? { texte: c.statut }).texte}
                      </span>
                    </td>
                    <td style={{ fontVariantNumeric: "tabular-nums" }}>{c.partis}</td>
                    <td style={{ fontVariantNumeric: "tabular-nums" }}>{c.ouverts}</td>
                    <td style={{ fontVariantNumeric: "tabular-nums" }}>{c.cliques}</td>
                    <td>
                      {(c.statut === "en_cours" || c.statut === "programmee") && (
                        <form action={actionArreterCampagne}>
                          <input type="hidden" name="id" value={c.id} />
                          <button type="submit" className="adm-btn fantome petit">
                            Arrêter
                          </button>
                        </form>
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
