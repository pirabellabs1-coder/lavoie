# Tableau de bord — mise en service

Le tableau de bord est déployé mais **endormi** tant que deux variables
d'environnement ne sont pas ajoutées dans Vercel. Sans elles, le site public
fonctionne exactement comme avant : les formulaires envoient leurs
notifications par e-mail, mais rien n'est enregistré ni automatisé.

Adresse une fois activé : <https://www.lavoie2laconscience.com/admin>

---

## 1. Créer la base de données (5 minutes)

1. Ouvrir le projet **lavoix** sur [vercel.com](https://vercel.com).
2. Onglet **Storage** → **Create Database** → choisir **Neon** (Postgres).
   Le palier gratuit suffit largement au volume actuel.
3. Vercel connecte la base au projet et ajoute tout seul la variable
   `DATABASE_URL`. Il n'y a rien d'autre à faire : **les tables se créent
   automatiquement** au premier chargement du tableau de bord.

> Toute autre base Postgres convient (Supabase, Railway…). Il suffit alors de
> coller sa chaîne de connexion dans une variable nommée `DATABASE_URL`.
> Utilisez de préférence la chaîne « pooled » / « pgbouncer ».

## 2. Choisir le mot de passe d'accès

Dans **Settings → Environment Variables**, ajouter :

| Nom | Valeur | Obligatoire |
| --- | --- | --- |
| `ADMIN_PASSWORD` | le mot de passe de connexion au tableau de bord | **oui** |
| `DATABASE_URL` | ajoutée automatiquement à l'étape 1 | **oui** |
| `CRON_SECRET` | une longue chaîne aléatoire | recommandé |
| `RESEND_FROM` | `La Voie 2 la Conscience <contact@lavoie2laconscience.com>` | recommandé |

Choisissez un mot de passe long et unique : c'est la seule protection du
fichier clients. Le changer déconnecte immédiatement toutes les sessions.

## 3. Redéployer

**Deployments** → dernier déploiement → **⋯** → **Redeploy**. Les variables
ne sont lues qu'au démarrage : sans ce redéploiement, rien ne change.

---

## Ce que fait le tableau de bord

**Vue d'ensemble** — nombre de contacts, nouveaux sur 7 et 30 jours, clients,
e-mails envoyés. L'entonnoir montre où se situent les gens dans le parcours,
la courbe montre les inscriptions jour par jour, et les sources disent d'où
ils viennent.

**Contacts** — la liste complète, avec recherche et filtre par statut, plus un
export CSV ouvrable dans Excel. Chaque fiche affiche les coordonnées, le
message envoyé, la chronologie complète (ce qu'il a fait et quand), une zone
de notes libre, et le statut à faire évoluer.

**Le parcours**, du premier contact à la conversion :

`Nouveau` → `Lead` → `Contacté` → `Appel fait` → `Proposition` → `Client`
(ou `Perdu`)

Le statut avance tout seul quand la personne agit sur le site, et ne recule
jamais. Vous pouvez le corriger à la main à tout moment.

**Séquences** — les e-mails qui partent tout seuls. Trois scénarios sont
installés d'office :

| Séquence | Se déclenche quand | Contenu |
| --- | --- | --- |
| Suite du guide gratuit | quelqu'un télécharge le guide | 4 e-mails sur 16 jours |
| Bienvenue aux Lettres | inscription aux Lettres | 2 e-mails sur 7 jours |
| Suite d'une demande d'appel | formulaire de contact rempli | accusé de réception + relance à J+4 |

Le sujet, le texte et le délai de chaque étape se modifient directement depuis
le tableau de bord. `{{prenom}}` est remplacé par le prénom du destinataire.
Chaque séquence peut être mise en pause sans rien perdre.

**Envois** — le journal de tous les e-mails automatiques partis, avec leur
état. Un envoi en échec est automatiquement retenté toutes les 6 heures.

---

## Points de vigilance

**Le domaine d'expédition.** Tant que `RESEND_FROM` n'est pas une adresse du
domaine vérifié dans Resend, les e-mails partent de `onboarding@resend.dev` et
finiront souvent en indésirables. C'est le premier réglage à faire pour que les
relances servent à quelque chose.

**Le rythme des relances.** Le worker tourne une fois par jour à 8 h (réglé
dans `vercel.json`). Les e-mails immédiats — bienvenue aux Lettres, accusé de
réception d'une demande d'appel — ne l'attendent pas et partent tout de suite.

**RGPD.** Chaque e-mail automatique contient un lien de désinscription, et un
désabonnement coupe instantanément toutes les séquences en cours. Les données
sont dans votre propre base : pensez à répondre aux demandes d'accès et de
suppression, et à garder la politique de confidentialité à jour.

**Sauvegarde.** L'export CSV depuis la page Contacts est votre filet de
sécurité. Prenez-en un de temps en temps.
