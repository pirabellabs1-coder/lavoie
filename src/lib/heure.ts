/**
 * Heures de Paris.
 *
 * Les fonctions serveur tournent en UTC chez Vercel : sans conversion
 * explicite, un rendez-vous saisi à 14 h 30 s'affiche à 12 h 30 et la clause
 * d'annulation se déclenche deux heures trop tôt. Tout ce qui touche à un
 * rendez-vous passe donc par ici.
 */

const ZONE = "Europe/Paris";

function parties(instant: Date): Record<string, string> {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: ZONE,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  return Object.fromEntries(fmt.formatToParts(instant).map((p) => [p.type, p.value]));
}

/** Décalage de Paris par rapport à UTC, en millisecondes, à cet instant précis. */
function decalage(instant: Date): number {
  const p = parties(instant);
  // `hour` vaut « 24 » à minuit dans certaines implémentations.
  const heure = Number(p.hour) % 24;
  const commeUtc = Date.UTC(
    Number(p.year),
    Number(p.month) - 1,
    Number(p.day),
    heure,
    Number(p.minute),
    Number(p.second),
  );
  return commeUtc - instant.getTime();
}

/** Convertit une saisie « 2026-09-01T14:30 », lue comme heure de Paris. */
export function depuisParis(saisie: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(saisie)) return null;
  const commeSiUtc = new Date(`${saisie}:00Z`);
  if (Number.isNaN(commeSiUtc.getTime())) return null;
  return new Date(commeSiUtc.getTime() - decalage(commeSiUtc));
}

/** Valeur d'un champ `datetime-local`, en heure de Paris. */
export function pourChamp(d: Date | string | null): string {
  if (!d) return "";
  const v = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(v.getTime())) return "";
  const p = parties(v);
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}

/** Jour de la semaine à Paris — « lundi », « mardi »… */
export function jourParis(d: Date = new Date()): string {
  return d.toLocaleDateString("fr-FR", { timeZone: ZONE, weekday: "long" }).toLowerCase();
}

/** Affichage lisible, toujours en heure de Paris. */
export function enClair(d: Date | string | null): string {
  if (!d) return "—";
  const v = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(v.getTime())) return "—";
  return v.toLocaleString("fr-FR", {
    timeZone: ZONE,
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
