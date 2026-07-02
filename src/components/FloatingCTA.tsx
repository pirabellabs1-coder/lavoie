"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * CTA flottant permanent (conversion) — « Réserver un appel offert ».
 * Apparaît après un peu de défilement, masqué sur la page contact.
 */
export default function FloatingCTA() {
  const [show, setShow] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Inutile sur la page de réservation elle-même.
  if (pathname === "/contact") return null;

  return (
    <Link
      href="/contact"
      className={`floating-cta${show ? " show" : ""}`}
      aria-label="Réserver un appel découverte offert"
    >
      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M8 2v3M16 2v3M3.5 9h17M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span>Réserver un appel offert</span>
    </Link>
  );
}
