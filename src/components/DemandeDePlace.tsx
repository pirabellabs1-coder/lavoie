"use client";

import { useEffect, useState } from "react";
import { useProtection } from "@/components/Protection";

/**
 * Réserver sa place à un stage.
 *
 * Le parcours reprend celui d'une billetterie, parce que c'est celui que les
 * gens connaissent : on choisit d'abord **son jour**, puis **combien de
 * places**, on voit **ce que ça fait au total**, et seulement ensuite on donne
 * ses coordonnées. Demander un nom avant d'avoir rien montré, c'est réclamer
 * un engagement avant d'avoir dit ce qu'on engage.
 *
 * Une seule différence avec une billetterie, assumée et écrite à l'écran :
 * rien n'est encaissé ici. La demande part au secrétariat, qui confirme la
 * place et transmet les modalités de règlement. Promettre un paiement qui
 * n'existe pas serait pire que de ne rien promettre.
 *
 * Les dates et le tarif arrivent après l'affichage, depuis le tableau de bord :
 * la page du stage reste servie en statique, seule la disponibilité bouge.
 */

/** Une date proposée, telle que la renvoie /api/stage/dates. */
type DateProposee = {
  id: string;
  debut: string;
  fin: string | null;
  etat: "libre" | "dernieres" | "complet" | "fermee" | "passee";
  restantes: number;
};

type StageInfo = {
  titre: string;
  lieu: string | null;
  prixCents: number | null;
  ouvert: boolean;
  restantes: number | null;
};

const ETATS_DATE: Record<string, string> = {
  dernieres: "Dernières places",
  complet: "Complet",
};

const MAX_PLACES = 6;

