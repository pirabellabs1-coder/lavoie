import Cadre from "../Cadre";
import { isDbConfigured } from "@/lib/crm/db";
import { listerSequences } from "@/lib/crm/sequences";
import { exigerDroit } from "@/lib/crm/session";
import { actionBasculer, actionMajEtape } from "./actions";

export const dynamic = "force-dynamic";

const DECLENCHEURS: Record<string, string> = {
  guide: "Quelqu'un télécharge le guide gratuit",
  lettres: "Quelqu'un s'inscrit aux Lettres",
  appel: "Quelqu'un remplit le formulaire de contact",
};

export default async function SequencesPage() {
  await exigerDroit("sequences");

  const sequences = isDbConfigured() ? await listerSequences() : [];

  return (
    <Cadre
      actif="/admin/sequences"
      titre="Séquences d'e-mails"
      sousTitre="Les messages qui partent tout seuls, et quand ils partent."
    >
      {!isDbConfigured() && (
        <div className="adm-alerte">
          <strong>La base de données n&apos;est pas encore branchée.</strong> Ajoutez la
          variable <code>DATABASE_URL</code> dans les réglages Vercel, puis redéployez :
          les trois séquences par défaut s&apos;installeront automatiquement.
        </div>
      )}

      <div className="adm-alerte" style={{ background: "#eef4ff", borderColor: "#c9d9f5", color: "#1a3a72" }}>
        Dans le sujet et le texte, <code>{"{{prenom}}"}</code> est remplacé par le prénom du
        destinataire. Le délai se compte en jours à partir du moment où la personne entre dans
        la séquence. Un lien de désinscription est ajouté automatiquement à chaque envoi.
      </div>

      {sequences.length === 0 && isDbConfigured() && (
        <div className="adm-carte">
          <p className="adm-vide">Aucune séquence.</p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {sequences.map((s) => (
          <div className="adm-carte" key={s.id}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 16,
                flexWrap: "wrap",
                alignItems: "flex-start",
                marginBottom: 16,
              }}
            >
              <div style={{ flex: 1, minWidth: 260 }}>
                <h2 style={{ fontSize: 17, margin: "0 0 6px" }}>
                  {s.nom}{" "}
                  <span
                    className="adm-tag"
                    data-s={s.active ? "client" : "perdu"}
                    style={{ verticalAlign: "middle", marginLeft: 6 }}
                  >
                    {s.active ? "Active" : "En pause"}
                  </span>
                </h2>
                <p style={{ margin: "0 0 6px", color: "var(--adm-mute)", fontSize: 13, lineHeight: 1.6 }}>
                  {s.description}
                </p>
                <p style={{ margin: 0, fontSize: 12, color: "var(--adm-mute)" }}>
                  <strong>Se déclenche quand :</strong> {DECLENCHEURS[s.declencheur] ?? s.declencheur}
                  {" · "}
                  <strong>{s.inscrits}</strong> personne{s.inscrits > 1 ? "s" : ""} en cours
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

            <div className="adm-etapes">
              {s.etapes.map((e) => (
                <form className="adm-etape" key={e.id} action={actionMajEtape}>
                  <input type="hidden" name="id" value={e.id} />
                  <header>
                    <span>Étape {e.ordre}</span>
                    <span>·</span>
                    <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      envoyé
                      <input
                        type="number"
                        name="delai_jours"
                        className="adm-champ"
                        defaultValue={e.delai_jours}
                        min={0}
                        max={365}
                        style={{ width: 72, padding: "4px 8px" }}
                      />
                      jour(s) après l&apos;entrée
                    </label>
                  </header>

                  <label className="adm-label">Sujet</label>
                  <input name="sujet" className="adm-champ" defaultValue={e.sujet} style={{ marginBottom: 10 }} />

                  <label className="adm-label">Message</label>
                  <textarea
                    name="corps"
                    className="adm-champ"
                    defaultValue={e.corps}
                    style={{ minHeight: 150 }}
                  />

                  <button type="submit" className="adm-btn petit" style={{ marginTop: 10 }}>
                    Enregistrer cette étape
                  </button>
                </form>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Cadre>
  );
}
