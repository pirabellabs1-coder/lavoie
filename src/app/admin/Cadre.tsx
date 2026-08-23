import Link from "next/link";
import DeconnexionBouton from "./DeconnexionBouton";

const LIENS = [
  { href: "/admin", label: "Vue d'ensemble" },
  { href: "/admin/contacts", label: "Contacts" },
  { href: "/admin/sequences", label: "Séquences" },
  { href: "/admin/campagnes", label: "Campagnes" },
  { href: "/admin/envois", label: "Envois" },
];

/** Coquille commune : barre latérale, titre de page et zone de contenu. */
export default function Cadre({
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
  return (
    <div className="adm-shell">
      <aside className="adm-side">
        <div className="adm-brand">
          La Voie 2 la Conscience
          <span>Tableau de bord</span>
        </div>
        <nav className="adm-nav">
          {LIENS.map((l) => (
            <Link key={l.href} href={l.href} className={l.href === actif ? "actif" : ""}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div style={{ marginTop: "auto", paddingTop: 18 }}>
          <Link
            href="/"
            className="adm-btn fantome petit"
            style={{ width: "100%", justifyContent: "center", marginBottom: 8 }}
          >
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
