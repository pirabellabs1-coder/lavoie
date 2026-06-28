/**
 * Liens réseaux sociaux — SOURCE UNIQUE.
 *
 * Renseignez les URL dans `url`. Tant qu'une `url` est vide, le lien pointe
 * vers "#" (placeholder) et n'ouvre rien.
 * Utilisé par : src/components/Footer.tsx et src/app/contact/page.tsx.
 *
 * Pour ajouter un réseau (ex. TikTok), ajoutez une entrée { abbr, name, url }.
 */
export type SocialLink = { abbr: string; name: string; url: string };

export const SOCIALS: SocialLink[] = [
  { abbr: "IG", name: "Instagram", url: "https://www.instagram.com/lavoie2laconscience/" },
  { abbr: "FB", name: "Facebook", url: "https://www.facebook.com/profile.php?id=61579137202783" },
  { abbr: "IN", name: "LinkedIn", url: "https://www.linkedin.com/in/domoina-ramiadana/" },
  { abbr: "YT", name: "YouTube", url: "https://youtube.com/@lavoie2laconscience?si=j0fhHcMQHO1CY8xf" },
];
