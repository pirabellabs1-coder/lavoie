"use client";

import { useEffect } from "react";

export default function CursorGlow() {
  useEffect(() => {
    const el = document.querySelector(".cursor-glow") as HTMLElement | null;
    if (!el) return;
    let visible = false;

    const onMove = (e: MouseEvent) => {
      el.style.left = e.clientX + "px";
      el.style.top = e.clientY + "px";
      if (!visible) {
        el.style.opacity = "1";
        visible = true;
      }
    };
    const onLeave = () => {
      el.style.opacity = "0";
      visible = false;
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return null;
}
