"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function FormulaireConnexion({ suite }: { suite?: string }) {
  const router = useRouter();
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState("");
  const [enCours, setEnCours] = useState(false);

  const envoyer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (enCours) return;
    setEnCours(true);
    setErreur("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motDePasse }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErreur(data.error || "Connexion refusée.");
        setEnCours(false);
        return;
      }
      const destination = suite && suite.startsWith("/admin") ? suite : "/admin";
      router.replace(destination);
      router.refresh();
    } catch {
      setErreur("Connexion impossible. Réessayez.");
      setEnCours(false);
    }
  };

  return (
    <form onSubmit={envoyer}>
      <label className="adm-label" htmlFor="mdp">
        Mot de passe
      </label>
      <input
        id="mdp"
        type="password"
        className="adm-champ"
        value={motDePasse}
        onChange={(e) => setMotDePasse(e.target.value)}
        autoComplete="current-password"
        autoFocus
        required
      />
      {erreur && (
        <p style={{ color: "var(--adm-bad)", fontSize: 13, margin: "12px 0 0" }}>{erreur}</p>
      )}
      <button
        type="submit"
        className="adm-btn"
        disabled={enCours}
        style={{ width: "100%", justifyContent: "center", marginTop: 18 }}
      >
        {enCours ? "Connexion…" : "Entrer"}
      </button>
    </form>
  );
}
