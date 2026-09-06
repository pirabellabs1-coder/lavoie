import Cadre from "../Cadre";
import { isDbConfigured } from "@/lib/crm/db";
import { exigerDroit } from "@/lib/crm/session";
import { listerJournal } from "@/lib/crm/journal";
import { enClair } from "@/lib/heure";

export const dynamic = "force-dynamic";

/** Libellés lisibles des actions tracées. */
const LIBELLES: Record<string, string> = {
  connexion: "Connexion",
  statut: "Changement de statut",
  export_csv: "Export du fichier contacts",
  sauvegarde: "Téléchargement d'une sauvegarde",
  offre_creee: "Proposition préparée",
  offre_envoyee: "Proposition envoyée",
  campagne_creee: "Campagne créée",
  compte_cree: "Compte créé",
  compte_invite: "Invitation envoyée à un collaborateur",
  compte_active: "Compte activé par son titulaire",
  compte_bascule: "Accès d'un compte modifié",
  compte_mdp: "Mot de passe d'un compte changé",
  rgpd_acces: "Accès RGPD (téléchargement)",
  rgpd_effacement: "Effacement RGPD",
  sequence_ajout_manuel: "Personnes ajoutées à la main dans une séquence",
  sequence_ajout_masse: "Ajout en masse dans une séquence",
  sequence_ajout_fiche: "Personne ajoutée à une séquence depuis sa fiche",
  sequence_retrait: "Personne retirée d'une séquence",
  contact_cree: "Fiche créée à la main",
  fichier_vide: "Fichier remis à zéro",
  sauvegarde_restauree: "Sauvegarde restaurée",
};

type Params = Promise<Record<string, string | string[] | undefined>>;

export default async function JournalPage({ searchParams }: { searchParams: Params }) {
  await exigerDroit("comptes");

  const params = await searchParams;
  const recherche = typeof params.q === "string" ? params.q : "";
  const lignes = isDbConfigured() ? await listerJournal({ recherche }) : [];

  return (
    <Cadre
      actif="/admin/journal"
      titre="Journal"
      sousTitre="Qui a fait quoi, et quand. Les actions qui touchent aux données et à l'argent."
    >
      {!isDbConfigured() && (
        <div className="adm-alerte">
          <strong>La base de données n&apos;est pas encore branchée.</strong> Ajoutez la
          variable <code>DATABASE_URL</code> dans les réglages Vercel, puis redéployez.
        </div>
      )}

      <form method="get" style={{ marginBottom: 14 }}>
        <input
          type="search"
          name="q"
          defaultValue={recherche}
          className="adm-champ"
          placeholder="Rechercher un nom, une action…"
          style={{ maxWidth: 320 }}
        />
      </form>

      <div className="adm-carte">
        {lignes.length === 0 ? (
          <p className="adm-vide">
            {recherche ? "Aucune entrée pour cette recherche." : "Aucune action enregistrée pour l'instant."}
          </p>
        ) : (
          <div className="adm-table-scroll">
            <table className="adm-t">
              <thead>
                <tr>
                  <th>Quand</th>
                  <th>Qui</th>
                  <th>Action</th>
                  <th>Détail</th>
                </tr>
              </thead>
              <tbody>
                {lignes.map((l) => (
                  <tr key={l.id}>
                    <td style={{ whiteSpace: "nowrap", color: "var(--adm-mute)" }}>
                      {enClair(l.cree_le)}
                    </td>
                    <td>{l.acteur_nom}</td>
                    <td>{LIBELLES[l.action] ?? l.action}</td>
                    <td style={{ color: "var(--adm-mute)", fontSize: 12.5 }}>
                      {[l.cible, l.details].filter(Boolean).join(" — ") || "—"}
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
