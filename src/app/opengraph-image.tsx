import { ImageResponse } from "next/og";

export const alt = "La Voie 2 la Conscience — Accompagnement initiatique premium";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #07103c 0%, #0f1d6e 100%)",
          padding: "72px 80px",
          fontFamily: "Georgia, serif",
        }}
      >
        {/* Eyebrow */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            color: "#c8a84b",
            fontSize: 22,
            letterSpacing: 6,
            textTransform: "uppercase",
          }}
        >
          <div style={{ width: 40, height: 2, background: "#c8a84b" }} />
          Accompagnement initiatique
        </div>

        {/* Titre */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "baseline", fontSize: 92, color: "#ffffff", lineHeight: 1.02 }}>
            <span>{"La Voie "}</span>
            <span style={{ color: "#c8a84b" }}>2</span>
            <span>{" la"}</span>
          </div>
          <div style={{ fontSize: 92, color: "#ffffff", lineHeight: 1.02, fontStyle: "italic" }}>
            Conscience
          </div>
        </div>

        {/* Pied */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            color: "rgba(255,255,255,0.62)",
            fontSize: 26,
          }}
        >
          <span>Domoïna · 21 ans de pratique · 500+ accompagnements</span>
          <span style={{ color: "#c8a84b" }}>Centre HUT · Sarthe</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
