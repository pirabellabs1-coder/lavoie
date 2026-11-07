import type postgres from "postgres";
import { describe, expect, it } from "vitest";
import { rembourser } from "@/lib/crm/paiements";

/**
 * L'inscription d'un remboursement, contre une base simulée.
 *
 * La simulation reconnaît les trois requêtes de `rembourser` par leur texte,
 * rend la ligne qu'on lui donne, et garde trace de ce qui a été écrit.
 */

type Ligne = {
  id: string;
  participation_id: string;
  statut: string;
  montant_cents: number;
  rembourse_cents: number;
  contact_id: string | null;
  titre: string;
};

function base(ligne: Ligne | null) {
  const ecrit: { requete: string; valeurs: unknown[] }[] = [];
  const tx = (morceaux: TemplateStringsArray, ...valeurs: unknown[]) => {
    const requete = morceaux.join("?").replace(/\s+/g, " ").trim();
    if (requete.startsWith("SELECT")) return Promise.resolve(ligne ? [ligne] : []);
    ecrit.push({ requete, valeurs });
    return Promise.resolve([]);
  };
  return { tx: tx as unknown as postgres.TransactionSql, ecrit };
}

const payee = (r: Partial<Ligne> = {}): Ligne => ({
  id: "7",
  participation_id: "42",
  statut: "payee",
  montant_cents: 15000,
  rembourse_cents: 0,
  contact_id: "3",
  titre: "Printemps — Manifester",
  ...r,
});

const ref = { paymentIntent: "pi_123", sessionId: null };

describe("rembourser", () => {
  it("inscrit un remboursement partiel, la place reste payée nette", async () => {
    const { tx, ecrit } = base(payee());
    const r = await rembourser(ref, 5000, tx);
    expect(r).toMatchObject({ rembourse: 5000, cumul: 5000, integral: false, contact_id: "3" });
    expect(ecrit).toHaveLength(1);
    expect(ecrit[0].valeurs).toContain("payee");
    expect(ecrit[0].valeurs).toContain(5000);
  });

  it("passe en remboursé et périme les liens encore ouverts de la place", async () => {
    // Sans cela, un lien de solde ouvert serait rappelé trois jours plus tard
    // et réclamerait le total à quelqu'un qu'on vient de rembourser.
    const { tx, ecrit } = base(payee());
    const r = await rembourser(ref, 15000, tx);
    expect(r).toMatchObject({ integral: true, cumul: 15000 });
    expect(ecrit[0].valeurs).toContain("remboursee");
    const peremption = ecrit.find((e) => e.requete.includes("statut = 'expiree'"));
    expect(peremption?.valeurs).toEqual(["42"]);
  });

  it("ne réécrit rien quand l'événement est rejoué", async () => {
    const { tx, ecrit } = base(payee({ rembourse_cents: 5000 }));
    expect(await rembourser(ref, 5000, tx)).toBeNull();
    expect(ecrit).toHaveLength(0);
  });

  it("ne redescend pas sur un cumul plus ancien livré en retard", async () => {
    const { tx, ecrit } = base(payee({ rembourse_cents: 10000 }));
    expect(await rembourser(ref, 5000, tx)).toBeNull();
    expect(ecrit).toHaveLength(0);
  });

  it("refuse un remboursement arrivé avant l'encaissement, pour qu'il soit rejoué", async () => {
    const { tx, ecrit } = base(payee({ statut: "attente" }));
    await expect(rembourser({ paymentIntent: null, sessionId: "cs_1" }, 15000, tx)).rejects.toThrow();
    expect(ecrit).toHaveLength(0);
  });

  it("ignore un paiement que le site ne connaît pas", async () => {
    const { tx } = base(null);
    expect(await rembourser(ref, 15000, tx)).toBeNull();
  });

  it("ne cherche rien sans identifiant", async () => {
    const { tx } = base(payee());
    expect(await rembourser({ paymentIntent: null, sessionId: null }, 15000, tx)).toBeNull();
  });
});
