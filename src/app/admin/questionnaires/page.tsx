import Link from "next/link";
import Cadre from "../Cadre";
import { isDbConfigured } from "@/lib/crm/db";
import { exigerIdentite } from "@/lib/crm/session";
import { listerQuestionnaires } from "@/lib/crm/questionnaires";
import { SEUIL_ELIGIBILITE } from "@/lib/questionnaire";
import { enClair } from "@/lib/heure";

export const dynamic = "force-dynamic";

type Params = Promise<Record<string, string | string[] | undefined>>;

const FILTRES = [
  { cle: "", label: "Tous" },
  { cle: "eligibles", label: "Éligibles" },
  { cle: "attente", label: "Prérequis en attente" },
];

function nomAffiche(l: { prenom: string | null; nom: string | null; email: string }): string {
  return [l.prenom, l.nom].filter(Boolean).join(" ").trim() || l.email;
}

export default async function QuestionnairesPage({ searchParams }: { searchParams: Params }) {
  await exigerIdentite();

  const params = await searchParams;
  const brut = Array.isArray(params.filtre) ? params.filtre[0] : params.filtre;
  const filtre = brut === "eligibles" || brut === "attente" ? brut : undefined;

  const copies = isDbConfigured() ? await listerQuestionnaires(filtre) : [];

  return (
    <Cadre
      actif="/admin/questionnaires"
      titre="Questionnaires"
      sousTitre={`Les copies reçues, notées sur 100. Au-dessus de ${SEUIL_ELIGIBILITE}, l'entretien est proposé.`}
      actions={
        <a href="/questionnaire" target="_blank" rel="noopener noreferrer" className="adm-btn fantome">
          Ouvrir le formulaire
        </a>
      }
    >
      {!isDbConfigured() && (
        <div className="adm-alerte">
          <strong>La base de données n&apos;est pas encore branchée.</strong> Ajoutez la
          variable <code>DATABASE_URL</code> dans les réglages Vercel, puis redéployez.
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        {FILTRES.map((f) => (
          <Link
            key={f.cle}
            href={f.cle ? `/admin/questionnaires?filtre=${f.cle}` : "/admin/questionnaires"}
            className={`adm-btn petit ${(filtre ?? "") === f.cle ? "" : "fantome"}`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="adm-carte">
        {copies.length === 0 ? (
          <p className="adm-vide">
            Aucun questionnaire pour l&apos;instant. Partagez l&apos;adresse du formulaire pour
            commencer à en recevoir.
          </p>
        ) : (
          <div className="adm-table-scroll">
            <table className="adm-t">
              <thead>
                <tr>
                  <th>Personne</th>
                  <th className="num">Score</th>
                  <th>Verdict</th>
                  <th>Prérequis</th>
                  <th>Rendez-vous</th>
                  <th>Reçu le</th>
                </tr>
              </thead>
              <tbody>
                {copies.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <Link href={`/admin/contacts/${c.contact_id}`}>{nomAffiche(c)}</Link>
                      <div style={{ fontSize: 11.5, color: "var(--adm-mute)", marginTop: 2 }}>
                        {c.email}
                      </div>
                    </td>
                    <td className="num" style={{ fontWeight: 650 }}>
                      {c.score}
                    </td>
                    <td>
                      <span className="adm-tag" data-s={c.eligible ? "client" : "nouveau"}>
                        {c.eligible ? "Éligible" : "À orienter"}
                      </span>
                    </td>
                    <td>
                      {!c.eligible ? (
                        <span style={{ color: "var(--adm-mute)" }}>—</span>
                      ) : c.prerequis_le ? (
                        <span style={{ color: "var(--adm-ok)" }}>
                          confirmés le {enClair(c.prerequis_le)}
                        </span>
                      ) : c.annule_le ? (
                        <span style={{ color: "var(--adm-bad)" }}>annulé</span>
                      ) : (
                        <span style={{ color: "var(--adm-warn)" }}>en attente</span>
                      )}
                    </td>
                    <td style={{ whiteSpace: "nowrap", color: "var(--adm-mute)" }}>
                      {c.rdv_le ? enClair(c.rdv_le) : "non fixé"}
                    </td>
                    <td style={{ whiteSpace: "nowrap", color: "var(--adm-mute)" }}>
                      {enClair(c.cree_le)}
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
