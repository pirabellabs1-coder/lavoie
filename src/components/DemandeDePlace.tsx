"use client";

import { useEffect, useState } from "react";
import { useProtection } from "@/components/Protection";

/** Une date proposée, telle que la renvoie /api/stage/dates. */
type DateProposee = {
  id: string;
  debut: string;
  fin: string | null;
  etat: "libre" | "dernieres" | "complet" | "fermee" | "passee";
  restantes: number;
};

const ETATS_DATE: Record<string, string> = {
  dernieres: "Dernières places",
  complet: "Complet",
};

function carteDate(iso: string) {
  const d = new Date(iso);
  const p = (options: Intl.DateTimeFormatOptions) =>
    d.toLocaleString("fr-FR", { timeZone: "Europe/Paris", ...options });
  return {
    jour: p({ weekday: "short" }).replace(".", ""),
    numero: p({ day: "numeric" }),
    mois: p({ month: "short" }).replace(".", ""),
    heure: p({ hour: "2-digit", minute: "2-digit" }),
  };
}

/**
 * Demander une place à un stage.
 *
 * La billetterie externe reste le chemin du paiement ; ce formulaire est celui
 * qui fait entrer la personne dans le fichier. Il dit donc franchement ce qu'il
 * fait : une demande, pas une inscription payée.
 *
 * Quand le stage propose plusieurs dates, on choisit d'abord son jour — comme
 * sur une billetterie. Les dates sont chargées depuis le navigateur : la page
 * du stage reste servie en statique, seule la disponibilité bouge.
 */
export default function DemandeDePlace({
  slug,
  titre,
  complet = false,
}: {
  slug: string;
  titre: string;
  complet?: boolean;
}) {
  const { champ, donnees } = useProtection();
  const [dates, setDates] = useState<DateProposee[] | null>(null);
  const [dateId, setDateId] = useState<string>("");
  const [form, setForm] = useState({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    message: "",
  });
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");
  const [fait, setFait] = useState<null | { attente: boolean }>(null);

  const champTexte =
    (cle: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm({ ...form, [cle]: e.target.value });

  // Les dates arrivent après l'affichage : le formulaire reste utilisable même
  // si l'appel échoue, exactement comme avant qu'elles existent.
  useEffect(() => {
    let vivant = true;
    fetch(`/api/stage/dates?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!vivant) return;
        const liste: DateProposee[] = Array.isArray(data?.dates) ? data.dates : [];
        setDates(liste);
        const premiere = liste.find((d) => d.etat !== "complet");
        if (premiere) setDateId(premiere.id);
      })
      .catch(() => vivant && setDates([]));
    return () => {
      vivant = false;
    };
  }, [slug]);

  const envoyer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (envoi) return;
    setEnvoi(true);
    setErreur("");
    try {
      const res = await fetch("/api/stage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, dateId: dateId || undefined, ...form, ...donnees() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErreur(data.error || "L'envoi a échoué. Réessayez dans un instant.");
        setEnvoi(false);
        return;
      }
      setFait({ attente: Boolean(data.attente) });
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
        <p className="display" style={{ fontSize: 26, margin: "0 0 10px", color: "var(--navy)" }}>
          {fait.attente ? "Vous êtes sur la liste." : "Votre demande est arrivée."}
        </p>
        <p style={{ color: "var(--mute)", lineHeight: 1.75, margin: 0 }}>
          {fait.attente
            ? "Le stage affiche complet. Dès qu'une place se libère, nous vous prévenons — dans l'ordre des demandes."
            : "Le secrétariat revient vers vous sous 48 heures ouvrées pour confirmer la place et vous transmettre les modalités de règlement."}
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
        {complet ? "Liste d'attente" : "Demander une place"}
      </p>
      <h3 className="display" style={{ fontSize: 26, margin: "0 0 10px", lineHeight: 1.2 }}>
        {titre}
      </h3>
      <p style={{ color: "var(--mute)", fontSize: 14.5, lineHeight: 1.7, margin: "0 0 24px" }}>
        {complet
          ? "Ce stage est complet. Laissez vos coordonnées : les places qui se libèrent sont proposées dans l'ordre des demandes."
          : "Une demande, pas encore une inscription : le secrétariat confirme la place et vous envoie les modalités de règlement."}
      </p>

      {dates && dates.length > 0 && (
        <div style={{ margin: "0 0 26px" }}>
          <p
            className="small"
            style={{
              letterSpacing: ".16em",
              textTransform: "uppercase",
              color: "var(--navy)",
              fontSize: 10.5,
              margin: "0 0 12px",
            }}
          >
            Choisissez votre date
          </p>
          <div className="dates-choix">
            {dates.map((d) => {
              const c = carteDate(d.debut);
              const complet = d.etat === "complet";
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => !complet && setDateId(d.id)}
                  aria-pressed={dateId === d.id}
                  disabled={complet}
                  className={`date-carte${dateId === d.id ? " choisie" : ""}${complet ? " complete" : ""}`}
                >
                  <span className="jour">{c.jour}</span>
                  <span className="numero">{c.numero}</span>
                  <span className="mois">{c.mois}</span>
                  <span className="heure">{c.heure}</span>
                  {ETATS_DATE[d.etat] && <span className="etat">{ETATS_DATE[d.etat]}</span>}
                </button>
              );
            })}
          </div>
          {dates.every((d) => d.etat === "complet") && (
            <p style={{ color: "var(--mute)", fontSize: 13, margin: "12px 0 0", lineHeight: 1.6 }}>
              Toutes les dates affichent complet. Laissez vos coordonnées : les places qui se
              libèrent sont proposées dans l&apos;ordre des demandes.
            </p>
          )}
        </div>
      )}

      <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
        <div className="field">
          <input
            type="text"
            required
            placeholder="Prénom"
            value={form.prenom}
            onChange={champTexte("prenom")}
            autoComplete="given-name"
          />
        </div>
        <div className="field">
          <input
            type="text"
            required
            placeholder="Nom"
            value={form.nom}
            onChange={champTexte("nom")}
            autoComplete="family-name"
          />
        </div>
      </div>

      <div className="field" style={{ marginTop: 14 }}>
        <input
          type="email"
          required
          placeholder="Adresse e-mail"
          value={form.email}
          onChange={champTexte("email")}
          autoComplete="email"
        />
      </div>
      <div className="field" style={{ marginTop: 14 }}>
        <input
          type="tel"
          placeholder="Téléphone (facultatif)"
          value={form.telephone}
          onChange={champTexte("telephone")}
          autoComplete="tel"
        />
      </div>
      <div className="field" style={{ marginTop: 14 }}>
        <textarea
          rows={4}
          placeholder="Ce que vous venez y chercher (facultatif)"
          value={form.message}
          onChange={champTexte("message")}
          style={{ resize: "vertical" }}
        />
      </div>

      {erreur && (
        <p style={{ color: "#b3261e", fontSize: 13, margin: "16px 0 0" }}>{erreur}</p>
      )}

      <button
        type="submit"
        className="btn btn-primary"
        disabled={envoi}
        style={{ width: "100%", justifyContent: "center", marginTop: 20, opacity: envoi ? 0.6 : 1 }}
      >
        {envoi ? "Envoi…" : complet ? "M'inscrire sur la liste d'attente" : "Demander ma place"}
      </button>
      <p
        className="small muted"
        style={{ margin: "14px 0 0", fontSize: 11.5, textAlign: "center" }}
      >
        Aucun paiement à cette étape · Vos données ne sont jamais cédées
      </p>
    </form>
  );
}
