import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd, faqLd } from "@/lib/jsonld";
import { getEvenement } from "@/lib/evenements";

/**
 * Les cercles : le barreau le plus accessible de l'échelle d'offres.
 *
 * Il vivait jusqu'ici sur un lien raccourci vers une boutique extérieure — les
 * séquences y envoyaient les gens sans que rien ne soit expliqué ici. Cette
 * page pose le principe (le rythme, le petit groupe, un axe à la fois) et
 * renvoie à la boutique pour ce qui bouge : les cercles ouverts, leur tarif et
 * leur calendrier. Ce qui change souvent n'a pas sa place en dur dans le code.
 */

const HUB = "https://bit.ly/4pT5ITp";

/**
 * `.sec-blue` ne pose que les couleurs de texte : le fond marine reste à la
 * charge de la page, comme sur les autres pages du site. Sans lui, du blanc
 * sur du blanc.
 */
const MARINE = "linear-gradient(150deg, #142579 0%, #0f1d6e 50%, #0a1450 100%)";

export const metadata: Metadata = {
  title: "Les cercles — avancer à plusieurs, à un rythme régulier",
  description:
    "Les cercles de La Voie 2 la Conscience : des rendez-vous réguliers en petit groupe, sur un axe précis — rêves, mémoires familiales, rapport à l'argent, relations, intimité. Sans engagement.",
  alternates: { canonical: "/cercles" },
  openGraph: {
    type: "website",
    title: "Les cercles — avancer à plusieurs, à un rythme régulier",
    description:
      "Un stage ouvre, le cercle inscrit. Des rendez-vous réguliers en petit groupe, sur un axe précis.",
  },
};

