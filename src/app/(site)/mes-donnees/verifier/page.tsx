import type { Metadata } from "next";
import Link from "next/link";
import { dossier, lireJeton } from "@/lib/crm/rgpd";
import { actionEffacer } from "./actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Vos données",
  robots: { index: false, follow: false },
};

function Coquille({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-fade">
      <section className="section" style={{ paddingTop: 120 }}>
        <div className="container-narrow" style={{ maxWidth: 640 }}>{children}</div>
      </section>
    </div>
  );
}

export default async function VerifierPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string; efface?: string }>;
}) {
  const { t, efface } = await searchParams;

  if (efface === "1") {
    return (
      <Coquille>
        <p
          className="small"
          style={{ letterSpacing: ".2em", textTransform: "uppercase", fontSize: 10.5, color: "var(--gold)", margin: "0 0 18px" }}
        >
          Effacé
        </p>
        <h1 className="display" style={{ fontSize: 34, margin: "0 0 16px" }}>
          C&apos;est fait.
        </h1>
        <p style={{ color: "var(--mute)", lineHeight: 1.75 }}>
          Vos données personnelles ont été effacées de notre fichier. Vous ne recevrez plus
          aucun message de notre part. Si vous souhaitez revenir un jour, vous serez le
          bienvenu — en repartant de zéro.
        </p>
        <p style={{ marginTop: 28 }}>
          <Link href="/" className="btn">Retour à l&apos;accueil</Link>
        </p>
      </Coquille>
    );
  }

  const email = t ? await lireJeton(t) : null;
  const d = email ? await dossier(email) : null;

  if (!email || !d) {
    return (
      <Coquille>
        <h1 className="display" style={{ fontSize: 34, margin: "0 0 16px" }}>
          Ce lien n&apos;est plus valable.
        </h1>
        <p style={{ color: "var(--mute)", lineHeight: 1.75 }}>
          Les liens d&apos;accès expirent au bout d&apos;une heure, par sécurité. Refaites
          simplement la demande depuis la page{" "}
          <Link href="/mes-donnees" style={{ color: "var(--blue)", textDecoration: "underline" }}>
            « Vos données »
          </Link>{" "}
          pour en recevoir un nouveau.
        </p>
      </Coquille>
    );
  }

  const c = d.contact as Record<string, string | null>;
  const lignes: [string, string][] = [
    ["Nom", [c.prenom, c.nom].filter(Boolean).join(" ") || "—"],
    ["E-mail", String(c.email ?? "—")],
    ["Téléphone", c.telephone || "—"],
    ["Statut", String(c.statut ?? "—")],
  ];
  const compte = [
    [d.evenements.length, "événement", "s dans votre chronologie"],
    [d.questionnaires.length, "questionnaire", "s"],
    [d.participations.length, "inscription", "s à un stage"],
    [d.propositions.length, "proposition", "s reçues"],
    [d.temoignages.length, "témoignage", "s déposés"],
  ] as const;

  return (
    <Coquille>
      <p
        className="small"
        style={{ letterSpacing: ".2em", textTransform: "uppercase", fontSize: 10.5, color: "var(--gold)", margin: "0 0 18px" }}
      >
        Vos données
      </p>
      <h1 className="display" style={{ fontSize: 34, margin: "0 0 18px", lineHeight: 1.1 }}>
        Voici ce que nous savons de vous.
      </h1>

      <div
        style={{ background: "var(--white)", border: "1px solid var(--line)", borderRadius: 16, padding: 26, margin: "0 0 22px" }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            {lignes.map(([k, v]) => (
              <tr key={k}>
                <td style={{ padding: "8px 0", color: "var(--mute)", fontSize: 14, width: 130 }}>{k}</td>
                <td style={{ padding: "8px 0", fontSize: 14.5 }}>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <ul style={{ margin: "16px 0 0", padding: "16px 0 0", borderTop: "1px solid var(--line)", listStyle: "none", display: "grid", gap: 6 }}>
          {compte
            .filter(([n]) => (n as number) > 0)
            .map(([n, mot, suite]) => (
              <li key={mot} style={{ fontSize: 14, color: "var(--navy-ink)" }}>
                {n} {mot}
                {(n as number) > 1 ? suite : suite.replace(/^s/, "")}
              </li>
            ))}
        </ul>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 34 }}>
        <a href={`/api/mes-donnees/export?t=${encodeURIComponent(t!)}`} className="btn btn-primary">
          Télécharger toutes mes données
        </a>
      </div>

      <div
        style={{ background: "var(--paper)", borderLeft: "3px solid #b3261e", borderRadius: 10, padding: "20px 22px" }}
      >
        <p className="display" style={{ fontSize: 20, margin: "0 0 8px", color: "var(--navy)" }}>
          Effacer mes données
        </p>
        <p style={{ color: "var(--mute)", fontSize: 14, lineHeight: 1.7, margin: "0 0 16px" }}>
          Cette action supprime définitivement vos coordonnées, vos réponses et votre
          historique de notre fichier. Elle est irréversible, et vous ne recevrez plus aucun
          message. Vos éventuels témoignages déjà publiés restent en ligne, mais détachés de
          votre identité.
        </p>
        <form action={actionEffacer}>
          <input type="hidden" name="jeton" value={t!} />
          <button type="submit" className="btn" style={{ borderColor: "#b3261e", color: "#b3261e" }}>
            Effacer définitivement mes données
          </button>
        </form>
      </div>
    </Coquille>
  );
}
