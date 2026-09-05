import { beforeAll, describe, expect, it } from "vitest";

/**
 * Le jeton d'un lien d'avis. Il n'ouvre pas grand-chose — un formulaire de
 * témoignage —, mais il dit « je suis cette personne » : il doit donc résister
 * à la retouche, et finir par expirer.
 */

beforeAll(() => {
  process.env.ADMIN_SECRET = "secret-de-test-suffisamment-long-pour-hmac";
});

const charger = async () => await import("@/lib/crm/avis");

describe("jeton d'avis", () => {
  it("se relit tel qu'il a été écrit", async () => {
    const { creerJetonAvis, lireJetonAvis } = await charger();
    const jeton = await creerJetonAvis({ contactId: "42", email: "Marie@Exemple.FR" });
    expect(await lireJetonAvis(jeton)).toEqual({ contactId: "42", email: "marie@exemple.fr" });
  });

  it("refuse un jeton retouché", async () => {
    const { creerJetonAvis, lireJetonAvis } = await charger();
    const jeton = await creerJetonAvis({ contactId: "42", email: "marie@exemple.fr" });
    const [, email, expiration, signature] = jeton.split(".");
    // Changer la personne visée sans toucher à la signature.
    const autre = [Buffer.from("43").toString("base64url"), email, expiration, signature].join(".");
    expect(await lireJetonAvis(autre)).toBeNull();
  });

  it("refuse un jeton périmé", async () => {
    const { creerJetonAvis, lireJetonAvis } = await charger();
    const jeton = await creerJetonAvis({ contactId: "42", email: "marie@exemple.fr" });
    const [id, email, , signature] = jeton.split(".");
    const perime = [id, email, Date.now() - 1000, signature].join(".");
    expect(await lireJetonAvis(perime)).toBeNull();
  });

  it("refuse ce qui n'a pas la forme d'un jeton", async () => {
    const { lireJetonAvis } = await charger();
    expect(await lireJetonAvis("")).toBeNull();
    expect(await lireJetonAvis("nimporte.quoi")).toBeNull();
    expect(await lireJetonAvis("a.b.c.d.e")).toBeNull();
  });

  it("construit une adresse de dépôt qui porte le jeton", async () => {
    const { lienAvis, lireJetonAvis } = await charger();
    const lien = await lienAvis("7", "jean@exemple.fr");
    expect(lien).toContain("/avis/");
    const jeton = decodeURIComponent(lien.split("/avis/")[1]);
    expect((await lireJetonAvis(jeton))?.contactId).toBe("7");
  });
});
