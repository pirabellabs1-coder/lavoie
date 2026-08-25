"use client";

import { useState } from "react";
import { useProtection } from "@/components/Protection";

function Arrow() {
  return (
    <svg className="arrow" width={14} height={14} viewBox="0 0 16 16" fill="none">
      <path d="M1 8h13M9 3l5 5-5 5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export default function NewsletterForm() {
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const { champ, donnees } = useProtection();
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prenom, email, ...donnees() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorMsg(data.error || "L'inscription a échoué. Réessayez.");
        setSending(false);
        return;
      }
      setDone(true);
    } catch {
      setErrorMsg("Connexion impossible. Réessayez dans un instant.");
      setSending(false);
    }
  };

  if (done) {
    return (
      <div
        style={{
          background: "var(--paper)",
          padding: 48,
          borderTop: "3px solid var(--gold)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "var(--gold)",
            display: "grid",
            placeItems: "center",
            margin: "0 auto 20px",
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M4 12l5 5 11-11" stroke="var(--navy-ink)" strokeWidth="2" />
          </svg>
        </div>
        <p
          className="display"
          style={{ fontSize: 26, margin: "0 0 8px", color: "var(--navy)" }}
        >
          Presque terminé.
        </p>
        <p style={{ color: "var(--mute)", fontSize: 14, lineHeight: 1.65 }}>
          Un e-mail vient de partir : cliquez sur le lien qu&apos;il contient pour confirmer
          votre inscription. Sans ce clic, vous ne recevrez rien — pensez à vos indésirables.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      data-reveal=""
      data-reveal-delay="1"
      style={{
        background: "var(--paper)",
        padding: 48,
        borderTop: "3px solid var(--gold)",
      }}
    >
      {champ}
      <p
        className="small"
        style={{
          letterSpacing: ".2em",
          textTransform: "uppercase",
          color: "var(--gold)",
          margin: "0 0 18px",
          fontSize: 10.5,
        }}
      >
        S&apos;inscrire
      </p>
      <h3
        className="display"
        style={{ fontSize: 28, margin: "0 0 28px", lineHeight: 1.2 }}
      >
        Recevoir la prochaine lettre{" "}
        <em className="display-italic">d&apos;hiver</em>.
      </h3>
      <div className="field" style={{ marginBottom: 14 }}>
        <input
          type="text"
          required
          placeholder="Prénom"
          value={prenom}
          onChange={(e) => setPrenom(e.target.value)}
          autoComplete="given-name"
        />
      </div>
      <div className="field" style={{ marginBottom: 22 }}>
        <input
          type="email"
          required
          placeholder="Adresse email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </div>
      {errorMsg && (
        <p style={{ color: "#b3261e", fontSize: 13, margin: "0 0 14px" }}>{errorMsg}</p>
      )}
      <button
        type="submit"
        className="btn btn-primary"
        disabled={sending}
        style={{ width: "100%", justifyContent: "center", opacity: sending ? 0.6 : 1 }}
      >
        {sending ? "Inscription…" : "M'inscrire aux Lettres"} <Arrow />
      </button>
      <p
        className="small muted"
        style={{ margin: "16px 0 0", fontSize: 11.5, textAlign: "center" }}
      >
        Désinscription en un clic · Aucune cession de données
      </p>
    </form>
  );
}
