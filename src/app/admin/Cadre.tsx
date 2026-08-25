import Link from "next/link";
import DeconnexionBouton from "./DeconnexionBouton";
import { exigerIdentite } from "@/lib/crm/session";
import { peut, type Droit } from "@/lib/crm/utilisateurs";
import { compterEnAttente } from "@/lib/crm/temoignages";

/**
 * Coquille commune du tableau de bord : barre latérale, titre de page, contenu.
 *
 * La navigation est groupée par intention plutôt qu'à plat — on cherche « les
 * gens » ou « ce qu'on leur envoie », pas une liste alphabétique. Les entrées
 * qu'un rôle n'a pas le droit d'ouvrir ne s'affichent pas ; le contrôle réel se
 * fait dans chaque page, masquer un lien ne protège rien.
 */

type Icone =
  | "vue"
  | "contacts"
  | "questionnaire"
  | "rdv"
  | "stages"
  | "temoignages"
  | "parrainage"
  | "offres"
  | "sequences"
  | "campagnes"
  | "envois"
  | "comptes"
  | "journal";

function Trait({ nom }: { nom: Icone }) {
  const chemins: Record<Icone, React.ReactNode> = {
    vue: <path d="M3 12h4l2.5-7 3 14 2.5-7H21" />,
    contacts: (
      <>
        <circle cx="9" cy="8" r="3.2" />
        <path d="M3.5 19c.6-3.2 2.9-5 5.5-5s4.9 1.8 5.5 5" />
        <path d="M16 8.2a3 3 0 0 1 0 5.6M17.5 19c-.2-1.6-.7-2.9-1.5-3.9" />
      </>
    ),
    questionnaire: (
      <>
        <path d="M6 3h9l4 4v14H6z" />
        <path d="M9.5 12l1.8 1.8 3.4-3.6" />
      </>
    ),
    rdv: (
      <>
        <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
        <path d="M3.5 10h17M8 3.2v3.6M16 3.2v3.6" />
      </>
    ),
    stages: (
      <>
        <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" />
      </>
    ),
    temoignages: (
      <>
        <path d="M4 5.5h16v11H8l-4 3.5z" />
        <path d="M8 9h8M8 12h5" />
      </>
    ),
    parrainage: (
      <>
        <circle cx="7" cy="8" r="2.6" />
        <circle cx="16.5" cy="8" r="2.6" />
        <path d="M2.5 19c.5-2.8 2.3-4.3 4.5-4.3s4 1.5 4.5 4.3M12.5 19c.5-2.8 2.3-4.3 4.5-4.3s3.6 1.3 4.2 3.6" />
      </>
    ),
    offres: (
      <>
        <path d="M4 7.5h16v11H4z" />
        <path d="M8.5 7.5V6a3.5 3.5 0 0 1 7 0v1.5M9.5 13h5" />
      </>
    ),
    sequences: (
      <>
        <circle cx="6" cy="6.5" r="2.2" />
        <circle cx="6" cy="17.5" r="2.2" />
        <path d="M6 8.8v6.4M9 6.5h6.5a2.5 2.5 0 0 1 0 5H9M9 17.5h9" />
      </>
    ),
    campagnes: (
      <>
        <path d="M3.5 6.5h17v11h-17z" />
        <path d="M3.5 7.5l8.5 6 8.5-6" />
      </>
    ),
    envois: (
      <>
        <path d="M21 4L3 11l7 3 3 7z" />
        <path d="M10 14l4-4" />
      </>
    ),
    comptes: (
      <>
        <circle cx="12" cy="8" r="3.4" />
        <path d="M5 20c.7-3.7 3.4-5.6 7-5.6s6.3 1.9 7 5.6" />
      </>
    ),
    journal: (
      <>
        <path d="M5 4h11l3 3v13H5z" />
        <path d="M8.5 10h7M8.5 13.5h7M8.5 17h4" />
      </>
    ),
  };

  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {chemins[nom]}
    </svg>
  );
}

type Entree = { href: string; label: string; icone: Icone; droit?: Droit; pastille?: number };

const GROUPES: { titre: string; entrees: Entree[] }[] = [
  {
    titre: "Pilotage",
    entrees: [{ href: "/admin", label: "Vue d'ensemble", icone: "vue" }],
  },
  {
    titre: "Les gens",
    entrees: [
      { href: "/admin/contacts", label: "Contacts", icone: "contacts" },
      { href: "/admin/questionnaires", label: "Questionnaires", icone: "questionnaire" },
      { href: "/admin/rendez-vous", label: "Rendez-vous", icone: "rdv" },
      { href: "/admin/stages", label: "Stages", icone: "stages" },
      { href: "/admin/temoignages", label: "Témoignages", icone: "temoignages" },
      { href: "/admin/parrainage", label: "Parrainage & réveil", icone: "parrainage" },
    ],
  },
  {
    titre: "Vendre",
    entrees: [{ href: "/admin/offres", label: "Propositions", icone: "offres", droit: "offres" }],
  },
  {
    titre: "Ce qu'on leur envoie",
    entrees: [
      { href: "/admin/sequences", label: "Séquences", icone: "sequences", droit: "sequences" },
      { href: "/admin/campagnes", label: "Campagnes", icone: "campagnes", droit: "campagnes" },
      { href: "/admin/envois", label: "Envois", icone: "envois" },
    ],
  },
  {
    titre: "Réglages",
    entrees: [
      { href: "/admin/comptes", label: "Comptes", icone: "comptes", droit: "comptes" },
      { href: "/admin/journal", label: "Journal", icone: "journal", droit: "comptes" },
    ],
  },
];

export default async function Cadre({
  actif,
  titre,
  sousTitre,
  actions,
  children,
}: {
  actif: string;
  titre: string;
  sousTitre?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const qui = await exigerIdentite();
  const enAttente = await compterEnAttente();

  const groupes = GROUPES.map((g) => ({
    ...g,
    entrees: g.entrees
      .filter((e) => !e.droit || peut(qui.role, e.droit))
      .map((e) =>
        e.href === "/admin/temoignages" && enAttente > 0
          ? { ...e, pastille: enAttente }
          : e,
      ),
  })).filter((g) => g.entrees.length > 0);

  return (
    <div className="adm-shell">
      <aside className="adm-side">
        <div className="adm-brand">
          La Voie 2 la Conscience
          <span>Tableau de bord</span>
        </div>

        <nav className="adm-nav">
          {groupes.map((g) => (
            <div key={g.titre} style={{ display: "contents" }}>
              <p className="groupe">{g.titre}</p>
              {g.entrees.map((e) => (
                <Link
                  key={e.href}
                  href={e.href}
                  className={e.href === actif ? "actif" : ""}
                  aria-current={e.href === actif ? "page" : undefined}
                >
                  <Trait nom={e.icone} />
                  {e.label}
                  {e.pastille ? <span className="adm-pastille">{e.pastille}</span> : null}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="adm-pied">
          <p className="adm-qui">
            <strong>{qui.nom}</strong>
            {qui.principal ? "mot de passe principal" : qui.role}
          </p>
          <Link href="/" className="adm-btn fantome petit">
            Voir le site
          </Link>
          <DeconnexionBouton />
        </div>
      </aside>

      <main className="adm-main">
        <div className="adm-head">
          <div>
            <h1>{titre}</h1>
            {sousTitre && <p>{sousTitre}</p>}
          </div>
          {actions && <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>{actions}</div>}
        </div>
        {children}
      </main>
    </div>
  );
}
