import { describe, expect, it } from "vitest";
import {
  etatDeLaDate,
  placesRestantesDate,
  SEUIL_DERNIERES,
  type DateStage,
} from "@/lib/crm/dates-stages";

/**
 * L'état d'une date décide de ce que voit le visiteur : un jour ouvert, un
 * « dernières places » qui presse, ou un « complet » barré. Se tromper ici,
 * c'est vendre une place qui n'existe pas.
 */

function date(sur: Partial<DateStage> = {}): DateStage {
  return {
    id: "1",
    stage_id: "1",
    debut_le: new Date(Date.now() + 30 * 86_400_000),
    fin_le: null,
    places: 12,
    ouverte: true,
    prises: 0,
    ...sur,
  };
}

describe("etatDeLaDate", () => {
  it("dit « libre » quand il reste de la marge", () => {
    expect(etatDeLaDate(date({ prises: 2 }))).toBe("libre");
  });

  it("prévient quand il ne reste que les dernières places", () => {
    expect(etatDeLaDate(date({ places: 12, prises: 12 - SEUIL_DERNIERES }))).toBe("dernieres");
  });

  it("dit « complet » dès que les places sont prises", () => {
    expect(etatDeLaDate(date({ places: 12, prises: 12 }))).toBe("complet");
    // Une surréservation ne repasse jamais en « libre ».
    expect(etatDeLaDate(date({ places: 12, prises: 15 }))).toBe("complet");
  });

  it("respecte une date fermée à la main, même vide", () => {
    expect(etatDeLaDate(date({ ouverte: false, prises: 0 }))).toBe("fermee");
  });

  it("range une date passée à part, avant tout le reste", () => {
    const hier = new Date(Date.now() - 86_400_000);
    expect(etatDeLaDate(date({ debut_le: hier, ouverte: false, prises: 99 }))).toBe("passee");
  });
});

describe("placesRestantesDate", () => {
  it("compte ce qui reste", () => {
    expect(placesRestantesDate(date({ places: 12, prises: 5 }))).toBe(7);
  });

  it("ne descend jamais sous zéro", () => {
    expect(placesRestantesDate(date({ places: 12, prises: 20 }))).toBe(0);
  });
});
