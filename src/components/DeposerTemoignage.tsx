"use client";

import { useState } from "react";
import { useProtection } from "@/components/Protection";

/**
 * Déposer un témoignage.
 *
 * Rien n'est publié depuis ce formulaire : le texte part en modération. C'est
 * dit clairement, pour que personne ne s'attende à se voir apparaître aussitôt
 * sur la page.
 */
export default function DeposerTemoignage() {
  const { champ, donnees } = useProtection();
  const [form, setForm] = useState({ nom: "", contexte: "", texte: "" });
  const [note, setNote] = useState(0);
  const [survol, setSurvol] = useState(0);
  const [accord, setAccord] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");
  const [fait, setFait] = useState(false);

  const champTexte =
    (cle: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm({ ...form, [cle]: e.target.value });

  const envoyer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (envoi) return;
    setEnvoi(true);
    setErreur("");
    try {
      const res = await fetch("/api/temoignage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          note: note || undefined,
          consentement: accord,
          ...donnees(),
        }),
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
      <div style={{ ...cadre, borderTop: "3px solid var(--gold)", textAlign: "center" }}>
        <p className="display" style={{ fontSize: 26, margin: "0 0 10px", color: "var(--navy)" }}>
          Merci de votre confiance.
        </p>
        <p style={{ color: "var(--mute)", lineHeight: 1.75, margin: 0 }}>
          Votre témoignage a bien été reçu. Il sera lu avant d&apos;être publié — c&apos;est
          notre façon de veiller à ce que chaque mot reste fidèle à ce que vous avez voulu
          dire.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={envoyer} style={cadre}>
      {champ}

      <p
        className="small"
        style={{
          letterSpacing: ".2em",
          textTransform: "uppercase",
          color: "var(--gold)",
          margin: "0 0 14px",
          fontSize: 10.5,
        }}
      >
        Partager mon expérience
      </p>
      <h3 className="display" style={{ fontSize: 26, margin: "0 0 24px", lineHeight: 1.2 }}>
        Ce que vous avez vécu peut éclairer quelqu&apos;un.
      </h3>

      <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        <div className="field">
          <input
            type="text"
            required
            placeholder="Votre nom (ou prénom seul)"
            value={form.nom}
            onChange={champTexte("nom")}
            autoComplete="name"
          />
        </div>
        <div className="field">
          <input
            type="text"
            placeholder="Votre contexte (facultatif)"
            value={form.contexte}
            onChange={champTexte("contexte")}
          />
        </div>
      </div>

      <div style={{ margin: "18px 0" }}>
        <span style={{ display: "block", fontSize: 13, color: "var(--mute)", marginBottom: 8 }}>
          Votre ressenti d&apos;ensemble (facultatif)
        </span>
        <div style={{ display: "flex", gap: 4 }} role="radiogroup" aria-label="Note">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setNote(n === note ? 0 : n)}
              onMouseEnter={() => setSurvol(n)}
              onMouseLeave={() => setSurvol(0)}
              aria-label={`${n} sur 5`}
              aria-pressed={note >= n}
              style={{
                fontSize: 28,
                lineHeight: 1,
                padding: 2,
                color: (survol || note) >= n ? "var(--gold)" : "var(--line-dark, #c9d2ea)",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <textarea
          required
          rows={6}
          placeholder="Racontez, à votre rythme et avec vos mots. Ce qui a changé, ce qui vous a marqué…"
          value={form.texte}
          onChange={champTexte("texte")}
          style={{ resize: "vertical", lineHeight: 1.7 }}
        />
      </div>

      <label style={{ display: "flex", gap: 10, alignItems: "flex-start", margin: "18px 0 0", cursor: "pointer" }}>
        <input
          type="checkbox"
          checked={accord}
          onChange={(e) => setAccord(e.target.checked)}
          required
          style={{ marginTop: 4, accentColor: "var(--gold)", flex: "none" }}
        />
        <span style={{ fontSize: 13.5, color: "var(--mute)", lineHeight: 1.6 }}>
          J&apos;autorise La Voie 2 la Conscience à publier ce témoignage sous ce nom, sur le
          site et ses supports. Je peux demander son retrait à tout moment.
        </span>
      </label>

      {erreur && (
        <p style={{ color: "#b3261e", fontSize: 13, margin: "16px 0 0" }}>{erreur}</p>
      )}

      <button
        type="submit"
        className="btn btn-primary"
        disabled={envoi}
        style={{ width: "100%", justifyContent: "center", marginTop: 20, opacity: envoi ? 0.6 : 1 }}
      >
        {envoi ? "Envoi…" : "Envoyer mon témoignage"}
      </button>
      <p className="small muted" style={{ margin: "14px 0 0", fontSize: 11.5, textAlign: "center" }}>
        Lu avant publication · Retirable à tout moment
      </p>
    </form>
  );
}
