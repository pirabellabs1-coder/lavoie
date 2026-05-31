"use client";

import { useState } from "react";

type Props = {
  id: string;       // YouTube video ID
  name: string;
  role: string;
  quote: string;
};

export default function VideoTestimonial({ id, name, role, quote }: Props) {
  const [playing, setPlaying] = useState(false);

  return (
    <div
      className="video-testi card-hover"
      style={{
        border: "1px solid var(--line)",
        background: "var(--white)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Lecteur / façade ── */}
      <div
        className="video-frame"
        style={{ position: "relative", aspectRatio: "16/9", background: "var(--navy-ink)", overflow: "hidden" }}
      >
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`}
            title={`Témoignage de ${name}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Lire le témoignage de ${name}`}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              padding: 0,
              border: 0,
              background: "transparent",
              cursor: "pointer",
              display: "block",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`}
              alt={`Témoignage de ${name}`}
              loading="lazy"
              onError={(e) => {
                const img = e.currentTarget;
                if (!img.dataset.fallback) {
                  img.dataset.fallback = "1";
                  img.src = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
                }
              }}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
            {/* Voile dégradé */}
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to top, rgba(7,16,60,0.5) 0%, rgba(7,16,60,0.12) 45%, rgba(7,16,60,0.28) 100%)",
              }}
            />
            {/* Bouton lecture doré */}
            <span className="video-play" aria-hidden="true">
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                <path d="M8 5.5v13l11-6.5-11-6.5z" fill="var(--navy-ink)" />
              </svg>
            </span>
          </button>
        )}
      </div>

      {/* ── Légende ── */}
      <div style={{ padding: "28px 32px 32px" }}>
        <h3 className="display" style={{ fontSize: "clamp(22px,1.8vw,26px)", color: "var(--navy)", margin: "0 0 5px", lineHeight: 1.15 }}>
          {name}
        </h3>
        <p
          style={{
            fontFamily: "var(--sans)",
            fontSize: 10.5,
            letterSpacing: ".16em",
            textTransform: "uppercase",
            color: "var(--gold)",
            margin: "0 0 18px",
            fontWeight: 500,
          }}
        >
          {role}
        </p>
        <hr className="filet" style={{ marginBottom: 18 }} />
        <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 16, lineHeight: 1.7, color: "var(--navy-ink)", margin: 0 }}>
          &ldquo;{quote}&rdquo;
        </p>
      </div>
    </div>
  );
}
