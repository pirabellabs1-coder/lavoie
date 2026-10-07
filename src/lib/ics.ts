/**
 * Un événement au format iCalendar.
 *
 * Le format a deux pièges qui font refuser le fichier entier par l'agenda :
 * une virgule ou un point-virgule non échappé coupe la valeur en deux, et une
 * ligne de plus de soixante-quinze octets doit être pliée. Les deux sont
 * traités ici, une fois, plutôt qu'à chaque appel.
 */

/** Un instant au format iCalendar, en UTC. */
export function instantIcs(d: Date | string): string {
  return new Date(d).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** Une ligne échappée, puis pliée à soixante-quinze octets. */
export function ligneIcs(cle: string, valeur: string): string {
  const net = valeur
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");

  // Le format compte des octets, pas des caractères : « é » en pèse deux, et
  // un titre de soixante-treize lettres accentuées dépasserait la limite sans
  // qu'on s'en aperçoive. On découpe donc sur la taille réelle, en s'arrêtant
  // toujours à une frontière de caractère — couper un « é » en deux produirait
  // un fichier illisible.
  const morceaux: string[] = [];
  let reste = `${cle}:${net}`;
  while (Buffer.byteLength(reste, "utf8") > 73) {
    let coupe = Math.min(reste.length, 73);
    while (Buffer.byteLength(reste.slice(0, coupe), "utf8") > 73) coupe -= 1;
    morceaux.push(reste.slice(0, coupe));
    // Une ligne pliée reprend par une espace : c'est la règle du format.
    reste = " " + reste.slice(coupe);
  }
  morceaux.push(reste);
  return morceaux.join("\r\n");
}

export type EvenementIcs = {
  uid: string;
  debut: Date | string;
  fin: Date | string;
  titre: string;
  description?: string;
  url?: string;
  lieu?: string | null;
};

export function evenementIcs(e: EvenementIcs): string {
  return (
    [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//La Voie 2 la Conscience//Stages//FR",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      ligneIcs("UID", e.uid),
      ligneIcs("DTSTAMP", instantIcs(new Date())),
      ligneIcs("DTSTART", instantIcs(e.debut)),
      ligneIcs("DTEND", instantIcs(e.fin)),
      ligneIcs("SUMMARY", e.titre),
      ...(e.description ? [ligneIcs("DESCRIPTION", e.description)] : []),
      ...(e.url ? [ligneIcs("URL", e.url)] : []),
      ...(e.lieu ? [ligneIcs("LOCATION", e.lieu)] : []),
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n") + "\r\n"
  );
}
