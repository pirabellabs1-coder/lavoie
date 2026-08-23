import Link from "next/link";
import Cadre from "./Cadre";
import { isDbConfigured } from "@/lib/crm/db";
import {
  STATUTS,
  STATUT_LABEL,
  listerContacts,
  nomAffiche,
  statistiques,
} from "@/lib/crm/contacts";

export const dynamic = "force-dynamic";

function dateCourte(d: Date | string): string {
  const v = d instanceof Date ? d : new Date(d);
  return v.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

export default async function AdminAccueil() {
  const stats = await statistiques();
  const derniers = await listerContacts({ limite: 8 });

  if (!isDbConfigured() || !stats) {
    return (
      <Cadre actif="/admin" titre="Vue d'ensemble">
        <div className="adm-alerte">
          <strong>La base de données n&apos;est pas encore branchée.</strong>
          <br />
          Le site fonctionne normalement et les formulaires continuent d&apos;envoyer leurs
          notifications par e-mail — mais rien n&apos;est encore enregistré ni automatisé.
          Ajoutez la variable <code>DATABASE_URL</code> dans les réglages Vercel du projet,
          puis redéployez : les tables se créent toutes seules au premier chargement.
        </div>
      </Cadre>
    );
  }

  const max = Math.max(1, ...stats.parJour.map((j) => j.n));
  const maxEntonnoir = Math.max(1, ...STATUTS.map((s) => stats.parStatut[s.cle] ?? 0));
  const tauxClient = stats.total ? Math.round((stats.parStatut.client / stats.total) * 100) : 0;

  return (
    <Cadre
      actif="/admin"
      titre="Vue d'ensemble"
      sousTitre="Ce que fait votre site, en un coup d'œil."
      actions={
        <Link href="/admin/contacts" className="adm-btn">
          Voir tous les contacts
        </Link>
      }
    >
      <div className="adm-grille adm-g4" style={{ marginBottom: 18 }}>
        <div className="adm-carte adm-kpi">
          <div className="n">{stats.total}</div>
          <div className="l">Contacts au total</div>
          <div className="s">{stats.actifs} joignables · {stats.desabonnes} désabonnés</div>
        </div>
        <div className="adm-carte adm-kpi">
          <div className="n">{stats.nouveaux7j}</div>
          <div className="l">Nouveaux sur 7 jours</div>
          <div className="s">{stats.nouveaux30j} sur 30 jours</div>
        </div>
        <div className="adm-carte adm-kpi">
          <div className="n">{stats.parStatut.client ?? 0}</div>
          <div className="l">Clients</div>
          <div className="s">{tauxClient}% des contacts</div>
        </div>
        <div className="adm-carte adm-kpi">
          <div className="n">{stats.envoyes30j}</div>
          <div className="l">E-mails envoyés (30 j)</div>
          <div className="s">
            {stats.enAttente} en attente
            {stats.echecs30j > 0 && (
              <> · <span style={{ color: "var(--adm-bad)" }}>{stats.echecs30j} en échec</span></>
            )}
          </div>
        </div>
      </div>

      <div className="adm-grille adm-g2" style={{ marginBottom: 18 }}>
        <div className="adm-carte">
          <p className="adm-titre">Le parcours, du premier contact au client</p>
          <div className="adm-entonnoir">
            {STATUTS.map((s) => {
              const n = stats.parStatut[s.cle] ?? 0;
              return (
                <div className="adm-etage" key={s.cle}>
                  <span className="nom" title={s.aide}>{s.label}</span>
                  <span className="barre">
                    <i style={{ width: `${Math.round((n / maxEntonnoir) * 100)}%` }} />
                  </span>
                  <span className="val">{n}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="adm-carte">
          <p className="adm-titre">Inscriptions des 30 derniers jours</p>
          <div className="adm-histo">
            {stats.parJour.map((j) => (
              <div
                key={j.jour}
                style={{ height: `${Math.max(2, Math.round((j.n / max) * 100))}%` }}
                title={`${j.jour} — ${j.n} inscription${j.n > 1 ? "s" : ""}`}
              />
            ))}
          </div>
          <p style={{ color: "var(--adm-mute)", fontSize: 12, margin: "10px 0 22px" }}>
            {stats.nouveaux30j} au total sur la période · pic à {max} en une journée
          </p>

          <p className="adm-titre">D&apos;où viennent-ils</p>
          {stats.parSource.length === 0 ? (
            <p style={{ color: "var(--adm-mute)", fontSize: 13, margin: 0 }}>Aucune donnée.</p>
          ) : (
            <div className="adm-entonnoir">
              {stats.parSource.map((s) => {
                const maxS = Math.max(1, ...stats.parSource.map((x) => x.n));
                return (
                  <div className="adm-etage" key={s.source}>
                    <span className="nom">{s.source}</span>
                    <span className="barre">
                      <i style={{ width: `${Math.round((s.n / maxS) * 100)}%`, background: "var(--adm-gold)" }} />
                    </span>
                    <span className="val">{s.n}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="adm-carte">
        <p className="adm-titre">Derniers arrivés</p>
        {derniers.length === 0 ? (
          <p className="adm-vide">
            Personne pour l&apos;instant. Les inscriptions apparaîtront ici automatiquement.
          </p>
        ) : (
          <div className="adm-table-scroll">
            <table className="adm-t">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>E-mail</th>
                  <th>Source</th>
                  <th>Statut</th>
                  <th>Arrivé le</th>
                </tr>
              </thead>
              <tbody>
                {derniers.map((c) => (
                  <tr key={c.id}>
                    <td><Link href={`/admin/contacts/${c.id}`}>{nomAffiche(c)}</Link></td>
                    <td style={{ color: "var(--adm-mute)" }}>{c.email}</td>
                    <td style={{ color: "var(--adm-mute)" }}>{c.source || "—"}</td>
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
