import Link from "next/link";
import Cadre from "../Cadre";
import { isDbConfigured } from "@/lib/crm/db";
import { exigerIdentite } from "@/lib/crm/session";
import {
  borneDepuis,
  CATEGORIES_ACTION,
  categorieAction,
  jourDuJour,
  listerActions,
  listerPrevues,
  peutRetoucher,
  resumeCarnet,
  type Action,
} from "@/lib/crm/carnet";
import { actionCocher, actionNoter, actionSupprimer } from "./actions";

export const dynamic = "force-dynamic";

type Params = Promise<Record<string, string | string[] | undefined>>;

function premier(v: string | string[] | undefined): string {
  return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
}

const PERIODES = [
  { cle: "7", label: "7 jours", jours: 7 },
  { cle: "30", label: "30 jours", jours: 30 },
  { cle: "90", label: "3 mois", jours: 90 },
  { cle: "tout", label: "Depuis le début", jours: 0 },
];

function jourEnClair(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  return d.toLocaleDateString("fr-FR", {
    timeZone: "Europe/Paris",
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function duree(minutes: number | null): string {
  if (!minutes) return "";
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} h ${String(m).padStart(2, "0")}` : `${h} h`;
}

/** Une ligne du carnet, la même qu'elle soit prévue ou faite. */
function Ligne({
  a,
  modifiable,
  cochable,
}: {
  a: Action;
  modifiable: boolean;
  cochable: boolean;
}) {
  const c = categorieAction(a.categorie);
  return (
    <div className="carnet-ligne">
      <span className="liseré" style={{ background: c.ton }} />
      <div>
        <div className="titre">{a.titre}</div>
        <div className="meta">
          <span className="adm-tag" style={{ background: `${c.ton}1a`, color: c.ton }}>
            {c.label}
          </span>
          <span>{a.auteur_nom}</span>
          {a.duree_min ? <span>{duree(a.duree_min)}</span> : null}
          {a.statut === "prevue" && a.echeance ? (
            <span>pour le {jourEnClair(new Date(a.echeance).toISOString().slice(0, 10))}</span>
          ) : null}
        </div>
        {a.detail && <p className="detail">{a.detail}</p>}
      </div>

      <div className="boutons">
        {cochable && (
          <form action={actionCocher} className="carnet-cocher">
            <input type="hidden" name="id" value={a.id} />
            <input
              type="text"
              name="note"
              className="adm-champ"
              placeholder="Un mot (facultatif)"
              aria-label="Note à ajouter en cochant"
            />
            <button type="submit" className="adm-btn petit">
              C&apos;est fait
            </button>
          </form>
        )}
        {modifiable && (
          <form action={actionSupprimer}>
            <input type="hidden" name="id" value={a.id} />
            <button type="submit" className="adm-btn fantome petit" title="Retirer cette ligne">
              Retirer
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default async function CarnetPage({ searchParams }: { searchParams: Params }) {
  const qui = await exigerIdentite();
  const params = await searchParams;
  const branchee = isDbConfigured();

  const erreur = premier(params.erreur);
  const fait = premier(params.fait);
  const auteur = premier(params.auteur);
  const categorie = premier(params.categorie);
  const periodeCle = premier(params.periode) || "30";
  const periode = PERIODES.find((p) => p.cle === periodeCle) ?? PERIODES[1];

  const depuis = borneDepuis(periode.jours);
  const filtres = { depuis, auteur: auteur || undefined, categorie: categorie || undefined };

  const actions = branchee ? await listerActions(filtres) : [];
  const prevues = branchee ? await listerPrevues() : [];
  const resume = branchee ? await resumeCarnet({ depuis }) : null;

  // Le carnet se lit par journée : c'est la maille dans laquelle on travaille.
  const journees: { jour: string; lignes: Action[] }[] = [];
  for (const a of actions) {
    const jour = a.fait_le ? new Date(a.fait_le).toISOString().slice(0, 10) : "—";
    const derniere = journees[journees.length - 1];
    if (derniere && derniere.jour === jour) derniere.lignes.push(a);
    else journees.push({ jour, lignes: [a] });
  }

  const lien = (modif: Record<string, string>) => {
    const u = new URLSearchParams({ periode: periodeCle });
    if (auteur) u.set("auteur", auteur);
    if (categorie) u.set("categorie", categorie);
    for (const [k, v] of Object.entries(modif)) {
      if (v) u.set(k, v);
      else u.delete(k);
    }
    return `/admin/carnet?${u.toString()}`;
  };

  return (
    <Cadre
      actif="/admin/carnet"
      titre="Carnet de bord"
      sousTitre="Ce que l'équipe a fait, jour après jour."
      actions={
        <a
          href={`/api/admin/carnet?periode=${periodeCle}${auteur ? `&auteur=${encodeURIComponent(auteur)}` : ""}`}
          className="adm-btn fantome"
        >
          Exporter en CSV
        </a>
      }
    >
      {!branchee && (
        <div className="adm-alerte">
          <strong>La base de données n&apos;est pas encore branchée.</strong> Ajoutez la
          variable <code>DATABASE_URL</code> dans les réglages Vercel, puis redéployez.
        </div>
      )}
      {erreur && <div className="adm-alerte">{erreur}</div>}
      {fait === "notee" && <div className="adm-alerte">C&apos;est noté.</div>}
      {fait === "prevue" && (
        <div className="adm-alerte">Ajouté à ce qui reste à faire, plus bas.</div>
      )}

      {/* ─── Noter une action ─── */}
      <div className="adm-carte" style={{ marginBottom: 14 }}>
        <p className="adm-titre">Qu&apos;avez-vous fait ?</p>
        <form action={actionNoter}>
          <div className="carnet-saisie">
            <label style={{ gridColumn: "1 / -1" }}>
              <span className="adm-label">En une ligne</span>
              <input
                name="titre"
                required
                maxLength={200}
                className="adm-champ"
                placeholder="Publication Instagram sur la blessure originelle"
              />
            </label>

            <label>
              <span className="adm-label">Catégorie</span>
              <select name="categorie" className="adm-champ" defaultValue="contenu">
                {CATEGORIES_ACTION.map((c) => (
                  <option key={c.cle} value={c.cle}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="adm-label">Quel jour</span>
              <input type="date" name="quand" className="adm-champ" defaultValue={jourDuJour()} />
            </label>

            <label>
              <span className="adm-label">Temps passé (minutes)</span>
              <input
                type="number"
                name="duree"
                min={1}
                max={1440}
                className="adm-champ"
                placeholder="45"
              />
            </label>
          </div>

          <label style={{ display: "block", marginTop: 12 }}>
            <span className="adm-label">Le détail, s&apos;il en faut un</span>
            <textarea
              name="detail"
              rows={2}
              maxLength={4000}
              className="adm-champ"
              placeholder="Ce qui a été décidé, ce qui reste à surveiller, le lien vers la publication…"
              style={{ resize: "vertical" }}
            />
          </label>

          <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap", marginTop: 12 }}>
            <button type="submit" className="adm-btn">
              Noter
            </button>
            <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12.5 }}>
              <input type="checkbox" name="prevue" />
              C&apos;est prévu, pas encore fait — la date devient l&apos;échéance
            </label>
          </div>
        </form>
      </div>

      {/* ─── Le résumé de la période ─── */}
      {resume && resume.total > 0 && (
        <div className="adm-carte" style={{ marginBottom: 14 }}>
          <p className="adm-titre">
            Sur la période <span className="appoint">— {periode.label.toLowerCase()}</span>
          </p>
          <div className="carnet-resume">
            <div>
              <div className="n">{resume.total}</div>
              <div className="l">action{resume.total > 1 ? "s" : ""} menée{resume.total > 1 ? "s" : ""}</div>
            </div>
            {resume.minutes > 0 && (
              <div>
                <div className="n">{duree(resume.minutes)}</div>
                <div className="l">de travail noté</div>
              </div>
            )}
            {resume.parPersonne.map((p) => (
              <div key={p.nom}>
                <div className="n">{p.n}</div>
                <div className="l">
                  {p.nom}
                  {p.minutes ? ` · ${duree(p.minutes)}` : ""}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
            {resume.parCategorie.map((c) => {
              const cat = categorieAction(c.cle);
              return (
                <span
                  key={c.cle}
                  className="adm-tag"
                  style={{ background: `${cat.ton}1a`, color: cat.ton }}
                >
                  {cat.label} · {c.n}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Ce qui reste à faire ─── */}
      {prevues.length > 0 && (
        <div className="adm-carte" style={{ marginBottom: 14 }}>
          <p className="adm-titre">
            À faire <span className="appoint">— {prevues.length} en attente</span>
          </p>
          <div className="carnet-liste">
            {prevues.map((a) => (
              <Ligne key={a.id} a={a} modifiable={peutRetoucher(a, qui)} cochable={peutRetoucher(a, qui)} />
            ))}
          </div>
        </div>
      )}

      {/* ─── Filtres ─── */}
      <div className="adm-carte" style={{ marginBottom: 14, display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {PERIODES.map((p) => (
            <Link
              key={p.cle}
              href={lien({ periode: p.cle })}
              className={`adm-btn petit ${periodeCle === p.cle ? "" : "fantome"}`}
            >
              {p.label}
            </Link>
          ))}
        </div>
        {resume && resume.auteurs.length > 1 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <Link href={lien({ auteur: "" })} className={`adm-btn petit ${auteur ? "fantome" : ""}`}>
              Tout le monde
            </Link>
            {resume.auteurs.map((nom) => (
              <Link
                key={nom}
                href={lien({ auteur: nom })}
                className={`adm-btn petit ${auteur === nom ? "" : "fantome"}`}
              >
                {nom}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ─── Le carnet, jour après jour ─── */}
      {journees.length === 0 ? (
        <div className="adm-carte">
          <p className="adm-vide">
            Rien de noté sur cette période. La première ligne du carnet s&apos;écrit avec le
            formulaire ci-dessus.
          </p>
        </div>
      ) : (
        journees.map((j) => (
          <div className="adm-carte" key={j.jour} style={{ marginBottom: 12 }}>
            <p className="adm-titre" style={{ textTransform: "capitalize" }}>
              {j.jour === "—" ? "Sans date" : jourEnClair(j.jour)}{" "}
              <span className="appoint">
                — {j.lignes.length} action{j.lignes.length > 1 ? "s" : ""}
              </span>
            </p>
            <div className="carnet-liste">
              {j.lignes.map((a) => (
                <Ligne key={a.id} a={a} modifiable={peutRetoucher(a, qui)} cochable={false} />
              ))}
            </div>
          </div>
        ))
      )}
    </Cadre>
  );
}
