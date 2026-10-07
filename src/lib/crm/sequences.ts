import { Resend } from "resend";
import { getDb } from "./db";
import { habiller, lienDesinscription, personnaliser } from "./email";
import { SITE } from "../site";

/**
 * Séquences d'e-mails automatiques.
 *
 * Une séquence est une suite d'étapes, chacune envoyée après un délai exprimé
 * en jours depuis l'inscription. Un worker (Vercel Cron → /api/cron/sequences)
 * traite chaque jour les échéances arrivées à terme.
 */

export const EXPEDITEUR =
  process.env.RESEND_FROM || "La Voie 2 la Conscience <onboarding@resend.dev>";

export type EtapeGraine = { ordre: number; delai_jours: number; sujet: string; corps: string };
export type SequenceGraine = {
  cle: string;
  nom: string;
  description: string;
  declencheur: string;
  etapes: EtapeGraine[];
};

const HUB_CERCLES = "https://bit.ly/4pT5ITp"; // groupes & événements
const BOUTIQUE = "https://formation-untout.com/"; // la boutique de formations
const EBOOKS = "https://bit.ly/4auR80h"; // ebooks & formations accessibles (< 20 €)

const SIGNATURE = `\n\nAvec toute ma présence,\nDomoïna Ramiadana — La Voie 2 la Conscience\n${SITE.url}`;

/**
 * Scénarios installés au premier démarrage. Ils sont modifiables depuis le
 * tableau de bord ; le semis ne réécrit jamais une séquence existante.
 */
