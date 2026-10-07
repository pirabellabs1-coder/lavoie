import { describe, expect, it } from "vitest";
import { PROFILS, profil, profilDesReponses } from "@/lib/crm/profils";
import { SEQUENCES_PAR_DEFAUT } from "@/lib/crm/sequences";
import { router, sequencePour, type Reponses } from "@/lib/questionnaire";

/**
 * Le profil décide ce qu'une personne va lire pendant un mois. Se tromper ici,
 * ce n'est pas afficher la mauvaise étiquette : c'est envoyer à quelqu'un qui
 * gagne 1 800 € par mois une séquence qui mène à un accompagnement premium.
 */

function copie(sur: Partial<Reponses> = {}): Reponses {
  return {
    situation_pro: "Salarié(e)",
    revenu: "2 000 – 5 000 €",
    travail_personnel: "Oui",
    depuis_quand: "1 à 3 ans",
    ...sur,
  };
}

describe("profilDesReponses", () => {
  it("met le budget serré avant tout le reste", () => {
    // Même une dirigeante très avancée : si le revenu ne suit pas, lui vendre
    // un accompagnement premium serait malhonnête.
    expect(
      profilDesReponses(
        copie({
          revenu: "0 – 2 000 €",
          situation_pro: "Dirigeant(e) / Chef d'entreprise",
          depuis_quand: "Plus de 5 ans",
        }),
      ),
    ).toBe("accessible");
  });

  it("reconnaît le dirigeant à ses moyens et à sa fonction", () => {
    expect(
      profilDesReponses(
        copie({ situation_pro: "Dirigeant(e) / Chef d'entreprise", revenu: "Plus de 5 000 €" }),
      ),
    ).toBe("dirigeant");
    expect(
      profilDesReponses(
        copie({ situation_pro: "Indépendant(e) / Entrepreneur", revenu: "Plus de 5 000 €" }),
      ),
    ).toBe("dirigeant");
  });

  it("ne fait pas un dirigeant d'un salarié bien payé", () => {
    expect(profilDesReponses(copie({ situation_pro: "Salarié(e)", revenu: "Plus de 5 000 €" }))).toBe(
      "cadre",
    );
  });

  it("ne fait pas un dirigeant de qui dirige sans en avoir les moyens", () => {
    expect(
      profilDesReponses(
        copie({ situation_pro: "Dirigeant(e) / Chef d'entreprise", revenu: "2 000 – 5 000 €" }),
      ),
    ).toBe("cadre");
  });

  it("repère le chemin déjà engagé au-delà de trois ans", () => {
    expect(profilDesReponses(copie({ depuis_quand: "3 à 5 ans" }))).toBe("avance");
    expect(profilDesReponses(copie({ depuis_quand: "Plus de 5 ans" }))).toBe("avance");
    // En deçà, c'est encore une transition ordinaire.
    expect(profilDesReponses(copie({ depuis_quand: "1 à 3 ans" }))).toBe("cadre");
  });

  it("ne compte pas l'ancienneté de qui n'a rien entrepris", () => {
    // Une réponse résiduelle à « depuis quand » ne doit pas promouvoir
    // quelqu'un qui a répondu « non » à la question d'avant.
    expect(
      profilDesReponses(copie({ travail_personnel: "Non", depuis_quand: "Plus de 5 ans" })),
    ).toBe("debutant");
  });

  it("range le reste en transition", () => {
    expect(profilDesReponses(copie())).toBe("cadre");
    expect(profilDesReponses(copie({ situation_pro: "En reconversion" }))).toBe("cadre");
  });

  it("ne jette pas sur un questionnaire vide", () => {
    expect(profilDesReponses({})).toBe("cadre");
  });
});

describe("profil", () => {
  it("retombe sur « inconnu » plutôt que de rendre undefined", () => {
    expect(profil(null).cle).toBe("inconnu");
    expect(profil("n'existe pas").cle).toBe("inconnu");
  });

  it("porte un ton que la feuille de style connaît", () => {
    // Une pastille sans style ne se voit pas à la relecture : le compilateur
    // tient l'union, ce test tient la liste côté CSS.
    const connus = ["nouveau", "lead", "contacte", "appel", "proposition", "client", "perdu"];
    for (const p of PROFILS) expect(connus, `profil ${p.cle}`).toContain(p.ton);
  });
});

