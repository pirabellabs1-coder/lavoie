import { describe, expect, it } from "vitest";
import { deposerImage, lienImage, lireImage } from "@/lib/crm/images";

/**
 * Le dépôt d'une photo est le seul endroit du site où un fichier choisi par
 * une personne est décodé par une bibliothèque native. Les gardes qui le
 * précèdent sont donc plus que de la validation de formulaire : sans elles, un
 * fichier de deux méga-octets qui annonce seize mille pixels de côté réclame
 * deux giga-octets de mémoire et emporte la fonction — celle qui sert aussi
 * les formulaires publics.
 *
 * Tout se teste sans base : les refus tombent avant l'ouverture de la base,
 * et une image acceptée s'arrête net sur son absence.
 */

const SANS_BASE = "Base de données indisponible.";

/** Un PNG minuscule et valide, pour vérifier qu'une vraie image passe. */
async function pngMinuscule(): Promise<Buffer> {
  const { default: sharp } = await import("sharp");
  return sharp({
    create: { width: 8, height: 8, channels: 3, background: { r: 10, g: 20, b: 30 } },
  })
    .png()
    .toBuffer();
}

function fichier(octets: Uint8Array | string, nom: string, type: string): File {
  const corps = typeof octets === "string" ? new TextEncoder().encode(octets) : octets;
  return new File([corps as BlobPart], nom, { type });
}

describe("deposerImage", () => {
  it("refuse un fichier vide", async () => {
    const depot = await deposerImage(fichier(new Uint8Array(0), "vide.png", "image/png"));
    expect(depot).toEqual({ ok: false, erreur: "Aucun fichier reçu." });
  });

  it("refuse au-delà de quatre méga-octets, sans décoder", async () => {
    const gros = fichier(new Uint8Array(4 * 1024 * 1024 + 1), "gros.png", "image/png");
    const depot = await deposerImage(gros);
    expect(depot.ok).toBe(false);
    expect(depot.ok === false && depot.erreur).toContain("quatre méga-octets");
  });

  it("refuse un type que le navigateur annonce hors liste", async () => {
    const depot = await deposerImage(fichier("GIF89a", "anime.gif", "image/gif"));
    expect(depot.ok).toBe(false);
    expect(depot.ok === false && depot.erreur).toContain("Format non accepté");
  });

  it("refuse un SVG déguisé en JPEG — le type annoncé ne prouve rien", async () => {
    // C'est la raison d'être du second contrôle : le navigateur annonce ce
    // qu'il veut, seuls les octets disent le format réel. Le SVG est ici de
    // taille modeste, pour que ce soit bien le format qui le fasse refuser.
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"></svg>';
    const depot = await deposerImage(fichier(svg, "photo.jpg", "image/jpeg"));
    expect(depot.ok).toBe(false);
    expect(depot.ok === false && depot.erreur).toContain("Format non accepté");
  });

  it("refuse une bombe de décompression de cent octets", async () => {
    // Seize mille pixels de côté annoncés en cent octets : décodé, c'est deux
    // giga-octets de mémoire. Le plafond de pixels le refuse à la lecture de
    // l'en-tête, donc sans rien allouer.
    const bombe = '<svg xmlns="http://www.w3.org/2000/svg" width="16000" height="16000"></svg>';
    const depot = await deposerImage(fichier(bombe, "photo.png", "image/png"));
    expect(depot.ok).toBe(false);
  });

  it("refuse un TIFF déguisé en PNG", async () => {
    const { default: sharp } = await import("sharp");
    const tiff = await sharp({
      create: { width: 8, height: 8, channels: 3, background: { r: 0, g: 0, b: 0 } },
    })
      .tiff()
      .toBuffer();
    const depot = await deposerImage(fichier(tiff, "photo.png", "image/png"));
    expect(depot.ok).toBe(false);
    expect(depot.ok === false && depot.erreur).toContain("Format non accepté");
  });

  it("laisse passer une vraie image jusqu'à la base", async () => {
    // Sans base branchée, l'échec attendu est celui de la base : la preuve que
    // les gardes de taille, de type et de format ont toutes été franchies.
    const depot = await deposerImage(fichier(await pngMinuscule(), "photo.png", "image/png"));
    expect(depot).toEqual({ ok: false, erreur: SANS_BASE });
  });
});

describe("lireImage", () => {
  it("refuse un identifiant mal formé sans ouvrir la base", async () => {
    for (const id of ["", "../../etc/passwd", "a".repeat(33), "%2e%2e", "abc def"]) {
      expect(await lireImage(id)).toBeNull();
    }
  });
});

describe("lienImage", () => {
  it("rend une adresse stable, ou rien", () => {
    expect(lienImage("aZ09_-abc")).toBe("/api/images/aZ09_-abc");
    expect(lienImage(null)).toBeNull();
  });
});
