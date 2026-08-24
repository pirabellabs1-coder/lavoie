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

const HUB_CERCLES = "https://bit.ly/4pT5ITp";

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
    nom: "Suite web-conférence — cercles accessibles",
    description:
      "Pour les revenus modestes (≤ 2 000 €). Reprend la séquence de la web-conférence des 9 Clés et oriente vers les cercles à 70 €/mois, plus adaptés que l'accompagnement individuel.",
    declencheur: "formations",
    etapes: [
      {
        ordre: 1,
        delai_jours: 0,
        sujet: "Votre chemin intérieur mérite d'être entendu",
        corps:
          `Bonjour {{prenom}},\n\nMerci pour ce que vous avez partagé.\n\nJe sens dans votre démarche une vraie recherche intérieure. Quelque chose qui cherche à se comprendre, à se déposer, à trouver un fil.\n\nJe voulais vous écrire pour vous dire : il existe un chemin à votre mesure. Pas besoin de tout changer d'un coup. Le chemin commence là où vous êtes.\n\nDans les prochains jours, je vais vous partager des ressources, des témoignages et des portes d'entrée concrètes pour commencer votre transformation.` +
          SIGNATURE,
      },
      {
        ordre: 2,
        delai_jours: 3,
        sujet: "L'histoire que j'ai portée pendant plus de 35 ans…",
        corps:
          `Bonjour {{prenom}},\n\nPendant toute mon enfance, j'ai cru que j'avais failli mourir à l'âge de 6 ans. Je racontais que j'avais voulu rattraper un bracelet, que j'avais failli tomber du 14e étage. Cette histoire, je l'ai portée en moi comme une évidence. Elle expliquait ma force, mon besoin de maîtrise, mon exigence intérieure.\n\nEt puis un jour, à l'âge adulte, tout s'est effondré. Lors du décès de ma mère, j'ai découvert la vérité.\n\nCe n'était pas moi. C'était mon petit frère. Il avait 3 ans, il a failli tomber du 6e étage. Et c'est moi, à 6 ans, qui lui ai sauvé la vie.\n\nMon esprit avait réécrit l'histoire pour survivre émotionnellement. C'est ce que j'appelle une blessure originelle. Nous construisons souvent toute notre zone d'excellence sur un traumatisme non reconnu.\n\nSi cela résonne en vous, nous traversons exactement ce travail dans mes cercles : ${HUB_CERCLES}` +
          SIGNATURE,
      },
      {
        ordre: 3,
        delai_jours: 6,
        sujet: "Rêver en conscience : vos nuits comme boussole",
        corps:
          `Bonjour {{prenom}},\n\nChaque nuit, quelque chose en vous continue de travailler. Vos rêves ne sont pas de simples images nocturnes : ils sont un langage, une boussole intérieure qui parle de vos peurs, vos désirs, vos blocages et votre chemin de vie.\n\nAvec ma méthode du Rêve Conscient, vous apprenez à les lire, à les traverser, à en extraire ce qu'ils portent pour vous. Le cercle inclut un espace d'échanges en groupe, des rendez-vous d'analyse en visio, et un apprentissage progressif et personnalisé.\n\nTarif : 70 €/mois — une porte d'entrée accessible pour commencer.\n\nRejoindre le cercle : ${HUB_CERCLES}` +
          SIGNATURE,
      },
      {
        ordre: 4,
        delai_jours: 9,
        sujet: "Ce que vous portez sans le savoir",
        corps:
          `Bonjour {{prenom}},\n\nCertains schémas ne viennent pas de vous. Ils ont été transmis — par votre famille, votre lignée, vos ancêtres — sans que personne n'ait eu conscience de ce qu'il portait. La peur du manque, la difficulté à recevoir, la fidélité inconsciente à la douleur du clan.\n\nDans le cercle « Se libérer des mémoires transgénérationnelles qui limitent son évolution », nous traversons ensemble ces héritages invisibles pour les libérer consciemment.\n\nDécouvrir le cercle et les prochaines dates : ${HUB_CERCLES}` +
          SIGNATURE,
      },
      {
        ordre: 5,
        delai_jours: 12,
        sujet: "Pourquoi vous sabotez votre prospérité",
        corps:
          `Bonjour {{prenom}},\n\nEt si votre relation à l'argent était votre plus vieille blessure ? Pas un manque de compétences, pas un manque de travail. Une croyance enfouie. Une fidélité inconsciente à la pauvreté du clan. Une peur de trahir en réussissant.\n\nDans le cercle « L'argent est à mon service et non l'inverse », nous explorons ensemble ces croyances limitantes et les libérons à la racine.\n\nDécouvrir le cercle : ${HUB_CERCLES}` +
          SIGNATURE,
      },
      {
        ordre: 6,
        delai_jours: 16,
        sujet: "Un chemin à votre mesure existe",
        corps:
          `Bonjour {{prenom}},\n\nVoici toutes les portes d'entrée disponibles pour continuer votre chemin :\n\n• Analyse des Rêves — 70 €/mois\n• Se libérer des mémoires transgénérationnelles\n• Sortir de l'abus — se relever sans perdre sa douceur\n• L'argent à mon service\n• Sexualité infinie et consciente : une autre approche du tantra\n• Stages en présentiel — à partir de 550 € (solstices et équinoxes)\n\nTous les cercles et événements : ${HUB_CERCLES}\n\nEt si vous sentez l'appel d'un accompagnement individuel plus profond, écrivez-nous : ${SITE.url}/contact` +
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
];

/** Installe les scénarios manquants. Idempotent, n'écrase jamais l'existant. */
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
      if (!creee) continue;
      for (const e of g.etapes) {
        await sql`
          INSERT INTO sequence_etapes (sequence_id, ordre, delai_jours, sujet, corps)
          VALUES (${creee.id}, ${e.ordre}, ${e.delai_jours}, ${e.sujet}, ${e.corps})
          ON CONFLICT (sequence_id, ordre) DO NOTHING
        `;
      }
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

export type SequenceVue = {
  id: string;
  cle: string;
  nom: string;
  description: string | null;
  declencheur: string;
  active: boolean;
  etapes: { id: string; ordre: number; delai_jours: number; sujet: string; corps: string }[];
  inscrits: number;
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
      const etapes = await sql<SequenceVue["etapes"]>`
        SELECT id, ordre, delai_jours, sujet, corps FROM sequence_etapes
        WHERE sequence_id = ${s.id} ORDER BY ordre
      `;
      const [c] = await sql<{ n: string }[]>`
        SELECT COUNT(*) AS n FROM inscriptions WHERE sequence_id = ${s.id} AND statut = 'active'
      `;
      out.push({ ...s, etapes, inscrits: Number(c?.n ?? 0) });
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
