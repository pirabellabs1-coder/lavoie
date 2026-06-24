import Link from "next/link";

function Arrow() {
  return (
    <svg className="arrow" width={14} height={14} viewBox="0 0 16 16" fill="none">
      <path d="M1 8h13M9 3l5 5-5 5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer>

      {/* ── Gold CTA band ── */}
      <div className="footer-cta">
        <div className="container-narrow">
          <p
            className="eyebrow"
            style={{ justifyContent: "center", color: "var(--navy-ink)", marginBottom: 20, opacity: 0.75 }}
          >
            <span className="dot" style={{ background: "var(--navy)" }} />
            Premier pas
            <span className="dot" style={{ background: "var(--navy)" }} />
          </p>
          <h3>
            Et si votre prochaine réussite
            <br />
            <em style={{ fontWeight: 300 }}>était intérieure&nbsp;?</em>
          </h3>
          <p
            style={{
              maxWidth: 580,
              margin: "0 auto 36px",
              fontSize: 15.5,
              lineHeight: 1.72,
              color: "rgba(14,26,74,0.7)",
            }}
          >
            Une spiritualité qui ne se contemple pas&nbsp;: elle s&apos;incarne dans vos relations —
            professionnelles, familiales, amoureuses. Réservez votre appel découverte offert
            avec Domoïna.
          </p>
          <Link href="/contact" className="btn btn-primary">
            Réserver mon appel offert <Arrow />
          </Link>
          <p
            style={{
              marginTop: 16,
              fontFamily: "var(--sans)",
              fontSize: 11,
              letterSpacing: ".12em",
              textTransform: "uppercase",
              color: "rgba(14,26,74,0.45)",
            }}
          >
            Sans engagement · Réponse sous 24h
          </p>
        </div>
      </div>

      {/* ── Dark footer ── */}
      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">

            {/* Brand */}
            <div className="footer-brand">
              <Link
                href="/"
                style={{
                  display: "inline-block",
                  fontFamily: "var(--serif)",
                  fontSize: 20,
                  fontWeight: 300,
                  color: "var(--white)",
                  marginBottom: 18,
                  letterSpacing: "-0.01em",
                  lineHeight: 1.1,
                  textDecoration: "none",
                }}
              >
                La Voie{" "}
                <span style={{ fontStyle: "italic", color: "var(--gold)", fontWeight: 400 }}>2</span>{" "}
                la Conscience
                <small
                  style={{
                    display: "block",
                    fontFamily: "var(--sans)",
                    fontSize: 8.5,
                    letterSpacing: ".28em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.45)",
                    marginTop: 4,
                    fontStyle: "normal",
                  }}
                >
                  Accompagnement initiatique
                </small>
              </Link>
              <p>
                Transformez vos blessures en Excellence Authentique Unique.
              </p>
              <div className="social">
                <a href="#" title="Instagram" aria-label="Instagram">IG</a>
                <a href="#" title="LinkedIn" aria-label="LinkedIn">IN</a>
                <a href="#" title="YouTube" aria-label="YouTube">YT</a>
                <a href="#" title="TikTok" aria-label="TikTok">TT</a>
              </div>
            </div>

            {/* Accompagnement */}
            <div>
              <h5>Accompagnement</h5>
              <Link href="/offre-gold">Offre Gold</Link>
              <Link href="/methodes">Méthodes</Link>
              <Link href="/centre-hut">Centre HUT</Link>
              <Link href="/domoina">À propos</Link>
              <Link href="/contact">Appel découverte</Link>
            </div>

            {/* Ressources */}
            <div>
              <h5>Ressources</h5>
              <Link href="/masterclass">Masterclass</Link>
              <Link href="/blog">Journal / Blog</Link>
              <Link href="/temoignages">Témoignages</Link>
              <Link href="/faq">FAQ</Link>
              <Link href="/cadre-deontologique">Déontologie</Link>
            </div>

            {/* Contact */}
            <div>
              <h5>Coordonnées</h5>
              <p
                style={{
                  margin: "0 0 20px",
                  fontSize: 13.5,
                  lineHeight: 1.85,
                  color: "rgba(255,255,255,0.6)",
                }}
              >
                50 Rue Principale
                <br />
                72110 Rouperroux-le-Coquet
                <br />
                Sarthe, France
              </p>
              <a href="mailto:contact@lavoie2laconscience.fr">
                contact@lavoie2laconscience.fr
              </a>
              <a href="tel:+33764201524">07 64 20 15 24</a>
            </div>
          </div>

          <div className="footer-bottom">
            <span>© 2026 La Voie 2 la Conscience · Tous droits réservés</span>
            <span style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
              <Link href="/mentions-legales">Mentions légales</Link>
              <Link href="/politique-confidentialite">Confidentialité</Link>
              <Link href="/cadre-deontologique">Déontologie</Link>
            </span>
          </div>
        </div>
      </div>

    </footer>
  );
}
