import Image from "next/image";
import { CSSProperties } from "react";

interface PlaceholderProps {
  label?: string;
  mark?: string;
  style?: CSSProperties;
  className?: string;
  src?: string;
  alt?: string;
  sizes?: string;
}

export default function Placeholder({ label, mark, style, className, src, alt, sizes }: PlaceholderProps) {
  return (
    <div className={`ph${className ? " " + className : ""}`} style={style}>
      {src ? (
        <Image
          src={src}
          alt={alt || label || ""}
          fill
          style={{ objectFit: "cover" }}
          sizes={sizes || "(max-width: 768px) 100vw, 50vw"}
        />
      ) : (
        <div className="ph-inner" />
      )}
      {mark && <span className="ph-mark">{mark}</span>}
      {!src && label && <span className="ph-label">{label}</span>}
    </div>
  );
}
