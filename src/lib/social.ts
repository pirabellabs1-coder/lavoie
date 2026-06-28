/**
 * Liens réseaux sociaux — SOURCE UNIQUE.
 *
 * Renseignez les URL fournies par le client dans `url`. Tant qu'une `url`
 * est vide, le lien pointe vers "#" (placeholder) et n'ouvre rien.
 * Utilisé par : src/components/Footer.tsx et src/app/contact/page.tsx.
 *
 * Pour ajouter un réseau (ex. Facebook), ajoutez une entrée { abbr, name, url }.
 */
export type SocialLink = { abbr: string; name: string; url: string };

export const SOCIALS: SocialLink[] = [
  { abbr: "IG", name: "Instagram", url: "" },
  { abbr: "IN", name: "LinkedIn", url: "" },
  { abbr: "YT", name: "YouTube", url: "" },
  { abbr: "TT", name: "TikTok", url: "" },
];
