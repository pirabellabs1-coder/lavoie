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

**Les stages sont un critère à part entière.** On peut être venu à un stage sans
être « client » ni porter la bonne source : le ciblage propose donc la liste des
stages — un stage précis, ou n'importe lequel — et l'état de la place :
demande, liste d'attente, confirmée, venue, annulée. Sans coche sur les états,
tous comptent. « Confirmée + venue » sur le stage d'automne écrit exactement au
groupe qui était dans la salle ; « demande » seule, à ceux qui ont frappé à la
porte sans que la place se conclue.

Ce même critère existe dans l'onglet **Séquences**, panneau « Ajouter des
personnes » : de quoi faire entrer d'un coup les venus d'un stage dans une
séquence — un suivi, une invitation au suivant.

**Regardez l'e-mail avant qu'il parte.** L'encadré « Avant d'envoyer » montre le
message tel qu'il arrivera — gabarit, liens, prénom remplacé —, et l'envoie à
votre adresse en un clic. L'objet de cet essai est préfixé de « [Essai] », donc
aucun risque de le confondre avec un vrai départ. Le même bouton existe sur
chaque e-mail des séquences, dans l'onglet Séquences.

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

## Les propositions

Onglet **Propositions**, réservé au propriétaire — il est question d'argent.

Une proposition se prépare depuis la fiche d'un contact : intitulé, montant,
échéancier, chances de signature, date de validité, et le texte que vous lui
adressez. Elle reste en brouillon tant que vous ne l'envoyez pas.

**Ce n'est pas un e-mail, c'est une page.** La personne reçoit un lien
personnel, ouvre la proposition, la relit, la fait lire autour d'elle, et répond
d'un clic : « j'accepte » ou « ce ne sera pas maintenant ». Un accord fait
passer le contact en client ; un refus le sort du parcours.

Vous voyez **combien de fois elle a été ouverte**, et quand. Une proposition
ouverte quatre fois sans réponse ne se relance pas comme une proposition jamais
ouverte — et le texte des relances automatiques en tient compte.

**Les relances partent seules** : trois jours après l'envoi, puis huit jours.
Sans réponse au bout de quinze jours, la proposition est classée et le contact
repasse en « perdu » — sauf s'il est déjà client d'autre chose.

En haut de la page, quatre chiffres : ce qui est en jeu, le même montant pondéré
par les chances que vous avez estimées, ce qui a été signé ce mois-ci, et le
taux d'acceptation sur toutes les propositions tranchées.

> Le paiement en ligne n'est pas branché : accepter une proposition n'encaisse
> rien. C'est la décision Stripe ou Chariow qui tranchera ce point.

## Les stages

Onglet **Stages**. Chaque stage du catalogue y apparaît avec sa jauge :
confirmées sur places, demandes à traiter, liste d'attente.

**Le formulaire est en bas de chaque page de stage.** Il dit franchement ce
qu'il est : une demande de place, pas une inscription payée. La personne entre
dans le fichier, reçoit un accusé de réception, et le secrétariat est prévenu.
Le règlement continue de passer par la billetterie — c'est la confirmation qui
porte le lien.

Quand les places sont prises, le formulaire bascule tout seul en **liste
d'attente**, et le message change en conséquence. Les demandes en cours
comptent comme des places prises : on ne promet jamais deux fois la même place.

Le parcours d'une place :

`Demande` → `Confirmée` → `Venue`, avec `Liste d'attente` et `Annulée` sur les
côtés. Confirmer quelqu'un le fait passer en **client** dans le fichier.

**Deux e-mails partent tout seuls.** Sept jours avant, les personnes confirmées
reçoivent la logistique — le texte se règle stage par stage, dans « Régler ce
stage ». Deux jours après, un mot de retour qui invite à répondre : c'est là que
se récoltent les témoignages.

> Les inscriptions déjà passées par Eventbrite ne remontent pas : la
> billetterie n'expose pas ses données sans clé d'API. Seules les demandes
> faites depuis le site entrent dans le fichier.

## Les témoignages

Onglet **Témoignages**. La page publique affichait jusqu'ici des avis écrits en
dur dans le code — chaque ajout demandait une modification et un déploiement.
Désormais, une personne peut déposer son témoignage depuis le bas de la page
`/temoignages`, avec une note en étoiles et son contexte.

