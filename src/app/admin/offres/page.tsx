import Link from "next/link";
import Cadre from "../Cadre";
import { Tuile } from "../Graphes";
import { isDbConfigured } from "@/lib/crm/db";
import { exigerDroit } from "@/lib/crm/session";
import {
  ETATS,
  chiffresPipeline,
  euros,
  listerOffres,
  type LigneOffre,
} from "@/lib/crm/offres";
import { enClair } from "@/lib/heure";
import { actionAnnulerOffre, actionEnvoyerOffre } from "./actions";

export const dynamic = "force-dynamic";

type Params = Promise<Record<string, string | string[] | undefined>>;

function premier(v: string | string[] | undefined): string {
  return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
}

function nomAffiche(l: LigneOffre): string {
  return [l.prenom, l.nom].filter(Boolean).join(" ").trim() || l.email;
}

const FILTRES = [
  { cle: "en_jeu", label: "En jeu" },
  { cle: "", label: "Toutes" },
  { cle: "gagnees", label: "Acceptées" },
];

export default async function OffresPage({ searchParams }: { searchParams: Params }) {
  await exigerDroit("offres");

  const params = await searchParams;
  const brut = premier(params.filtre);
  const filtre = brut === "gagnees" ? "gagnees" : brut === "" && "filtre" in params ? undefined : "en_jeu";

  const branchee = isDbConfigured();
  const offres = branchee ? await listerOffres(filtre) : [];
  const chiffres = branchee ? await chiffresPipeline() : null;

  const erreur = premier(params.erreur);
  const envoyee = premier(params.offre) === "envoyee";

  return (
    <Cadre
      actif="/admin/offres"
      titre="Propositions"
      sousTitre="Ce qui est en jeu, ce qui a été signé, et ce qui traîne."
      actions={
        <Link href="/admin/contacts" className="adm-btn fantome">
          Nouvelle proposition depuis une fiche
        </Link>
      }
    >
      {!branchee && (
        <div className="adm-alerte">
          <strong>La base de données n&apos;est pas encore branchée.</strong> Ajoutez la
          variable <code>DATABASE_URL</code> dans les réglages Vercel, puis redéployez.
        </div>
      )}
      {erreur && <div className="adm-alerte">{erreur}</div>}
      {envoyee && <div className="adm-alerte">La proposition est partie.</div>}

      {chiffres && (
        <div className="adm-grille adm-g4" style={{ marginBottom: 14 }}>
          <Tuile
            label="En jeu"
            valeur={euros(chiffres.montantEnJeu)}
            detail={`${chiffres.enJeu} proposition${chiffres.enJeu > 1 ? "s" : ""} ouverte${chiffres.enJeu > 1 ? "s" : ""}`}
          />
          <Tuile
            label="Pondéré par la probabilité"
            valeur={euros(chiffres.montantPondere)}
            detail="ce qu'on peut raisonnablement attendre"
          />
          <Tuile
            label="Signé ce mois-ci"
            valeur={euros(chiffres.montantGagneMois)}
            detail={`${chiffres.gagneesMois} proposition${chiffres.gagneesMois > 1 ? "s" : ""} acceptée${chiffres.gagneesMois > 1 ? "s" : ""}`}
          />
          <Tuile
            label="Taux d'acceptation"
            valeur={`${chiffres.tauxAcceptation} %`}
            detail="sur toutes les propositions tranchées"
          />
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        {FILTRES.map((f) => {
          const actif = (filtre ?? "") === f.cle;
          return (
            <Link
              key={f.cle || "toutes"}
              href={`/admin/offres?filtre=${f.cle}`}
              className={`adm-btn petit ${actif ? "" : "fantome"}`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      <div className="adm-carte">
        {offres.length === 0 ? (
          <p className="adm-vide">
            Aucune proposition ici. Elles se créent depuis la fiche d&apos;un contact, sous
            son questionnaire.
          </p>
        ) : (
          <div className="adm-table-scroll">
            <table className="adm-t">
              <thead>
                <tr>
                  <th>Personne</th>
                  <th>Proposition</th>
                  <th className="num">Montant</th>
                  <th className="num">Proba.</th>
                  <th>État</th>
                  <th>Suivi</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {offres.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <Link href={`/admin/contacts/${o.contact_id}`}>{nomAffiche(o)}</Link>
                      <div style={{ fontSize: 11.5, color: "var(--adm-mute)", marginTop: 2 }}>
                        {o.email}
                      </div>
                    </td>
                    <td>
                      {o.intitule}
                      {o.echeancier && (
                        <div style={{ fontSize: 11.5, color: "var(--adm-mute)", marginTop: 2 }}>
                          {o.echeancier}
                        </div>
                      )}
                    </td>
                    <td className="num" style={{ fontWeight: 650, whiteSpace: "nowrap" }}>
                      {euros(o.montant_cents)}
                    </td>
                    <td className="num" style={{ color: "var(--adm-mute)" }}>
                      {o.probabilite} %
                    </td>
                    <td>
                      <span className="adm-tag" data-s={(ETATS[o.statut] ?? ETATS.brouillon).ton}>
                        {(ETATS[o.statut] ?? { texte: o.statut }).texte}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: "var(--adm-mute)", whiteSpace: "nowrap" }}>
                      {o.envoyee_le ? (
                        <>
                          envoyée le {enClair(o.envoyee_le)}
                          <div>
                            {o.vues > 0
                              ? `ouverte ${o.vues} fois`
                              : "jamais ouverte"}
                            {o.relances > 0 && ` · ${o.relances} relance${o.relances > 1 ? "s" : ""}`}
                          </div>
                        </>
                      ) : (
                        "pas encore envoyée"
                      )}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        {o.statut === "brouillon" && (
                          <form action={actionEnvoyerOffre}>
                            <input type="hidden" name="id" value={o.id} />
                            <input type="hidden" name="retour" value="/admin/offres" />
                            <button type="submit" className="adm-btn petit">
                              Envoyer
                            </button>
                          </form>
                        )}
                        {(o.statut === "brouillon" || o.statut === "envoyee" || o.statut === "vue") && (
                          <form action={actionAnnulerOffre}>
                            <input type="hidden" name="id" value={o.id} />
                            <input type="hidden" name="retour" value="/admin/offres" />
                            <button type="submit" className="adm-btn fantome petit">
                              Classer
                            </button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p style={{ color: "var(--adm-mute)", fontSize: 12, marginTop: 14, lineHeight: 1.7 }}>
        Une proposition sans réponse est relancée deux fois — trois jours puis huit jours
        après l&apos;envoi — puis classée au bout de quinze jours. Le texte de la relance
        change selon qu&apos;elle a été ouverte ou non.
      </p>
    </Cadre>
  );
}
