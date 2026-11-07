import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { describe, expect, it } from "vitest";
import { estRoleValide, peut } from "@/lib/crm/utilisateurs";

/**
 * Qui voit quoi.
 *
 * Un rôle sans accès aux fiches ne vaut que si chaque page et chaque action le
 * vérifie. Masquer un lien ne protège rien : ces tests échouent le jour où une
 * page nouvelle oublie sa garde.
 */

describe("les droits par rôle", () => {
  it("donne tout au propriétaire", () => {
    for (const d of ["fichier", "campagnes", "sequences", "export", "comptes", "sauvegarde", "offres"] as const) {
      expect(peut("proprietaire", d)).toBe(true);
    }
  });

  it("donne les fiches au secrétariat, et rien de ce qui touche à l'argent ou aux envois de masse", () => {
    expect(peut("secretariat", "fichier")).toBe(true);
    for (const d of ["campagnes", "sequences", "export", "comptes", "sauvegarde", "offres"] as const) {
      expect(peut("secretariat", d)).toBe(false);
    }
  });

  it("ne donne aucune donnée personnelle à l'observateur", () => {
    for (const d of ["fichier", "campagnes", "sequences", "export", "comptes", "sauvegarde", "offres"] as const) {
      expect(peut("observateur", d)).toBe(false);
    }
  });

  it("accepte le rôle observateur à l'invitation, et refuse l'inconnu", () => {
    expect(estRoleValide("observateur")).toBe(true);
    expect(estRoleValide("administrateur")).toBe(false);
  });

  it("ne donne rien à un rôle inconnu", () => {
    expect(peut("pirate", "fichier")).toBe(false);
  });
});

function pages(dossier: string): string[] {
  return readdirSync(dossier).flatMap((nom) => {
    const chemin = join(dossier, nom);
    if (statSync(chemin).isDirectory()) return pages(chemin);
    return nom === "page.tsx" ? [chemin] : [];
  });
}

const ADMIN = join(process.cwd(), "src", "app", "admin");
const lire = (chemin: string) => readFileSync(chemin, "utf8");
const nom = (chemin: string) => relative(ADMIN, chemin).split(sep).join("/");

describe("les gardes du tableau de bord", () => {
  // Ouvertes à tout compte connecté : des chiffres, et le carnet de l'équipe.
  const OUVERTES = new Set(["page.tsx", "carnet/page.tsx"]);
  // Sans session par nature : on y entre pour en obtenir une.
  const PUBLIQUES = new Set(["login/page.tsx", "invitation/[jeton]/page.tsx"]);

  it("fait vérifier un droit explicite à chaque page, sauf la vue d'ensemble et le carnet", () => {
    const sansDroit = pages(ADMIN)
      .filter((p) => !OUVERTES.has(nom(p)) && !PUBLIQUES.has(nom(p)))
      .filter((p) => !/exigerDroit\("[a-z]+"\)/.test(lire(p)))
      .map(nom);
    expect(sansDroit).toEqual([]);
  });

  it("vérifie le droit avant toute lecture, pas après", () => {
    // Vérifiée après coup, une garde laisse deviner quelles fiches existent :
    // refus pour une fiche réelle, 404 pour une fiche absente.
    const fautives = pages(ADMIN)
      .filter((p) => !PUBLIQUES.has(nom(p)))
      .filter((p) => {
        const corps = lire(p).split("export default async function")[1] ?? "";
        const premier = corps.match(/await (?!searchParams|params)[^;]+/);
        return !premier || !/exigerDroit|exigerIdentite/.test(premier[0]);
      })
      .map(nom);
    expect(fautives).toEqual([]);
  });

  it("garde les pages de données personnelles derrière le droit « fichier »", () => {
    for (const p of [
      "contacts/page.tsx",
      "contacts/[id]/page.tsx",
      "questionnaires/page.tsx",
      "rendez-vous/page.tsx",
      "stages/page.tsx",
      "temoignages/page.tsx",
      "parrainage/page.tsx",
      "envois/page.tsx",
    ]) {
      expect(lire(join(ADMIN, ...p.split("/"))), p).toContain('exigerDroit("fichier")');
    }
  });

  it("ne laisse aucune action sur les fiches se contenter d'une session", () => {
    for (const a of ["contacts/actions.ts", "temoignages/actions.ts", "stages/actions.ts"]) {
      const src = lire(join(ADMIN, ...a.split("/")));
      expect(src, a).not.toMatch(/if \(!\(await identite\(\)\)\)|const qui = await identite\(\);/);
    }
    const fiche = lire(join(ADMIN, "contacts", "[id]", "actions.ts"));
    expect(fiche).toContain('return (await identiteAvecDroit("fichier")) !== null;');
    expect(fiche).not.toContain("const qui = await identite();");
  });
});