function Arrow({ size = 14 }: { size?: number }) {
  return (
    <svg className="arrow" width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M1 8h13M9 3l5 5-5 5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function Eyebrow({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <p className="eyebrow" style={{ margin: 0, ...style }}>
      <span className="dot" />
      {children}
      <span className="dot" />
    </p>
  );
}

const PRINCIPES = [
  {
    t: "Le rythme, pas l'intensité",
    b: "Une prise de conscience ne tient pas toute seule. Ce qui inscrit un changement, ce n'est pas la force du moment où il arrive, c'est le rendez-vous qui revient — et devant lequel on ne peut pas remettre à plus tard.",
  },
  {
    t: "Un petit groupe",
    b: "On y parle et on y est entendu. Le groupe fait ce qu'aucune lecture ne fait : il montre que ce qu'on croyait être son anomalie personnelle traverse la vie des autres, et il empêche de se raconter des histoires.",
  },
  {
    t: "Un axe à la fois",
    b: "Chaque cercle travaille une seule chose — les rêves, l'argent, ce qui se répète depuis des générations. On n'avance pas partout en même temps, et c'est pour cela qu'on avance vraiment quelque part.",
  },
];

const AXES = [
  {
    t: "Les rêves",
    b: "Décoder ce que la nuit dit et que le jour n'entend pas : les rêves qui reviennent, les cauchemars, les figures familières. Le seul cercle dont le détail vit sur ce site.",
    lien: "/canal-des-reves",
    interne: true,
  },
  {
    t: "Les mémoires familiales",
    b: "Ce qui se rejoue de génération en génération — les loyautés invisibles, les places assignées, les silences qu'on porte sans les avoir choisis.",
  },
  {
    t: "Le rapport à l'argent",
    b: "L'argent comme révélateur : ce qu'on n'ose pas demander, ce qu'on donne pour être aimé, ce qu'on ne garde jamais. Le remettre à son service plutôt que l'inverse.",
  },
  {
    t: "Sortir de l'abus",
    b: "Les relations où l'on se perd, et le chemin pour en sortir sans se briser : reconnaître le mécanisme, retrouver ses appuis, tenir la distance juste.",
  },
  {
    t: "Sexualité et intimité",
    b: "Le corps comme lieu de la transformation, et non comme sujet à part : ce qu'il retient, ce qu'il demande, ce qu'il permet quand on cesse de le traiter en étranger.",
  },
];

const FAQ = [
  {
    q: "Faut-il avoir fait un stage avant de rejoindre un cercle ?",
    a: "Non. Un cercle se rejoint tel qu'on est, et beaucoup de personnes commencent par là. Après un stage, il prend un autre sens : celui de ne pas laisser se refermer ce qui s'est ouvert.",
  },
  {
    q: "Combien de temps faut-il s'engager ?",
    a: "Les cercles fonctionnent au mois, sans engagement de durée. On reste tant que le rendez-vous sert, on s'arrête quand ce n'est plus le cas.",
  },
  {
    q: "Que se passe-t-il si je manque une séance ?",
    a: "Rien de grave : un cercle n'est pas un cursus, c'est un rythme. On reprend au rendez-vous suivant, sans avoir à rattraper quoi que ce soit.",
  },
  {
    q: "Quelle différence avec l'accompagnement individuel ?",
    a: "Le cercle avance sur un axe, en groupe, à un rythme régulier et pour un budget accessible. L'accompagnement individuel travaille votre histoire, à votre rythme, et suppose un entretien préalable. Beaucoup font les deux, à des moments différents.",
  },
];

export default function CerclesPage() {
  const reves = getEvenement("canal-des-reves");

  return (
    <div className="page-fade">
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "Accueil", path: "/" },
            { name: "Les cercles", path: "/cercles" },
          ]),
          faqLd(FAQ),
        ]}
      />

      {/* ─── Ouverture ─── */}
      <section
        className="page-hero"
        style={{ background: "var(--white)", borderBottom: "1px solid var(--line)", paddingBottom: 64 }}
      >
        <div className="container-narrow" style={{ textAlign: "center" }}>
          <Eyebrow style={{ justifyContent: "center", marginBottom: 30 }}>
            Le rythme · en petit groupe
          </Eyebrow>
          <h1
            className="display"
            style={{ fontSize: "clamp(34px, 4.4vw, 62px)", margin: "0 0 26px", lineHeight: 1.03 }}
          >
            Un stage ouvre.
            <br />
            <em className="display-italic">Le cercle inscrit.</em>
          </h1>
          <hr className="filet" style={{ margin: "0 auto 30px" }} />
          <p
            style={{
              fontSize: 17,
              lineHeight: 1.75,
              color: "var(--navy-ink)",
              maxWidth: 640,
              margin: "0 auto 32px",
            }}
          >
            Les personnes qui transforment durablement ne sont pas les plus motivées : ce sont
            celles qui ne restent pas seules. Les cercles sont des rendez-vous réguliers, en
            petit groupe, sur un axe précis — la porte la plus accessible de l&apos;accompagnement,
            et souvent la plus tenace.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a
              href={HUB}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-gold btn-lg"
            >
              Voir les cercles ouverts <Arrow />
            </a>
            <Link href="/contact" className="btn btn-ghost btn-lg">
              En parler d&apos;abord
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Ce qui fait un cercle ─── */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <Eyebrow>Ce qui fait un cercle</Eyebrow>
            <h2 className="display">Trois choses, et rien d&apos;autre.</h2>
          </div>
          <div className="rg-3">
            {PRINCIPES.map((p) => (
              <article key={p.t} className="card-hover" style={{ padding: 32 }}>
                <h3 className="display" style={{ fontSize: 21, margin: "0 0 12px" }}>
                  {p.t}
                </h3>
                <p style={{ margin: 0, lineHeight: 1.75, color: "var(--navy-ink)" }}>{p.b}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Les axes ─── */}
      <section className="section sec-blue" style={{ background: MARINE }}>
        <div className="container">
          <div className="section-head">
            <Eyebrow>Les axes travaillés</Eyebrow>
            <h2 className="display">Un cercle par endroit où ça coince.</h2>
            <p>
              Les cercles ouverts en ce moment, leur rythme et leur tarif se trouvent sur la
              boutique — c&apos;est ce qui bouge, et c&apos;est là que c&apos;est toujours à jour.
            </p>
          </div>

          <div className="rg-2">
            {AXES.map((a) => (
              <article key={a.t} className="card-marine" style={{ padding: 32 }}>
                <h3 className="display" style={{ fontSize: 21, margin: "0 0 12px" }}>
                  {a.t}
                </h3>
                <p style={{ margin: "0 0 18px", lineHeight: 1.75, color: "rgba(255,255,255,0.82)" }}>
                  {a.b}
                </p>
                {a.interne && a.lien ? (
                  <Link href={a.lien} className="btn btn-primary btn-sm">
                    Le Canal des Rêves{reves ? ` — ${reves.prix}` : ""} <Arrow />
                  </Link>
                ) : (
                  <a href={HUB} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                    Voir les modalités <Arrow />
                  </a>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Questions ─── */}
      <section className="section">
        <div className="container-narrow">
          <div className="section-head">
            <Eyebrow>Questions fréquentes</Eyebrow>
            <h2 className="display">Avant de rejoindre.</h2>
          </div>
          <div style={{ display: "grid", gap: 24 }}>
            {FAQ.map((f) => (
              <div key={f.q} style={{ borderTop: "1px solid var(--line)", paddingTop: 24 }}>
                <h3 style={{ fontSize: 17, margin: "0 0 10px", color: "var(--navy)" }}>{f.q}</h3>
                <p style={{ margin: 0, lineHeight: 1.75, color: "var(--navy-ink)" }}>{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Et après ─── */}
      <section className="section sec-blue" style={{ background: MARINE }}>
        <div className="container-narrow" style={{ textAlign: "center" }}>
          <Eyebrow style={{ justifyContent: "center", marginBottom: 26 }}>La suite</Eyebrow>
          <h2 className="display" style={{ fontSize: "clamp(28px, 3.4vw, 44px)", margin: "0 0 20px" }}>
            Le cercle n&apos;est pas un point d&apos;arrivée.
          </h2>
          <p style={{ lineHeight: 1.8, maxWidth: 620, margin: "0 auto 32px", color: "rgba(255,255,255,0.82)" }}>
            Quatre fois par an, au Centre HUT, les stages font en quatre jours ce qu&apos;un cercle
            fait en plusieurs mois : traverser dans le corps. Et pour un travail resserré sur
            votre propre histoire, l&apos;accompagnement individuel commence par un entretien.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/cycle-des-saisons" className="btn btn-gold btn-lg">
              Le Cycle des Saisons <Arrow />
            </Link>
            <Link href="/contact" className="btn btn-ghost-white btn-lg">
              Demander un entretien
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
