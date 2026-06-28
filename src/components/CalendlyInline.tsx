"use client";

import Script from "next/script";
import { useCallback, useRef } from "react";

declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (opts: { url: string; parentElement: HTMLElement }) => void;
    };
  }
}

/**
 * Widget Calendly « inline » fiable, y compris en navigation interne (SPA).
 * next/script charge le script une seule fois ; onReady se redéclenche à chaque
 * montage du composant → on (ré)initialise explicitement le widget de la page.
 */
export default function CalendlyInline({ url, height = 700 }: { url: string; height?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  const init = useCallback(() => {
    const el = ref.current;
    if (window.Calendly && el && !el.querySelector("iframe")) {
      window.Calendly.initInlineWidget({ url, parentElement: el });
    }
  }, [url]);

  return (
    <>
      <div ref={ref} className="calendly-inline-widget" data-url={url} style={{ minWidth: 320, height }} />
      <Script
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="afterInteractive"
        onReady={init}
      />
    </>
  );
}
