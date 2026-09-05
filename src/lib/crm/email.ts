/**
 * Mise en forme des e-mails.
 *
 * Les contenus des séquences sont écrits en texte simple dans le tableau de
 * bord : c'est ce qui les rend modifiables sans connaître le HTML. Ce module
 * les habille au moment de l'envoi — même texte, deux versions, la seconde
 * aux couleurs du site.
 *
 * Contraintes propres à l'e-mail : tableaux plutôt que grilles, styles en
 * ligne plutôt que feuille de style, largeur bornée, et aucune image distante
 * indispensable à la lecture.
 */

import { SITE } from "@/lib/site";

const MARINE = "#0f1d6e";
const JAUNE = "#f5c422";
const ENCRE = "#14181f";
const GRIS = "#6f7ba0";
const PAPIER = "#f3f5fd";

export function lienDesinscription(email: string): string {
  return `${SITE.url}/desinscription?e=${encodeURIComponent(email)}`;
}

/**
 * Remplace les variables d'un gabarit. Trois seulement, volontairement :
 * `{{prenom}}`, `{{email}}` et `{{lien_prerequis}}`. Une variable inconnue est
 * laissée telle quelle — mieux vaut un texte visiblement raté qu'un e-mail
 * envoyé avec un trou silencieux.
 */
export function personnaliser(
  gabarit: string,
  destinataire: { prenom: string | null; email: string; jeton?: string | null },
): string {
  // À défaut de questionnaire, le lien de confirmation renvoie vers la page de
  // contact : mieux vaut une page utile qu'un lien mort.
  const lienPrerequis = destinataire.jeton
    ? `${SITE.url}/prerequis/${destinataire.jeton}`
    : `${SITE.url}/contact`;

  // Le prénom peut manquer — une personne ajoutée à la main sur sa seule
  // adresse, par exemple. On avale alors la ponctuation qui l'annonçait, sans
  // quoi l'objet devient « Avez-vous ouvert le guide,  ? ».
  const prenom = destinataire.prenom?.trim() || "";
  let texte = gabarit.replace(
    /([ \t]*[,:—–-]?[ \t]*)\{\{\s*prenom\s*\}\}/g,
    (_tout, avant: string) => (prenom ? `${avant}${prenom}` : ""),
  );
  if (!prenom) {
    // Reste le cas du gabarit qui ouvre sur le prénom : « {{prenom}}, ».
    texte = texte.replace(/^[ \t]*,[ \t]*/gm, "");
  }

  return texte
    .replace(/\{\{\s*email\s*\}\}/g, destinataire.email)
    .replace(/\{\{\s*lien_prerequis\s*\}\}/g, lienPrerequis)
    // Un « Bonjour , » disgracieux si le prénom est inconnu.
    .replace(/Bonjour\s+,/g, "Bonjour,");
}

function echapper(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Transforme les URL nues en liens cliquables, une fois le texte échappé. */
function lier(s: string): string {
  return s.replace(/(https?:\/\/[^\s<]+[^\s<.,;:!?)"'])/g, (url) => {
    return `<a href="${url}" style="color:${MARINE};text-decoration:underline">${url}</a>`;
  });
}

function paragraphes(texte: string): string {
  return texte
    .split(/\n{2,}/)
    .map((bloc) => bloc.trim())
    .filter(Boolean)
    .map((bloc) => {
      const contenu = lier(echapper(bloc)).replace(/\n/g, "<br>");
      return `<p style="margin:0 0 18px;font-size:15px;line-height:1.65;color:${ENCRE}">${contenu}</p>`;
    })
    .join("");
}

export type EmailHabille = { html: string; text: string };

/**
 * Habille un texte simple. `email` sert au lien de désinscription : sans lui,
 * le pied de page se contente de l'identité de l'expéditeur (cas des
 * notifications internes, qui ne se désabonnent pas).
 */
export function habiller(opts: {
  texte: string;
  email?: string | null;
  /** Ligne d'aperçu affichée par la boîte de réception, sous l'objet. */
  apercu?: string;
}): EmailHabille {
  const lien = opts.email ? lienDesinscription(opts.email) : null;

  const text = lien
    ? `${opts.texte.trim()}\n\n—\nPour ne plus recevoir ces messages : ${lien}\n`
    : `${opts.texte.trim()}\n`;

  const apercu = (opts.apercu || opts.texte.trim().slice(0, 120)).replace(/\s+/g, " ");

  const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<title>${echapper(SITE.name)}</title>
</head>
<body style="margin:0;padding:0;background:${PAPIER};-webkit-font-smoothing:antialiased">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${echapper(apercu)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${PAPIER}">
  <tr>
    <td align="center" style="padding:32px 16px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
             style="max-width:560px;background:#ffffff;border-radius:4px;overflow:hidden">
        <tr>
          <td style="background:${MARINE};padding:22px 32px">
            <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:19px;
                      letter-spacing:.01em;color:#ffffff">La Voie 2 la Conscience</p>
          </td>
        </tr>
        <tr><td style="height:3px;background:${JAUNE};font-size:0;line-height:0">&nbsp;</td></tr>
        <tr>
          <td style="padding:32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif">
            ${paragraphes(opts.texte)}
          </td>
        </tr>
        <tr>
          <td style="padding:0 32px 28px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif">
            <div style="border-top:1px solid #e3e9f9;padding-top:16px">
              <p style="margin:0 0 6px;font-size:12px;line-height:1.6;color:${GRIS}">
                ${echapper(SITE.name)} · ${echapper(SITE.address.street)}, ${echapper(SITE.address.postalCode)} ${echapper(SITE.address.locality)}
              </p>
              ${
                lien
                  ? `<p style="margin:0;font-size:12px;line-height:1.6;color:${GRIS}">
                       <a href="${lien}" style="color:${GRIS};text-decoration:underline">Ne plus recevoir ces messages</a>
                     </p>`
                  : ""
              }
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

  return { html, text };
}
