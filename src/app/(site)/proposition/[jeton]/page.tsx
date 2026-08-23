import type { Metadata } from "next";
import Link from "next/link";
import { euros, ouvrirOffre } from "@/lib/crm/offres";
import { actionRepondre } from "./actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Votre proposition",
  robots: { index: false, follow: false },
};

function dateLongue(d: Date | string): string {
  const v = d instanceof Date ? d : new Date(d);
  return v.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

function Coquille({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-fade">
      <section className="section" style={{ paddingTop: 120 }}>
        <div className="container-narrow" style={{ maxWidth: 660 }}>{children}</div>
      </section>
    </div>
  );
}

export default async function PropositionPage({
  params,
}: {
  params: Promise<{ jeton: string }>;
}) {
  const { jeton } = await params;
  const offre = await ouvrirOffre(jeton);

  if (!offre) {
    return (
      <Coquille>
        <h1 className="display" style={{ fontSize: 34, margin: "0 0 16px" }}>
          Ce lien n&apos;est plus valable.
        </h1>
        <p style={{ color: "var(--mute)", lineHeight: 1.75 }}>
          Il a peut-être été tronqué par votre messagerie. Ouvrez-le depuis l&apos;e-mail
          d&apos;origine, ou écrivez-nous à contact@lavoie2laconscience.com.
        </p>
        <p style={{ marginTop: 28 }}>
          <Link href="/" className="btn">Retour à l&apos;accueil</Link>
        </p>
      </Coquille>
    );
  }

  const tranchee = ["acceptee", "refusee", "expiree"].includes(offre.statut);
  // La date du jour est celle de la base : le rendu ne lit pas l'heure.
  const expiree = offre.perimee;

  return (
    <Coquille>
      <p
        className="small"
        style={{
          letterSpacing: ".2em",
          textTransform: "uppercase",
          fontSize: 10.5,
          color: "var(--gold)",
          margin: "0 0 18px",
        }}
      >
        Proposition personnelle
      </p>

      <h1 className="display" style={{ fontSize: 36, margin: "0 0 10px", lineHeight: 1.1 }}>
        {offre.intitule}
      </h1>
      <p style={{ color: "var(--mute)", margin: "0 0 30px" }}>
        Préparée pour {offre.prenom ?? offre.email}
        {offre.valide_jusqu_au && ` · valable jusqu'au ${dateLongue(offre.valide_jusqu_au)}`}
      </p>

      <div
        style={{
          background: "var(--white)",
          border: "1px solid var(--line)",
          borderRadius: 18,
          padding: 30,
          marginBottom: 28,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16, flexWrap: "wrap" }}>
          <span style={{ color: "var(--mute)", fontSize: 14 }}>Montant</span>
          <span className="display" style={{ fontSize: 34, color: "var(--navy)" }}>
            {euros(offre.montant_cents)}
          </span>
        </div>
        {offre.echeancier && (
          <p style={{ margin: "14px 0 0", color: "var(--navy-ink)", lineHeight: 1.7 }}>
            {offre.echeancier}
          </p>
        )}
      </div>

      {offre.message && (
        <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.85, fontSize: 16, marginBottom: 34 }}>
          {offre.message}
        </div>
      )}

      {offre.statut === "acceptee" ? (
        <div style={{ background: "var(--paper)", borderTop: "3px solid var(--gold)", padding: 26 }}>
          <p className="display" style={{ fontSize: 24, margin: "0 0 8px", color: "var(--navy)" }}>
            C&apos;est noté.
          </p>
          <p style={{ margin: 0, color: "var(--mute)", lineHeight: 1.75 }}>
            Votre accord a bien été enregistré. Le secrétariat revient vers vous pour la
            suite — les modalités pratiques, les dates, et le premier pas.
          </p>
        </div>
      ) : offre.statut === "refusee" ? (
        <div style={{ background: "var(--paper)", padding: 26 }}>
          <p className="display" style={{ fontSize: 24, margin: "0 0 8px", color: "var(--navy)" }}>
            Entendu.
          </p>
          <p style={{ margin: 0, color: "var(--mute)", lineHeight: 1.75 }}>
            Votre réponse a été transmise. Un « non » clair vaut mieux qu&apos;un silence, et
            la porte reste ouverte si le moment change.
          </p>
        </div>
      ) : tranchee || expiree ? (
        <div style={{ background: "var(--paper)", padding: 26 }}>
          <p style={{ margin: 0, color: "var(--mute)", lineHeight: 1.75 }}>
            Cette proposition n&apos;est plus ouverte. Si vous souhaitez la reprendre,
            écrivez simplement à contact@lavoie2laconscience.com.
          </p>
        </div>
      ) : (
        <div>
          <p style={{ color: "var(--mute)", fontSize: 14.5, lineHeight: 1.75, marginBottom: 18 }}>
            Prenez le temps qu&apos;il faut. Une décision prise sous pression n&apos;engage rien
            de solide — et un refus est une réponse parfaitement valable.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <form action={actionRepondre}>
              <input type="hidden" name="jeton" value={jeton} />
              <input type="hidden" name="reponse" value="oui" />
              <button type="submit" className="btn btn-primary">
                J&apos;accepte cette proposition
              </button>
            </form>
            <form action={actionRepondre}>
              <input type="hidden" name="jeton" value={jeton} />
              <input type="hidden" name="reponse" value="non" />
              <button type="submit" className="btn">
                Ce ne sera pas maintenant
              </button>
            </form>
          </div>
        </div>
      )}
    </Coquille>
  );
}
