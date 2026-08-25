"use client";

import { useState } from "react";
import { useProtection } from "@/components/Protection";

/**
 * Demande d'accès ou d'effacement RGPD. Le formulaire ne fait qu'envoyer un
 * lien de vérification : rien n'est montré ni supprimé ici.
 */
export default function DemandeRgpd() {
  const { champ, donnees } = useProtection();
  const [email, setEmail] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [fait, setFait] = useState(false);
  const [erreur, setErreur] = useState("");

  const envoyer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (envoi) return;
    setEnvoi(true);
    setErreur("");
    try {
      const res = await fetch("/api/mes-donnees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, ...donnees() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErreur(data.error || "L'envoi a échoué. Réessayez dans un instant.");
        setEnvoi(false);
        return;
      }
      setFait(true);
    } catch {
      setErreur("Connexion impossible. Réessayez dans un instant.");
      setEnvoi(false);
    }
  };

  const cadre: React.CSSProperties = {
    background: "var(--white)",
    border: "1px solid var(--line)",
    borderRadius: 18,
    padding: 34,
  };

  if (fait) {
    return (
      <div style={{ ...cadre, borderTop: "3px solid var(--gold)" }}>
        <p className="display" style={{ fontSize: 24, margin: "0 0 10px", color: "var(--navy)" }}>
          Vérifiez votre boîte mail.
        </p>
        <p style={{ color: "var(--mute)", lineHeight: 1.75, margin: 0 }}>
          Si une adresse correspond à un contact chez nous, un lien personnel vient de partir.
          Il est valable une heure et vous permettra de télécharger vos données ou de les
          effacer. Pensez à regarder vos indésirables.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={envoyer} style={cadre}>
      {champ}
      <label htmlFor="rgpd-email" style={{ display: "block", fontWeight: 500, marginBottom: 10 }}>
        Votre adresse e-mail
      </label>
      <div className="field">
        <input
          id="rgpd-email"
          type="email"
          required
          placeholder="celle avec laquelle vous nous avez écrit"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </div>
      {erreur && <p style={{ color: "#b3261e", fontSize: 13, margin: "14px 0 0" }}>{erreur}</p>}
      <button
        type="submit"
        className="btn btn-primary"
        disabled={envoi}
        style={{ width: "100%", justifyContent: "center", marginTop: 18, opacity: envoi ? 0.6 : 1 }}
      >
        {envoi ? "Envoi…" : "Recevoir mon lien"}
      </button>
      <p className="small muted" style={{ margin: "14px 0 0", fontSize: 11.5, textAlign: "center" }}>
        Lien valable une heure · Envoyé uniquement à l&apos;adresse concernée
      </p>
    </form>
  );
}
