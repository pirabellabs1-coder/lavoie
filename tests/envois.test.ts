import { describe, expect, it } from "vitest";
import { lirePersonnes, resumerAjout, MAXIMUM_COLLE } from "@/lib/crm/ajouts";
import { decrireSegment, nettoyerSegment } from "@/lib/crm/campagnes";
import { habiller, lienDesinscription, personnaliser } from "@/lib/crm/email";
import { categorie, groupesManuels } from "@/lib/crm/categories";

/**
 * Ce qui décide du contenu d'un e-mail et de la liste de ses destinataires.
 * Aucune de ces fonctions ne touche la base : elles prennent des données et en
 * rendent d'autres, et c'est là que les erreurs coûtent le plus cher.
 */

describe("personnaliser", () => {
  it("remplace le prénom là où il est attendu", () => {
    const sujet = personnaliser("Avez-vous ouvert le guide, {{prenom}} ?", {
      prenom: "Marie",
      email: "marie@exemple.fr",
    });
    expect(sujet).toBe("Avez-vous ouvert le guide, Marie ?");
  });

  it("avale la ponctuation quand le prénom manque", () => {
    const destinataire = { prenom: null, email: "x@y.fr" };
    expect(personnaliser("Avez-vous ouvert le guide, {{prenom}} ?", destinataire)).toBe(
      "Avez-vous ouvert le guide ?",
    );
    expect(personnaliser("Bienvenue parmi les Lettres, {{prenom}}", destinataire)).toBe(
      "Bienvenue parmi les Lettres",
    );
    expect(personnaliser("Avant votre entretien, {{prenom}} : deux choses", destinataire)).toBe(
      "Avant votre entretien : deux choses",
    );
  });

  it("traite un prénom fait d'espaces comme un prénom absent", () => {
    expect(personnaliser("Bonjour {{prenom}},\n\nSuite.", { prenom: "   ", email: "x@y.fr" })).toBe(
      "Bonjour,\n\nSuite.",
    );
  });

  it("retire la virgule orpheline d'un texte qui ouvre sur le prénom", () => {
    expect(personnaliser("{{prenom}},\n\nJe ne veux pas encombrer.", { prenom: null, email: "x@y.fr" })).toBe(
      "Je ne veux pas encombrer.",
    );
  });

  it("renvoie vers la page de contact à défaut de questionnaire", () => {
    const texte = personnaliser("Confirmez : {{lien_prerequis}}", {
      prenom: "Marie",
      email: "x@y.fr",
    });
    expect(texte).toContain("/contact");
    const avecJeton = personnaliser("Confirmez : {{lien_prerequis}}", {
      prenom: "Marie",
      email: "x@y.fr",
      jeton: "abc123",
    });
    expect(avecJeton).toContain("/prerequis/abc123");
  });

  it("laisse une variable inconnue en évidence plutôt que de la vider", () => {
    expect(personnaliser("Bonjour {{inconnu}}", { prenom: "Marie", email: "x@y.fr" })).toContain(
      "{{inconnu}}",
    );
  });
});

describe("habiller", () => {
  it("ajoute le lien de désinscription quand l'adresse est connue", () => {
    const { text, html } = habiller({ texte: "Bonjour.", email: "marie@exemple.fr" });
    expect(text).toContain("Pour ne plus recevoir");
    expect(html).toContain(encodeURIComponent("marie@exemple.fr"));
  });

  it("s'en passe quand il n'y a pas d'adresse — un aperçu n'a personne à désabonner", () => {
    const { text } = habiller({ texte: "Bonjour." });
    expect(text).not.toContain("Pour ne plus recevoir");
  });

  it("encode l'adresse dans le lien de désinscription", () => {
    expect(lienDesinscription("a+b@exemple.fr")).toContain("a%2Bb%40exemple.fr");
  });
});

describe("lirePersonnes", () => {
  it("lit les trois formes attendues d'une ligne", () => {
    const { personnes } = lirePersonnes(
      ["marie@exemple.fr, Marie, Durand", "jean@exemple.fr", "Paul Martin <paul@exemple.fr>"].join(
        "\n",
      ),
    );
    expect(personnes).toEqual([
      { email: "marie@exemple.fr", prenom: "Marie", nom: "Durand" },
      { email: "jean@exemple.fr", prenom: undefined, nom: undefined },
      { email: "paul@exemple.fr", prenom: "Paul", nom: "Martin" },
    ]);
  });

  it("accepte le point-virgule et la tabulation d'un copier-coller de tableur", () => {
    const { personnes } = lirePersonnes("sophie@x.fr;Sophie;Nguyen\nluc@x.fr\tLuc\tBernard");
    expect(personnes[0]).toEqual({ email: "sophie@x.fr", prenom: "Sophie", nom: "Nguyen" });
    expect(personnes[1]).toEqual({ email: "luc@x.fr", prenom: "Luc", nom: "Bernard" });
  });

  it("retire les guillemets d'un export CSV", () => {
    const { personnes } = lirePersonnes('"Durand";"Marie";"marie@x.fr"');
    expect(personnes[0].prenom).toBe("Durand");
    expect(personnes[0].nom).toBe("Marie");
  });

  it("ignore un doublon, quelle que soit la casse, et le compte", () => {
    const { personnes, doublons } = lirePersonnes("Marie@X.FR\nmarie@x.fr");
    expect(personnes).toHaveLength(1);
    expect(doublons).toBe(1);
  });

  it("désigne les lignes illisibles par leur numéro, jamais par leur contenu", () => {
    const { rejetees, lignesRejetees } = lirePersonnes("a@b.fr\npas une adresse\n\nanne exemple.fr");
    expect(rejetees).toBe(2);
    expect(lignesRejetees).toEqual([2, 4]);
  });

  it("refuse une adresse démesurée plutôt que de la tronquer en une autre", () => {
    const { personnes, rejetees } = lirePersonnes(`${"x".repeat(300)}@b.fr`);
    expect(personnes).toHaveLength(0);
    expect(rejetees).toBe(1);
  });

  it("compte les adresses sans prénom : leurs e-mails seront impersonnels", () => {
    expect(lirePersonnes("a@b.fr\nc@d.fr, Claire").sansPrenom).toBe(1);
  });

  it("ne signale une troncature que si des personnes valides ont été perdues", () => {
    expect(lirePersonnes("a@b.fr\nc@d.fr\nrien du tout", 2).tronquee).toBe(false);
    expect(lirePersonnes("a@b.fr\nc@d.fr\ne@f.fr", 2).tronquee).toBe(true);
  });

  it("s'arrête au maximum par défaut", () => {
    const lignes = Array.from({ length: MAXIMUM_COLLE + 5 }, (_, i) => `p${i}@x.fr`).join("\n");
    const { personnes, tronquee } = lirePersonnes(lignes);
    expect(personnes).toHaveLength(MAXIMUM_COLLE);
    expect(tronquee).toBe(true);
  });
});

