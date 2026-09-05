import { describe, expect, it } from "vitest";
import {
  evaluer,
  manquantes,
  router,
  revenuModeste,
  SEQUENCE_DE_ROUTE,
  SEUIL_ELIGIBILITE,
  type Reponses,
} from "@/lib/questionnaire";

/**
 * Le questionnaire décide qui est invité à un entretien avec Domoïna et qui
 * est orienté ailleurs. Une erreur de barème ne se voit pas : elle se traduit
 * par des gens mal orientés, pendant des mois.
 */

/** Une copie franchement engagée, avec des réponses écrites longues. */
function copieEngagee(sur: Partial<Reponses> = {}): Reponses {
  const texte = "x".repeat(150);
  return {
    investir_temps: "Oui, pleinement",
    remettre_en_question: "Oui",
    travail_personnel: "Oui",
    depuis_quand: "Plus de 5 ans",
    pratique_reconnexion: "Oui, régulièrement",
    blessure_identifiee: "Oui",
    revenu: "2 000 – 5 000 €",
    prise_conscience: texte,
    difficulte_1: texte,
    difficulte_2: texte,
    difficulte_3: texte,
    empechement: texte,
    etat_emotionnel: texte,
    aspect_transformer: texte,
    ...sur,
  };
}

describe("evaluer", () => {
  it("déclare éligible une copie pleinement engagée", () => {
    const { score, eligible } = evaluer(copieEngagee());
    expect(score).toBeGreaterThanOrEqual(SEUIL_ELIGIBILITE);
    expect(eligible).toBe(true);
  });

  it("refuse celle qui ne veut rien remettre en question", () => {
    const { eligible } = evaluer(
      copieEngagee({
        investir_temps: "Non, pas pour le moment",
        remettre_en_question: "Non",
        travail_personnel: "Non",
        depuis_quand: undefined,
        pratique_reconnexion: "Non, jamais",
        blessure_identifiee: "Non",
      }),
    );
    expect(eligible).toBe(false);
  });

  it("fait peser l'engagement plus lourd que l'argent", () => {
    const riche = evaluer(
      copieEngagee({ revenu: "Plus de 5 000 €", investir_temps: "Non, pas pour le moment" }),
    );
    const engage = evaluer(copieEngagee({ revenu: "0 – 2 000 €" }));
    expect(engage.score).toBeGreaterThan(riche.score);
  });

  it("récompense le soin des réponses écrites, sans le laisser tout décider", () => {
    const bavard = evaluer(copieEngagee());
    const laconique = evaluer(
      copieEngagee({
        prise_conscience: "oui",
        difficulte_1: "oui",
        difficulte_2: "oui",
        difficulte_3: "oui",
        empechement: "oui",
        etat_emotionnel: "oui",
        aspect_transformer: "oui",
      }),
    );
    expect(bavard.score).toBeGreaterThan(laconique.score);
    // La rédaction ne vaut que quinze points sur cent dix : elle ne renverse
    // pas à elle seule le verdict d'une copie engagée.
    expect(laconique.eligible).toBe(true);
  });

  it("ne dépasse jamais cent, et détaille toujours d'où vient la note", () => {
    const { score, details } = evaluer(copieEngagee({ revenu: "Plus de 5 000 €" }));
    expect(score).toBeLessThanOrEqual(100);
    expect(details.length).toBeGreaterThan(1);
    expect(details.at(-1)?.libelle).toContain("réponses écrites");
  });

  it("ignore une réponse inconnue plutôt que de compter n'importe quoi", () => {
    const { score } = evaluer(copieEngagee({ revenu: "je préfère ne pas dire" }));
    const sansRevenu = evaluer(copieEngagee({ revenu: undefined }));
    expect(score).toBe(sansRevenu.score);
  });
});

describe("router", () => {
  it("envoie vers les formations dès que le revenu est modeste, même très engagé", () => {
    const reponses = copieEngagee({ revenu: "0 – 2 000 €" });
    const { eligible } = evaluer(reponses);
    expect(eligible).toBe(true);
    expect(router(reponses, eligible)).toBe("formations");
  });

  it("envoie vers l'appel une copie qualifiée aux revenus suffisants", () => {
    const reponses = copieEngagee({ revenu: "2 000 – 5 000 €" });
    expect(router(reponses, true)).toBe("appel");
  });

  it("envoie vers les stages une copie non qualifiée mais qui en a les moyens", () => {
    const reponses = copieEngagee({ revenu: "Plus de 5 000 €" });
    expect(router(reponses, false)).toBe("stages");
  });

  it("reconnaît le revenu modeste au libellé exact du questionnaire", () => {
    expect(revenuModeste({ revenu: "0 – 2 000 €" })).toBe(true);
    expect(revenuModeste({ revenu: "2 000 – 5 000 €" })).toBe(false);
    expect(revenuModeste({})).toBe(false);
  });

  it("associe chaque route à une séquence existante", () => {
    expect(SEQUENCE_DE_ROUTE.appel).toBe("prerequis");
    expect(SEQUENCE_DE_ROUTE.stages).toBe("stages");
    expect(SEQUENCE_DE_ROUTE.formations).toBe("formations");
  });
});

describe("manquantes", () => {
  it("réclame les champs obligatoires d'une copie vide", () => {
    const trous = manquantes({});
    expect(trous).toContain("nom_prenom");
    expect(trous).toContain("email");
  });

  it("ne réclame pas une question masquée par sa condition", () => {
    // « Depuis combien de temps » ne s'affiche que si le travail personnel a
    // été entrepris : une copie qui répond « Non » ne doit pas la voir exigée.
    expect(manquantes({ travail_personnel: "Non" })).not.toContain("depuis_quand");
  });
});
