"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const timer = setTimeout(() => {
      const els = document.querySelectorAll("[data-reveal]:not(.in)");

      if (!("IntersectionObserver" in window)) {
        els.forEach((e) => e.classList.add("in"));
        return;
      }

      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("in");
              io.unobserve(e.target);
            }
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
      );

      els.forEach((e) => io.observe(e));
      return () => io.disconnect();
    }, 30);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
