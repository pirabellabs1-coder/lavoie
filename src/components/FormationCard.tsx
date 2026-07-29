import Image from "next/image";
import type { Formation } from "@/lib/formations";

function Arrow({ size = 12 }: { size?: number }) {
  return (
    <svg className="arrow" width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M1 8h13M9 3l5 5-5 5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

/** Carte d'une formation numérique (couverture + tag + titre + bénéfice + CTA). */
export default function FormationCard({ f }: { f: Formation }) {
  return (
    <a
      href={f.url}
      target="_blank"
      rel="noopener noreferrer"
      className="card-hover"
      style={{ display: "flex", flexDirection: "column", background: "var(--white)", border: "1px solid var(--line)", borderRadius: 16, textDecoration: "none", position: "relative", overflow: "hidden" }}
    >
      <div style={{ position: "relative", aspectRatio: "1 / 1", background: "var(--paper-alt)" }}>
        <Image
          src={f.image}
          alt={`Couverture — ${f.titre}`}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          style={{ objectFit: "cover" }}
        />
        {f.featured && (
          <span className="pill pill-gold" style={{ position: "absolute", top: 14, left: 14, fontSize: 9, zIndex: 2 }}>★ Le plus complet</span>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", flexGrow: 1, padding: "22px 24px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
          <span className="pill" style={{ background: "rgba(15,29,110,0.06)", color: "var(--blue)", borderColor: "rgba(15,29,110,0.18)" }}>{f.tag}</span>
          {f.livre && <span className="pill" style={{ fontSize: 9 }}>Aussi en livre</span>}
        </div>
        <h3 className="display" style={{ fontSize: 20, color: "var(--navy)", margin: "0 0 10px", lineHeight: 1.25 }}>{f.titre}</h3>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--mute)", margin: "0 0 22px", flexGrow: 1 }}>{f.benefice}</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 16, borderTop: "1px solid var(--line)" }}>
          <span style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 16, color: "var(--navy)" }}>Dès 10 €</span>
          <span className="link-underline" style={{ color: "var(--blue)", fontWeight: 500, fontSize: 13 }}>Découvrir <Arrow /></span>
        </div>
      </div>
    </a>
  );
}
