import type { CSSProperties } from "react";

interface MarqueeProps {
  items: string[];
  /**
   * Durée d'un cycle complet, en secondes.
   * Plus la valeur est GRANDE, plus le défilement est LENT.
   * Pilote la variable CSS --marquee-duration (cf. .marquee-track dans globals.css).
   */
  duration?: number;
}

export default function Marquee({ items, duration = 60 }: MarqueeProps) {
  const loop = [...items, ...items];
  return (
    <div className="marquee">
      <div
        className="marquee-track"
        style={{ "--marquee-duration": `${duration}s` } as CSSProperties}
      >
        {loop.map((item, i) => (
          <span key={i} className="marquee-item">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
