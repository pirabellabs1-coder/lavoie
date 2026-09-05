import { Resend } from "resend";
import { SITE } from "@/lib/site";
import { habiller, personnaliser } from "./email";
import { EXPEDITEUR } from "./sequences";
import { identite } from "./session";
import { obtenirUtilisateur } from "./utilisateurs";

/**
 * Voir un e-mail avant qu'il parte, et se l'envoyer.
 *
 * Jusqu'ici on écrivait une campagne dans un champ de texte et on cliquait
 * « Envoyer maintenant ». Entre les deux, rien : ni le gabarit, ni les liens,
 * ni ce que devient `{{prenom}}`, ni la tête que ça a dans une boîte de
 * réception. Un envoi de masse ne se rattrape pas ; il doit pouvoir se
 * regarder d'abord.
 *
 * L'aperçu emprunte exactement le même chemin que l'envoi réel —
 * `personnaliser` puis `habiller` — sans quoi il mentirait. Le prénom est
 * remplacé par un exemple, et le lien de désinscription pointe vers l'adresse
 * qui regarde : cliquer dessus depuis l'aperçu désabonnerait bien quelqu'un,
 * autant que ce soit soi-même.
 */

/** Le prénom d'exemple, pour voir ce que donne la personnalisation. */
export const PRENOM_EXEMPLE = "Marie";

export type Apercu = { sujet: string; html: string; texte: string };

export function construireApercu(entree: {
  sujet: string;
  corps: string;
  /** L'adresse qui sert de destinataire fictif. */
  email: string;
  prenom?: string;
}): Apercu {
  const destinataire = {
    prenom: entree.prenom ?? PRENOM_EXEMPLE,
    email: entree.email,
    jeton: null,
  };
  const { html, text } = habiller({
    texte: personnaliser(entree.corps, destinataire),
    email: entree.email,
  });
  return { sujet: personnaliser(entree.sujet, destinataire), html, texte: text };
}

/**
 * Envoie l'e-mail tel quel à une seule adresse. Renvoie `null` si c'est parti,
 * une phrase à afficher sinon.
 */
export async function envoyerEssai(entree: {
  sujet: string;
  corps: string;
  destinataire: string;
  prenom?: string;
}): Promise<string | null> {
  if (!process.env.RESEND_API_KEY) {
    return "L'envoi d'e-mails n'est pas configuré (RESEND_API_KEY manquante).";
  }
  const apercu = construireApercu({
    sujet: entree.sujet,
    corps: entree.corps,
    email: entree.destinataire,
    prenom: entree.prenom,
  });

  try {
    const { error } = await new Resend(process.env.RESEND_API_KEY).emails.send({
      from: EXPEDITEUR,
      to: entree.destinataire,
      // Le préfixe évite qu'un essai retrouvé trois jours plus tard soit pris
      // pour un vrai message parti à la liste.
      subject: `[Essai] ${apercu.sujet}`,
      html: apercu.html,
      text: apercu.texte,
    });
    return error ? (error.message ?? "Erreur Resend") : null;
  } catch (e) {
    return e instanceof Error ? e.message : "Erreur inconnue";
  }
}

/**
 * L'adresse proposée par défaut pour un essai : celle du compte connecté quand
 * il en a une, l'adresse du site sinon (la clé de secours n'a pas de compte).
 */
export async function adresseParDefaut(): Promise<string> {
  const qui = await identite();
  if (!qui || qui.principal) return SITE.email;
  const u = await obtenirUtilisateur(qui.id);
  return u?.email || SITE.email;
}
