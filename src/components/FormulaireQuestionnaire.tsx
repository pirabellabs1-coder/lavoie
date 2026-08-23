"use client";

import { useState } from "react";
import { useProtection } from "@/components/Protection";
import {
  ETAPES,
  manquantes,
  visible,
  type Question,
  type Reponses,
} from "@/lib/questionnaire";

/**
 * Le questionnaire de préparation, en quatre étapes.
 *
 * Une étape par écran : on ne demande jamais trente réponses d'un coup, et
 * chaque étape est validée avant de passer à la suivante. Les réponses restent
 * en mémoire tant que la page n'est pas rechargée — c'est volontairement le
 * navigateur qui les garde, pas un stockage tiers.
 */
export default function FormulaireQuestionnaire() {
  const { champ, donnees } = useProtection();
  const [etape, setEtape] = useState(0);
  const [reponses, setReponses] = useState<Reponses>({});
  const [precisions, setPrecisions] = useState<Record<string, string>>({});
  const [manque, setManque] = useState<string[]>([]);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");
  const [fait, setFait] = useState(false);

  const courante = ETAPES[etape];
  const derniere = etape === ETAPES.length - 1;

  const definir = (cle: string, valeur: string | string[]) => {
    setReponses((r) => ({ ...r, [cle]: valeur }));
    setManque((m) => m.filter((c) => c !== cle));
  };

  const basculerMulti = (cle: string, valeur: string) => {
    const actuel = Array.isArray(reponses[cle]) ? (reponses[cle] as string[]) : [];
    definir(
      cle,
      actuel.includes(valeur) ? actuel.filter((v) => v !== valeur) : [...actuel, valeur],
    );
  };

  /** Fusionne les « Autre » avec leur précision avant l'envoi. */
  const consolider = (): Reponses => {
    const sortie: Reponses = { ...reponses };
    for (const e of ETAPES) {
      for (const q of e.questions) {
        if (!q.libre) continue;
        const v = sortie[q.cle];
        const p = precisions[q.cle]?.trim();
        if (v === q.libre && p) sortie[q.cle] = `${q.libre} : ${p}`;
      }
    }
    return sortie;
  };

  const suivant = () => {
    const absentes = manquantes(reponses, courante);
    if (absentes.length) {
      setManque(absentes);
      return;
    }
    setManque([]);
    setEtape((n) => n + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const precedent = () => {
    setManque([]);
    setEtape((n) => Math.max(0, n - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const envoyer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (envoi) return;

    const absentes = manquantes(reponses, courante);
    if (absentes.length) {
      setManque(absentes);
      return;
    }

    setEnvoi(true);
    setErreur("");
    try {
      const res = await fetch("/api/questionnaire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reponses: consolider(), ...donnees() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErreur(data.error || "L'envoi a échoué. Réessayez dans un instant.");
        setEnvoi(false);
        return;
      }
      setFait(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setErreur("Connexion impossible. Réessayez dans un instant.");
      setEnvoi(false);
    }
  };

  if (fait) {
    return (
      <div style={{ maxWidth: 620, margin: "0 auto", textAlign: "center", padding: "40px 0" }}>
        <p className="display" style={{ fontSize: 34, margin: "0 0 16px", color: "var(--navy)" }}>
          Votre questionnaire est arrivé.
        </p>
        <p style={{ color: "var(--mute)", lineHeight: 1.7 }}>
          Vos réponses ont été transmises au secrétariat de Domoïna. Vous recevez d&apos;ici
          quelques minutes un e-mail précisant la suite du parcours et ce qui vous est
          demandé avant tout entretien. Pensez à regarder vos indésirables s&apos;il tarde.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={envoyer} style={{ maxWidth: 700, margin: "0 auto" }}>
      {champ}

      <div style={{ marginBottom: 34 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: 10,
          }}
        >
          <span
            className="small"
            style={{
              letterSpacing: ".2em",
              textTransform: "uppercase",
              fontSize: 10.5,
              color: "var(--gold)",
            }}
          >
            Étape {etape + 1} sur {ETAPES.length}
          </span>
          <span style={{ fontSize: 12, color: "var(--mute)" }}>{courante.titre}</span>
        </div>
        <div
          style={{ height: 3, background: "var(--paper-alt)", borderRadius: 2 }}
          role="progressbar"
          aria-valuenow={etape + 1}
          aria-valuemin={1}
          aria-valuemax={ETAPES.length}
        >
          <div
            style={{
              height: "100%",
              width: `${((etape + 1) / ETAPES.length) * 100}%`,
              background: "var(--gold)",
              borderRadius: 2,
              transition: "width .4s var(--ease-out)",
            }}
          />
        </div>
      </div>

      <h2 className="display" style={{ fontSize: 30, margin: "0 0 10px" }}>
        {courante.titre}
      </h2>
      <p style={{ color: "var(--mute)", margin: "0 0 34px", lineHeight: 1.7 }}>
        {courante.intro}
      </p>

      <div style={{ display: "grid", gap: 30 }}>
        {courante.questions
          .filter((q) => visible(q, reponses))
          .map((q) => (
            <Champ
              key={q.cle}
              question={q}
              valeur={reponses[q.cle]}
              precision={precisions[q.cle] ?? ""}
              enDefaut={manque.includes(q.cle)}
              onChange={(v) => definir(q.cle, v)}
              onBascule={(v) => basculerMulti(q.cle, v)}
              onPrecision={(v) => setPrecisions((p) => ({ ...p, [q.cle]: v }))}
            />
          ))}
      </div>

      {manque.length > 0 && (
        <p style={{ color: "#b3261e", fontSize: 13, margin: "26px 0 0" }}>
          {manque.length === 1
            ? "Une réponse obligatoire est encore vide."
            : `${manque.length} réponses obligatoires sont encore vides.`}
        </p>
      )}
      {erreur && (
        <p style={{ color: "#b3261e", fontSize: 13, margin: "26px 0 0" }}>{erreur}</p>
      )}

      <div style={{ display: "flex", gap: 12, marginTop: 36, flexWrap: "wrap" }}>
        {etape > 0 && (
          <button type="button" className="btn" onClick={precedent}>
            Précédent
          </button>
        )}
        {derniere ? (
          <button
            type="submit"
            className="btn btn-primary"
            disabled={envoi}
            style={{ opacity: envoi ? 0.6 : 1 }}
          >
            {envoi ? "Envoi…" : "Envoyer le questionnaire"}
          </button>
        ) : (
          <button type="button" className="btn btn-primary" onClick={suivant}>
            Continuer
          </button>
        )}
      </div>
    </form>
  );
}

// ─── Un champ ───────────────────────────────────────────────────────────────

function Champ({
  question: q,
  valeur,
  precision,
  enDefaut,
  onChange,
  onBascule,
  onPrecision,
}: {
  question: Question;
  valeur: string | string[] | undefined;
  precision: string;
  enDefaut: boolean;
  onChange: (v: string) => void;
  onBascule: (v: string) => void;
  onPrecision: (v: string) => void;
}) {
  const bord = enDefaut ? "#b3261e" : "var(--line)";
  const texte = typeof valeur === "string" ? valeur : "";
  const liste = Array.isArray(valeur) ? valeur : [];

  const etiquette = (
    <>
      <span style={{ display: "block", fontWeight: 500, marginBottom: q.aide ? 4 : 10 }}>
        {q.titre}
        {q.obligatoire && <span style={{ color: "var(--gold)" }}> *</span>}
      </span>
      {q.aide && (
        <span
          style={{ display: "block", fontSize: 13, color: "var(--mute)", marginBottom: 12 }}
        >
          {q.aide}
        </span>
      )}
    </>
  );

  if (q.type === "case") {
    return (
      <label style={{ display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer" }}>
        <input
          type="checkbox"
          checked={texte === "Oui"}
          onChange={(e) => onChange(e.target.checked ? "Oui" : "")}
          style={{ marginTop: 5, accentColor: "var(--gold)", flex: "none" }}
        />
        <span style={{ fontSize: 14.5, lineHeight: 1.6, color: enDefaut ? "#b3261e" : "inherit" }}>
          {q.titre}
          {q.aide && (
            <span style={{ display: "block", fontSize: 13, color: "var(--mute)", marginTop: 4 }}>
              {q.aide}
            </span>
          )}
        </span>
      </label>
    );
  }

  if (q.type === "choix" || q.type === "ouinon" || q.type === "multi") {
    const options = q.type === "ouinon" ? ["Oui", "Non"] : (q.choix ?? []);
    const multiple = q.type === "multi";
    return (
      <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
        <legend style={{ padding: 0 }}>{etiquette}</legend>
        <div style={{ display: "grid", gap: 8 }}>
          {options.map((o) => {
            const coche = multiple ? liste.includes(o) : texte === o || texte.startsWith(`${o} :`);
            return (
              <label
                key={o}
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  padding: "11px 14px",
                  border: `1px solid ${coche ? "var(--gold)" : bord}`,
                  borderRadius: "var(--r-sm)",
                  background: coche ? "rgba(245,196,34,.08)" : "var(--white)",
                  cursor: "pointer",
                  fontSize: 14.5,
                }}
              >
                <input
                  type={multiple ? "checkbox" : "radio"}
                  name={q.cle}
                  checked={coche}
                  onChange={() => (multiple ? onBascule(o) : onChange(o))}
                  style={{ accentColor: "var(--gold)" }}
                />
                {o}
              </label>
            );
          })}
        </div>
        {q.libre && (texte === q.libre || texte.startsWith(`${q.libre} :`)) && (
          <input
            type="text"
            className="adm-champ"
            placeholder="Précisez en quelques mots"
            value={precision}
            onChange={(e) => onPrecision(e.target.value)}
            style={{
              marginTop: 10,
              width: "100%",
              padding: "11px 14px",
              border: `1px solid ${bord}`,
              borderRadius: "var(--r-sm)",
              font: "inherit",
              fontSize: 14.5,
            }}
          />
        )}
      </fieldset>
    );
  }

  const commun = {
    value: texte,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(e.target.value),
    style: {
      width: "100%",
      padding: "12px 14px",
      border: `1px solid ${bord}`,
      borderRadius: "var(--r-sm)",
      font: "inherit",
      fontSize: 14.5,
      background: "var(--white)",
      color: "inherit",
    },
  };

  return (
    <label style={{ display: "block" }}>
      {etiquette}
      {q.type === "long" ? (
        <textarea {...commun} rows={5} style={{ ...commun.style, resize: "vertical" }} />
      ) : (
        <input
          {...commun}
          type={q.type === "email" ? "email" : q.type === "tel" ? "tel" : "text"}
          autoComplete={
            q.type === "email" ? "email" : q.type === "tel" ? "tel" : undefined
          }
        />
      )}
    </label>
  );
}
