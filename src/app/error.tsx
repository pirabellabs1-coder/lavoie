"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * La page des pannes.
 *
 * Elle ne s'affiche que si quelque chose casse côté serveur ou pendant le
 * rendu. Elle doit donc être la plus autonome possible : pas de navigation à
 * charger, pas de donnée à lire, rien qui puisse casser à son tour. Deux
 * issues, et le message qui dit la vérité — le problème vient de nous.
 */
export default function Erreur({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // La trace part dans les journaux de l'hébergeur, jamais à l'écran : un
    // message d'erreur technique ne dit rien d'utile à un visiteur.
    console.error("[site] erreur de rendu:", error);
  }, [error]);

  return (
    <div className="page-fade">
      <section
        className="page-hero"
        style={{ background: "var(--white)", paddingBottom: 56 }}
      >
        <div className="container-narrow" style={{ textAlign: "center" }}>
          <p className="eyebrow" style={{ margin: "0 0 30px", justifyContent: "center" }}>
            <span className="dot" />
            Une panne, de notre côté
            <span className="dot" />
          </p>
          <h1
            className="display"
            style={{ fontSize: "clamp(32px, 4.2vw, 56px)", margin: "0 0 26px", lineHeight: 1.04 }}
          >
            Quelque chose
            <br />
            <em className="display-italic">s&apos;est interrompu.</em>
          </h1>
          <hr className="filet" style={{ margin: "0 auto 30px" }} />
          <p
            style={{
              fontSize: 17,
              lineHeight: 1.75,
              color: "var(--navy-ink)",
              maxWidth: 560,
              margin: "0 auto 32px",
            }}
          >
            La panne vient de nous, pas de vous, et elle est déjà signalée. Réessayez dans un
            instant — si cela persiste, écrivez-nous, nous vous répondrons.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button type="button" onClick={reset} className="btn btn-gold btn-lg">
              Réessayer
            </button>
            <Link href="/" className="btn btn-ghost btn-lg">
              Revenir à l&apos;accueil
            </Link>
          </div>
          {error.digest && (
            <p style={{ marginTop: 28, fontSize: 12, color: "var(--mute)" }}>
              Référence à nous transmettre si besoin : <code>{error.digest}</code>
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
