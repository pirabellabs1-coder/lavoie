import { describe, expect, it } from "vitest";
import { paragraphes, pluriel } from "@/lib/texte";

/**
 * Le texte d'une page de stage est tapé dans une zone de saisie, puis rendu
 * tel quel. Ce découpage est donc la seule chose qui sépare un texte lisible
 * d'un pavé d'un bloc — et il doit tenir quelle que soit la machine qui a saisi.
 */

describe("paragraphes", () => {
  it("coupe sur une ligne vide", () => {
    expect(paragraphes("Premier.\n\nSecond.")).toEqual(["Premier.", "Second."]);
  });

  it("garde un retour simple à l'intérieur d'un paragraphe", () => {
    expect(paragraphes("Une ligne\nqui continue.")).toEqual(["Une ligne\nqui continue."]);
  });

  it("accepte les retours à la ligne de Windows", () => {
    expect(paragraphes("Premier.\r\n\r\nSecond.")).toEqual(["Premier.", "Second."]);
  });

  it("ne rend pas de paragraphe vide sur plusieurs sauts", () => {
    expect(paragraphes("A.\n\n\n\nB.")).toEqual(["A.", "B."]);
  });

  it("ignore les lignes vides en tête et en queue", () => {
    expect(paragraphes("\n\n  Seul.  \n\n")).toEqual(["Seul."]);
  });

  it("ne coupe pas sur une ligne d'espaces entre deux sauts", () => {
    expect(paragraphes("A.\n   \nB.")).toEqual(["A.", "B."]);
  });

  it("rend une liste vide pour rien", () => {
    expect(paragraphes(null)).toEqual([]);
    expect(paragraphes("")).toEqual([]);
    expect(paragraphes("   \n  ")).toEqual([]);
  });
});

describe("pluriel", () => {
  it("accorde au-delà de un", () => {
    expect(pluriel(3, "place")).toBe("3 places");
  });

  it("laisse le singulier à un", () => {
    expect(pluriel(1, "place")).toBe("1 place");
  });

  it("laisse le singulier à zéro, comme le veut l'usage", () => {
    expect(pluriel(0, "place")).toBe("0 place");
  });
});
