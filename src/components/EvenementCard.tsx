import Image from "next/image";
import Link from "next/link";
import type { Evenement } from "@/lib/evenements";

function Arrow({ size = 12 }: { size?: number }) {
  return (
    <svg className="arrow" width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M1 8h13M9 3l5 5-5 5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function Pin({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M8 1.6c-2.4 0-4.3 1.9-4.3 4.3C3.7 9.2 8 14.4 8 14.4s4.3-5.2 4.3-8.5c0-2.4-1.9-4.3-4.3-4.3Z" stroke="currentColor" strokeWidth="1.1" />
      <circle cx="8" cy="5.9" r="1.5" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}

function Clock({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <circle cx="8" cy="8" r="6.3" stroke="currentColor" strokeWidth="1.1" />
      <path d="M8 4.4V8l2.4 1.6" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

/** Carte d'un événement (couverture + date + lieu + titre + accroche + billetterie). */
export default function EvenementCard({ e }: { e: Evenement }) {
  const card = (
    <>
      <div style={{ position: "relative", aspectRatio: "2 / 1", background: "var(--paper-alt)" }}>
        <Image
          src={e.image}
          alt={`Affiche — ${e.titre}`}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          style={{ objectFit: "cover", opacity: e.complet ? 0.55 : 1 }}
        />
        {e.featured && !e.complet && (
          <span className="pill pill-gold" style={{ position: "absolute", top: 14, left: 14, fontSize: 9, zIndex: 2 }}>★ Prochaine date</span>
        )}
        {e.complet && (
          <span className="pill" style={{ position: "absolute", top: 14, left: 14, fontSize: 9, zIndex: 2, background: "var(--white)", color: "var(--navy)" }}>Complet</span>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", flexGrow: 1, padding: "22px 24px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
          <span className="pill" style={{ background: "rgba(15,29,110,0.06)", color: "var(--blue)", borderColor: "rgba(15,29,110,0.18)" }}>{e.tag}</span>
        </div>

        <p style={{ fontFamily: "var(--sans)", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--gold)", margin: "0 0 10px", fontWeight: 600 }}>
          {e.date}
        </p>

        <h3 className="display" style={{ fontSize: 20, color: "var(--navy)", margin: "0 0 10px", lineHeight: 1.25 }}>{e.titre}</h3>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--mute)", margin: "0 0 18px", flexGrow: 1 }}>{e.accroche}</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 18, fontSize: 13, color: "var(--navy-ink)" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}><Pin />{e.lieu}</span>
          {e.heure && <span style={{ display: "flex", alignItems: "center", gap: 8 }}><Clock />{e.heure}</span>}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 16, borderTop: "1px solid var(--line)" }}>
          <span style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 16, color: "var(--navy)" }}>{e.prix}</span>
          {e.complet ? (
            <span style={{ color: "var(--mute)", fontWeight: 500, fontSize: 13 }}>Complet</span>
          ) : (
            <span className="link-underline" style={{ color: "var(--blue)", fontWeight: 500, fontSize: 13 }}>Découvrir <Arrow /></span>
          )}
        </div>
      </div>
    </>
  );

  const shell: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    background: "var(--white)",
    border: "1px solid var(--line)",
    borderRadius: 16,
    textDecoration: "none",
    position: "relative",
    overflow: "hidden",
  };

  if (e.complet) {
    return <div style={shell}>{card}</div>;
  }

  // La carte mène à la page de détail du site ; la billetterie externe est
  // ouverte depuis cette page — on garde le visiteur sur le site.
  return (
    <Link href={e.href} className="card-hover" style={shell}>
      {card}
    </Link>
  );
}
