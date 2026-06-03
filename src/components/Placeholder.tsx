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
  objectFit?: "cover" | "contain";
  objectPosition?: string;
}

export default function Placeholder({ label, mark, style, className, src, alt, sizes, objectFit, objectPosition }: PlaceholderProps) {
  return (
    <div className={`ph${className ? " " + className : ""}`} style={style}>
      {src ? (
        <Image
          src={src}
          alt={alt || label || ""}
          fill
          style={{ objectFit: objectFit || "cover", objectPosition: objectPosition || "center" }}
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