**Rien n'est publié tout seul.** Le texte entre en file d'attente, et le petit
chiffre doré à côté de « Témoignages » dans la barre latérale compte ceux qui
vous attendent. Vous les relisez, puis « Publier » les met en ligne aussitôt,
en tête de la page, devant les avis Google historiques. « Retirer du site » les
masque sans les effacer ; « Supprimer » est définitif, à réserver aux doublons
et aux dépôts indésirables.

Le consentement à la publication est demandé au dépôt, et enregistré : c'est ce
qui vous autorise à publier le nom.

**C'est le mot de retour post-stage qui les fait venir.** Deux jours après un
stage, l'e-mail automatique invite maintenant à déposer un témoignage — le canal
et la récolte sont branchés l'un sur l'autre.

## Parrainage & réveil

Onglet **Parrainage & réveil**, sous « Les gens ». Deux mécaniques qui font
revenir du monde sans effort de votre part.

**Le parrainage.** Chaque contact peut recevoir un lien personnel, à copier
depuis sa fiche (encart « Parrainage »). Toute personne qui arrive par ce lien
et laisse ses coordonnées lui est automatiquement rattachée — ni l'un ni l'autre
n'a rien à saisir. Le rattachement se fait au premier contact et ne s'écrase
jamais : un parrain, une fois, définitivement. La page liste les parrains, le
nombre de personnes qu'ils ont amenées, et combien sont devenues clientes.

**Le réveil des dormants.** Une liste qui gonfle sans se nettoyer coûte de
l'argent et abîme la délivrabilité de tout le monde. Après six mois sans le
moindre signe, une dernière lettre part — une seule. Trente jours plus tard,
faute de réaction, le contact sort de la liste active : il reste dans le
fichier, il ne reçoit simplement plus rien. Les clients ne sont jamais
concernés. Tout se fait tout seul, chaque jour.

Les deux chiffres du haut disent où en est la liste : combien de contacts
sommeillent, et combien sont en sursis après leur réveil.

## Autour des stages

Trois choses partent toutes seules, en plus de la logistique envoyée à J-7 :

**La demande sans réponse.** L'accusé de réception promet une confirmation sous
48 heures ouvrées. Si au bout de **quatre jours** la place est toujours en
« Demande », un mot part à la personne : le délai vient de nous, son intention
tient-elle toujours ? Une seule fois, jamais deux, et jamais pour un stage déjà
passé. C'est aussi ce qui fait remonter les demandes oubliées — la réponse
arrive dans votre boîte.

**La demande de retour**, deux jours après le stage, qui invite à déposer un
témoignage.

**La suite du chemin**, cinq jours après le stage : les personnes confirmées ou
venues entrent dans la séquence **« Après le stage »** — trois e-mails sur un
mois. L'intégration d'abord (ce qui se referme quand on rentre), puis les
cercles comme rythme, puis le stage suivant et l'accompagnement individuel. Elle
s'arrête d'elle-même en cas de désinscription, et se modifie comme les autres
depuis l'onglet Séquences.

## Le routage par revenu

Le questionnaire aiguille désormais chaque personne selon son revenu **et** son
score, vers l'une de trois routes :

| Profil | Route | Séquence e-mail | Destination |
| --- | --- | --- | --- |
| Score élevé (qualifié) | **Appel direct** | Prérequis | l'entretien avec Domoïna |
| Revenu > 2 000 €, non qualifié | **Stages** | Suite web-conférence → stages | réserver un stage sur le site |
| Revenu ≤ 2 000 € | **Formations** | Suite web-conférence → cercles | les cercles à 70 €/mois (hub `bit.ly/4pT5ITp`) |

Le revenu modeste prime sur le score : on ne pousse pas un accompagnement
premium à quelqu'un dont on sait qu'il ne rentre pas dans le budget — on
l'oriente vers un cercle accessible, plus juste pour lui.

Les deux nouvelles séquences reprennent **votre copie Mailchimp** (la séquence
de la web-conférence des 9 Clés) : l'histoire de la blessure originelle, le Rêve
Conscient, la prospérité, le menu complet des portes d'entrée. Rien n'a été
réinventé — le texte est porté tel quel, et il part maintenant de votre domaine
vérifié (Resend) au lieu d'une adresse Gmail, ce qui améliore la délivrabilité.

Tout se modifie depuis l'onglet **Séquences**, comme les autres.

## Remettre le fichier à zéro

Onglet **Comptes**, tout en bas, encadré rouge. Il retire d'un coup les
personnes et tout ce qui s'y rattache : fiches, chronologies, questionnaires,
places de stage, propositions, témoignages, inscriptions aux séquences, journal
des envois et campagnes écrites. C'est fait pour la mise en service — repartir
d'une page blanche avant que les vraies personnes arrivent.

