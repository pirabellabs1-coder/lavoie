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

export async function semerSequences(): Promise<void> {
  const sql = await getDb();
  if (!sql) return;
  try {
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
  } catch (e) {
    console.error("[crm] semerSequences:", e);
  }
}

/**
 * Inscrit un contact à une séquence. Sans effet si le contact y est déjà,
 * s'il s'est désabonné, ou si la séquence est désactivée.
 */
export async function inscrireASequence(contactId: string, cle: string): Promise<void> {
  const sql = await getDb();
  if (!sql) return;
  try {
    await semerSequences();
    const [seq] = await sql<{ id: string }[]>`
      SELECT id FROM sequences WHERE cle = ${cle} AND active = TRUE
    `;
    if (!seq) return;

    const [contact] = await sql<{ desabonne_le: Date | null }[]>`
      SELECT desabonne_le FROM contacts WHERE id = ${contactId}
    `;
    if (!contact || contact.desabonne_le) return;

    const [premiere] = await sql<{ delai_jours: number }[]>`
      SELECT delai_jours FROM sequence_etapes
      WHERE sequence_id = ${seq.id} ORDER BY ordre ASC LIMIT 1
    `;
    if (!premiere) return;

    await sql`
      INSERT INTO inscriptions (contact_id, sequence_id, etape_suivante, echeance)
      VALUES (${contactId}, ${seq.id}, 1, NOW() + make_interval(days => ${premiere.delai_jours}))
      ON CONFLICT (contact_id, sequence_id) DO NOTHING
    `;
  } catch (e) {
    console.error("[crm] inscrireASequence:", e);
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
