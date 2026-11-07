import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Le diagnostic du branchement, face à un Stripe simulé.
 *
 * Ce sont les erreurs de collage et de droits qui font perdre un paiement en
 * silence : on les rejoue ici, sans réseau et sans base.
 */

const stripeSimule = vi.hoisted(() => ({
  retrieveCurrent: vi.fn(),
  list: vi.fn(),
}));

vi.mock("stripe", () => ({
  default: class {
    accounts = { retrieveCurrent: stripeSimule.retrieveCurrent };
    webhookEndpoints = { list: stripeSimule.list };
  },
}));

vi.mock("@/lib/crm/db", () => ({ getDb: async () => null }));

import { ADRESSE_WEBHOOK, diagnosticStripe, EVENEMENTS_WEBHOOK } from "@/lib/crm/paiements";

const sauve = { ...process.env };

function compte(charges_enabled: boolean) {
  return {
    id: "acct_1",
    country: "FR",
    email: null,
    charges_enabled,
    payouts_enabled: false,
    settings: { dashboard: { display_name: "La Voie 2 la Conscience" } },
    business_profile: null,
  };
}

function adresseDeclaree() {
  return { data: [{ url: ADRESSE_WEBHOOK, status: "enabled", enabled_events: [...EVENEMENTS_WEBHOOK] }] };
}

function etape(d: Awaited<ReturnType<typeof diagnosticStripe>>, titre: string) {
  return d.etapes.find((e) => e.titre === titre);
}

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  stripeSimule.retrieveCurrent.mockReset();
  stripeSimule.list.mockReset();
});

afterEach(() => {
  process.env = { ...sauve };
  vi.restoreAllMocks();
});

describe("diagnosticStripe", () => {
  it("dit tout ce qui reste à faire quand rien n'est posé", async () => {
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_WEBHOOK_SECRET;
    const d = await diagnosticStripe();
    expect(d.mode).toBeNull();
    expect(etape(d, "La clé secrète")?.etat).toBe("a-faire");
    expect(etape(d, "Le secret du webhook")?.etat).toBe("a-faire");
    expect(stripeSimule.retrieveCurrent).not.toHaveBeenCalled();
  });

  it("refuse une clé collée avec un retour à la ligne, sans appeler Stripe", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_abc\n";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_abc";
    const d = await diagnosticStripe();
    expect(etape(d, "La clé secrète")?.etat).toBe("probleme");
    expect(stripeSimule.retrieveCurrent).not.toHaveBeenCalled();
  });

  it("refuse un secret de webhook collé avec un espace", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_abc";
    process.env.STRIPE_WEBHOOK_SECRET = " whsec_abc";
    stripeSimule.retrieveCurrent.mockResolvedValue(compte(true));
    stripeSimule.list.mockResolvedValue(adresseDeclaree());
    const d = await diagnosticStripe();
    expect(etape(d, "Le secret du webhook")?.etat).toBe("probleme");
  });

  it("repère la clé publique posée à la place de la secrète", async () => {
    process.env.STRIPE_SECRET_KEY = "pk_live_abc";
    const d = await diagnosticStripe();
    expect(etape(d, "La clé secrète")?.etat).toBe("probleme");
    expect(etape(d, "La clé secrète")?.detail).toContain("publique");
  });

  it("nomme un défaut de droits plutôt que d'accuser le réseau", async () => {
    process.env.STRIPE_SECRET_KEY = "rk_live_abc";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_abc";
    stripeSimule.retrieveCurrent.mockRejectedValue({ type: "StripePermissionError" });
    stripeSimule.list.mockRejectedValue({ type: "StripePermissionError" });
    const d = await diagnosticStripe();
    expect(etape(d, "Stripe accepte la clé")?.detail).toContain("droit");
    expect(etape(d, "L'adresse déclarée chez Stripe")?.detail).toContain("droit");
  });

  it("dit d'une clé révoquée qu'elle est refusée", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_live_abc";
    stripeSimule.retrieveCurrent.mockRejectedValue({ type: "StripeAuthenticationError" });
    stripeSimule.list.mockRejectedValue({ type: "StripeAuthenticationError" });
    const d = await diagnosticStripe();
    expect(etape(d, "Stripe accepte la clé")?.detail).toContain("refuse");
  });

  it("ne compte pas un compte d'essai non activé parmi les points à régler", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_abc";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_abc";
    stripeSimule.retrieveCurrent.mockResolvedValue(compte(false));
    stripeSimule.list.mockResolvedValue(adresseDeclaree());
    const d = await diagnosticStripe();
    expect(d.mode).toBe("essai");
    expect(d.compte).toBe("La Voie 2 la Conscience");
    expect(etape(d, "Le compte peut encaisser")?.etat).toBe("ok");
    // Tout est vert sauf le premier appel, qui attend un paiement d'essai.
    expect(d.etapes.filter((e) => e.etat !== "ok").map((e) => e.titre)).toEqual([
      "Stripe appelle bien le site",
    ]);
  });

  it("exige l'activation du compte en production", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_live_abc";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_abc";
    stripeSimule.retrieveCurrent.mockResolvedValue(compte(false));
    stripeSimule.list.mockResolvedValue(adresseDeclaree());
    const d = await diagnosticStripe();
    expect(etape(d, "Le compte peut encaisser")?.etat).toBe("a-faire");
  });
});