export const SEQUENCES_PAR_DEFAUT: SequenceGraine[] = [
  {
    cle: "guide",
    nom: "Suite du guide gratuit",
    description:
      "Se déclenche quand quelqu'un télécharge « Sortir de la crise silencieuse ». Le guide lui-même part immédiatement ; cette séquence prend le relais.",
    declencheur: "guide",
    etapes: [
      {
        ordre: 1,
        delai_jours: 2,
        sujet: "Avez-vous ouvert le guide, {{prenom}} ?",
        corps:
          `Bonjour {{prenom}},\n\nVous avez reçu le guide il y a deux jours. Si vous ne l'avez pas encore ouvert, ce n'est pas un oubli : c'est souvent le signe que quelque chose résiste un peu.\n\nCommencez simplement par la première partie, celle des six signaux. La plupart des personnes que j'accompagne en reconnaissent au moins trois — et c'est en général le moment où elles cessent de se dire que « ça va passer ».\n\nSi une phrase vous arrête, répondez-moi directement à cet e-mail. Je lis tout.` +
          SIGNATURE,
      },
      {
        ordre: 2,
        delai_jours: 5,
        sujet: "Ce que la lucidité ne suffit pas à guérir",
        corps:
          `Bonjour {{prenom}},\n\nBeaucoup de personnes très lucides sur leur histoire — capables d'en parler avec finesse — continuent pourtant de reproduire les mêmes schémas.\n\nComprendre est nécessaire. Mais insuffisant. On ne guérit pas une blessure en l'analysant : on la guérit en la vivant autrement, dans le corps, dans l'émotion enfin traversée.\n\nC'est exactement ce que travaille la notion de blessure originelle, et c'est le cœur de mon accompagnement.\n\nÀ lire si le sujet vous parle : ${SITE.url}/blog/la-blessure-originelle` +
          SIGNATURE,
      },
      {
        ordre: 3,
        delai_jours: 9,
        sujet: "45 minutes, offertes, sans engagement",
        corps:
          `Bonjour {{prenom}},\n\nJe réserve chaque semaine quelques créneaux pour des appels découverte. 45 minutes, offerts, sans aucun engagement.\n\nCe n'est pas un appel de vente. C'est un temps pour poser votre situation à voix haute et regarder ensemble ce qui serait juste pour vous — même si la réponse est « pas maintenant », ou « pas avec moi ».\n\nRéserver votre créneau : ${SITE.url}/contact` +
          SIGNATURE,
      },
      {
        ordre: 4,
        delai_jours: 16,
        sujet: "Et si vous le viviez, plutôt que de le lire ?",
        corps:
          `Bonjour {{prenom}},\n\nLire éclaire. Traverser transforme.\n\nQuatre fois par an, au Centre HUT en Sarthe, j'accompagne un groupe restreint pendant quatre jours, au rythme des saisons. On y descend à ses racines, on y regarde son histoire en face, et on en ressort avec des fondations — pas avec des notes.\n\nLes prochaines dates : ${SITE.url}/evenements\nLe parcours complet : ${SITE.url}/cycle-des-saisons` +
          SIGNATURE,
      },
    ],
  },
  {
    cle: "lettres",
    nom: "Bienvenue aux Lettres",
    description:
      "Se déclenche à l'inscription aux Lettres depuis le site. Souhaite la bienvenue et oriente vers les ressources.",
    declencheur: "lettres",
    etapes: [
      {
        ordre: 1,
        delai_jours: 0,
        sujet: "Bienvenue parmi les Lettres, {{prenom}}",
        corps:
          `Bonjour {{prenom}},\n\nMerci de votre inscription. Vous recevrez désormais mes Lettres : des réflexions et des repères sur la transformation, le couple, le sens et l'équilibre. Pas de rythme imposé, pas de remplissage — j'écris quand j'ai quelque chose à dire.\n\nEn attendant la prochaine, le guide « Sortir de la crise silencieuse » est offert : ${SITE.url}/evenements#guide` +
          SIGNATURE,
      },
      {
        ordre: 2,
        delai_jours: 7,
        sujet: "Réussir, et se sentir vide",
        corps:
          `Bonjour {{prenom}},\n\nC'est la situation que je rencontre le plus souvent : de l'extérieur tout va bien — le parcours, le titre, la famille — et à l'intérieur, quelque chose s'est éteint sans prévenir.\n\nCe vide n'est pas un défaut de gratitude. C'est un signal.\n\nJ'ai écrit là-dessus : ${SITE.url}/blog/reussir-et-se-sentir-vide` +
          SIGNATURE,
      },
    ],
  },
  {
    cle: "appel",
    nom: "Suite d'une demande d'appel",
    description:
      "Se déclenche quand quelqu'un remplit le formulaire de contact. Accuse réception, puis relance si l'appel n'a pas eu lieu.",
    declencheur: "appel",
    etapes: [
      {
        ordre: 1,
        delai_jours: 0,
        sujet: "Votre demande est bien arrivée, {{prenom}}",
        corps:
          `Bonjour {{prenom}},\n\nVotre demande d'appel découverte m'est bien parvenue. Je reviens vers vous sous 48 heures ouvrées pour convenir d'un créneau.\n\nEn attendant, rien à préparer. Venez comme vous êtes — c'est même préférable.` +
          SIGNATURE,
      },
      {
        ordre: 2,
        delai_jours: 4,
        sujet: "Toujours partant pour cet échange ?",
        corps:
          `Bonjour {{prenom}},\n\nJe reviens vers vous au cas où mon précédent message serait passé inaperçu. Si vous souhaitez toujours cet appel, répondez simplement à cet e-mail avec deux ou trois créneaux qui vous arrangent.\n\nEt si le moment n'est plus le bon, dites-le-moi aussi : c'est une réponse parfaitement valable.` +
          SIGNATURE,
      },
    ],
  },
  {
    cle: "prerequis",
    nom: "Prérequis avant l'entretien",
    description:
      "Se déclenche quand un questionnaire de préparation est jugé éligible. Pose le cadre, demande la confirmation, puis relance. S'arrête d'elle-même dès que les prérequis sont confirmés.",
    declencheur: "prerequis",
    etapes: [
      {
        ordre: 1,
        delai_jours: 0,
        sujet: "Avant votre entretien, {{prenom}} : deux choses à faire",
        corps:
          `Bonjour {{prenom}},\n\nNous vous remercions d'avoir pris le temps de remplir le questionnaire de préparation.\n\nAprès étude de vos réponses, vous êtes éligible à la consultation d'entretien offerte proposée par Domoïna. Avant que cette rencontre puisse avoir lieu, deux prérequis sont à valider.\n\n1. Visionner la vidéo sur la gratuité :\nhttps://youtube.com/live/tMXW3wfZqqI\nCe visionnage vous permettra de vous présenter avec un positionnement de responsabilité vis-à-vis de vos questions et de vos attentes envers le Guide.\n\n2. Récupérer le livret sur le Cadre :\nhttps://formation-untout.com/comment-le-cadre-vous-rend-t-il-plus-libre\n\nUne fois ces deux éléments lus et écoutés, confirmez-le en un clic, au plus tard la veille de votre rendez-vous :\n{{lien_prerequis}}\n\nCette démarche vous évite de vous présenter dans la posture que Domoïna appelle « l'addiction à la consommation d'enseignements et d'accompagnements », sans rien donner de votre propre énergie. C'est vous qui donnez votre énergie, et non le Guide.\n\nDomoïna travaille en étroite collaboration avec un prêtre du Fa, qui réalisera votre consultation une fois ces prérequis confirmés. Cette consultation spirituelle avec l'oracle agit comme un diagnostic, en complément de ce que vous ferez avec Domoïna. Il vous appartiendra ensuite de poursuivre ou non.\n\nSans confirmation de votre part, nous serons dans l'obligation d'annuler votre demande, afin de libérer la place pour ceux qui sont prêts à avancer.\n\nRecevez ce message comme le commencement d'une véritable transformation, pour vous comme pour votre lignée.` +
          SIGNATURE,
      },
      {
        ordre: 2,
        delai_jours: 3,
        sujet: "Vos prérequis ne sont pas encore confirmés",
        corps:
          `Bonjour {{prenom}},\n\nSauf erreur, vous n'avez pas encore confirmé avoir visionné la vidéo sur la gratuité et récupéré le livret sur le Cadre.\n\nLa confirmation se fait en un clic :\n{{lien_prerequis}}\n\nRappel des deux éléments :\n· la vidéo : https://youtube.com/live/tMXW3wfZqqI\n· le livret : https://formation-untout.com/comment-le-cadre-vous-rend-t-il-plus-libre\n\nSans confirmation la veille du rendez-vous, celui-ci est annulé automatiquement. Ce n'est pas une sanction : c'est le cadre, et il vaut aussi pour nous.` +
          SIGNATURE,
      },
    ],
  },
  {
    cle: "orientation",
    nom: "Orientation après questionnaire",
    description:
      "Se déclenche quand un questionnaire de préparation n'atteint pas le seuil d'éligibilité. Oriente vers le livret sur le Cadre et les stages, sans promettre d'entretien.",
    declencheur: "orientation",
    etapes: [
      {
        ordre: 1,
        delai_jours: 0,
        sujet: "Votre questionnaire est bien arrivé, {{prenom}}",
        corps:
          `Bonjour {{prenom}},\n\nMerci d'avoir pris le temps de répondre à ce questionnaire. Vos réponses ont été lues.\n\nÀ ce stade du chemin, l'entretien avec Domoïna ne serait pas le plus juste pour vous — non par manque d'intérêt de notre part, mais parce qu'il suppose un cadre déjà posé, faute de quoi l'échange tourne à la consommation d'un conseil de plus.\n\nDeux portes vous sont ouvertes dès maintenant :\n\n· Le livret sur le Cadre, qui explique pourquoi une contrainte choisie rend plus libre :\nhttps://formation-untout.com/comment-le-cadre-vous-rend-t-il-plus-libre\n\n· Les stages au Centre HUT, quatre jours au rythme des saisons, où le travail se fait dans le corps et non dans la tête :\n${SITE.url}/evenements\n\nQuand ces deux étapes auront été traversées, reprenez le questionnaire : nous le relirons avec plaisir.` +
          SIGNATURE,
      },
    ],
  },
  {
    cle: "formations",
    nom: "Suite web-conférence — ressources accessibles",
    description:
      "Pour les revenus modestes (≤ 2 000 €). Reprend la séquence « Cold Lead Nurturing » de Mailchimp et oriente vers la boutique de formations, les ebooks accessibles et les cercles à 70 €/mois.",
    declencheur: "formations",
    etapes: [
      {
        ordre: 1,
        delai_jours: 0,
        sujet: "Un premier pas, à votre rythme",
        corps:
          `Bonjour {{prenom}},\n\nMerci d'avoir pris le temps de vous présenter. Votre chemin intérieur a de la valeur, quelle que soit votre situation aujourd'hui.\n\nJe propose des ressources accessibles pour commencer à explorer — des ebooks et des formations pensés pour vous offrir des clés concrètes, à votre rythme et à votre budget.\n\nDécouvrir la boutique : ${BOUTIQUE}` +
          SIGNATURE,
      },
      {
        ordre: 2,
        delai_jours: 3,
        sujet: "Je vous offre l'extrait de mon livre",
        corps:
          `Bonjour {{prenom}},\n\nAvant d'aller plus loin, je voulais vous offrir quelque chose : l'extrait de mon livre « Fragments de vie amoureuse », dans lequel je partage mon propre parcours de transformation, mes blessures et mes passages fondateurs.\n\nCe n'est pas un livre de recettes. C'est une traversée authentique.\n\nTélécharger l'extrait offert : ${BOUTIQUE}\n\nLisez-le à votre rythme. Et si quelque chose résonne, je suis là.` +
          SIGNATURE,
      },
      {
        ordre: 3,
        delai_jours: 6,
        sujet: "Pendant des années, j'ai cru à une histoire qui n'était pas la mienne…",
        corps:
          `Bonjour {{prenom}},\n\nPendant toute mon enfance, j'ai cru que j'avais failli mourir à l'âge de 6 ans. Je racontais que j'avais voulu rattraper un bracelet, que j'avais failli tomber du 14e étage. Cette histoire, je l'ai portée en moi comme une évidence. Elle expliquait ma force, mon besoin de contrôle, mon exigence intérieure.\n\nEt puis un jour, à l'âge adulte, tout s'est effondré. Lors du décès de ma mère, j'ai découvert la vérité.\n\nCe n'était pas moi. C'était mon petit frère. Il avait 3 ans, il a failli tomber du 6e étage. Et c'est moi, à 6 ans, qui lui ai sauvé la vie.\n\nMon esprit avait réécrit l'histoire pour survivre émotionnellement. C'est ce que j'appelle une blessure originelle. Nous construisons souvent toute notre zone d'excellence sur un traumatisme non reconnu. Ces schémas peuvent se comprendre, puis se libérer.\n\nMes ressources vous donnent les premiers outils pour commencer : ${EBOOKS}` +
          SIGNATURE,
      },
      {
        ordre: 4,
        delai_jours: 9,
        sujet: "Ce que vous appelez « blocage » n'est pas ce que vous croyez",
        corps:
          `Bonjour {{prenom}},\n\nCe que vous appelez « blocage », « chaos » ou « schéma qui se répète »... n'est pas un défaut. C'est une organisation autour d'une blessure. Une tentative de survie qui a fait son travail — et qui aujourd'hui appelle à être rencontrée autrement.\n\nL'enfant non reconnu devient performant. Celui qui a connu l'abandon devient sauveur. Celui qui a été humilié devient brillant.\n\nCes schémas peuvent se comprendre, puis se libérer.\n\nDécouvrir les ressources : ${EBOOKS}` +
          SIGNATURE,
      },
      {
        ordre: 5,
        delai_jours: 12,
        sujet: "Rêver en conscience : vos nuits ont quelque chose à vous dire",
        corps:
          `Bonjour {{prenom}},\n\nChaque nuit, quelque chose en vous continue de travailler. Vos rêves portent des messages — sur vos peurs, vos désirs, vos blocages, votre chemin.\n\nJ'ai créé des ressources pour commencer à les décoder, même sans accompagnement individuel.\n\nDécouvrir les ressources sur l'analyse des rêves : ${EBOOKS}` +
          SIGNATURE,
      },
      {
        ordre: 6,
        delai_jours: 15,
        sujet: "Des contenus offerts pour nourrir votre chemin",
        corps:
          `Bonjour {{prenom}},\n\nJe voulais vous partager quelques ressources gratuites pour continuer à avancer :\n\n• L'extrait de mon livre « Fragments de vie amoureuse » (si vous ne l'avez pas encore téléchargé)\n• Mes contenus sur les 4 piliers de transformation\n• Les témoignages de personnes qui ont traversé ce chemin : ${SITE.url}/temoignages\n\nEt pour les ebooks et formations accessibles : ${EBOOKS}` +
          SIGNATURE,
      },
      {
        ordre: 7,
        delai_jours: 18,
        sujet: "Un dernier message avant de faire une pause",
        corps:
          `{{prenom}},\n\nJe ne veux pas encombrer votre boîte mail. Mais avant de faire une pause dans nos échanges, je voulais vous laisser ces trois portes d'entrée :\n\n• Ebooks et formations accessibles (moins de 20 €) : ${EBOOKS}\n• Groupes thématiques et événements : ${HUB_CERCLES}\n• Mon site et son contenu gratuit : ${SITE.url}\n\nEt quand vous vous sentirez prêt(e) pour aller plus loin, je serai là.` +
          SIGNATURE,
      },
    ],
  },
  {
    cle: "stages",
    nom: "Suite web-conférence — vers les stages",
    description:
      "Pour les revenus > 2 000 € non éligibles à l'entretien. Reprend les e-mails de fond de la web-conférence puis oriente vers la réservation d'un stage en présentiel sur le site.",
    declencheur: "stages",
    etapes: [
      {
        ordre: 1,
        delai_jours: 0,
        sujet: "Votre chemin intérieur mérite d'être entendu",
        corps:
          `Bonjour {{prenom}},\n\nMerci pour ce que vous avez partagé. Je sens dans votre démarche une vraie recherche intérieure — quelque chose qui cherche à se comprendre, à se déposer, à trouver un fil.\n\nIl existe un chemin à votre mesure. Pas besoin de tout changer d'un coup : il commence là où vous êtes. Dans les prochains jours, je vous partagerai des repères concrets pour avancer.` +
          SIGNATURE,
      },
      {
        ordre: 2,
        delai_jours: 3,
        sujet: "L'histoire que j'ai portée pendant plus de 35 ans…",
        corps:
          `Bonjour {{prenom}},\n\nPendant toute mon enfance, j'ai cru que j'avais failli mourir à l'âge de 6 ans. Cette histoire expliquait ma force, mon besoin de maîtrise. Puis, au décès de ma mère, j'ai découvert la vérité : ce n'était pas moi, c'était mon petit frère de 3 ans — et c'est moi, à 6 ans, qui lui ai sauvé la vie.\n\nMon esprit avait réécrit l'histoire pour survivre. C'est ce que j'appelle une blessure originelle. Nous bâtissons souvent toute notre zone d'excellence sur un traumatisme non reconnu.\n\nCe travail-là, on ne le fait pas dans la tête : on le traverse dans le corps. C'est exactement ce que sont les stages.` +
          SIGNATURE,
      },
      {
        ordre: 3,
        delai_jours: 7,
        sujet: "Lire éclaire. Traverser transforme.",
        corps:
          `Bonjour {{prenom}},\n\nComprendre son histoire est nécessaire, mais insuffisant. On ne guérit pas une blessure en l'analysant : on la guérit en la vivant autrement, dans le corps, dans l'émotion enfin traversée.\n\nQuatre fois par an, au Centre HUT en Sarthe, j'accompagne un groupe restreint pendant quatre jours, au rythme des saisons. On y descend à ses racines, on regarde son histoire en face, et on en repart avec des fondations — pas avec des notes.\n\nLes prochaines dates et la réservation, directement sur le site : ${SITE.url}/evenements` +
          SIGNATURE,
      },
      {
        ordre: 4,
        delai_jours: 11,
        sujet: "Un chemin à votre mesure existe",
        corps:
          `Bonjour {{prenom}},\n\nDeux voies s'ouvrent à vous, selon ce que vous sentez juste :\n\n• Les stages en présentiel — quatre jours au Centre HUT, à partir de 550 €, aux solstices et équinoxes. Vous réservez votre place directement ici : ${SITE.url}/evenements\n\n• Un accompagnement individuel plus profond avec Domoïna, si vous en sentez l'appel : écrivez-nous à ${SITE.url}/contact\n\nPrenez le temps qu'il faut. Le bon moment, c'est le vôtre.` +
          SIGNATURE,
      },
    ],
  },
  {
    cle: "suivi_entretien",
    nom: "Suite d'un entretien",
    description:
      "Se déclenche quand le statut d'un contact passe à « Appel fait ». Remercie après l'échange et propose la suite, sans presser.",
    declencheur: "suivi_entretien",
    etapes: [
      {
        ordre: 1,
        delai_jours: 0,
        sujet: "Merci pour cet échange, {{prenom}}",
        corps:
          `Bonjour {{prenom}},\n\nMerci pour le temps que nous venons de partager. Ces échanges comptent : ils posent, souvent, la première pierre d'un vrai mouvement intérieur.\n\nLaissez maintenant décanter ce qui s'est dit. Les choses justes ne se décident pas dans l'instant — elles se déposent, puis elles s'imposent d'elles-mêmes.\n\nSi une question monte d'ici quelques jours, répondez simplement à cet e-mail. Je lis tout.` +
          SIGNATURE,
      },
      {
        ordre: 2,
        delai_jours: 4,
        sujet: "Ce qui se dépose après un premier pas",
        corps:
          `Bonjour {{prenom}},\n\nQuelques jours ont passé depuis notre échange. C'est souvent maintenant que les choses prennent leur place — pas pendant, après.\n\nSi vous sentez l'appel de poursuivre, la voie qui vous conviendra dépend de là où vous en êtes : un cercle pour avancer en groupe, un stage pour traverser dans le corps, ou un accompagnement individuel plus profond.\n\nDites-moi simplement ce qui résonne, et nous regarderons ensemble ce qui est juste pour vous.` +
          SIGNATURE,
      },
    ],
  },
  // ── Les quatre séquences de profil ─────────────────────────────────────
  //
  // Elles se ressemblent par la forme — cinq e-mails à J+0, 3, 7, 14 et 24 —
  // et par rien d'autre. Un dirigeant qu'on tutoie de loin avec du vocabulaire
  // d'éveil se désabonne ; un débutant à qui on parle de plateau ne comprend
  // pas de quoi il s'agit. Deux de ces séquences ne partagent aucune phrase.
  {
    cle: "dirigeant",
    nom: "Dirigeants — ce que la réussite n'a pas réglé",
    description: "Pour les dirigeants et independants a revenus eleves. Registre d'arbitrage, aucun lexique spirituel : on parle du cout cache de la performance, et on mene a l'entretien individuel.",
    declencheur: "dirigeant",
    etapes: [
      {
        ordre: 1,
        delai_jours: 0,
        sujet: "Ce qui ne figure dans aucun bilan",
        corps: "Bonjour {{prenom}},\n\nVous avez construit quelque chose. Les chiffres tiennent, l'activité tourne, votre entourage vous croit solide. Et pourtant, à certaines heures, vous ne ressentez rien de ce que cette réussite devrait produire.\n\nCe n'est pas une baisse de régime. Ce n'est pas non plus un manque de gratitude. C'est un écart — entre ce que vous avez bâti et celui qui l'a bâti.\n\nLes dirigeants que j'accompagne arrivent presque tous avec la même formulation : tout va bien, et je ne sais plus pourquoi je continue. Ils n'ont pas un problème de méthode. Ils ont un problème de place.\n\nJe ne vais pas vous vendre un état d'esprit. Les quatre e-mails qui suivent posent ce que j'observe depuis des années chez des personnes qui décident vite, bien, et pour tout le monde sauf elles-mêmes.\n\nVous pouvez les lire entre deux rendez-vous. Si rien ne vous parle, le lien de désinscription est en bas de page, et aucune explication ne vous sera demandée.\n\nSi quelque chose vous arrête, deux lignes en réponse me suffisent." + SIGNATURE,
      },
      {
        ordre: 2,
        delai_jours: 3,
        sujet: "{{prenom}}, le prix de la maîtrise",
        corps: "Bonjour {{prenom}},\n\nVotre capacité à tenir n'est pas tombée du ciel. Elle s'est construite, souvent très tôt, parce qu'il fallait bien que quelqu'un tienne.\n\nC'est l'endroit que presque personne ne regarde. On félicite la rigueur, l'endurance, le sang-froid. On ne demande jamais ce qu'ils ont coûté à l'enfant qui les a appris le premier.\n\nJe le formule ainsi : nous bâtissons fréquemment notre zone d'excellence sur une blessure que nous n'avons jamais nommée. Le contrôle a été une solution. Il a fonctionné. Il a produit des résultats réels, mesurables, parfois considérables. Puis il est devenu la seule manière d'exister, et c'est à ce moment que l'intérieur s'éteint.\n\nVous le repérez dans des détails. L'incapacité à ne rien faire un dimanche. L'agacement quand on vous aide. La fatigue qui ne part plus en vacances.\n\nRien de cela ne se répare par une meilleure organisation. Ce n'est pas un problème de temps, et c'est bien pour cette raison que les solutions d'agenda n'y changent rien.\n\nLe fond du sujet est ici : https://www.lavoie2laconscience.com/blog/la-blessure-originelle" + SIGNATURE,
      },
      {
        ordre: 3,
        delai_jours: 7,
        sujet: "Pourquoi je n'appelle pas cela du coaching",
        corps: "Bonjour {{prenom}},\n\nLa question revient à chaque premier échange : en quoi est-ce différent de ce que j'ai déjà essayé.\n\nTrois différences, et je les assume.\n\nUn coach travaille sur un objectif. Je travaille sur ce qui, en vous, choisit les objectifs. Ce n'est pas le même étage.\n\nUn programme de développement personnel vous demande de comprendre. Ici, la compréhension est l'entrée et non la sortie. Ce qui déplace réellement les choses se joue dans le corps, dans un lieu, sur plusieurs jours — pas dans une visioconférence de soixante minutes.\n\nEnfin, je ne promets aucune performance supplémentaire. Si vous cherchez à produire davantage, d'autres le feront mieux que moi. Ce travail vise l'inverse : retrouver la cohérence entre ce que vous faites et celui que vous êtes devenu en le faisant.\n\nBeaucoup de dirigeants ont déjà essayé le coaching, les séminaires, les retraites, les lectures. Souvent avec profit. Rarement avec bascule.\n\nSi cette distinction vous semble jouer sur les mots, c'est une objection valable et elle m'intéresse. Écrivez-la-moi telle quelle." + SIGNATURE,
      },
      {
        ordre: 4,
        delai_jours: 14,
        sujet: "La discrétion n'est pas une option ici",
        corps: "Bonjour {{prenom}},\n\nUne objection m'est rarement formulée à voix haute : je ne peux pas me permettre d'être vu dans ce genre de démarche.\n\nElle est légitime. Un dirigeant qui parle de ce qui s'est éteint chez lui prend un risque réel, vis-à-vis de ses équipes, de ses associés, parfois de sa famille.\n\nC'est pourquoi le cadre est posé avant le travail. Engagement de confidentialité signé. Groupe restreint lors des immersions. Discrétion sur le lieu. Charte de pratique, supervision externe, et droit de retrait à tout moment.\n\nPour le reste, le dispositif se décrit simplement : des séances individuelles à distance, des immersions de plusieurs jours au Centre HUT en Sarthe, et une ligne directe entre les rendez-vous. Trois niveaux existent selon la durée, de trois à douze mois. Les tarifs se communiquent après un audit d'alignement, sur devis, avec un règlement en trois, six ou douze fois.\n\nAutant vous le dire maintenant plutôt qu'à l'issue d'un entretien : ce n'est pas une dépense accessoire, et elle n'a de sens que si le moment est juste.\n\nLe détail des trois niveaux : https://www.lavoie2laconscience.com/offre-gold" + SIGNATURE,
      },
      {
        ordre: 5,
        delai_jours: 24,
        sujet: "Quarante-cinq minutes, et vous décidez",
        corps: "Bonjour {{prenom}},\n\nJe termine ici cette série, avec une proposition précise.\n\nUn entretien individuel de quarante-cinq minutes, offert. Un créneau de fin de journée ou de début de matinée, selon ce qui s'insère le mieux dans votre semaine.\n\nCe qui s'y passe : vous posez votre situation à voix haute, ce qui est souvent la première fois que cela arrive. Je vous dis ce que j'entends, sans ménagement inutile. Nous regardons ensemble si un accompagnement est juste pour vous, maintenant, ou si autre chose le serait davantage.\n\nTrois sorties possibles, et les trois sont acceptables : nous travaillons ensemble, nous reportons, je vous oriente ailleurs. Tout le monde ne repart pas avec une proposition d'accompagnement — le questionnaire de préparation existe précisément pour que cette question soit tranchée avant, et non pendant.\n\nSi votre réponse est « pas maintenant », elle n'a pas à être justifiée. Vous resterez sur cette liste et rien ne vous sera renvoyé à ce sujet.\n\nDemander un créneau : https://www.lavoie2laconscience.com/contact" + SIGNATURE,
      },
    ],
  },
  {
    cle: "cadre",
    nom: "En transition — le premier stage",
    description: "Pour les salaries et personnes en reconversion, budget mesure. Registre concret et logistique : le cadre, le groupe, le prix, et le fait qu'on n'a pas a tout quitter. Mene a un stage de saison.",
    declencheur: "cadre",
    etapes: [
      {
        ordre: 1,
        delai_jours: 0,
        sujet: "Vous n'avez pas à tout quitter",
        corps: "Bonjour {{prenom}},\n\nUne idée circule beaucoup et bloque énormément de monde : pour changer de vie, il faudrait d'abord tout casser. Démissionner, partir, recommencer ailleurs.\n\nJ'observe surtout l'inverse. Les personnes qui tiennent leurs changements sont celles qui ont commencé sans brûler leurs appuis.\n\nVous êtes peut-être en poste, en reconversion, ou entre les deux. Vous vous posez les mêmes questions depuis un moment : un an, trois ans, parfois davantage. Elles ne sont jamais urgentes, et c'est exactement le problème. Rien ne vous force, donc rien ne bouge.\n\nCe qui fait bouger, dans mon expérience, c'est une date posée dans l'agenda. Un lieu, un début, une fin. Pas un grand saut : un cadre.\n\nDans les trois semaines qui viennent, je vous écris quatre fois. Je vous décris concrètement ce qui se passe pendant quatre jours de stage, ce que cela coûte, ce qui est demandé et ce qui ne l'est pas.\n\nVous saurez à quoi vous attendre avant qu'une seule décision vous soit demandée. Rien ne vous sera proposé avant que vous ayez ces informations." + SIGNATURE,
      },
      {
        ordre: 2,
        delai_jours: 3,
        sujet: "Quatre jours, un lieu, un groupe",
        corps: "Bonjour {{prenom}},\n\nConcrètement, voilà à quoi ressemblent quatre jours.\n\nVous arrivez un jeudi en fin d'après-midi, au Centre HUT, en Sarthe. Le premier soir sert à poser le cadre et à formuler pourquoi vous êtes venu. Rien de plus.\n\nLes trois jours suivants alternent des temps d'enseignement, des cercles de parole, des pratiques corporelles, des repas partagés et des plages de silence, souvent le soir. Il y a aussi un rituel dans l'eau : un bassin, de l'eau chaude, peu profonde, et un encadrement pendant toute la durée. Savoir nager n'est pas nécessaire.\n\nLe groupe est volontairement petit. Il mêle des personnes qui arrivent et d'autres qui reviennent d'une saison précédente. Ce mélange fait une partie du travail : vous entendez des gens plus avancés parler de ce que vous êtes en train de traverser.\n\nLa clôture a lieu le dimanche à dix-huit heures. Vous repartez avec quelque chose de formulé, pas avec un classeur de notes.\n\nCe stage appartient à un parcours de quatre saisons, mais chacun se tient seul. Vous pouvez n'en faire qu'un et vous arrêter là.\n\nLe détail du parcours : https://www.lavoie2laconscience.com/cycle-des-saisons" + SIGNATURE,
      },
      {
        ordre: 3,
        delai_jours: 7,
        sujet: "Ce que le cadre protège chez vous",
        corps: "Bonjour {{prenom}},\n\nUne crainte revient très souvent chez les personnes qui n'ont jamais fait ce type de travail : devoir se livrer devant des inconnus.\n\nJe vais être claire. Rien n'est imposé. Les cercles de parole se vivent sur la base du volontariat, et le cadre posé le premier soir sert précisément à cela : protéger ce que vous ne souhaitez pas dire. On peut traverser un stage entier en parlant peu.\n\nCe mot, « cadre », a mauvaise presse. On l'associe à la contrainte, donc à une liberté qui diminue. C'est l'inverse qui se produit. Un groupe sans règles devient un endroit où l'on se surveille. Un groupe dont les règles sont dites devient un endroit où l'on peut enfin déposer quelque chose.\n\nCela vaut aussi en dehors des stages. Dans une vie professionnelle dense, l'absence de cadre ne produit pas de la souplesse, elle produit du débordement — et vous le vérifiez probablement toutes les semaines.\n\nJ'ai écrit un livret court là-dessus. Il explique pourquoi une contrainte choisie rend plus libre.\n\nLe livret : https://formation-untout.com/comment-le-cadre-vous-rend-t-il-plus-libre" + SIGNATURE,
      },
      {
        ordre: 4,
        delai_jours: 14,
        sujet: "Combien coûtent ces quatre jours, {{prenom}} ?",
        corps: "Bonjour {{prenom}},\n\nParlons d'argent, puisque la réflexion s'arrête souvent là.\n\nUn stage de saison démarre à 500 €. Deux options existent en supplément, à 150 € chacune : arriver la veille, repartir le lendemain. Elles ne sont pas obligatoires, et beaucoup de personnes viennent sans.\n\nS'y ajoutent le trajet jusqu'en Sarthe et les jours posés. Ce que le tarif couvre exactement figure sur la billetterie, et je préfère que vous le lisiez plutôt que de vous en donner un résumé approximatif.\n\nCinq cents euros, sur un salaire, ce n'est pas rien. C'est une dépense qui se prépare, pas une décision d'impulsion. C'est aussi pourquoi l'inscription reste remboursable jusqu'à vingt-huit jours avant la date : vous pouvez réserver une place et continuer de réfléchir.\n\nCe que j'évite, c'est de comparer ce montant à un week-end ou à un téléphone. Ce genre de calcul ne convainc personne et met surtout mal à l'aise.\n\nPosez-vous plutôt une question simple : depuis combien de temps repoussez-vous cela à l'année prochaine.\n\nSi un point reste flou sur les tarifs ou les conditions, répondez-moi. Je réponds précisément, chiffres compris." + SIGNATURE,
      },
      {
        ordre: 5,
        delai_jours: 24,
        sujet: "L'hiver, si vous voulez une date",
        corps: "Bonjour {{prenom}},\n\nJe vous propose quelque chose de daté, parce qu'une intention sans date ne survit pas à un mois chargé.\n\nLe prochain passage ouvert au Centre HUT est celui de l'hiver. Les dates précises s'affichent sur la page des événements au fur et à mesure qu'elles sont arrêtées — c'est la seule source à jour, mes e-mails vieillissent plus vite qu'elle.\n\nPourquoi l'hiver convient à quelqu'un qui commence : c'est la descente fondatrice du cycle. On y regarde ce qui a été transmis avant nous, les loyautés familiales, les silences. Il est possible de rejoindre le parcours à cette saison.\n\nEt après, une question que presque personne n'anticipe : comment ne pas laisser se refermer ce qui s'est ouvert. Quatre jours intenses suivis de six mois sans rien donnent un bon souvenir et peu de changement. C'est à cela que servent les cercles, un rendez-vous régulier en petit groupe autour d'un axe précis, pour environ soixante-dix euros par mois. On en reparlera le moment venu.\n\nSi cet hiver n'est pas possible, dites-le sans détour. Un agenda qui ne s'y prête pas, un budget qui n'y est pas, une envie qui n'est pas là : trois raisons suffisantes, et aucune ne ferme la porte.\n\nLes dates et la réservation : https://www.lavoie2laconscience.com/evenements" + SIGNATURE,
      },
    ],
  },
  {
    cle: "avance",
    nom: "Chemin engagé — comprendre ne suffit plus",
    description: "Pour celles et ceux qui travaillent sur eux depuis des annees. On ne reexplique aucune base : on nomme le plateau, la lucidite qui tourne a vide, et on mene au Cycle complet et au jeune.",
    declencheur: "avance",
    etapes: [
      {
        ordre: 1,
        delai_jours: 0,
        sujet: "Je ne vais pas vous réexpliquer les bases",
        corps: "Bonjour {{prenom}},\n\nVous travaillez depuis plus de trois ans. Vous avez une pratique, vous la tenez, et vous savez nommer ce qui se rejoue chez vous. Vous pourriez probablement l'expliquer mieux que plusieurs des accompagnants que vous avez rencontrés.\n\nJe ne vais donc pas vous parler de l'enfant intérieur, du mental qui s'agite ou de l'importance de la respiration. Vous avez passé cet endroit, et vous le savez.\n\nCe que je vois arriver, en revanche, chez des personnes exactement à votre étape : un plateau. La pratique continue, les prises de conscience deviennent plus fines, la vie ne se déplace plus. On devient très bon pour s'observer, et c'est précisément ce qui immobilise.\n\nCe n'est pas un échec. C'est le signe qu'un autre type de travail est requis. Plus engageant, plus incarné, nettement moins confortable.\n\nLes quatre messages suivants parlent de cela. Ils ne vous proposeront pas une méthode supplémentaire à ajouter à votre collection, vous en avez déjà assez.\n\nSi vous reconnaissez le plateau, répondez-moi en une phrase pour me dire depuis quand il dure. Je lis ces réponses avec attention." + SIGNATURE,
      },
      {
        ordre: 2,
        delai_jours: 3,
        sujet: "Quand la lucidité devient un abri",
        corps: "Bonjour {{prenom}},\n\nIl existe une manière très élégante de ne pas changer : comprendre.\n\nComprendre apaise. On met un mot sur ce qui fait mal, le mot tient, la douleur baisse d'un cran. On a l'impression d'avancer. Parfois on avance réellement. Et parfois on a seulement trouvé un abri confortable, construit avec du vocabulaire juste.\n\nLe signe est assez net. Vous savez d'où vient votre schéma, vous pouvez en retracer l'origine, les acteurs, la mécanique — et il produit toujours les mêmes effets dans vos relations, votre rapport à l'argent, votre corps.\n\nCe qui manque n'est pas une information de plus. C'est un passage. Un moment où le corps traverse ce que la tête a déjà cartographié, devant témoins, sans pouvoir sortir par le commentaire.\n\nC'est inconfortable, et c'est le but. Les dispositifs qui transforment durablement ont tous ce point commun : pendant un temps donné, ils rendent la fuite par l'analyse impossible.\n\nNe me croyez pas sur parole. Vérifiez. Prenez la prise de conscience dont vous êtes le plus fier, et regardez ce qu'elle a concrètement déplacé dans votre vie depuis douze mois.\n\nSi la réponse est « rien », vous savez où vous en êtes." + SIGNATURE,
      },
      {
        ordre: 3,
        delai_jours: 7,
        sujet: "Pourquoi quatre saisons et pas un week-end",
        corps: "Bonjour {{prenom}},\n\nVous avez probablement déjà fait des retraites. Trois jours intenses, un retour chez soi en état de grâce, et six semaines plus tard le niveau d'avant.\n\nLe Cycle des Saisons est construit contre cet effet-là. Quatre stages sur une année, un par saison, et chacun travaille un mouvement différent.\n\nL'automne accepte : on regarde son histoire et ses héritages sans chercher à les corriger dans l'instant. L'hiver descend : les loyautés familiales, les récits qu'on s'est racontés pour tenir, ce qui vient d'avant nous. Le printemps manifeste : il demande de sortir, de poser un acte identifié et daté, devant le cercle. L'été élève et célèbre, ce que les personnes très performantes savent le moins faire.\n\nOn ne retravaille donc pas la même matière à six mois d'intervalle. Chaque passage s'appuie sur le précédent et descend plus bas.\n\nIl y a aussi le rituel de l'eau, la Voie Initiatique de l'Eau. Dans l'eau chaude, le système nerveux se régule et le mental cesse de tenir la barre. Ce qui était figé se remet à bouger. C'est le genre de chose que je ne sais pas démontrer par écrit.\n\nLe parcours, saison par saison : https://www.lavoie2laconscience.com/cycle-des-saisons" + SIGNATURE,
      },
      {
        ordre: 4,
        delai_jours: 14,
        sujet: "{{prenom}}, ce que le jeûne retire",
        corps: "Bonjour {{prenom}},\n\nIl y a un rendez-vous dont je parle peu, parce qu'il ne convient pas à tout le monde : le jeûne initiatique.\n\nCe n'est ni une cure, ni une performance. Le principe est ancien et simple. En retirant la nourriture, on retire aussi ce que le mental n'arrivait plus à trier : les priorités devenues automatiques, les engagements qu'on honore sans y croire, les liens qui pèsent et qu'on n'ose pas nommer.\n\nLe protocole est encadré de bout en bout, descente alimentaire, jeûne, reprise. Un échange préalable vérifie que c'est adapté à votre situation, car certaines conditions de santé le contre-indiquent. Le groupe reste restreint, avec des temps de silence structurés et un travail écrit sur les intentions.\n\nPour quelqu'un qui pratique depuis des années, l'intérêt n'est pas dans la détoxification. C'est l'un des rares dispositifs où la volonté ne sert à rien. On ne jeûne pas bien par discipline. À un moment, le contrôle lâche, et ce qui parle ensuite n'est plus la voix habituelle. Vous avez peut-être déjà cherché cela ailleurs, en plus long et en moins net.\n\nLes dates de l'édition d'automne ne sont pas encore arrêtées, le lieu non plus. Si ce rendez-vous vous intéresse, répondez-moi : je vous écris dès que c'est fixé." + SIGNATURE,
      },
      {
        ordre: 5,
        delai_jours: 24,
        sujet: "S'engager sur une année, pas un stage",
        corps: "Bonjour {{prenom}},\n\nVoici ce que je vous propose, et c'est exigeant.\n\nNon pas un stage, mais le cycle. Une année, quatre passages, avec ce que cela implique : des dates bloquées très en avance, un budget assumé, et l'obligation de revenir même quand la saison précédente a remué quelque chose de désagréable.\n\nL'entrée se fait habituellement à l'automne. Celui de cette année est derrière nous. Le prochain passage ouvert est l'hiver, qui constitue la descente fondatrice du parcours : c'est une entrée cohérente pour quelqu'un qui a déjà beaucoup travaillé la surface de son récit familial sans en atteindre les racines.\n\nCe qui change dans un engagement d'un an : vous ne choisissez plus vos moments. C'est exactement ce qui en fait un cadre initiatique et non une consommation d'expériences. On y va aussi quand on n'en a pas envie, et c'est fréquemment là que quelque chose cède.\n\nSi vous préférez commencer par une seule saison pour voir, c'est possible et personne ne vous le reprochera. Et si la réponse est « pas cette année », elle est reçue sans discussion : un cycle commencé à contretemps ne produit pas grand-chose.\n\nLes dates et les modalités : https://www.lavoie2laconscience.com/evenements" + SIGNATURE,
      },
    ],
  },
  {
    cle: "debutant",
    nom: "Premier pas — par où commencer",
    description: "Pour qui n'a jamais rien entrepris. Phrases courtes, aucun jargon, droit explicite de ne pas savoir. Mene au livret sur le Cadre puis a un cercle.",
    declencheur: "debutant",
    etapes: [
      {
        ordre: 1,
        delai_jours: 0,
        sujet: "Si vous ne savez pas par où commencer",
        corps: "Bonjour {{prenom}},\n\nMerci d'être là. Une chose d'abord : vous n'avez rien à préparer et rien à comprendre pour l'instant.\n\nBeaucoup de personnes m'écrivent la même phrase, un peu gênées. Je ne sais pas par où commencer. Comme s'il s'agissait d'un aveu. C'est en réalité le point de départ le plus honnête qui existe. Celles qui savent exactement ce qu'elles cherchent ont souvent déjà décidé ce qu'elles ne voulaient pas voir.\n\nJe vais vous écrire quatre fois dans les trois semaines qui viennent. Des messages courts. Pas de vocabulaire compliqué, pas de promesse de transformation en sept jours.\n\nJe vous expliquerai trois choses, et pas une de plus : ce que veut dire travailler sur soi quand on n'a jamais essayé, ce que recouvrent les mots étranges qu'on croise dans ce milieu, et à quoi ressemble un premier pas qui ne coûte presque rien.\n\nVous pouvez tout lire, ou n'en lire aucun. Il n'y aura ni rappel insistant, ni compte à rebours.\n\nEt si une question vous vient, même une question que vous jugez bête, répondez à cet e-mail. Je lis tout." + SIGNATURE,
      },
      {
        ordre: 2,
        delai_jours: 3,
        sujet: "Pourquoi je parle toujours de cadre",
        corps: "Bonjour {{prenom}},\n\nUn mot reviendra souvent si vous restez par ici : le cadre.\n\nIl sonne sévère. On imagine des règles, de la discipline, quelqu'un qui surveille. C'est presque le contraire.\n\nPrenez un exemple quotidien. Sans heure de coucher, la soirée s'étire, vous arbitrez cent fois entre un épisode de plus et le sommeil, et vous vous couchez fatigué d'avoir décidé. Avec une heure posée à l'avance, la question ne se pose plus. Vous ne subissez pas la règle : vous cessez de la rediscuter.\n\nLe cadre produit cela à l'échelle d'une vie intérieure. Dix minutes par jour, toujours au même moment, sans téléphone, valent davantage qu'un week-end de résolutions. Non pas parce que dix minutes seraient magiques, mais parce qu'elles reviennent.\n\nC'est le premier conseil que je donne, et le seul qui ne demande aucun argent. Commencez par un rendez-vous minuscule que vous ne négociez plus avec vous-même.\n\nJ'ai écrit un livret court qui explique comment une contrainte choisie rend plus libre. C'est la meilleure entrée possible dans ce travail, et vous n'avez besoin de rien connaître pour le lire.\n\nLe livret : https://formation-untout.com/comment-le-cadre-vous-rend-t-il-plus-libre" + SIGNATURE,
      },
      {
        ordre: 3,
        delai_jours: 7,
        sujet: "Trois mots qui font peur pour rien",
        corps: "Bonjour {{prenom}},\n\nCe milieu a un vocabulaire qui décourage. Trois mots reviennent sans arrêt. Voilà ce qu'ils veulent dire, sans décoration.\n\nUn cercle, c'est un petit groupe qui se retrouve régulièrement et où chacun peut parler. Rien d'ésotérique : des personnes, un sujet, et quelqu'un qui tient le temps de parole. On y va surtout pour s'apercevoir qu'on n'est pas seul à vivre ce qu'on croyait anormal chez soi.\n\nUn rituel, c'est un geste décidé à l'avance pour marquer un passage. Un mariage est un rituel. Un enterrement aussi. Cela sert à ce que le corps enregistre qu'une chose a changé, puisque la tête, seule, oublie très vite.\n\nInitiatique signifie qu'il y a un avant et un après. Pas une formation que l'on suit, mais une étape que l'on franchit. Le mot est ancien, il n'est pas plus mystérieux que cela.\n\nSi un terme vous arrête ailleurs, sur le site ou pendant une conférence, demandez-moi ce qu'il veut dire. Je préfère une question posée tôt à un malentendu qui s'installe.\n\nRien ne vous est demandé aujourd'hui. C'était du vocabulaire, rien d'autre." + SIGNATURE,
      },
      {
        ordre: 4,
        delai_jours: 14,
        sujet: "À quoi ressemble un cercle, {{prenom}}",
        corps: "Bonjour {{prenom}},\n\nVous vous demandez peut-être ce qu'est un cercle en pratique. Je prends le plus concret, celui dont le détail est public : le Canal des Rêves.\n\nC'est un groupe privé sur Telegram. Vous y déposez un rêve quand vous en faites un. Vous recevez une analyse, pas une interprétation sortie d'un dictionnaire, et vous lisez celles des autres, ce qui apprend autant que les vôtres. Soixante euros par mois, et vous entrez quand vous voulez, sans calendrier à suivre.\n\nDeux remarques pour vous rassurer. Ne pas se souvenir de ses rêves n'est pas un obstacle : cette mémoire se réveille avec la pratique, et c'est l'une des premières choses que le groupe travaille. Et ce qui se dit là n'en sort pas, sinon personne ne déposerait quoi que ce soit de vrai.\n\nLes autres cercles fonctionnent sur le même principe, avec un axe différent : ce qui se répète de génération en génération, le rapport à l'argent, les relations où l'on se perd, le corps et l'intimité.\n\nTous marchent au mois, sans durée minimale, et aucun n'exige d'avoir fait quelque chose avant.\n\nLes axes ouverts : https://www.lavoie2laconscience.com/cercles" + SIGNATURE,
      },
      {
        ordre: 5,
        delai_jours: 24,
        sujet: "Un premier pas, et rien de plus",
        corps: "Bonjour {{prenom}},\n\nDernier message. Je vous propose une seule chose, la plus petite que je connaisse : rejoindre un cercle pendant un mois.\n\nUn mois, c'est assez pour savoir si ce rythme vous fait quelque chose, et trop court pour devenir un engagement qui pèse. Comptez autour de soixante-dix euros selon le cercle. On ne vous demandera ni expérience, ni vocabulaire, ni histoire à raconter le premier jour.\n\nChoisissez l'axe qui vous parle le plus spontanément, pas celui qui paraît le plus sérieux. Si vous hésitez entre deux, prenez celui qui vous met un peu mal à l'aise : c'est en général le bon.\n\nEt si la réponse est non, ou pas encore, c'est très bien ainsi. Des personnes lisent ces messages pendant un an avant de bouger, d'autres ne bougent jamais et vont parfaitement bien. Vous ne recevrez aucune relance sur ce sujet.\n\nCe que vous pouvez garder, même sans rien rejoindre : le rendez-vous quotidien dont je vous parlais, dix minutes qui reviennent toujours au même moment. C'est, honnêtement, ce qui change le plus de choses pour le moins d'argent.\n\nLes cercles ouverts : https://www.lavoie2laconscience.com/cercles" + SIGNATURE,
      },
    ],
  },
  {
    cle: "apres_stage",
    nom: "Après le stage",
    description:
      "Se déclenche cinq jours après un stage, pour les places confirmées et les personnes venues. Accompagne l'intégration, puis ouvre le pas suivant — un cercle, le stage d'après, ou un accompagnement.",
    declencheur: "apres_stage",
    etapes: [
      {
        ordre: 1,
        delai_jours: 0,
        sujet: "Ce qui reste, une fois rentré",
        corps:
          `Bonjour {{prenom}},\n\nVous êtes rentré depuis quelques jours. C'est le moment le plus délicat du chemin : celui où la vie reprend son rythme, où les vieux réflexes se remettent en place, et où ce qui s'est ouvert pendant le stage risque de se refermer sans bruit.\n\nCe n'est pas une faiblesse de votre part. C'est mécanique. Un corps qui vient de traverser quelque chose de fort cherche à revenir à ce qu'il connaît.\n\nUne seule chose à tenir cette semaine : un point d'ancrage quotidien, même minuscule. Dix minutes, à heure fixe, sans écran. Ce n'est pas la durée qui compte, c'est la régularité.\n\nEt si quelque chose remonte — une émotion, une image, une question —, écrivez-le-moi. Je lis tout.` +
          SIGNATURE,
      },
      {
        ordre: 2,
        delai_jours: 12,
        sujet: "Seul, on retombe ; ensemble, on tient",
        corps:
          `Bonjour {{prenom}},\n\nDeux semaines ont passé. Vous savez maintenant ce qui a tenu, et ce qui a glissé.\n\nCe que j'observe depuis des années : les personnes qui transforment durablement ne sont pas les plus motivées, ce sont celles qui ne restent pas seules. Un stage ouvre ; c'est le rythme qui inscrit.\n\nC'est exactement ce que sont les cercles : un rendez-vous régulier, en petit groupe, sur un axe précis — les rêves, les mémoires transgénérationnelles, l'argent, la sexualité. On y avance sans repartir de zéro à chaque fois.\n\nLes cercles ouverts en ce moment : ${HUB_CERCLES}\n\nEt si aucun ne vous parle, ce n'est pas grave : le stage a déjà fait son travail.` +
          SIGNATURE,
      },
      {
        ordre: 3,
        delai_jours: 25,
        sujet: "Le prochain passage",
        corps:
          `Bonjour {{prenom}},\n\nUn dernier mot, puis je vous laisse à votre chemin.\n\nLe Cycle des Saisons se parcourt sur quatre stages, un par saison. Chacun se tient seul, mais l'un après l'autre ils descendent plus profond — on ne retravaille pas la même chose à l'automne et au printemps.\n\nLes prochaines dates : ${SITE.url}/evenements\nLe parcours complet : ${SITE.url}/cycle-des-saisons\n\nEt s'il vous faut un travail plus resserré, en tête-à-tête, dites-le-moi : ${SITE.url}/contact\n\nQuoi que vous décidiez, ce que vous avez traversé vous appartient. Personne ne peut vous le reprendre.` +
          SIGNATURE,
      },
    ],
  },
];

