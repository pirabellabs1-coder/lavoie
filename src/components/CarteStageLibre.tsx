import Image from "next/image";
import Link from "next/link";
import type { StageALAffiche } from "@/lib/crm/stages";
import { periodeEnClair } from "@/lib/heure";
import { SANS_DATE } from "@/lib/crm/dates-stages";

/**
 * La carte d'agenda d'un stage créé depuis le tableau de bord.
 *
 * Elle imite celle du catalogue (`EvenementCard`) sans la copier : un stage de
 * la base n'a ni affiche, ni accroche rédigée, ni thème. Ce qu'on ne lui a pas
 * saisi, la carte le tait plutôt que de l'inventer.
 */

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

const MARINE = "linear-gradient(150deg, #142579 0%, #0f1d6e 50%, #0a1450 100%)";

export default function CarteStageLibre({ s }: { s: StageALAffiche }) {
  const image = s.image_id ? `/api/images/${s.image_id}` : null;
  const complet = s.restantes != null && s.restantes <= 0;
  const quand = s.debut_le ? periodeEnClair(s.debut_le, s.fin_le) : SANS_DATE;
  const tarif =
    s.prix_cents == null
      ? "Tarif sur demande"
      : (s.prix_cents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });

  const card = (
    <>
      <div style={{ position: "relative", aspectRatio: "2 / 1", background: image ? "var(--paper-alt)" : MARINE }}>
        {image ? (
          <Image
            src={image}
            alt={s.image_alt ?? `Visuel — ${s.titre}`}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            style={{ objectFit: "cover", opacity: complet ? 0.55 : 1 }}
          />
        ) : (
          <span
            aria-hidden="true"
            style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "var(--gold)", fontSize: 26 }}
          >
            ✦
          </span>
        )}
        {complet && (
          <span className="pill" style={{ position: "absolute", top: 14, left: 14, fontSize: 9, zIndex: 2, background: "var(--white)", color: "var(--navy)" }}>
            Complet
          </span>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", flexGrow: 1, padding: "22px 24px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
          <span className="pill" style={{ background: "rgba(15,29,110,0.06)", color: "var(--blue)", borderColor: "rgba(15,29,110,0.18)" }}>
            Stage
          </span>
        </div>

        <p style={{ fontFamily: "var(--sans)", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--gold)", margin: "0 0 10px", fontWeight: 600 }}>
          {quand}
        </p>

        <h3 className="display" style={{ fontSize: 20, color: "var(--navy)", margin: "0 0 10px", lineHeight: 1.25 }}>
          {s.titre}
        </h3>
        {s.resume && (
          <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--mute)", margin: "0 0 18px", flexGrow: 1 }}>
            {s.resume}
          </p>
        )}

        {s.lieu && (
          <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 18, fontSize: 13, color: "var(--navy-ink)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Pin />
              {s.lieu}
            </span>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 16, borderTop: "1px solid var(--line)", marginTop: "auto" }}>
          <span style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 16, color: "var(--navy)" }}>{tarif}</span>
          <span className="link-underline" style={{ color: "var(--blue)", fontWeight: 500, fontSize: 13 }}>
            Découvrir <Arrow />
          </span>
        </div>
      </div>
    </>
  );

  return (
    <Link
      href={`/evenements/${s.slug}`}
      className="card-hover"
      style={{
        display: "flex",
        flexDirection: "column",
        background: "var(--white)",
        border: "1px solid var(--line)",
        borderRadius: 16,
        textDecoration: "none",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {card}
    </Link>
  );
}
