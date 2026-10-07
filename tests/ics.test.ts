import { describe, expect, it } from "vitest";
import { evenementIcs, instantIcs, ligneIcs } from "@/lib/ics";

/**
 * Un agenda ne pardonne rien : une virgule non échappée coupe la valeur en
 * deux, une ligne trop longue fait refuser le fichier entier. L'erreur ne se
 * voit pas au moment du clic — elle se voit quand la personne arrive un jour
 * où il n'y a personne.
 */

describe("instantIcs", () => {
  it("écrit un instant en UTC, sans séparateur", () => {
    expect(instantIcs("2026-11-12T09:00:00.000Z")).toBe("20261112T090000Z");
  });

  it("accepte une Date comme en rend le pilote Postgres", () => {
    expect(instantIcs(new Date("2027-01-02T16:30:00.000Z"))).toBe("20270102T163000Z");
  });
});

describe("ligneIcs", () => {
  it("échappe la virgule, qui sinon coupe la valeur", () => {
    expect(ligneIcs("LOCATION", "Centre HUT, Sarthe")).toBe("LOCATION:Centre HUT\\, Sarthe");
  });

  it("échappe le point-virgule et la contre-oblique", () => {
    expect(ligneIcs("SUMMARY", "Stage ; hiver")).toBe("SUMMARY:Stage \\; hiver");
    expect(ligneIcs("SUMMARY", "a\\b")).toBe("SUMMARY:a\\\\b");
  });

  it("plie sur les octets, et jamais au milieu d'un accent", () => {
    // Cent « é » pèsent deux cents octets : une borne comptée en caractères
    // les aurait laissés passer, et un agenda aurait refusé le fichier.
    const rendu = ligneIcs("SUMMARY", "é".repeat(100));
    for (const l of rendu.split("\r\n")) {
      expect(Buffer.byteLength(l, "utf8")).toBeLessThanOrEqual(75);
    }
    // Rien n'est perdu ni abîmé au dépliage.
    expect(rendu.replace(/\r\n /g, "")).toBe(`SUMMARY:${"é".repeat(100)}`);
  });

  it("met les retours à la ligne à plat", () => {
    expect(ligneIcs("DESCRIPTION", "Deux\nlignes")).toBe("DESCRIPTION:Deux\\nlignes");
  });

  it("plie les lignes trop longues, et la suite commence par une espace", () => {
    const rendu = ligneIcs("DESCRIPTION", "x".repeat(200));
    const lignes = rendu.split("\r\n");
    expect(lignes.length).toBeGreaterThan(1);
    for (const l of lignes) expect(Buffer.byteLength(l, "utf8")).toBeLessThanOrEqual(75);
    for (const l of lignes.slice(1)) expect(l.startsWith(" ")).toBe(true);
    // Déplié, on retrouve exactement la valeur de départ.
    expect(rendu.replace(/\r\n /g, "")).toBe(`DESCRIPTION:${"x".repeat(200)}`);
  });
});

describe("evenementIcs", () => {
  const ics = evenementIcs({
    uid: "stage-hiver-7@lavoie2laconscience.com",
    debut: "2026-11-12T09:00:00.000Z",
    fin: "2026-11-12T16:00:00.000Z",
    titre: "Hiver — Rencontrer",
    description: "Quatre jours au Centre HUT",
    url: "https://www.lavoie2laconscience.com/evenements/hiver-rencontrer",
    lieu: "Centre HUT, Rouperroux-le-Coquet (72)",
  });

  it("ouvre et ferme le calendrier comme il faut", () => {
    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("END:VEVENT");
  });

  it("sépare ses lignes par un retour chariot, comme l'exige le format", () => {
    expect(ics.split("\r\n").length).toBeGreaterThan(10);
    // Aucun saut de ligne seul : un \n orphelin casse certains agendas.
    expect(/[^\r]\n/.test(ics)).toBe(false);
  });

  it("porte les heures et le lieu échappé", () => {
    expect(ics).toContain("DTSTART:20261112T090000Z");
    expect(ics).toContain("DTEND:20261112T160000Z");
    expect(ics).toContain("LOCATION:Centre HUT\\, Rouperroux-le-Coquet (72)");
  });

  it("se passe des champs absents sans laisser de ligne vide", () => {
    const nu = evenementIcs({
      uid: "x@y",
      debut: "2026-11-12T09:00:00.000Z",
      fin: "2026-11-12T10:00:00.000Z",
      titre: "Atelier",
      lieu: null,
    });
    expect(nu).not.toContain("LOCATION");
    expect(nu).not.toContain("DESCRIPTION");
    expect(nu.split("\r\n").filter((l) => l === "")).toHaveLength(1); // la fin
  });
});