/** Installe les scénarios manquants. Idempotent, n'écrase jamais l'existant. */
/**
 * Séquences dont le contenu a été révisé après un premier semis, à rafraîchir
 * une fois — mais seulement si elles n'ont pas été retouchées à la main.
 * La détection se fait sur le sujet de la première étape : tant qu'il vaut
 * encore l'ancien texte semé, la séquence est réputée intacte et peut être
 * remplacée. Dès que quelqu'un l'a modifiée depuis le tableau de bord, on n'y
 * touche plus.
 */
const GRAINES_A_RAFRAICHIR: Record<string, string> = {
  formations: "Votre chemin intérieur mérite d'être entendu",
};

/**
 * Le semis n'a lieu qu'une fois par instance : il est idempotent, et les
 * graines ne changent qu'au déploiement suivant. Sans cette mémoire, un ajout
 * de cent personnes rejouait neuf requêtes de semis par personne. Même motif
 * que `schemaReady` dans `db.ts`.
 */
let semisFait: Promise<void> | null = null;

type Sql = NonNullable<Awaited<ReturnType<typeof getDb>>>;

export async function semerSequences(): Promise<void> {
  const sql = await getDb();
  if (!sql) return;
  if (!semisFait) {
    semisFait = semer(sql).catch((e) => {
      // Un semis raté ne reste pas mémorisé : la base était peut-être
      // simplement indisponible, et l'appel suivant doit réessayer.
      semisFait = null;
      console.error("[crm] semerSequences:", e);
    });
  }
  return semisFait;
}

