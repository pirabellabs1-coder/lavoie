import Link from "next/link";
import Cadre from "../Cadre";
import { isDbConfigured } from "@/lib/crm/db";
import { STATUTS, STATUT_LABEL, listerContacts, nomAffiche } from "@/lib/crm/contacts";

export const dynamic = "force-dynamic";

function dateCourte(d: Date | string): string {
  const v = d instanceof Date ? d : new Date(d);
  return v.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "2-digit" });
}

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; statut?: string }>;
}) {
  const { q, statut } = await searchParams;
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
        <a href="/api/admin/export" className="adm-btn fantome">
          Exporter en CSV
        </a>
      }
    >
      {!isDbConfigured() && (
        <div className="adm-alerte">
          <strong>La base de données n&apos;est pas encore branchée.</strong> Ajoutez la
          variable <code>DATABASE_URL</code> dans les réglages Vercel, puis redéployez.
        </div>
      )}

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
