import { describe, expect, it } from "vitest";
import { depuisParis, periodeEnClair, pourChamp } from "@/lib/heure";

/**
 * Les dates d'un stage sont saisies à Paris, stockées en UTC et relues sur la
 * page publique. Chaque conversion est une occasion de décaler une immersion
 * de deux heures — ou de n'afficher que son premier jour.
 */

describe("depuisParis", () => {
  it("lit une saisie d'été comme heure de Paris (UTC+2)", () => {
    expect(depuisParis("2026-09-17T17:00")?.toISOString()).toBe("2026-09-17T15:00:00.000Z");
  });

  it("lit une saisie d'hiver comme heure de Paris (UTC+1)", () => {
    expect(depuisParis("2026-01-10T09:30")?.toISOString()).toBe("2026-01-10T08:30:00.000Z");
  });

  it("refuse une saisie illisible", () => {
    expect(depuisParis("17/09/2026")).toBeNull();
    expect(depuisParis("")).toBeNull();
  });

  it("fait l'aller-retour avec le champ du formulaire", () => {
    const saisie = "2026-09-17T17:00";
    expect(pourChamp(depuisParis(saisie))).toBe(saisie);
  });
});

describe("periodeEnClair", () => {
  it("écrit les quatre jours d'un stage, pas seulement le premier", () => {
    expect(
      periodeEnClair("2026-09-17T15:00:00.000Z", "2026-09-20T16:00:00.000Z"),
    ).toBe("Du jeudi 17 au dimanche 20 septembre 2026");
  });

  it("répète le mois quand la période l'enjambe", () => {
    expect(
      periodeEnClair("2026-10-30T15:00:00.000Z", "2026-11-02T16:00:00.000Z"),
    ).toBe("Du vendredi 30 octobre au lundi 2 novembre 2026");
  });

  it("donne le créneau entier quand tout tient en une journée", () => {
    // Un atelier d'une journée se réserve sur ses horaires : savoir qu'il
    // commence à 9 h sans savoir jusqu'à quand ne suffit pas à s'organiser.
    expect(periodeEnClair("2026-09-17T07:00:00.000Z", "2026-09-17T16:00:00.000Z")).toBe(
      "jeudi 17 septembre 2026 · 09:00 – 18:00",
    );
  });

  it("se passe d'une fin manquante", () => {
    expect(periodeEnClair("2026-09-17T07:00:00.000Z", null)).toBe(
      "jeudi 17 septembre 2026 · 09:00",
    );
  });

  it("se passe d'une fin illisible", () => {
    expect(periodeEnClair("2026-09-17T07:00:00.000Z", "pas une date")).toBe(
      "jeudi 17 septembre 2026 · 09:00",
    );
  });

  it("accepte une Date, comme en rend le pilote Postgres", () => {
    expect(
      periodeEnClair(new Date("2026-09-17T15:00:00.000Z"), new Date("2026-09-20T16:00:00.000Z")),
    ).toBe("Du jeudi 17 au dimanche 20 septembre 2026");
  });

  it("porte l'année de la fin quand la période change d'année", () => {
    expect(
      periodeEnClair("2026-12-30T10:00:00.000Z", "2027-01-02T16:00:00.000Z"),
    ).toBe("Du mercredi 30 décembre au samedi 2 janvier 2027");
  });

  it("ne jette pas sur une date illisible", () => {
    expect(periodeEnClair("pas une date")).toBe("—");
  });
});
