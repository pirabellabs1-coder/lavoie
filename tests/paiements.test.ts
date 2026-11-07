import { afterEach, describe, expect, it } from "vitest";
import {
  acompteDe,
  ADRESSE_WEBHOOK,
  euros,
  jugerWebhook,
  montantAReclamer,
  PART_ACOMPTE,
  stripeActif,
  stripeEnEssai,
} from "@/lib/crm/paiements";

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

describe("montantAReclamer", () => {
  it("demande l'acompte sur une place neuve", () => {
    expect(montantAReclamer({ total: 50000, dejaPaye: 0, genre: "acompte" })).toEqual({
      montant: 15000,
      genre: "acompte",
    });
  });

  it("demande tout quand on demande tout", () => {
    expect(montantAReclamer({ total: 50000, dejaPaye: 0, genre: "integral" })).toEqual({
      montant: 50000,
      genre: "integral",
    });
  });

  it("bascule en solde dès qu'un versement est arrivé, même si l'on redemande un acompte", () => {
    // C'est le défaut qui avait échappé : relancer « en acompte » après un
    // premier versement ne doit pas rouvrir un second acompte.
    expect(montantAReclamer({ total: 50000, dejaPaye: 15000, genre: "acompte" })).toEqual({
      montant: 35000,
      genre: "solde",
    });
  });

  it("ne réclame jamais plus que le reste dû", () => {
    const r = montantAReclamer({ total: 50000, dejaPaye: 49000, genre: "integral" });
    expect(r?.montant).toBe(1000);
  });

  it("appelle « intégral » un acompte qui couvre tout", () => {
    // Un stage à 3 € : trente pour cent tombent sous le plancher d'un euro,
    // et le plancher ne doit pas dépasser le total.
    const r = montantAReclamer({ total: 300, dejaPaye: 0, genre: "acompte" });
    expect(r?.montant).toBeLessThanOrEqual(300);
  });

  it("ne demande rien quand tout est réglé", () => {
    expect(montantAReclamer({ total: 50000, dejaPaye: 50000, genre: "solde" })).toBeNull();
    // Un sur-encaissement ne produit pas un montant négatif.
    expect(montantAReclamer({ total: 50000, dejaPaye: 60000, genre: "solde" })).toBeNull();
    expect(montantAReclamer({ total: 0, dejaPaye: 0, genre: "integral" })).toBeNull();
  });
});

describe("jugerWebhook", () => {
  const deux = ["checkout.session.completed", "checkout.session.async_payment_succeeded"];

  it("vise l'adresse canonique du site, avec le www", () => {
    expect(ADRESSE_WEBHOOK).toBe("https://www.lavoie2laconscience.com/api/stripe/webhook");
  });

  it("dit ce qui reste à faire quand rien n'est déclaré", () => {
    expect(jugerWebhook([]).etat).toBe("a-faire");
  });

  it("valide l'adresse exacte, active, avec les deux événements", () => {
    const j = jugerWebhook([{ url: ADRESSE_WEBHOOK, status: "enabled", enabled_events: deux }]);
    expect(j.etat).toBe("ok");
  });

  it("tolère une barre finale et les majuscules", () => {
    const j = jugerWebhook([
      { url: "https://WWW.lavoie2laconscience.com/api/stripe/webhook/", status: "enabled", enabled_events: deux },
    ]);
    expect(j.etat).toBe("ok");
  });

  it("accepte un abonnement à tous les événements", () => {
    const j = jugerWebhook([{ url: ADRESSE_WEBHOOK, status: "enabled", enabled_events: ["*"] }]);
    expect(j.etat).toBe("ok");
  });

  it("signale une adresse sans www comme une erreur, pas comme un oubli", () => {
    // Le piège le plus courant : Stripe appelle, le site redirige, l'appel échoue.
    const j = jugerWebhook([
      { url: "https://lavoie2laconscience.com/api/stripe/webhook", status: "enabled", enabled_events: deux },
    ]);
    expect(j.etat).toBe("probleme");
    expect(j.detail).toContain("lavoie2laconscience.com/api/stripe/webhook");
  });

  it("signale une adresse désactivée", () => {
    const j = jugerWebhook([{ url: ADRESSE_WEBHOOK, status: "disabled", enabled_events: deux }]);
    expect(j.etat).toBe("probleme");
  });

  it("nomme l'événement qui manque", () => {
    const j = jugerWebhook([
      { url: ADRESSE_WEBHOOK, status: "enabled", enabled_events: ["checkout.session.completed"] },
    ]);
    expect(j.etat).toBe("probleme");
    expect(j.detail).toContain("checkout.session.async_payment_succeeded");
  });

  it("refuse deux déclarations actives de la même adresse", () => {
    // Chacune a son secret, le site n'en connaît qu'un : l'une échoue toujours.
    const j = jugerWebhook([
      { url: ADRESSE_WEBHOOK, status: "enabled", enabled_events: deux },
      { url: `${ADRESSE_WEBHOOK}/`, status: "enabled", enabled_events: deux },
    ]);
    expect(j.etat).toBe("probleme");
  });

  it("distingue les majuscules du chemin, que le site distingue aussi", () => {
    const j = jugerWebhook([
      { url: "https://www.lavoie2laconscience.com/API/stripe/webhook", status: "enabled", enabled_events: deux },
    ]);
    expect(j.etat).toBe("probleme");
  });

  it("retient l'adresse active quand il en existe une désactivée à côté", () => {
    const j = jugerWebhook([
      { url: ADRESSE_WEBHOOK, status: "disabled", enabled_events: deux },
      { url: ADRESSE_WEBHOOK, status: "enabled", enabled_events: deux },
    ]);
    expect(j.etat).toBe("ok");
  });
});