async function semer(sql: Sql): Promise<void> {
  for (const g of SEQUENCES_PAR_DEFAUT) {
    const rows = await sql<{ id: string }[]>`
      INSERT INTO sequences (cle, nom, description, declencheur)
      VALUES (${g.cle}, ${g.nom}, ${g.description}, ${g.declencheur})
      ON CONFLICT (cle) DO NOTHING
      RETURNING id
    `;
    const creee = rows[0];

    if (creee) {
      for (const e of g.etapes) {
        await sql`
          INSERT INTO sequence_etapes (sequence_id, ordre, delai_jours, sujet, corps)
          VALUES (${creee.id}, ${e.ordre}, ${e.delai_jours}, ${e.sujet}, ${e.corps})
          ON CONFLICT (sequence_id, ordre) DO NOTHING
        `;
      }
      continue;
    }

    // La séquence existait déjà : on ne la rafraîchit que si elle est prévue
    // pour et qu'elle est restée intacte depuis son semis.
    const ancienSujet = GRAINES_A_RAFRAICHIR[g.cle];
    if (!ancienSujet) continue;

    const [etat] = await sql<{ id: string; sujet: string | null }[]>`
      SELECT s.id, e.sujet
      FROM sequences s
      LEFT JOIN sequence_etapes e ON e.sequence_id = s.id AND e.ordre = 1
      WHERE s.cle = ${g.cle}
    `;
    if (!etat || etat.sujet !== ancienSujet) continue;

    await sql`DELETE FROM sequence_etapes WHERE sequence_id = ${etat.id}`;
    for (const e of g.etapes) {
      await sql`
        INSERT INTO sequence_etapes (sequence_id, ordre, delai_jours, sujet, corps)
        VALUES (${etat.id}, ${e.ordre}, ${e.delai_jours}, ${e.sujet}, ${e.corps})
      `;
    }
    await sql`
      UPDATE sequences SET nom = ${g.nom}, description = ${g.description}
      WHERE id = ${etat.id}
    `;
  }
}

