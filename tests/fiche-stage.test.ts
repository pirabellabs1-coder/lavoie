import { beforeEach, describe, expect, it, vi } from "vitest";
import type { DateStage } from "@/lib/crm/dates-stages";

/**
 * La barrière d'entrée d'une réservation.
 *
 * C'est elle qui décide si un formulaire de réservation aboutit ou répond
 * « Stage inconnu ». Elle doit laisser passer les six rendez-vous du catalogue
 * **et** les stages tenus depuis le tableau de bord, mais jamais un brouillon :
 * un stage que personne n'a publié n'a pas à prendre de place.
 *
 * Les deux lectures en base sont remplacées par des doublures : ce qui se teste
 * ici est la décision, pas le SQL.
 */

const lectures = vi.hoisted(() => ({
  stage: vi.fn(),
  dates: vi.fn(),
}));

vi.mock("@/lib/crm/stages", () => ({ stagePublic: lectures.stage }));
vi.mock("@/lib/crm/dates-stages", () => ({
  datesOuvertes: lectures.dates,
  SANS_DATE: "Prochaine date à venir",
}));

const { ficheDuStage } = await import("@/lib/crm/fiche-stage");

function date(sur: Partial<DateStage> = {}): DateStage {
  return {
    id: "7",
    stage_id: "3",
    debut_le: new Date("2026-11-12T09:00:00.000Z"),
    fin_le: null,
    places: 12,
    ouverte: true,
    prises: 0,
    ...sur,
  };
}

beforeEach(() => {
  lectures.stage.mockReset();
  lectures.dates.mockReset();
  lectures.dates.mockResolvedValue([]);
});

describe("ficheDuStage — le catalogue du code", () => {
  it("reconnaît un stage du catalogue sans toucher la base", async () => {
    const fiche = await ficheDuStage("stage-automne-naitre-a-soi", null);
    expect(fiche?.titre).toContain("Automne");
    expect(fiche?.lieu).toBeTruthy();
    expect(lectures.stage).not.toHaveBeenCalled();
  });

  it("préfère la date ouverte en base au texte du catalogue", async () => {
    // Le catalogue annonce « 17–20 septembre 2026 », une session passée. Si une
    // date est ouverte au tableau de bord, c'est elle qui part dans l'e-mail.
    lectures.dates.mockResolvedValue([date()]);
    const fiche = await ficheDuStage("stage-automne-naitre-a-soi", null);
    expect(fiche?.quand).toBe("jeudi 12 novembre 2026 · 10:00");
  });

  it("retombe sur le texte du catalogue quand aucune date n'est ouverte", async () => {
    const fiche = await ficheDuStage("stage-automne-naitre-a-soi", null);
    expect(fiche?.quand).toContain("2026");
  });

  it("retient la date choisie parmi celles qui sont ouvertes", async () => {
    lectures.dates.mockResolvedValue([
      date({ id: "7" }),
      date({ id: "9", debut_le: new Date("2026-12-03T09:00:00.000Z") }),
    ]);
    const fiche = await ficheDuStage("stage-automne-naitre-a-soi", "9");
    expect(fiche?.quand).toContain("3 décembre 2026");
  });

  it("ignore un identifiant de date qui n'est pas de ce stage", async () => {
    // Les dates rendues appartiennent au stage par construction : un
    // identifiant forgé ne s'y trouve pas, et la première date fait foi.
    lectures.dates.mockResolvedValue([date({ id: "7" })]);
    const fiche = await ficheDuStage("stage-automne-naitre-a-soi", "999999");
    expect(fiche?.quand).toBe("jeudi 12 novembre 2026 · 10:00");
  });
});

describe("ficheDuStage — les stages du tableau de bord", () => {
  it("laisse réserver un stage publié hors catalogue", async () => {
    lectures.stage.mockResolvedValue({
      slug: "atelier-poser-ses-intentions",
      titre: "Atelier — Poser ses intentions",
      lieu: "En ligne",
      actif: true,
      places: 12,
      prix_cents: 9000,
      resume: null,
      description: null,
      image_id: null,
      image_alt: null,
    });
    lectures.dates.mockResolvedValue([
      date({ fin_le: new Date("2026-11-12T16:00:00.000Z") }),
    ]);

    const fiche = await ficheDuStage("atelier-poser-ses-intentions", "7");
    expect(fiche).toEqual({
      titre: "Atelier — Poser ses intentions",
      titreLong: "Atelier — Poser ses intentions",
      quand: "jeudi 12 novembre 2026 · 10:00 – 17:00",
      lieu: "En ligne",
    });
  });

  it("refuse un brouillon : rien ne doit s'y réserver", async () => {
    lectures.stage.mockResolvedValue({
      slug: "brouillon",
      titre: "Pas encore prêt",
      lieu: null,
      actif: false,
      places: 12,
      prix_cents: null,
      resume: null,
      description: null,
      image_id: null,
      image_alt: null,
    });
    expect(await ficheDuStage("brouillon", null)).toBeNull();
  });

  it("refuse un slug qui n'existe nulle part", async () => {
    lectures.stage.mockResolvedValue(null);
    expect(await ficheDuStage("jamais-vu", null)).toBeNull();
  });

  it("dit l'absence de date plutôt que de l'inventer", async () => {
    lectures.stage.mockResolvedValue({
      slug: "sans-date",
      titre: "Stage sans date",
      lieu: null,
      actif: true,
      places: 12,
      prix_cents: null,
      resume: null,
      description: null,
      image_id: null,
      image_alt: null,
    });
    const fiche = await ficheDuStage("sans-date", null);
    expect(fiche?.quand).toBe("Prochaine date à venir");
    expect(fiche?.lieu).toBe("communiqué à l'inscription");
  });
});