describe("sequencePour", () => {
  it("garde les prérequis pour qui décroche l'entretien", () => {
    // La préparation d'un entretien ne dépend pas de qui on est.
    expect(sequencePour("appel", "dirigeant")).toBe("prerequis");
    expect(sequencePour("appel", "debutant")).toBe("prerequis");
  });

  it("envoie chacun vers la séquence écrite pour lui", () => {
    expect(sequencePour("stages", "dirigeant")).toBe("dirigeant");
    expect(sequencePour("stages", "avance")).toBe("avance");
    expect(sequencePour("formations", "accessible")).toBe("formations");
  });

  it("retombe sur la route quand le profil est inconnu", () => {
    expect(sequencePour("stages", "inconnu")).toBe("stages");
  });

  it("chaque profil vise une séquence qui existe vraiment", () => {
    const clés = new Set(SEQUENCES_PAR_DEFAUT.map((s) => s.cle));
    for (const p of PROFILS) {
      expect(clés.has(p.sequence), `séquence manquante : ${p.sequence}`).toBe(true);
    }
    for (const p of PROFILS.filter((x) => x.cle !== "inconnu")) {
      expect(clés.has(sequencePour("stages", p.cle))).toBe(true);
    }
  });
});

describe("router et profil, ensemble", () => {
  it("un dirigeant qualifié prépare son entretien, un autre reçoit sa séquence", () => {
    const d = copie({ situation_pro: "Dirigeant(e) / Chef d'entreprise", revenu: "Plus de 5 000 €" });
    expect(sequencePour(router(d, true), profilDesReponses(d))).toBe("prerequis");
    expect(sequencePour(router(d, false), profilDesReponses(d))).toBe("dirigeant");
  });

  it("un budget serré ne reçoit jamais la voie premium, même très qualifié", () => {
    const r = copie({ revenu: "0 – 2 000 €" });
    expect(sequencePour(router(r, true), profilDesReponses(r))).toBe("formations");
  });
});

describe("les quatre séquences de profil", () => {
  const clés = ["dirigeant", "cadre", "avance", "debutant"];
  const parCle = new Map(SEQUENCES_PAR_DEFAUT.map((s) => [s.cle, s]));

  it("comptent cinq e-mails, aux mêmes délais", () => {
    for (const c of clés) {
      const s = parCle.get(c)!;
      expect(s.etapes.map((e) => e.delai_jours)).toEqual([0, 3, 7, 14, 24]);
      expect(s.etapes.map((e) => e.ordre)).toEqual([1, 2, 3, 4, 5]);
    }
  });

  it("ne partagent aucune phrase entre elles", () => {
    // C'est la promesse de la segmentation : quatre textes, pas un texte et
    // trois variantes. Une phrase commune signalerait un copier-coller.
    const phrases = new Map<string, string>();
    for (const c of clés) {
      for (const e of parCle.get(c)!.etapes) {
        // La signature est commune à tous les e-mails de la maison : elle ne
        // compte pas comme une phrase recopiée.
        const sansSignature = e.corps.split("Avec toute ma présence,")[0];
        for (const phrase of sansSignature.split(/[.!?]\s+/)) {
          const nette = phrase.trim().toLowerCase();
          // Les salutations et les formules courtes se répètent légitimement,
          // et deux séquences ont le droit de pointer le même lien.
          if (nette.length < 60 || nette.includes("http")) continue;
          const vue = phrases.get(nette);
          expect(vue ?? c, `phrase partagée avec « ${vue} » : ${nette.slice(0, 70)}`).toBe(c);
          phrases.set(nette, c);
        }
      }
    }
  });

  it("personnalisent au moins un objet par séquence", () => {
    for (const c of clés) {
      expect(parCle.get(c)!.etapes.some((e) => e.sujet.includes("{{prenom}}"))).toBe(true);
    }
  });

  it("portent la signature et s'adressent à la personne", () => {
    for (const c of clés) {
      for (const e of parCle.get(c)!.etapes) {
        expect(e.corps.startsWith("Bonjour {{prenom}},")).toBe(true);
        expect(e.corps).toContain("Domoïna Ramiadana");
      }
    }
  });
});