/**
 * Ce qui est arrivé à une demande d'inscription. Le tableau de bord s'en sert
 * pour dire à qui ajoute du monde ce qui a été fait, et ce qui ne l'a pas
 * été — inscrire quelqu'un à une liste d'envoi ne doit jamais être une
 * opération muette.
 */
export type Inscription =
  /** Entrée neuve dans la séquence. */
  | "inscrite"
  /** Séquence terminée ou arrêtée, remise au début. */
  | "reprise"
  /** Déjà en cours : rien touché. */
  | "deja"
  /** La personne s'est désabonnée : elle ne reçoit plus rien. */
  | "desabonne"
  /** Inscription en attente de confirmation (double opt-in) : on n'y touche pas. */
  | "sans_consentement"
  /** La séquence est en pause : personne n'y entre. */
  | "en_pause"
  /** Séquence inconnue, séquence vide, ou base indisponible. */
  | "impossible";

/**
 * Inscrit un contact à une séquence, et dit ce qui s'est passé.
 *
 * Par défaut une inscription existante n'est jamais touchée, quel que soit son
 * état : c'est ce qu'attendent les déclencheurs automatiques, où un second
 * téléchargement du guide ne doit pas rejouer toute la séquence. L'option
 * `reprendre` renverse cette règle pour les ajouts faits à la main — quand on
 * remet quelqu'un dans une séquence qu'il a déjà terminée, c'est bien qu'on
 * veut la voir repartir du début.
 */
