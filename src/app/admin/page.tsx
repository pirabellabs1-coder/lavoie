import Link from "next/link";
import Cadre from "./Cadre";
import { Barres, CourbeInscriptions, Entonnoir, Jauge, Tuile } from "./Graphes";
import { isDbConfigured } from "@/lib/crm/db";
import {
  STATUTS,
  STATUT_LABEL,
  listerContacts,
  nomAffiche,
  statistiques,
} from "@/lib/crm/contacts";
import { exigerIdentite } from "@/lib/crm/session";
import { peut } from "@/lib/crm/utilisateurs";
import { derniereSauvegarde } from "@/lib/crm/sauvegarde";
import { enClair } from "@/lib/heure";

export const dynamic = "force-dynamic";

function dateCourte(d: Date | string): string {
  const v = d instanceof Date ? d : new Date(d);
  return v.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

function taux(part: number, total: number): number {
  return total ? Math.round((part / total) * 100) : 0;
}

type Params = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminAccueil({ searchParams }: { searchParams: Params }) {
  const qui = await exigerIdentite();
  const params = await searchParams;
  const refuse = params.refuse === "1";

  const stats = await statistiques();
  const derniers = await listerContacts({ limite: 8 });
  const sauvegarde = peut(qui.role, "sauvegarde") ? await derniereSauvegarde() : null;

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

  const evolution =
    stats.nouveaux30jAvant > 0
      ? ((stats.nouveaux30j - stats.nouveaux30jAvant) / stats.nouveaux30jAvant) * 100
      : null;

  // Douze points hebdomadaires pour l'esquisse : la courbe complète est en dessous.
  const esquisse = stats.parJour
    .slice(-24)
    .reduce<number[]>((acc, jour, i) => {
      const bloc = Math.floor(i / 2);
      acc[bloc] = (acc[bloc] ?? 0) + jour.n;
      return acc;
    }, []);

  const entonnoir = STATUTS.filter((s) => s.cle !== "perdu").map((s) => ({
    cle: s.cle,
    label: s.label,
    n: stats.parStatut[s.cle] ?? 0,
  }));

  const tauxOuverture = taux(stats.ouverts30j, stats.envoyes30j);

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
      {refuse && (
        <div className="adm-alerte">
          Cette page est réservée. Si vous pensez qu&apos;elle devrait vous être ouverte,
          demandez à Domoïna de changer votre rôle.
        </div>
      )}

      <div className="adm-grille adm-g4" style={{ marginBottom: 14 }}>
        <Tuile
          label="Contacts"
          valeur={stats.total}
          detail={`${stats.actifs} joignables · ${stats.desabonnes} désabonnés`}
        />
        <Tuile
          label="Nouveaux sur 30 jours"
          valeur={stats.nouveaux30j}
          detail={`dont ${stats.nouveaux7j} cette semaine`}
          delta={evolution}
          serie={esquisse}
        />
        <Tuile
          label="Clients"
          valeur={stats.parStatut.client ?? 0}
          detail={`${taux(stats.parStatut.client ?? 0, stats.total)} % des contacts`}
        />
        <Tuile
          label="E-mails sur 30 jours"
          valeur={stats.envoyes30j}
          detail={
            stats.envoyes30j
              ? `${tauxOuverture} % ouverts · ${taux(stats.cliques30j, stats.envoyes30j)} % cliqués`
              : "aucun envoi sur la période"
          }
        />
      </div>

      <div className="adm-grille adm-g-large" style={{ marginBottom: 14 }}>
        <div className="adm-carte">
          <p className="adm-titre">
            Inscriptions jour par jour{" "}
            <span className="appoint">— trente derniers jours</span>
          </p>
          <CourbeInscriptions points={stats.parJour} />
        </div>

        <div className="adm-carte">
          <p className="adm-titre">Le parcours</p>
          <Entonnoir etages={entonnoir} />
          <p style={{ color: "var(--adm-mute)", fontSize: 12, margin: "16px 0 0", lineHeight: 1.6 }}>
            {stats.parStatut.perdu ?? 0} personne{(stats.parStatut.perdu ?? 0) > 1 ? "s" : ""} sans
            suite, hors entonnoir.
          </p>
        </div>
      </div>

      <div className="adm-grille adm-g3" style={{ marginBottom: 14 }}>
        <div className="adm-carte">
          <p className="adm-titre">D&apos;où ils viennent</p>
          <Barres
            lignes={stats.parSource.map((s) => ({ nom: s.source, n: s.n }))}
            vide="Aucune source enregistrée pour l'instant."
          />
        </div>

        <div className="adm-carte">
          <p className="adm-titre">Questionnaires</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: 12.5, color: "var(--adm-ink-2)" }}>Reçus sur 30 jours</span>
                <span style={{ fontWeight: 650, fontVariantNumeric: "tabular-nums" }}>
                  {stats.questionnaires30j}
                </span>
              </div>
              <div style={{ marginTop: 8 }}>
                <Jauge part={taux(stats.eligibles30j, stats.questionnaires30j)} />
              </div>
              <p style={{ color: "var(--adm-mute)", fontSize: 12, margin: "8px 0 0" }}>
                {stats.eligibles30j} éligible{stats.eligibles30j > 1 ? "s" : ""} à l&apos;entretien,
                soit {taux(stats.eligibles30j, stats.questionnaires30j)} % des copies.
              </p>
            </div>

            <div style={{ borderTop: "1px solid var(--adm-line)", paddingTop: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: 12.5, color: "var(--adm-ink-2)" }}>
                  Prérequis en attente
                </span>
                <span
                  style={{
                    fontWeight: 650,
                    fontVariantNumeric: "tabular-nums",
                    color: stats.prerequisEnAttente > 0 ? "var(--adm-warn)" : "inherit",
                  }}
                >
                  {stats.prerequisEnAttente}
                </span>
              </div>
              <p style={{ color: "var(--adm-mute)", fontSize: 12, margin: "6px 0 0", lineHeight: 1.6 }}>
                Personnes déclarées éligibles qui n&apos;ont pas encore confirmé la vidéo et le
                livret.
              </p>
            </div>
          </div>
        </div>

        <div className="adm-carte">
          <p className="adm-titre">Les jours qui viennent</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <span className="l" style={{ color: "var(--adm-mute)", fontSize: 12.5 }}>
                Rendez-vous sous sept jours
              </span>
              <div style={{ fontSize: 26, fontWeight: 650, letterSpacing: "-.02em" }}>
                {stats.rdv7j}
              </div>
            </div>
            <div style={{ borderTop: "1px solid var(--adm-line)", paddingTop: 14 }}>
              <span style={{ color: "var(--adm-mute)", fontSize: 12.5 }}>
                E-mails automatiques en attente
              </span>
              <div style={{ fontSize: 26, fontWeight: 650, letterSpacing: "-.02em" }}>
                {stats.enAttente}
              </div>
              {stats.echecs30j > 0 && (
                <p style={{ color: "var(--adm-bad)", fontSize: 12, margin: "8px 0 0" }}>
                  {stats.echecs30j} envoi{stats.echecs30j > 1 ? "s" : ""} en échec sur 30 jours.
                </p>
              )}
            </div>
            <Link href="/admin/rendez-vous" className="adm-btn fantome petit">
              Voir les rendez-vous
            </Link>
          </div>
        </div>
      </div>

      {sauvegarde !== null && (
        <div className="adm-carte" style={{ marginBottom: 14 }}>
          <p className="adm-titre">Sauvegarde</p>
          <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 320px", lineHeight: 1.6 }}>
              Dernière copie le <strong>{enClair(sauvegarde.cree_le)}</strong> —{" "}
              {sauvegarde.contacts_n} contacts, {Math.round(sauvegarde.taille / 1024)} Ko
              {sauvegarde.envoyee ? ", envoyée par e-mail" : ", non envoyée par e-mail"}.
              <span style={{ display: "block", color: "var(--adm-mute)", fontSize: 12, marginTop: 4 }}>
                Une copie part chaque jour par e-mail, sauf si rien n&apos;a changé depuis la
                veille.
              </span>
            </div>
            <a href="/api/admin/sauvegarde" className="adm-btn fantome">
              Télécharger maintenant
            </a>
          </div>
        </div>
      )}

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
                    <td>
                      <Link href={`/admin/contacts/${c.id}`}>{nomAffiche(c)}</Link>
                    </td>
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
