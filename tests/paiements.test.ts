import { afterEach, describe, expect, it } from "vitest";
import { acompteDe, euros, PART_ACOMPTE, stripeActif, stripeEnEssai } from "@/lib/crm/paiements";

/**
 * L'argent ne se calcule pas en virgule flottante, et un acompte ne s'affiche
 * pas à 149,97 €. Ces deux règles valent tout un module.
 */

const cle = process.env.STRIPE_SECRET_KEY;
afterEach(() => {
  if (cle === undefined) delete process.env.STRIPE_SECRET_KEY;
  else process.env.STRIPE_SECRET_KEY = cle;
});

describe("acompteDe", () => {
  it("prend trente pour cent, arrondis à l'euro", () => {
    expect(acompteDe(50000)).toBe(15000);
    expect(PART_ACOMPTE).toBe(0.3);
  });

  it("arrondit à l'euro plutôt qu'au centime", () => {
    // 499 € × 30 % = 149,70 € — on demande 150 €.
    expect(acompteDe(49900)).toBe(15000);
    expect(acompteDe(49000) % 100).toBe(0);
  });

  it("ne descend jamais sous un euro", () => {
    expect(acompteDe(100)).toBe(100);
    expect(acompteDe(0)).toBe(100);
  });

  it("reste un entier de centimes, jamais un flottant", () => {
    for (const total of [12345, 50000, 7000, 99999]) {
      const a = acompteDe(total);
      expect(Number.isInteger(a)).toBe(true);
      expect(a).toBeLessThanOrEqual(total + 100);
    }
  });
});

describe("euros", () => {
  it("écrit un montant en français", () => {
    // L'espace avant l'euro est une espace insécable : on la neutralise.
    expect(euros(50000).replace(/ | /g, " ")).toBe("500,00 €");
    expect(euros(0).replace(/ | /g, " ")).toBe("0,00 €");
  });
});

describe("l'état de Stripe", () => {
  it("dort tant qu'aucune clé n'est posée", () => {
    delete process.env.STRIPE_SECRET_KEY;
    expect(stripeActif()).toBe(false);
    expect(stripeEnEssai()).toBe(false);
  });

  it("reconnaît une clé d'essai", () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_quelquechose";
    expect(stripeActif()).toBe(true);
    expect(stripeEnEssai()).toBe(true);
  });

  it("ne prend pas une clé de production pour un essai", () => {
    process.env.STRIPE_SECRET_KEY = "sk_live_quelquechose";
    expect(stripeActif()).toBe(true);
    expect(stripeEnEssai()).toBe(false);
  });
});
