import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { faqLd, breadcrumbLd } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "FAQ — Questions fréquentes sur l'accompagnement",
  description:
    "Toutes les réponses à vos questions sur l'accompagnement de Domoina, l'Offre Gold, le Centre HUT et les méthodes de transformation.",
  alternates: { canonical: "/faq" },
};

function Arrow() {
  return (
    <svg className="arrow" width={14} height={14} viewBox="0 0 16 16" fill="none">
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

const categories = [
  {
    titre: "L'accompagnement",
    questions: [
      {
        q: "À qui s'adresse l'accompagnement de Domoina ?",
        r: "L'accompagnement est destiné aux dirigeants, cadres supérieurs et thérapeutes qui ressentent un décalage entre leur vie extérieure (souvent réussie) et leur état intérieur. Il s'adresse à celles et ceux qui sont prêts à aller en profondeur pour transformer durablement leur relation à eux-mêmes et au monde.",
      },
      {
        q: "Comment se déroule un accompagnement type ?",
        r: "Chaque accompagnement commence par un appel découverte (offert, 30 min), suivi d'un bilan approfondi. L'accompagnement alterne ensuite entre séances individuelles, stages immersifs au Centre HUT et temps d'intégration. Le rythme est adapté à chaque personne.",
      },
      {
        q: "Les séances peuvent-elles se faire à distance ?",
        r: "Oui, les séances individuelles peuvent se dérouler en visioconférence. Cependant, les stages immersifs au Centre HUT requièrent une présence physique — c'est un élément essentiel et non substituable de la transformation.",
      },
      {
        q: "Quelle est la différence entre les trois niveaux de l'Offre Gold ?",
        r: "Les trois niveaux se distinguent par la durée, l'intensité et la profondeur du suivi. L'Immersion Essence (3 mois) pose les fondations. L'Immersion Expansion (6 mois) approfondit et ancre. L'Immersion Royale (9-12 mois) offre un accompagnement total, illimité et sur mesure.",
      },
    ],
  },
  {
    titre: "Le Centre HUT",
    questions: [
      {
        q: "Comment se rendre au Centre HUT ?",
        r: "Le Centre est situé à Rouperroux-le-Coquet, en Sarthe, à environ 2h de Paris. Il est accessible en voiture (A11 puis D357) ou en train jusqu'au Mans, avec un transfert organisé sur demande.",
      },
      {
        q: "Que faut-il prévoir pour un stage immersif ?",
        r: "Chaque participant reçoit une liste préparatoire détaillée avant son arrivée. En général : tenues confortables et tenues pour la nature, affaires de bain, carnet personnel. Les repas et l'hébergement sont inclus dans le programme.",
      },
      {
        q: "Peut-on visiter le Centre HUT sans être inscrit à un programme ?",
        r: "Le Centre HUT accueille exclusivement les participants aux programmes de l'Offre Gold. Il n'est pas ouvert aux visites libres, afin de préserver la qualité et la sacralité de l'espace.",
      },
    ],
  },
  {
    titre: "Tarifs & pratique",
    questions: [
      {
        q: "Quels sont les tarifs de l'Offre Gold ?",
        r: "Les tarifs sont établis sur devis personnalisé, en fonction du niveau d'accompagnement et de votre situation spécifique. Contactez-nous pour recevoir une proposition adaptée à vos besoins.",
      },
      {
        q: "Est-il possible de payer en plusieurs fois ?",
        r: "Oui, des facilités de paiement peuvent être proposées en fonction de votre situation. Cette possibilité est discutée lors de l'appel découverte.",
      },
      {
        q: "Proposez-vous un premier entretien gratuit ?",
        r: "Absolument. L'appel découverte (30 minutes) est offert, sans engagement et sans pression. Il permet de faire connaissance, d'explorer votre situation et de déterminer si l'accompagnement est adapté pour vous.",
      },
      {
        q: "L'accompagnement est-il confidentiel ?",
        r: "La confidentialité est un pilier fondamental de notre pratique. Tout ce qui est partagé en séance ou lors des stages reste strictement confidentiel, conformément au cadre déontologique de Domoina.",
      },
    ],
  },
];

const allFaqs = categories.flatMap((c) => c.questions.map((q) => ({ q: q.q, a: q.r })));

export default function FAQ() {
  return (
    <div className="page-fade">
      <JsonLd
        data={[
          faqLd(allFaqs),
          breadcrumbLd([
            { name: "Accueil", path: "/" },
            { name: "FAQ", path: "/faq" },
          ]),
        ]}
      />

      {/* HERO */}
      <section className="page-hero" style={{ background: "var(--white)", borderBottom: "1px solid var(--line)" }}>
        <div className="container-narrow" style={{ textAlign: "center" }}>
          <Eyebrow style={{ marginBottom: 32 }}>Questions fréquentes</Eyebrow>
          <h1 className="display" style={{ fontSize: "clamp(52px, 7vw, 96px)", margin: "0 0 28px", lineHeight: 0.98 }}>
            Vos questions,<br /><em className="display-italic">nos réponses.</em>
          </h1>
          <hr className="filet" style={{ margin: "0 auto" }} />
        </div>
      </section>

      {/* FAQ */}
      <section className="section">
        <div className="container-narrow">

          {categories.map((cat, ci) => (
            <div key={ci} style={{ marginBottom: 72 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 40 }}>
                <span className="card-num" style={{ fontSize: 13 }}>0{ci + 1}.</span>
                <h2 className="display" style={{ fontSize: 36, color: "var(--navy)", margin: 0 }}>{cat.titre}</h2>
              </div>

              <div style={{ borderTop: "1px solid var(--line)" }}>
                {cat.questions.map((item, qi) => (
                  <details key={qi} style={{ borderBottom: "1px solid var(--line)" }}>
                    <summary style={{
                      listStyle: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 24,
                      padding: "28px 0",
                      cursor: "pointer",
                    }}>
                      <span className="display" style={{ fontSize: 22, color: "var(--navy)", lineHeight: 1.3 }}>{item.q}</span>
                      <span style={{ width: 32, height: 32, border: "1px solid var(--navy)", display: "grid", placeItems: "center", flexShrink: 0, color: "var(--navy)", fontSize: 20, transition: "transform .3s, background .3s, color .3s" }}>+</span>
                    </summary>
                    <p style={{ fontSize: 16, lineHeight: 1.8, color: "var(--mute)", margin: "0 0 28px", maxWidth: 680 }}>{item.r}</p>
                  </details>
                ))}
              </div>
            </div>
          ))}

          {/* Question non trouvée */}
          <div className="sec-blue" style={{ background: "linear-gradient(150deg, #142579 0%, #0f1d6e 50%, #0a1450 100%)", padding: "48px 40px", textAlign: "center" }}>
            <h3 className="display" style={{ fontSize: 32, color: "var(--white)", margin: "0 0 16px" }}>
              Vous ne trouvez pas votre réponse ?
            </h3>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.65)", margin: "0 0 32px" }}>
              Domoina répond personnellement à toutes vos questions sous 24h ouvrées.
            </p>
            <Link href="/contact" className="btn btn-gold">
              Poser ma question <Arrow />
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
}
