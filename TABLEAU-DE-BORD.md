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

Choisissez un mot de passe long et unique : c'est la clé de secours du fichier
clients. Le changer déconnecte immédiatement toutes les sessions.

Une fois le tableau de bord ouvert, créez un compte nominatif par personne
depuis l'onglet **Comptes** (voir plus bas) : ce mot de passe principal n'a
alors plus à circuler.

## 3. Redéployer

**Deployments** → dernier déploiement → **⋯** → **Redeploy**. Les variables
ne sont lues qu'au démarrage : sans ce redéploiement, rien ne change.

---

## Le questionnaire de préparation

Adresse à partager : <https://www.lavoie2laconscience.com/questionnaire>

Il remplace le Typeform. Mêmes questions, en quatre étapes, mais les réponses
arrivent dans votre base et s'affichent dans la fiche de la personne, sous le
score.

**Le score.** Chaque copie est notée sur 100. L'engagement déclaré pèse le plus
lourd (prêt à investir du temps, prêt à se remettre en question : 45 points),
puis l'antériorité du travail personnel et la pratique en cours (20 points), la
blessure déjà identifiée (8), le soin apporté aux réponses écrites (15), et la
capacité d'investissement seulement à la marge (12). Au-dessus de **60**, la
personne est déclarée éligible à l'entretien offert.

Ces poids sont un point de départ, pas une vérité. Ils se modifient dans
`src/lib/questionnaire.ts`, dans un seul tableau nommé `BAREMES`, avec le seuil
juste en dessous.

**Ce qui part ensuite, tout seul :**

| Score | Séquence déclenchée | Contenu |
| --- | --- | --- |
| 60 et plus | Prérequis avant l'entretien | vidéo sur la gratuité, livret sur le Cadre, lien de confirmation, relance à J+3 |
| moins de 60 | Orientation après questionnaire | renvoi vers le livret et les stages, sans promesse d'entretien |

## Le cadre avant l'entretien

La personne éligible reçoit un **lien personnel** : un bouton à cliquer une fois
la vidéo vue et le livret pris. Plus d'e-mail de confirmation à lire et à
pointer — la date s'inscrit dans sa fiche, et la relance s'arrête d'elle-même.

**Pour que la clause d'annulation s'applique**, il faut renseigner la date du
rendez-vous dans la fiche du contact, encadré « Questionnaire de préparation ».
Sans date, rien n'est annulé. Avec une date, le worker annule automatiquement
tout rendez-vous à moins de 24 heures dont les prérequis ne sont pas confirmés,
prévient la personne, et l'inscrit dans sa chronologie.

## Campagnes

Onglet **Campagnes** : les e-mails que vous décidez d'écrire, par opposition aux
séquences qui partent seules.

Le ciblage se combine : statut dans le parcours, source du formulaire, campagne
d'origine, ancienneté, ou « n'a jamais ouvert un e-mail » pour les réveils. Sans
aucun critère, la campagne part à toute la liste ; les désabonnés sont toujours
exclus.

**Comptez toujours les destinataires avant d'envoyer.** Le bouton est là pour
ça, et un envoi de masse ne se rattrape pas. Pour un premier essai, ciblez une
campagne d'origine qui n'existe pas : vous verrez le mécanisme sans écrire à
personne.

L'envoi part par paquets et reprend là où il s'est arrêté ; personne ne reçoit
deux fois le même message. Une campagne en cours peut être arrêtée à tout
moment — ce qui est parti est parti, le reste ne part pas.

## Le suivi des envois

Le journal des envois indique maintenant si chaque e-mail a été **livré, ouvert
ou cliqué**, et l'en-tête de la page affiche les taux. Une adresse qui rebondit
définitivement ou une personne qui signale un message comme indésirable est
désinscrite automatiquement : c'est ce qui protège la réputation du domaine, et
donc la délivrabilité de tous les autres messages.

**Ce suivi demande un dernier réglage.** Dans Resend → Webhooks → Add endpoint,
posez l'adresse `https://www.lavoie2laconscience.com/api/webhooks/resend`.
Resend affiche alors un secret commençant par `whsec_` : collez-le dans une
variable `RESEND_WEBHOOK_SECRET` sur Vercel, puis redéployez. Tant qu'elle
manque, l'adresse répond 503 et refuse tout — personne ne peut y injecter de
faux événements.

## Le point du lundi

Chaque lundi matin, un e-mail part vers `contact@lavoie2laconscience.com` avec
sept chiffres : nouveaux contacts, total, clients, questionnaires reçus et
éligibles, prérequis confirmés, rendez-vous de la semaine, e-mails partis et
taux d'ouverture.

## Les comptes

Onglet **Comptes**, réservé au propriétaire. Chacun a désormais son accès, avec
son e-mail comme identifiant.

| Rôle | Ce qu'il peut faire |
| --- | --- |
| **Propriétaire** | tout : campagnes, séquences, export du fichier, sauvegarde, gestion des comptes |
| **Secrétariat** | contacts, questionnaires, rendez-vous, journal des envois — rien d'autre |

Retirer l'accès à quelqu'un se fait en un clic et ne change rien pour les
autres. Le compte n'est pas supprimé : sa trace reste, et l'accès se rend aussi
facilement qu'il se retire.

**Le mot de passe principal reste la clé de secours.** `ADMIN_PASSWORD` ouvre
toujours le tableau de bord avec tous les droits, en laissant le champ e-mail
vide. Il ne passe pas par la base : c'est ce qui garantit de pouvoir entrer même
si la base est momentanément injoignable. Il doit rester entre les mains de
Domoïna seule.

Les mots de passe des comptes ne sont jamais enregistrés tels quels, seulement
une empreinte qui ne permet pas de les retrouver. Un mot de passe oublié se
remplace depuis la page Comptes ; il ne se relit pas.

## La sauvegarde

Une copie complète de la base part chaque jour par e-mail vers
`contact@lavoie2laconscience.com` : la sauvegarde au format JSON et la liste des
contacts au format CSV, ouvrable dans Excel.

Rien ne part si rien n'a changé depuis la veille — une base au repos n'inonde
pas la boîte. Et les empreintes de mots de passe des comptes ne sont jamais
exportées : après une restauration, il faudra redonner un mot de passe à chacun.

Le bouton **Télécharger maintenant**, sur la vue d'ensemble, produit la même
copie à la demande.

> Rangez ces fichiers ailleurs que dans la boîte de réception. Une sauvegarde
> qui vit au même endroit que le reste n'en est pas une.

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
| Prérequis avant l'entretien | questionnaire jugé éligible | le cadre + le lien de confirmation, relance à J+3 |
| Orientation après questionnaire | questionnaire sous le seuil | renvoi vers le livret et les stages |

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