describe("resumerAjout", () => {
  const vide = {
    ajoutes: 0,
    reprises: 0,
    deja: 0,
    desabonnes: 0,
    sansConsentement: 0,
    crees: 0,
    sansPrenom: 0,
    rejetees: 0,
    doublons: 0,
    echecs: 0,
    lignesRejetees: [],
    enPause: false,
    tronquee: false,
  };

  it("dit « aucun changement » quand il ne s'est rien passé", () => {
    expect(resumerAjout(vide)).toBe("aucun changement");
  });

  it("dit ce qui a été écarté autant que ce qui a été fait", () => {
    const phrase = resumerAjout({ ...vide, ajoutes: 3, desabonnes: 1, sansConsentement: 2 });
    expect(phrase).toContain("3 personnes ajoutées");
    expect(phrase).toContain("désabonnée");
    expect(phrase).toContain("en attente de confirmation");
  });

  it("accorde le singulier", () => {
    expect(resumerAjout({ ...vide, ajoutes: 1 })).toBe("1 personne ajoutée");
  });
});

describe("nettoyerSegment", () => {
  it("ne garde que les critères réellement posés", () => {
    expect(nettoyerSegment({ statuts: [], source: "  ", depuis_jours: "0" })).toEqual({});
  });

  it("borne l'ancienneté et coupe les chaînes trop longues", () => {
    const s = nettoyerSegment({ depuis_jours: "999999", source: "x".repeat(500) });
    expect(s.depuis_jours).toBe(3650);
    expect(s.source?.length).toBe(120);
  });

  it("laisse tomber un état de stage sans stage : c'est le stage qui porte le critère", () => {
    expect(nettoyerSegment({ stage_etats: ["venue"] }).stage_etats).toBeUndefined();
    expect(nettoyerSegment({ stage: "hiver", stage_etats: ["venue"] }).stage_etats).toEqual([
      "venue",
    ]);
  });

  it("ignore un état de stage inventé", () => {
    expect(nettoyerSegment({ stage: "hiver", stage_etats: ["venue", "n'importe quoi"] }).stage_etats)
      .toEqual(["venue"]);
  });

  it("laisse tomber les états quand ils sont tous cochés : ils ne filtrent plus rien", () => {
    const tous = ["demande", "attente", "confirmee", "venue", "annulee"];
    expect(nettoyerSegment({ stage: "hiver", stage_etats: tous }).stage_etats).toBeUndefined();
  });
});

describe("decrireSegment", () => {
  it("dit « toute la liste » quand rien n'est ciblé", () => {
    expect(decrireSegment({})).toBe("toute la liste");
  });

  it("nomme le stage plutôt que son identifiant technique", () => {
    const phrase = decrireSegment({ stage: "stage-automne" }, { "stage-automne": "Stage Automne" });
    expect(phrase).toContain("Stage Automne");
    expect(phrase).not.toContain("stage-automne");
  });

  it("dit « n'importe quel stage » pour l'étoile", () => {
    expect(decrireSegment({ stage: "*" })).toContain("inscrits à un stage");
  });
});

describe("categories", () => {
  it("rend une catégorie de repli plutôt que de casser sur une clé inconnue", () => {
    const c = categorie("inventée");
    expect(c.manuel).toBe(false);
    expect(c.cat).toBe("inventée");
  });

  it("n'ouvre à l'ajout manuel que les catégories prévues pour", () => {
    expect(categorie("guide").manuel).toBe(true);
    expect(categorie("orientation").manuel).toBe(false);
    const proposees = groupesManuels().flatMap((g) => g.cats.map((c) => c.cle));
    expect(proposees).toContain("guide");
    expect(proposees).not.toContain("orientation");
  });

  it("garde l'ordre du parcours dans les groupes proposés", () => {
    const ordres = groupesManuels().flatMap((g) => g.cats.map((c) => c.ordre));
    expect(ordres).toEqual([...ordres].sort((a, b) => a - b));
  });
});