export async function inscrireContact(
  contactId: string,
  cle: string,
  options: { reprendre?: boolean; exigerConsentement?: boolean } = {},
): Promise<Inscription> {
  const sql = await getDb();
  if (!sql) return "impossible";
  try {
    await semerSequences();
    const [seq] = await sql<{ id: string; active: boolean }[]>`
      SELECT id, active FROM sequences WHERE cle = ${cle}
    `;
    if (!seq) return "impossible";
    if (!seq.active) return "en_pause";

    const [contact] = await sql<{ desabonne_le: Date | null; consentement: boolean }[]>`
      SELECT desabonne_le, consentement FROM contacts WHERE id = ${contactId}
    `;
    if (!contact) return "impossible";
    if (contact.desabonne_le) return "desabonne";

    // `consentement = FALSE` sans désabonnement, c'est une inscription qui
    // attend encore son clic de confirmation (`optin.ts`). Un ajout fait à la
    // main ne passe pas devant ce clic : une case cochée par le secrétariat ne
    // vaut pas la preuve que le double opt-in fabrique.
    //
    // Les déclencheurs automatiques, eux, ne demandent rien : la personne qui
    // remplit le formulaire de contact doit recevoir son accusé de réception,
    // même si son inscription aux Lettres, elle, attend toujours.
    if (options.exigerConsentement && !contact.consentement) return "sans_consentement";

    const [premiere] = await sql<{ delai_jours: number }[]>`
      SELECT delai_jours FROM sequence_etapes
      WHERE sequence_id = ${seq.id} ORDER BY ordre ASC LIMIT 1
    `;
    if (!premiere) return "impossible";

    // `xmax = 0` distingue la ligne créée de la ligne relancée. La clause WHERE
    // du DO UPDATE protège les inscriptions en cours : elles ne renvoient alors
    // rien du tout, et l'on sait que la personne y était déjà.
    const lignes = options.reprendre
      ? await sql<{ nouvelle: boolean }[]>`
          INSERT INTO inscriptions (contact_id, sequence_id, etape_suivante, echeance)
          VALUES (${contactId}, ${seq.id}, 1, NOW() + make_interval(days => ${premiere.delai_jours}))
          ON CONFLICT (contact_id, sequence_id) DO UPDATE
            SET statut = 'active', etape_suivante = 1, cree_le = NOW(),
                echeance = NOW() + make_interval(days => ${premiere.delai_jours})
            WHERE inscriptions.statut <> 'active'
          RETURNING (xmax = 0) AS nouvelle
        `
      : await sql<{ nouvelle: boolean }[]>`
          INSERT INTO inscriptions (contact_id, sequence_id, etape_suivante, echeance)
          VALUES (${contactId}, ${seq.id}, 1, NOW() + make_interval(days => ${premiere.delai_jours}))
          ON CONFLICT (contact_id, sequence_id) DO NOTHING
          RETURNING TRUE AS nouvelle
        `;

    if (!lignes.length) return "deja";
    return lignes[0].nouvelle ? "inscrite" : "reprise";
  } catch (e) {
    console.error("[crm] inscrireContact:", e);
    return "impossible";
  }
}

