import Link from "next/link";
import { temoignagesPublies } from "@/lib/crm/temoignages";

/**
 * Trois voix, juste avant de réserver.
 *
 * Les mêmes sur toutes les pages : les témoignages ne sont pas rattachés à un
 * stage en particulier, et le nom du composant le dit plutôt que de laisser
 * croire à un filtrage qui n'existe pas.
 *
 * Les témoignages existaient, rangés sur une page que personne n'ouvre au
 * moment de décider. Ils valent cent fois plus ici, à l'endroit exact où l'on
 * hésite — et ils sont déjà modérés, donc rien de neuf à surveiller.
 *
 * Le bloc disparaît s'il n'y a rien à montrer : trois places vides diraient le
 * contraire de ce qu'on cherche.
 */

function Etoiles({ note }: { note: number }) {
  return (
    <span
      aria-label={`${note} sur 5`}
      style={{ color: "var(--gold)", letterSpacing: ".18em", fontSize: 13 }}
    >
      {"★".repeat(Math.max(1, Math.min(5, note)))}
    </span>
  );
}

export default async function AvisPublies({ titre }: { titre?: string }) {
  const tous = await temoignagesPublies();
  if (tous.length === 0) return null;
  const avis = tous.slice(0, 3);

  return (
    <section className="section-tight" style={{ background: "var(--white)" }}>
      <div className="container">
        <p
          className="eyebrow"
          style={{ margin: "0 0 26px", justifyContent: "center", color: "var(--navy)" }}
        >
          <span className="dot" />
          {titre ?? "Ce qu'elles et ils en disent"}
          <span className="dot" />
        </p>

        <div className="rg-3" style={{ gap: 20, alignItems: "stretch" }}>
          {avis.map((a, i) => (
            <figure
              key={i}
              style={{
                margin: 0,
                display: "flex",
                flexDirection: "column",
                background: "var(--paper)",
                border: "1px solid var(--line)",
                borderRadius: 16,
                padding: "28px 30px",
              }}
            >
              {a.note != null && <Etoiles note={a.note} />}
              <blockquote
                style={{
                  margin: a.note != null ? "14px 0 0" : 0,
                  fontFamily: "var(--serif)",
                  fontStyle: "italic",
                  fontSize: 17,
                  lineHeight: 1.65,
                  color: "var(--navy-ink)",
                  flexGrow: 1,
                }}
              >
                « {a.texte} »
              </blockquote>
              <figcaption
                style={{
                  marginTop: 20,
                  paddingTop: 16,
                  borderTop: "1px solid var(--line)",
                  fontSize: 13,
                  color: "var(--mute)",
                }}
              >
                <strong style={{ color: "var(--navy)", fontWeight: 600 }}>{a.nom}</strong>
                {a.contexte && ` · ${a.contexte}`}
              </figcaption>
            </figure>
          ))}
        </div>

        {tous.length > avis.length && (
          <p style={{ textAlign: "center", margin: "28px 0 0" }}>
            <Link href="/temoignages" className="link-underline" style={{ color: "var(--blue)", fontWeight: 500, fontSize: 14 }}>
              Lire les {tous.length} témoignages
            </Link>
          </p>
        )}
      </div>
    </section>
  );
}
