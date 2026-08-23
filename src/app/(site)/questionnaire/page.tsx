import type { Metadata } from "next";
import FormulaireQuestionnaire from "@/components/FormulaireQuestionnaire";

export const metadata: Metadata = {
  title: "Préparation du premier rendez-vous",
  description:
    "Le questionnaire à remplir avant tout entretien avec Domoïna. Vos réponses déterminent la suite du parcours.",
  // Page atteinte par lien personnel, pas par une recherche.
  robots: { index: false, follow: false },
  alternates: { canonical: "/questionnaire" },
};

export default function QuestionnairePage() {
  return (
    <div className="page-fade">
      <section
        className="page-hero"
        style={{
          background: "var(--white)",
          borderBottom: "1px solid var(--line)",
          paddingBottom: 56,
        }}
      >
        <div className="container-narrow" style={{ textAlign: "center" }}>
          <p
            className="eyebrow"
            style={{ margin: "0 0 30px", justifyContent: "center" }}
          >
            <span className="dot" />
            Préparation · premier rendez-vous
            <span className="dot" />
          </p>
          <h1
            className="display"
            style={{
              fontSize: "clamp(34px, 4.4vw, 62px)",
              margin: "0 0 26px",
              lineHeight: 1.03,
            }}
          >
            Avant de nous parler,
            <br />
            <em className="display-italic">posez ce qui vous amène.</em>
          </h1>
          <hr className="filet" style={{ margin: "0 auto 30px" }} />
          <p
            style={{
              fontSize: 17,
              lineHeight: 1.75,
              color: "var(--navy-ink)",
              maxWidth: 620,
              margin: "0 auto",
            }}
          >
            Une trentaine de questions, environ quinze minutes. Prenez-les au sérieux :
            elles servent à savoir si un entretien avec Domoïna est le pas juste pour
            vous maintenant, ou si un autre chemin vous conviendrait mieux.
          </p>
        </div>
      </section>

      <section className="section" style={{ background: "var(--paper)", paddingTop: 80 }}>
        <div className="container">
          <FormulaireQuestionnaire />
        </div>
      </section>
    </div>
  );
}