**Sans retour possible.** Il n'y a pas de corbeille. L'écran compte d'abord ce
qui partirait, ligne par ligne, et rien ne se déclenche tant que le mot `VIDER`
n'est pas écrit en toutes lettres. Prenez l'export CSV avant, et gardez la
sauvegarde quotidienne qui arrive par e-mail : c'est le seul filet.

**Ce qui reste, délibérément** : les séquences et leurs e-mails (c'est du
réglage, pas de la donnée), le catalogue des stages avec ses places et sa
logistique, les comptes du tableau de bord, et le journal d'audit — où
l'opération s'inscrit elle-même, avec le nom de qui l'a faite. Effacer les
traces en même temps que le reste serait le seul geste vraiment irrattrapable.

Réservé au propriétaire.

## Les stages, centralisés

Le bouton « Réserver ma place » de chaque page de stage ouvre maintenant le
formulaire du site, plus la billetterie externe. La demande entre dans le
fichier, le secrétariat confirme, et le règlement se fait à part. Plus besoin de
passer par Eventbrite pour réserver.

## Fin de migration Mailchimp

Les trois dernières automatisations Mailchimp sont traitées :

**Cold Lead Nurturing** — c'est la séquence accessible (« à votre rythme et à
votre budget »). Elle remplace désormais le contenu de la route ≤ 2 000 €
(séquence **Formations**), avec les vraies destinations : la boutique
`formation-untout.com`, les ebooks à moins de 20 € (`bit.ly/4auR80h`) et les
cercles à 70 €/mois (`bit.ly/4pT5ITp`). Sept e-mails, portés verbatim — dont le
« Ce que vous appelez blocage n'est pas ce que vous croyez ».

