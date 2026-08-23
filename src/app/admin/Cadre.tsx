import Link from "next/link";
import DeconnexionBouton from "./DeconnexionBouton";
import { exigerIdentite } from "@/lib/crm/session";
import { peut, type Droit } from "@/lib/crm/utilisateurs";

/** `droit` absent = visible par tout le monde. */
const LIENS: { href: string; label: string; droit?: Droit }[] = [
  { href: "/admin", label: "Vue d'ensemble" },
  { href: "/admin/contacts", label: "Contacts" },
  { href: "/admin/sequences", label: "Séquences", droit: "sequences" },
  { href: "/admin/campagnes", label: "Campagnes", droit: "campagnes" },
  { href: "/admin/envois", label: "Envois" },
  { href: "/admin/comptes", label: "Comptes", droit: "comptes" },
];

/** Coquille commune : barre latérale, titre de page et zone de contenu. */
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
  const liens = LIENS.filter((l) => !l.droit || peut(qui.role, l.droit));

  return (
    <div className="adm-shell">
      <aside className="adm-side">
        <div className="adm-brand">
          La Voie 2 la Conscience
          <span>Tableau de bord</span>
        </div>
        <nav className="adm-nav">
          {liens.map((l) => (
            <Link key={l.href} href={l.href} className={l.href === actif ? "actif" : ""}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div style={{ marginTop: "auto", paddingTop: 18 }}>
          <p style={{ fontSize: 11.5, color: "var(--adm-mute)", margin: "0 0 12px", lineHeight: 1.5 }}>
            Connecté : <strong style={{ color: "var(--adm-ink)" }}>{qui.nom}</strong>
            <br />
            {qui.principal ? "mot de passe principal" : qui.role}
          </p>
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