/**
 * Inscrit un contact à une séquence. Sans effet s'il y est déjà, s'il s'est
 * désabonné, ou si la séquence est en pause. C'est la porte des déclencheurs
 * automatiques, qui n'ont rien à faire du détail.
 */
export async function inscrireASequence(contactId: string, cle: string): Promise<void> {
  await inscrireContact(contactId, cle);
}

/**
 * Sort un contact d'une séquence en cours, et renvoie le nom de la séquence
 * quittée — de quoi écrire une chronologie qui dise laquelle. Ce qui est déjà
 * parti reste parti.
 */
export async function retirerDeSequence(
  contactId: string,
  sequenceId: string,
): Promise<string | null> {
  const sql = await getDb();
  if (!sql) return null;
  try {
    const lignes = await sql<{ nom: string }[]>`
      UPDATE inscriptions i SET statut = 'arretee'
      FROM sequences s
      WHERE s.id = i.sequence_id
        AND i.contact_id = ${contactId}
        AND i.sequence_id = ${sequenceId}
        AND i.statut = 'active'
      RETURNING s.nom
    `;
    return lignes[0]?.nom ?? null;
  } catch (e) {
    console.error("[crm] retirerDeSequence:", e);
    return null;
  }
}

export type InscriptionVue = {
  sequence_id: string;
  cle: string;
  nom: string;
  /** La séquence elle-même tourne-t-elle ? */
  sequence_active: boolean;
  statut: string;
  etape: number;
  etapes: number;
  echeance: Date;
  cree_le: Date;
};