function partiesDeDate(iso: string) {
  const d = new Date(iso);
  const p = (options: Intl.DateTimeFormatOptions) =>
    d.toLocaleString("fr-FR", { timeZone: "Europe/Paris", ...options });
  return {
    jour: p({ weekday: "short" }).replace(".", ""),
    numero: p({ day: "numeric" }),
    mois: p({ month: "short" }).replace(".", ""),
    heure: p({ hour: "2-digit", minute: "2-digit" }),
    complet: p({
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

function euros(cents: number): string {
  return (cents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

export default function DemandeDePlace({
  slug,
  titre,
  complet = false,
  prixTexte,
  dateTexte,
}: {
  slug: string;
  titre: string;
  complet?: boolean;
  /** Le tarif écrit au catalogue, tant qu'aucun montant n'est réglé en base. */
  prixTexte?: string;
  /** Les dates écrites au catalogue, tant qu'aucune n'est ouverte en base. */
  dateTexte?: string;
}) {
  const { champ, donnees } = useProtection();

  const [etape, setEtape] = useState<"choix" | "coordonnees">("choix");
  const [stage, setStage] = useState<StageInfo | null>(null);
  const [dates, setDates] = useState<DateProposee[] | null>(null);
  const [dateId, setDateId] = useState("");
  const [places, setPlaces] = useState(1);

  const [form, setForm] = useState({ prenom: "", nom: "", email: "", telephone: "", message: "" });
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");
  const [fait, setFait] = useState<null | { attente: boolean }>(null);

  const champTexte =
    (cle: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm({ ...form, [cle]: e.target.value });

  // Les dates et le tarif arrivent après le rendu. Si l'appel échoue, le
  // panneau reste utilisable : on retombe sur ce que dit le catalogue.
  useEffect(() => {
    let vivant = true;
    fetch(`/api/stage/dates?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!vivant) return;
        setStage(data?.stage ?? null);
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

  const choisie = dates?.find((d) => d.id === dateId) ?? null;
  const toutComplet = Boolean(dates?.length && dates.every((d) => d.etat === "complet"));
  const listeAttente = complet || toutComplet;
  const prixCents = stage?.prixCents ?? null;
  const total = prixCents != null ? prixCents * places : null;
  // On ne propose jamais plus de places qu'il n'en reste sur la date choisie.
  const plafond = Math.max(
    1,
    Math.min(MAX_PLACES, choisie && choisie.restantes > 0 ? choisie.restantes : MAX_PLACES),
  );

  const envoyer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (envoi) return;
    setEnvoi(true);
    setErreur("");
    try {
      const res = await fetch("/api/stage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          dateId: dateId || undefined,
          personnes: places,
          ...form,
          ...donnees(),
        }),
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
    overflow: "hidden",
  };

  // ── Après l'envoi ─────────────────────────────────────────────────────────
  if (fait) {
    return (
      <div style={{ ...cadre, borderTop: "3px solid var(--gold)", padding: 34 }}>
        <p className="display" style={{ fontSize: 26, margin: "0 0 10px", color: "var(--navy)" }}>
          {fait.attente ? "Vous êtes sur la liste." : "Votre demande est arrivée."}
        </p>
        <p style={{ color: "var(--mute)", lineHeight: 1.75, margin: "0 0 18px" }}>
          {fait.attente
            ? "Le stage affiche complet. Dès qu'une place se libère, nous vous prévenons — dans l'ordre des demandes."
            : "Le secrétariat revient vers vous sous 48 heures ouvrées pour confirmer la place et vous transmettre les modalités de règlement."}
        </p>
        <div className="resa-recap">
          {choisie && <span>{partiesDeDate(choisie.debut).complet}</span>}
          <span>
            {places} place{places > 1 ? "s" : ""}
          </span>
          {total != null && <span>{euros(total)}</span>}
        </div>
      </div>
    );
  }

  // ── Étape 1 : la place ────────────────────────────────────────────────────
  if (etape === "choix") {
    return (
      <div style={cadre}>
        <div className="resa-entete">
          <div>
            <p className="resa-sur">{listeAttente ? "Liste d'attente" : "Réserver ma place"}</p>
            <h3 className="display resa-titre">{titre}</h3>
            {stage?.lieu && <p className="resa-lieu">{stage.lieu}</p>}
          </div>
          <div className="resa-prix">
            {prixCents != null ? (
              <>
                <span className="montant">{euros(prixCents)}</span>
                <span className="par">par personne</span>
              </>
            ) : (
              <span className="par">{prixTexte ?? "Tarif sur demande"}</span>
            )}
          </div>
        </div>

        <div className="resa-corps">
          <p className="resa-legende">Date et heure</p>
          {dates === null ? (
            <p className="resa-attente">Chargement des dates…</p>
          ) : dates.length > 0 ? (
            <div className="dates-choix">
              {dates.map((d) => {
                const c = partiesDeDate(d.debut);
                const plein = d.etat === "complet";
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => {
                      if (plein) return;
                      setDateId(d.id);
                      setPlaces(1);
                    }}
                    aria-pressed={dateId === d.id}
                    disabled={plein}
                    className={`date-carte${dateId === d.id ? " choisie" : ""}${plein ? " complete" : ""}`}
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
          ) : (
            <p className="resa-date-fixe">{dateTexte ?? "Dates communiquées à la confirmation"}</p>
          )}

          <p className="resa-legende" style={{ marginTop: 26 }}>
            Places
          </p>
          <div className="resa-billet">
            <div>
              <div className="nom">Participation au stage</div>
              <div className="detail">
                {prixTexte ?? (prixCents != null ? euros(prixCents) : "Tarif sur demande")}
                {choisie && choisie.restantes > 0 && choisie.restantes <= 6
                  ? ` · ${choisie.restantes} place${choisie.restantes > 1 ? "s" : ""} restante${choisie.restantes > 1 ? "s" : ""}`
                  : ""}
              </div>
            </div>
            <div className="compteur">
              <button
                type="button"
                onClick={() => setPlaces((n) => Math.max(1, n - 1))}
                disabled={places <= 1}
                aria-label="Retirer une place"
              >
                −
              </button>
              <span aria-live="polite">{places}</span>
              <button
                type="button"
                onClick={() => setPlaces((n) => Math.min(plafond, n + 1))}
                disabled={places >= plafond}
                aria-label="Ajouter une place"
              >
                +
              </button>
            </div>
          </div>

          {total != null && prixCents != null && (
            <div className="resa-total">
              <span>
                {places} × {euros(prixCents)}
              </span>
              <strong>{euros(total)}</strong>
            </div>
          )}

          {listeAttente && (
            <p className="resa-note">
              Ce stage affiche complet. Votre demande entre en liste d&apos;attente : les places
              qui se libèrent sont proposées dans l&apos;ordre des demandes.
            </p>
          )}

          <p className="resa-note">
            <strong>Aucun paiement à cette étape.</strong> Le secrétariat confirme votre place
            sous 48 heures ouvrées et vous transmet les modalités de règlement.
          </p>

          <button
            type="button"
            className="btn btn-gold btn-lg resa-suite"
            onClick={() => setEtape("coordonnees")}
          >
            Continuer
          </button>
        </div>
      </div>
    );
  }

  // ── Étape 2 : les coordonnées ─────────────────────────────────────────────
  return (
    <form onSubmit={envoyer} style={cadre}>
      {champ}

      <div className="resa-entete">
        <div>
          <p className="resa-sur">Vos coordonnées</p>
          <h3 className="display resa-titre">{titre}</h3>
        </div>
        <button type="button" className="resa-modifier" onClick={() => setEtape("choix")}>
          Modifier
        </button>
      </div>

      <div className="resa-corps">
        <div className="resa-recap">
          {choisie ? (
            <span>{partiesDeDate(choisie.debut).complet}</span>
          ) : (
            dateTexte && <span>{dateTexte}</span>
          )}
          <span>
            {places} place{places > 1 ? "s" : ""}
          </span>
          {total != null && <span>{euros(total)}</span>}
        </div>

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
            placeholder="Votre e-mail"
            value={form.email}
            onChange={champTexte("email")}
            autoComplete="email"
          />
        </div>

        <div className="field" style={{ marginTop: 14 }}>
          <input
            type="tel"
            placeholder="Votre téléphone (facultatif)"
            value={form.telephone}
            onChange={champTexte("telephone")}
            autoComplete="tel"
          />
        </div>

        <div className="field" style={{ marginTop: 14 }}>
          <textarea
            rows={3}
            placeholder="Une question, une précision ? (facultatif)"
            value={form.message}
            onChange={champTexte("message")}
          />
        </div>

        {erreur && (
          <p style={{ color: "var(--gold)", fontSize: 14, margin: "14px 0 0" }} role="alert">
            {erreur}
          </p>
        )}

        <button type="submit" className="btn btn-gold btn-lg resa-suite" disabled={envoi}>
          {envoi ? "Envoi…" : listeAttente ? "M'inscrire sur la liste" : "Envoyer ma demande"}
        </button>

        <p className="resa-note" style={{ textAlign: "center", marginBottom: 0 }}>
          Aucun paiement à cette étape · Vos données ne sont jamais cédées
        </p>
      </div>
    </form>
  );
}