**Post-appointment follow-up** — devient la séquence **Suite d'un entretien**.
Elle part toute seule quand vous passez un contact à « Appel fait » : un
remerciement, puis une proposition de suite quelques jours après. (La version
Mailchimp n'avait jamais servi ; le texte est écrit dans la voix de Domoïna.)

**Appointment booking confirmation & reminder** — déjà couvert nativement, en
mieux : la demande de place envoie un accusé de réception, la logistique part
sept jours avant le stage, et le rendez-vous est rappelé la veille. Rien à
migrer.

Toutes les séquences se modifient depuis l'onglet **Séquences**.

## Le journal

Onglet **Journal**, réservé au propriétaire. Il enregistre les actions qui
comptent : connexions, changements de statut, export du fichier, sauvegardes
téléchargées, propositions préparées et envoyées, campagnes créées, comptes
gérés, et droits RGPD exercés. À côté de chaque entrée : qui, quoi, quand. Ce
n'est pas là pour surveiller le travail courant, mais pour pouvoir répondre à
« qui a fait ça » le jour où la question se pose.

## Le RGPD en libre-service

Une page publique **/mes-donnees** (lien en pied de site) permet à n'importe qui
d'exercer ses droits sans vous solliciter :

1. La personne saisit son adresse. Un lien personnel, valable une heure, part
   vers cette boîte — et seulement si un contact existe (on ne révèle jamais qui
   est dans le fichier).
2. Depuis ce lien, elle voit ce que vous savez d'elle, peut **télécharger toutes
   ses données** (droit d'accès) ou les **effacer définitivement** (droit à
   l'oubli).

L'effacement supprime la fiche, la chronologie, les réponses au questionnaire,
les inscriptions et les propositions ; les témoignages déjà publiés restent en
ligne mais détachés de l'identité. Chaque accès et chaque effacement laisse une
trace dans le journal. Cela couvre l'obligation légale de répondre aux demandes
d'accès et de suppression — automatiquement, et dans les délais.

## Le double opt-in

Les inscriptions marketing passent désormais par une **confirmation en un clic**.

**Les Lettres** : la personne s'inscrit, reçoit un e-mail avec un lien à cliquer,
et ce n'est qu'après ce clic que la séquence de bienvenue démarre. Tant qu'elle
n'a pas confirmé, aucun message ne part et elle n'entre pas dans les campagnes.

**Le guide** : le guide part tout de suite (il est demandé), mais l'e-mail
contient un lien pour confirmer et recevoir la suite. Sans clic, la personne
garde son guide et ne reçoit rien d'autre.

Pourquoi : une adresse mal tapée ou fausse ne confirme jamais, donc elle
n'encombre pas la liste et n'abîme pas la délivrabilité. Et le clic, horodaté
dans la chronologie du contact, vaut **preuve de consentement** en cas de
contrôle. Les autres formulaires — contact, questionnaire, demande de stage —
n'y passent pas : ce sont des demandes explicites, où le consentement est direct.

## Ajouter des personnes dans une séquence

Tout ce qui vient du site entre tout seul dans la bonne séquence. Reste ce qui
n'y passe pas : la personne rencontrée en stage, l'adresse notée au téléphone,
une liste reprise d'un ancien outil. Onglet **Séquences**, chaque catégorie a
maintenant son panneau **« Ajouter des personnes »**.

**On entre par une catégorie de personnes, jamais par une séquence nue.** La
catégorie décide de la fiche créée — son statut, sa source — et de la séquence
qui prend la personne en charge.

| Catégorie | La fiche créée | Ce qu'elle reçoit |
| --- | --- | --- |
| A téléchargé le guide | Lead, source « Guide gratuit » | la suite du guide, 4 e-mails |
| S'est inscrit aux Lettres | Lead, source « Lettres » | la bienvenue aux Lettres |
| A demandé un appel | Contacté | accusé de réception + relance |
| Qualifié → appel avec Domoïna | Contacté | les prérequis avant l'entretien |
| Revenu > 2 000 € → stages | Lead | l'orientation vers les stages |
| Revenu ≤ 2 000 € → formations | Lead | l'orientation vers les formations |
| L'appel a eu lieu | Appel fait | le suivi d'entretien |

**Une liste collée.** Une personne par ligne, sous la forme
`e-mail, prénom, nom`. La virgule, le point-virgule et la tabulation font
séparateur : un copier-coller de tableur passe tel quel, la forme
`Jean Dupont <jean@exemple.fr>` des carnets d'adresses aussi. Cinquante
personnes au plus par collage. Les fiches manquantes sont créées, les fiches
connues seulement complétées — leur source d'origine n'est jamais réécrite.

**Des contacts déjà dans le fichier.** Pour rattraper une catégorie entière ou
reprendre une liste importée : on cible par statut, par source et par
ancienneté, on **compte d'abord**, puis on ajoute. Comme pour les campagnes, le
bouton « Compter » est là pour ça — un envoi de masse ne se rattrape pas.

**Depuis l'onglet Contacts.** Le bouton **« Ajouter une personne »**, en haut à
droite, crée une fiche à la main : prénom, nom, e-mail, téléphone, et ce qu'il
faut retenir. La catégorie y est facultative — on peut vouloir seulement noter
quelqu'un dans le fichier sans rien lui envoyer. Dès qu'une catégorie est
choisie, c'est elle qui fixe le statut et la source, et sa séquence démarre.
Une adresse déjà connue n'est jamais dupliquée : sa fiche est complétée, et
vous arrivez dessus.

**Depuis une fiche.** L'encadré **Automatisations**, sous « Où en est-il dans le
parcours », montre où en est la personne dans chaque séquence — quel e-mail,
quand part le suivant — permet de l'ajouter à une catégorie, et de la retirer
d'une séquence en cours.

**La case d'accord n'est pas une formalité.** Elle atteste que ces personnes
ont accepté de recevoir ces e-mails ; l'ajout est inscrit au journal d'audit
avec votre nom, et une ligne « consentement » est écrite dans la chronologie de
chaque personne ajoutée. C'est cette trace qui vaut preuve de consentement pour
un ajout fait à la main, faute de double opt-in.

**Ce qui ne peut pas arriver :** un désabonné n'est jamais réinscrit ; une
personne inscrite aux Lettres mais qui n'a pas encore cliqué son lien de
confirmation est écartée elle aussi — une case cochée par vous ne remplace pas
son clic ; une personne déjà en cours de séquence n'est pas remise au début
(une séquence qu'elle a terminée, si — c'est bien le but quand on la rajoute) ;
une séquence en pause, absente ou vidée de ses e-mails refuse les ajouts au
lieu de les faire attendre dans le vide. Pour une liste collée, le compte rendu
dit combien de personnes ont été écartées et pourquoi ; pour un ajout en masse,
les écartés le sont par le ciblage lui-même, avant même d'être comptés.

Les vingt premiers e-mails d'une liste saisie à la main partent dans la foulée ;
le reste, comme les ajouts en masse, suit le rythme du worker : 200 par jour,
à 8 h.

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
Chaque séquence peut être mise en pause sans rien perdre. Pour y inscrire
quelqu'un à la main, voir « Ajouter des personnes dans une séquence ».

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
