"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLeaf = { href: string; label: string; desc?: string };
type NavItem = NavLeaf | { label: string; children: NavLeaf[] };

const nav: NavItem[] = [
  { href: "/domoina", label: "Domoina" },
  {
    label: "L'approche",
    children: [
      { href: "/methodes", label: "Mon approche", desc: "3 fondements · 4 piliers · Zone d'E.A.U." },
      { href: "/centre-hut", label: "Centre HUT", desc: "Le sanctuaire de reconnexion" },
    ],
  },
  {
    label: "Programmes",
    children: [
      { href: "/offre-gold", label: "Offre Gold", desc: "Trois niveaux d'engagement" },
      { href: "/masterclass", label: "Masterclass", desc: "Pour celles qui transmettent" },
    ],
  },
  {
    label: "Ressources",
    children: [
      { href: "/temoignages", label: "Témoignages", desc: "500+ vies transformées" },
      { href: "/blog", label: "Blog", desc: "Réflexions & pratiques" },
      { href: "/cadre-deontologique", label: "Cadre déontologique", desc: "Charte éthique & engagement" },
    ],
  },
  { href: "/contact", label: "Contact" },
];

function isLeaf(item: NavItem): item is NavLeaf {
  return "href" in item;
}

function Chevron() {
  return (
    <svg className="nav-chevron" width={9} height={9} viewBox="0 0 16 16" fill="none">
      <path d="M3 6l5 5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Navbar() {
  const [shrunk, setShrunk]         = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href));

  useEffect(() => {
    const onScroll = () => setShrunk(window.scrollY > 32);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <header className={`nav${shrunk ? " scrolled" : ""}`}>
        <div className={`nav-inner${shrunk ? " shrunk" : ""}`}>

          {/* ── Logo ── */}
          <Link href="/" className="logo">
            La Voie <span className="num">&thinsp;2&thinsp;</span> la Conscience
            <small>Accompagnement initiatique</small>
          </Link>

          {/* ── Desktop links ── */}
          <nav className="nav-links" aria-label="Navigation principale">
            {nav.map((item) => {
              if (isLeaf(item)) {
                return (
                  <Link key={item.href} href={item.href} className={isActive(item.href) ? "active" : ""}>
                    {item.label}
                  </Link>
                );
              }
              const groupActive = item.children.some((c) => isActive(c.href));
              return (
                <div key={item.label} className="nav-group">
                  <button
                    type="button"
                    className={`nav-group-trigger${groupActive ? " active" : ""}`}
                    aria-haspopup="true"
                  >
                    {item.label}
                    <Chevron />
                  </button>
                  <div className="nav-dropdown" role="menu">
                    {item.children.map((c) => (
                      <Link
                        key={c.href}
                        href={c.href}
                        role="menuitem"
                        className={isActive(c.href) ? "active" : ""}
                      >
                        <span className="dd-label">{c.label}</span>
                        {c.desc && <span className="dd-desc">{c.desc}</span>}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </nav>

          {/* ── Desktop CTA + burger ── */}
          <div className="nav-cta">
            <Link href="/contact" className="btn btn-gold btn-sm">
              Appel offert
              <svg width={11} height={11} viewBox="0 0 16 16" fill="none" className="arrow">
                <path d="M1 8h13M9 3l5 5-5 5" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            </Link>

            {/* Burger button (mobile) */}
            <button
              className={`nav-burger${mobileOpen ? " open" : ""}`}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={mobileOpen}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile overlay menu ── */}
      <div
        className={`nav-mobile${mobileOpen ? " open" : ""}`}
        aria-hidden={!mobileOpen}
      >
        {/* Header with logo + close */}
        <div style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          borderBottom: "1px solid var(--line)",
        }}>
          <Link href="/" className="logo" style={{ fontSize: 16 }}>
            La Voie <span className="num">&thinsp;2&thinsp;</span> la Conscience
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Fermer"
            style={{
              width: 36, height: 36,
              border: "1px solid var(--line)",
              display: "grid", placeItems: "center",
              fontSize: 18,
              color: "var(--navy)",
              cursor: "pointer",
              background: "transparent",
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>

        {/* Navigation links — grouped */}
        <nav style={{ flex: 1 }}>
          {nav.map((item) => {
            if (isLeaf(item)) {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "18px 0",
                    borderBottom: "1px solid var(--line)",
                    fontSize: 22,
                    fontFamily: "var(--serif)",
                    fontWeight: 300,
                    letterSpacing: "-0.01em",
                    color: active ? "var(--navy)" : "var(--navy-ink)",
                    opacity: active ? 1 : 0.85,
                    textDecoration: "none",
                  }}
                >
                  <span>{item.label}</span>
                  {active && (
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--gold)" }} />
                  )}
                </Link>
              );
            }
            return (
              <div key={item.label} style={{ padding: "20px 0 10px", borderBottom: "1px solid var(--line)" }}>
                <p style={{
                  fontFamily: "var(--sans)",
                  fontSize: 10.5,
                  letterSpacing: ".22em",
                  textTransform: "uppercase",
                  color: "var(--gold)",
                  margin: "0 0 6px",
                  fontWeight: 600,
                }}>
                  {item.label}
                </p>
                {item.children.map((c) => {
                  const active = isActive(c.href);
                  return (
                    <Link
                      key={c.href}
                      href={c.href}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px 0",
                        fontSize: 20,
                        fontFamily: "var(--serif)",
                        fontWeight: 300,
                        letterSpacing: "-0.01em",
                        color: active ? "var(--navy)" : "var(--navy-ink)",
                        opacity: active ? 1 : 0.8,
                        textDecoration: "none",
                      }}
                    >
                      <span>{c.label}</span>
                      {active && (
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--gold)" }} />
                      )}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Bottom CTA */}
        <div style={{ paddingTop: 28, borderTop: "1px solid var(--line)" }}>
          <Link
            href="/contact"
            className="btn btn-primary btn-lg"
            style={{ width: "100%", justifyContent: "center" }}
          >
            Réserver mon appel offert
            <svg width={14} height={14} viewBox="0 0 16 16" fill="none" className="arrow">
              <path d="M1 8h13M9 3l5 5-5 5" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </Link>
          <p style={{ textAlign: "center", marginTop: 12, fontSize: 11, color: "var(--mute)", letterSpacing: ".1em" }}>
            45 minutes · Gratuit · Sans engagement
          </p>
        </div>
      </div>
    </>
  );
}
