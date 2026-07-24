"use client";

import { useState } from "react";

function Arrow() {
  return (
    <svg className="arrow" width={14} height={14} viewBox="0 0 16 16" fill="none">
      <path d="M1 8h13M9 3l5 5-5 5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

/**
 * Formulaire lead magnet : capture prénom + e-mail, envoie une notification
 * au propriétaire (via /api/lead) puis affiche un message de confirmation.
 * `source` identifie la ressource offerte dans l'e-mail de notification.
 */
export default function LeadMagnetForm({ source = "Guide gratuit" }: { source?: string }) {
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prenom, email, source }),
      });
      if (!res.ok) throw new Error();
      setDone(true);
    } catch {
      setErrorMsg(
        "Une erreur est survenue. Réessayez, ou écrivez-nous à contact@lavoie2laconscience.com.",
      );
    } finally {
      setSending(false);
    }
  };

  if (done) {
    return (
      <div className="lead-form" style={{ textAlign: "center" }}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: "var(--gold)",
            display: "grid",
            placeItems: "center",
            margin: "0 auto 18px",
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M4 12l5 5 11-11" stroke="var(--navy-ink)" strokeWidth="2" />
          </svg>
        </div>
        <p className="display" style={{ fontSize: 26, margin: "0 0 8px", color: "var(--navy)" }}>
          C&apos;est noté, {prenom || "merci"}&nbsp;!
        </p>
        <p style={{ color: "var(--mute)", fontSize: 14.5, lineHeight: 1.6, margin: 0 }}>
          Vous recevrez le guide par e-mail très vite, à l&apos;adresse indiquée.
          Pensez à vérifier vos courriers indésirables.
        </p>
      </div>
    );
  }

  return (
    <form className="lead-form" onSubmit={onSubmit}>
      <div className="field" style={{ marginBottom: 12 }}>
        <input
          type="text"
          required
          placeholder="Votre prénom"
          value={prenom}
          onChange={(e) => setPrenom(e.target.value)}
        />
      </div>
      <div className="field" style={{ marginBottom: 18 }}>
        <input
          type="email"
          required
          placeholder="Votre adresse e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <button
        type="submit"
        disabled={sending}
        className="btn btn-primary"
        style={{ width: "100%", justifyContent: "center", opacity: sending ? 0.7 : 1, cursor: sending ? "wait" : "pointer" }}
      >
        {sending ? "Envoi en cours…" : <>Recevoir le guide gratuit <Arrow /></>}
      </button>
      {errorMsg && (
        <p role="alert" style={{ textAlign: "center", margin: "14px 0 0", color: "#c0392b", fontSize: 12.5, lineHeight: 1.5 }}>
          {errorMsg}
        </p>
      )}
      <p className="small muted" style={{ margin: "14px 0 0", fontSize: 11.5, textAlign: "center" }}>
        Gratuit · Désinscription en un clic · Aucune cession de données
      </p>
    </form>
  );
}
