import Link from "next/link";
import Cadre from "../Cadre";
import { isDbConfigured } from "@/lib/crm/db";
import { STATUTS, STATUT_LABEL, listerContacts, nomAffiche } from "@/lib/crm/contacts";
import { groupesManuels } from "@/lib/crm/categories";
import { exigerIdentite } from "@/lib/crm/session";
import { peut } from "@/lib/crm/utilisateurs";
import { actionCreerContact } from "./actions";

export const dynamic = "force-dynamic";

function dateCourte(d: Date | string): string {
  const v = d instanceof Date ? d : new Date(d);
  return v.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "2-digit" });
}

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; statut?: string; erreur?: string }>;
}) {
  const { q, statut, erreur } = await searchParams;
  const qui = await exigerIdentite();
  const automate = peut(qui.role, "sequences");
  const contacts = isDbConfigured()
    ? await listerContacts({ recherche: q, statut, limite: 500 })
    : [];

  return (
    <Cadre
      actif="/admin/contacts"
      titre="Contacts"
      sousTitre={
        isDbConfigured()
          ? `${contacts.length} résultat${contacts.length > 1 ? "s" : ""}`
          : undefined
      }
      actions={
        <>
          <a href="#ajouter" className="adm-btn">Ajouter une personne</a>
          <a href="/api/admin/export" className="adm-btn fantome">
            Exporter en CSV
          </a>
        </>
      }
    >
      {!isDbConfigured() && (
        <div className="adm-alerte">
          <strong>La base de données n&apos;est pas encore branchée.</strong> Ajoutez la
          variable <code>DATABASE_URL</code> dans les réglages Vercel, puis redéployez.
        </div>
      )}

      {/* ─── Ajouter quelqu'un à la main ─── */}
      <div className="adm-carte" id="ajouter" style={{ marginBottom: 16 }}>
        <details className="seq-edit seq-ajout" open={Boolean(erreur)}>
          <summary>Ajouter une personne</summary>

          {erreur && (
            <div className="adm-alerte" style={{ margin: "10px 0" }}>
              {erreur}
            </div>
          )}

          <p className="seq-ajout-aide">
            Pour quelqu&apos;un rencontré hors du site : un stage, un appel, une adresse
            notée sur un carnet. Une adresse déjà connue n&apos;est jamais dupliquée — sa
            fiche est complétée, et vous arrivez dessus.
          </p>

          <form action={actionCreerContact} style={{ marginTop: 12 }}>
            <div className="contact-neuf">
              <label>
                <span className="adm-label">Prénom</span>
                <input name="prenom" className="adm-champ" maxLength={80} />
              </label>
              <label>
                <span className="adm-label">Nom</span>
                <input name="nom" className="adm-champ" maxLength={80} />
              </label>
              <label>
                <span className="adm-label">E-mail *</span>
                <input
                  name="email"
                  type="email"
                  required
                  className="adm-champ"
                  maxLength={254}
                  placeholder="marie@exemple.fr"
                />
              </label>
              <label>
                <span className="adm-label">Téléphone</span>
                <input name="telephone" className="adm-champ" maxLength={40} />
              </label>
              <label>
                <span className="adm-label">Statut</span>
                <select name="statut" className="adm-champ" defaultValue="nouveau">
                  {STATUTS.map((s) => (
                    <option key={s.cle} value={s.cle}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="adm-label">Source</span>
                <input
                  name="source"
                  className="adm-champ"
                  maxLength={120}
                  placeholder="Stage automne, salon…"
                />
              </label>
            </div>

            <label style={{ display: "block", marginTop: 12 }}>
              <span className="adm-label">Ce qu&apos;il faut retenir</span>
              <textarea
                name="note"
                rows={2}
                className="adm-champ"
                maxLength={2000}
                placeholder="Où vous l'avez rencontrée, ce qu'elle cherche…"
                style={{ resize: "vertical" }}
              />
            </label>

            {automate ? (
              <>
                <label style={{ display: "block", marginTop: 12 }}>
                  <span className="adm-label">L&apos;inscrire dans une catégorie</span>
                  <select name="categorie" className="adm-champ" defaultValue="">
                    <option value="">Ne l&apos;inscrire à aucune séquence</option>
                    {groupesManuels().map((g) => (
                      <optgroup key={g.titre} label={g.titre}>
                        {g.cats.map((c) => (
                          <option key={c.cle} value={c.cle}>
                            {c.cat}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </label>
                <p className="seq-ajout-note" style={{ margin: "6px 0 0" }}>
                  Une catégorie choisie décide du statut et de la source à la place des
                  champs ci-dessus, et lance sa séquence d&apos;e-mails. Sans catégorie, la
                  fiche est simplement créée et rien ne part.
                </p>
                <label className="seq-ajout-accord">
                  <input type="checkbox" name="accord" />
                  <span>
                    Cette personne a accepté de recevoir ces e-mails — à cocher seulement si
                    vous choisissez une catégorie. L&apos;accord est consigné dans sa
                    chronologie avec votre nom.
                  </span>
                </label>
              </>
            ) : (
              <p className="seq-ajout-note" style={{ marginTop: 12 }}>
                La fiche est créée sans qu&apos;aucun e-mail ne parte.
              </p>
            )}

            <button type="submit" className="adm-btn" style={{ marginTop: 4 }}>
              Enregistrer cette personne
            </button>
          </form>
        </details>
      </div>

      <form className="adm-carte" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <label className="adm-label" htmlFor="q">Rechercher</label>
            <input
              id="q"
              name="q"
              className="adm-champ"
              defaultValue={q ?? ""}
              placeholder="Nom, prénom ou e-mail"
            />
          </div>
          <div style={{ minWidth: 180 }}>
            <label className="adm-label" htmlFor="statut">Statut</label>
            <select id="statut" name="statut" className="adm-champ" defaultValue={statut ?? ""}>
              <option value="">Tous</option>
              {STATUTS.map((s) => (
                <option key={s.cle} value={s.cle}>{s.label}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="adm-btn">Filtrer</button>
          {(q || statut) && (
            <Link href="/admin/contacts" className="adm-btn fantome">Réinitialiser</Link>
          )}
        </div>
      </form>

      <div className="adm-carte">
        {contacts.length === 0 ? (
          <p className="adm-vide">
            {q || statut
              ? "Aucun contact ne correspond à cette recherche."
              : "Aucun contact enregistré pour l'instant."}
          </p>
        ) : (
          <div className="adm-table-scroll">
            <table className="adm-t">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>E-mail</th>
                  <th>Téléphone</th>
                  <th>Source</th>
                  <th>Intérêt</th>
                  <th>Statut</th>
                  <th>Arrivé le</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <Link href={`/admin/contacts/${c.id}`}>{nomAffiche(c)}</Link>
                      {c.desabonne_le && (
                        <div style={{ fontSize: 11, color: "var(--adm-bad)", marginTop: 2 }}>
                          désabonné
                        </div>
                      )}
                    </td>
                    <td style={{ color: "var(--adm-mute)" }}>{c.email}</td>
                    <td style={{ color: "var(--adm-mute)" }}>{c.telephone || "—"}</td>
                    <td style={{ color: "var(--adm-mute)" }}>{c.source || "—"}</td>
                    <td style={{ color: "var(--adm-mute)" }}>{c.interet || "—"}</td>
                    <td>
                      <span className="adm-tag" data-s={c.statut}>
                        {STATUT_LABEL[c.statut] ?? c.statut}
                      </span>
                    </td>
                    <td style={{ color: "var(--adm-mute)", whiteSpace: "nowrap" }}>
                      {dateCourte(c.cree_le)}
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