/** Les séquences où se trouve un contact, en cours d'abord, passées ensuite. */
export async function inscriptionsDuContact(contactId: string): Promise<InscriptionVue[]> {
  const sql = await getDb();
  if (!sql) return [];
  try {
    return await sql<InscriptionVue[]>`
      SELECT i.sequence_id, s.cle, s.nom, s.active AS sequence_active,
             i.statut, i.etape_suivante AS etape, i.echeance, i.cree_le,
             (SELECT COUNT(*) FROM sequence_etapes e WHERE e.sequence_id = s.id)::int AS etapes
      FROM inscriptions i
      JOIN sequences s ON s.id = i.sequence_id
      WHERE i.contact_id = ${contactId}
      ORDER BY (i.statut = 'active') DESC, i.cree_le DESC
    `;
  } catch (e) {
    console.error("[crm] inscriptionsDuContact:", e);
    return [];
  }
}

const rendre = personnaliser;

type AEnvoyer = {
  inscription_id: string;
  contact_id: string;
  sequence_id: string;
  email: string;
  prenom: string | null;
  etape: number;
  sujet: string;
  corps: string;
  /** Jeton du dernier questionnaire, pour le lien de confirmation des prérequis. */
  jeton: string | null;
};

/**
 * Traite toutes les échéances arrivées à terme : envoie l'e-mail, journalise,
 * puis programme l'étape suivante ou clôt l'inscription.
 * Renvoie le compte des envois réussis et échoués.
 */
export async function traiterEcheances(
  limite = 100,
): Promise<{ envoyes: number; echecs: number; ignores: number }> {
  const sql = await getDb();
  if (!sql) return { envoyes: 0, echecs: 0, ignores: 0 };
  if (!process.env.RESEND_API_KEY) return { envoyes: 0, echecs: 0, ignores: 0 };

  const resend = new Resend(process.env.RESEND_API_KEY);
  let envoyes = 0;
  let echecs = 0;
  let ignores = 0;

  let dues: AEnvoyer[] = [];
  try {
    dues = await sql<AEnvoyer[]>`
      SELECT i.id AS inscription_id, i.contact_id, i.sequence_id, i.etape_suivante AS etape,
             c.email, c.prenom, e.sujet, e.corps, q.jeton
      FROM inscriptions i
      JOIN contacts c        ON c.id = i.contact_id
      JOIN sequences s       ON s.id = i.sequence_id
      JOIN sequence_etapes e ON e.sequence_id = i.sequence_id AND e.ordre = i.etape_suivante
      LEFT JOIN LATERAL (
        SELECT jeton FROM questionnaires
        WHERE contact_id = c.id
        ORDER BY cree_le DESC
        LIMIT 1
      ) q ON TRUE
      WHERE i.statut = 'active'
        AND i.echeance <= NOW()
        AND s.active = TRUE
        AND c.desabonne_le IS NULL
      ORDER BY i.echeance ASC
      LIMIT ${limite}
    `;
  } catch (e) {
    console.error("[crm] traiterEcheances (lecture):", e);
    return { envoyes: 0, echecs: 0, ignores: 0 };
  }

  for (const d of dues) {
    const sujet = rendre(d.sujet, d);
    const { html, text } = habiller({ texte: rendre(d.corps, d), email: d.email });

    let erreur: string | null = null;
    let messageId: string | null = null;
    try {
      const { data, error } = await resend.emails.send({
        from: EXPEDITEUR,
        to: d.email,
        subject: sujet,
        html,
        text,
        headers: { "List-Unsubscribe": `<${lienDesinscription(d.email)}>` },
      });
      if (error) erreur = error.message ?? "Erreur Resend";
      // L'identifiant Resend relie l'ouverture et le clic à cet envoi précis
      // (voir /api/webhooks/resend).
      messageId = data?.id ?? null;
    } catch (e) {
      erreur = e instanceof Error ? e.message : "Erreur inconnue";
    }

    try {
      await sql`
        INSERT INTO envois (contact_id, sequence_id, etape, destinataire, sujet, statut, erreur, message_id)
        VALUES (${d.contact_id}, ${d.sequence_id}, ${d.etape}, ${d.email}, ${sujet},
                ${erreur ? "echec" : "envoye"}, ${erreur}, ${messageId})
      `;

      if (erreur) {
        echecs += 1;
        // Nouvelle tentative dans 6 heures, sans avancer l'étape.
        await sql`
          UPDATE inscriptions SET echeance = NOW() + INTERVAL '6 hours'
          WHERE id = ${d.inscription_id}
        `;
        continue;
      }

      envoyes += 1;
      await sql`
        INSERT INTO evenements (contact_id, type, libelle)
        VALUES (${d.contact_id}, 'email', ${"E-mail envoyé — " + sujet})
      `;

      const [suivante] = await sql<{ ordre: number; delai_jours: number }[]>`
        SELECT ordre, delai_jours FROM sequence_etapes
        WHERE sequence_id = ${d.sequence_id} AND ordre > ${d.etape}
        ORDER BY ordre ASC LIMIT 1
      `;

      if (suivante) {
        // Le délai de chaque étape est compté depuis l'inscription.
        await sql`
          UPDATE inscriptions
          SET etape_suivante = ${suivante.ordre},
              echeance = cree_le + make_interval(days => ${suivante.delai_jours})
          WHERE id = ${d.inscription_id}
        `;
      } else {
        await sql`
          UPDATE inscriptions SET statut = 'terminee' WHERE id = ${d.inscription_id}
        `;
      }
    } catch (e) {
      ignores += 1;
      console.error("[crm] traiterEcheances (ecriture):", e);
    }
  }

  return { envoyes, echecs, ignores };
}

export type EtapeVue = {
  id: string;
  ordre: number;
  delai_jours: number;
  sujet: string;
  corps: string;
  envoyes: number;
  ouverts: number;
};

export type SequenceVue = {
  id: string;
  cle: string;
  nom: string;
  description: string | null;
  declencheur: string;
  active: boolean;
  etapes: EtapeVue[];
  inscrits: number;
  termines: number;
};

export async function listerSequences(): Promise<SequenceVue[]> {
  const sql = await getDb();
  if (!sql) return [];
  try {
    await semerSequences();
    const seqs = await sql<Omit<SequenceVue, "etapes" | "inscrits">[]>`
      SELECT id, cle, nom, description, declencheur, active FROM sequences ORDER BY cle
    `;
    const out: SequenceVue[] = [];
    for (const s of seqs) {
      // Les étapes, avec pour chacune le nombre d'e-mails partis et ouverts —
      // c'est ce qui donne au pipeline sa lecture « où en sont les gens ».
      const etapes = await sql<EtapeVue[]>`
        SELECT e.id, e.ordre, e.delai_jours, e.sujet, e.corps,
               COUNT(v.id) FILTER (WHERE v.statut <> 'echec')::int AS envoyes,
               COUNT(v.id) FILTER (WHERE v.ouvert_le IS NOT NULL)::int AS ouverts
        FROM sequence_etapes e
        LEFT JOIN envois v ON v.sequence_id = ${s.id} AND v.etape = e.ordre
        WHERE e.sequence_id = ${s.id}
        GROUP BY e.id
        ORDER BY e.ordre
      `;
      const [c] = await sql<{ actifs: number; termines: number }[]>`
        SELECT COUNT(*) FILTER (WHERE statut = 'active')::int   AS actifs,
               COUNT(*) FILTER (WHERE statut = 'terminee')::int AS termines
        FROM inscriptions WHERE sequence_id = ${s.id}
      `;
      out.push({
        ...s,
        etapes,
        inscrits: Number(c?.actifs ?? 0),
        termines: Number(c?.termines ?? 0),
      });
    }
    return out;
  } catch (e) {
    console.error("[crm] listerSequences:", e);
    return [];
  }
}

export async function basculerSequence(id: string, active: boolean): Promise<boolean> {
  const sql = await getDb();
  if (!sql) return false;
  try {
    await sql`UPDATE sequences SET active = ${active} WHERE id = ${id}`;
    return true;
  } catch (e) {
    console.error("[crm] basculerSequence:", e);
    return false;
  }
}

export async function majEtape(
  id: string,
  champs: { sujet: string; corps: string; delai_jours: number },
): Promise<boolean> {
  const sql = await getDb();
  if (!sql) return false;
  try {
    await sql`
      UPDATE sequence_etapes
      SET sujet = ${champs.sujet}, corps = ${champs.corps},
          delai_jours = ${Math.max(0, Math.min(365, champs.delai_jours))}
      WHERE id = ${id}
    `;
    return true;
  } catch (e) {
    console.error("[crm] majEtape:", e);
    return false;
  }
}

export type LigneEnvoi = {
  id: string;
  contact_id: string | null;
  destinataire: string;
  sujet: string;
  statut: string;
  erreur: string | null;
  envoye_le: Date;
  ouvert_le: Date | null;
  clique_le: Date | null;
};

export async function listerEnvois(limite = 200): Promise<LigneEnvoi[]> {
  const sql = await getDb();
  if (!sql) return [];
  try {
    return await sql<LigneEnvoi[]>`
      SELECT id, contact_id, destinataire, sujet, statut, erreur, envoye_le,
             ouvert_le, clique_le
      FROM envois ORDER BY envoye_le DESC LIMIT ${limite}
    `;
  } catch (e) {
    console.error("[crm] listerEnvois:", e);
    return [];
  }
}
