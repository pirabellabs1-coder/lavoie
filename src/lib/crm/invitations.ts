import { Resend } from "resend";
import { SITE } from "@/lib/site";
import { habiller } from "./email";
import { EXPEDITEUR } from "./sequences";
import { INVITATION_JOURS, ROLES, type Role } from "./utilisateurs";

/**
 * L'e-mail qui ouvre l'accès au tableau de bord.
 *
 * Il ne contient aucun mot de passe — ni choisi par quelqu'un d'autre, ni
 * fabriqué puis expédié en clair. Il porte un lien à usage unique par lequel la
 * personne invitée choisit elle-même son mot de passe. Personne d'autre, pas
 * même Domoïna, ne le connaîtra : c'est ce qui rend une trace de connexion
 * crédible, et ce qui évite qu'un mot de passe traîne dans une boîte mail.
 */

export function lienInvitation(jeton: string): string {
  return `${SITE.url}/admin/invitation/${encodeURIComponent(jeton)}`;
}

export async function envoyerInvitation(entree: {
  email: string;
  nom: string;
  role: Role | string;
  jeton: string;
  /** Qui invite — la personne s'attend à un nom qu'elle reconnaît. */
  parQui: string;
  /** Vrai s'il s'agit d'un nouveau lien pour un compte déjà invité. */
  renvoi?: boolean;
}): Promise<string | null> {
  if (!process.env.RESEND_API_KEY) {
    return "L'envoi d'e-mails n'est pas configuré (RESEND_API_KEY manquante).";
  }

  const role = ROLES.find((r) => r.cle === entree.role);
  const lien = lienInvitation(entree.jeton);
  const prenom = entree.nom.split(/\s+/)[0];

  const { html, text } = habiller({
    email: entree.email,
    apercu: "Votre accès au tableau de bord de La Voie 2 la Conscience.",
    texte:
      `Bonjour ${prenom},\n\n` +
      (entree.renvoi
        ? `Voici un nouveau lien pour ouvrir votre accès au tableau de bord — le précédent a expiré ou s'est perdu.\n\n`
        : `${entree.parQui} vous ouvre un accès au tableau de bord de La Voie 2 la Conscience.\n\n`) +
      (role ? `Votre rôle : ${role.label}. ${role.aide}\n\n` : "") +
      `Choisissez votre mot de passe ici :\n${lien}\n\n` +
      `Ce lien ne sert qu'une fois et vaut ${INVITATION_JOURS} jours. Personne d'autre que vous ne connaîtra ce mot de passe — pas même la personne qui vous invite : elle ne peut que vous renvoyer un lien, jamais lire ni choisir le vôtre.\n\n` +
      `Une fois entré, votre adresse de connexion est ${entree.email}, sur ${SITE.url}/admin.\n\n` +
      `Ce tableau de bord donne accès au fichier des personnes accompagnées. Choisissez un mot de passe que vous n'utilisez nulle part ailleurs, et gardez-le pour vous.`,
  });

  try {
    const { error } = await new Resend(process.env.RESEND_API_KEY).emails.send({
      from: EXPEDITEUR,
      to: entree.email,
      subject: entree.renvoi
        ? "Votre nouveau lien d'accès au tableau de bord"
        : "Votre accès au tableau de bord",
      html,
      text,
    });
    return error ? (error.message ?? "Erreur Resend") : null;
  } catch (e) {
    return e instanceof Error ? e.message : "Erreur inconnue";
  }
}
