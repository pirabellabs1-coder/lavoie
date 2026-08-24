import Link from "next/link";
import Cadre from "../Cadre";
import { isDbConfigured } from "@/lib/crm/db";
import { exigerIdentite } from "@/lib/crm/session";
import { listerTemoignages, type Temoignage } from "@/lib/crm/temoignages";
import { enClair } from "@/lib/heure";
import { actionStatutTemoignage, actionSupprimerTemoignage } from "./actions";

export const dynamic = "force-dynamic";

const ETATS: Record<string, { texte: string; ton: string }> = {
  attente: { texte: "En attente", ton: "contacte" },
  publie: { texte: "Publié", ton: "client" },
  masque: { texte: "Masqué", ton: "perdu" },
};

const FILTRES = [
  { cle: "attente", label: "En attente" },
  { cle: "publie", label: "Publiés" },
  { cle: "masque", label: "Masqués" },
  { cle: "", label: "Tous" },
];

/** Les suites possibles selon l'état d'un témoignage. */
function suites(statut: string): { statut: string; libelle: string; primaire?: boolean }[] {
  switch (statut) {
    case "attente":
      return [
        { statut: "publie", libelle: "Publier", primaire: true },
        { statut: "masque", libelle: "Écarter" },
      ];
    case "publie":
      return [{ statut: "masque", libelle: "Retirer du site" }];
    case "masque":
      return [{ statut: "publie", libelle: "Publier", primaire: true }];
    default:
      return [];
  }
}

function Etoiles({ note }: { note: number }) {
  return (
    <span style={{ color: "var(--adm-gold)", letterSpacing: 1 }} aria-label={`${note} sur 5`}>
      {"★".repeat(note)}
      <span style={{ color: "var(--adm-line-fort)" }}>{"★".repeat(5 - note)}</span>
    </span>
  );
}

export default async function TemoignagesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await exigerIdentite();

  const params = await searchParams;
  const brut = Array.isArray(params.filtre) ? params.filtre[0] : params.filtre;
  const filtre = brut === undefined ? "attente" : brut;

  const branchee = isDbConfigured();
  const temoignages: Temoignage[] = branchee ? await listerTemoignages(filtre || undefined) : [];

  return (
    <Cadre
      actif="/admin/temoignages"
      titre="Témoignages"
      sousTitre="Les témoignages déposés depuis le site. Rien n'est en ligne avant votre validation."
      actions={
        <a href="/temoignages" target="_blank" rel="noopener noreferrer" className="adm-btn fantome">
          Voir la page publique
        </a>
      }
    >
      {!branchee && (
        <div className="adm-alerte">
          <strong>La base de données n&apos;est pas encore branchée.</strong> Ajoutez la
          variable <code>DATABASE_URL</code> dans les réglages Vercel, puis redéployez.
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        {FILTRES.map((f) => (
          <Link
            key={f.cle || "tous"}
            href={f.cle ? `/admin/temoignages?filtre=${f.cle}` : "/admin/temoignages?filtre="}
            className={`adm-btn petit ${filtre === f.cle ? "" : "fantome"}`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {temoignages.length === 0 ? (
        <div className="adm-carte">
          <p className="adm-vide">
            {filtre === "attente"
              ? "Aucun témoignage en attente. Ils arriveront ici dès qu'une personne en dépose un sur le site."
              : "Rien à afficher pour ce filtre."}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {temoignages.map((t) => (
            <div className="adm-carte" key={t.id}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "baseline", flexWrap: "wrap" }}>
                <div>
                  <strong>{t.nom}</strong>
                  {t.contexte && (
                    <span style={{ color: "var(--adm-mute)", fontSize: 12.5 }}> · {t.contexte}</span>
                  )}
                  {t.note != null && (
                    <span style={{ marginLeft: 10 }}>
                      <Etoiles note={t.note} />
                    </span>
                  )}
                </div>
                <span className="adm-tag" data-s={(ETATS[t.statut] ?? ETATS.attente).ton}>
                  {(ETATS[t.statut] ?? { texte: t.statut }).texte}
                </span>
              </div>

              <p style={{ margin: "12px 0 14px", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                {t.texte}
              </p>

              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ fontSize: 11.5, color: "var(--adm-mute)" }}>
                  déposé le {enClair(t.cree_le)}
                  {t.contact_id && (
                    <>
                      {" · "}
                      <Link href={`/admin/contacts/${t.contact_id}`}>fiche du contact</Link>
                    </>
                  )}
                </span>
                <span style={{ flex: 1 }} />
                {suites(t.statut).map((suite) => (
                  <form action={actionStatutTemoignage} key={suite.statut}>
                    <input type="hidden" name="id" value={t.id} />
                    <input type="hidden" name="statut" value={suite.statut} />
                    <button type="submit" className={`adm-btn petit ${suite.primaire ? "" : "fantome"}`}>
                      {suite.libelle}
                    </button>
                  </form>
                ))}
                <form action={actionSupprimerTemoignage}>
                  <input type="hidden" name="id" value={t.id} />
                  <button
                    type="submit"
                    className="adm-btn fantome petit"
                    style={{ color: "var(--adm-bad)" }}
                  >
                    Supprimer
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}

      <p style={{ color: "var(--adm-mute)", fontSize: 12, marginTop: 16, lineHeight: 1.7 }}>
        Publier un témoignage le met en ligne immédiatement, en tête de la page. Le retirer
        le masque sans le supprimer. La suppression, elle, est définitive — à réserver aux
        doublons et aux dépôts indésirables.
      </p>
    </Cadre>
  );
}
