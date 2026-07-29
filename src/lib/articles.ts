/**
 * Source UNIQUE des articles du blog.
 *
 * Utilisée par :
 *   - src/app/blog/page.tsx          (liste des articles)
 *   - src/app/blog/[slug]/page.tsx   (article détaillé)
 *   - src/app/sitemap.ts             (slugs du sitemap)
 *   - src/app/page.tsx               (section « Journal » de l'accueil)
 *
 * ─────────────────────────────────────────────────────────────────────────
 * AUTOMATISATION — Le tableau `ARTICLES` est volontairement VIDE.
 * Les articles seront publiés automatiquement. Chaque article doit respecter
 * le type `Article` ci-dessous. Il suffit d'ajouter des objets dans `ARTICLES`
 * (ou de regénérer ce fichier) : le blog, l'accueil et le sitemap se mettent
 * à jour tout seuls.
 *
 * Format du contenu (`content`) — un tableau de blocs :
 *   { k: "p",     t: "..." }            paragraphe (gras avec **texte**)
 *   { k: "h2",    t: "..." }            titre de section
 *   { k: "quote", t: "..." }            citation mise en exergue
 *   { k: "ul",    items: ["...", ...] } liste à puces
 *
 * Modèle d'article :
 *   {
 *     slug: "mon-article",
 *     categorie: "Transformation",
 *     titre: "Titre complet de l'article",
 *     titreLead: "Titre complet de",
 *     titreAccent: "l'article.",
 *     extrait: "Chapô / résumé (liste + meta description).",
 *     date: "12 mai 2026",
 *     dateISO: "2026-05-12",
 *     lecture: "8 min",
 *     image: "https://.../cover.jpg",   // optionnel
 *     lede: "Paragraphe d'introduction, en serif.",
 *     content: [
 *       { k: "p", t: "Premier paragraphe…" },
 *       { k: "h2", t: "Une section" },
 *       { k: "quote", t: "Une citation forte." },
 *       { k: "ul", items: ["point 1", "point 2"] },
 *     ],
 *   }
 */

export type Block =
  | { k: "p"; t: string }
  | { k: "h2"; t: string }
  | { k: "quote"; t: string }
  | { k: "ul"; items: string[] }
  | { k: "image"; src: string; alt: string; caption?: string };

export type Article = {
  slug: string;
  categorie: string;
  /** Titre complet (liste, métadonnées, partages). */
  titre: string;
  /** Début du titre, affiché en clair dans le hero de l'article. */
  titreLead: string;
  /** Fin du titre, mise en valeur (or, italique) dans le hero. */
  titreAccent: string;
  /** Chapô / extrait (liste + meta description). */
  extrait: string;
  /** Date affichée (ex. « 12 mai 2026 »). */
  date: string;
  /** Date ISO pour le sitemap et les métadonnées (ex. « 2026-05-12 »). */
  dateISO: string;
  /** Temps de lecture (ex. « 8 min »). */
  lecture: string;
  /** Image de couverture (URL absolue ou /chemin local). Optionnel. */
  image?: string;
  /** Paragraphe d'introduction, en serif. */
  lede: string;
  content: Block[];
};

/**
 * Articles du blog — VIDE pour l'instant (rempli par automatisation).
 * Ajoutez des objets de type `Article` dans ce tableau.
 */
export const ARTICLES: Article[] = [
  {
    slug: "reussir-et-se-sentir-vide",
    categorie: "Crise silencieuse",
    titre: "Réussir sa vie et se sentir vide : le paradoxe des dirigeants accomplis",
    titreLead: "Réussir sa vie et se sentir vide :",
    titreAccent: "le paradoxe des accomplis.",
    extrait:
      "De l'extérieur, tout va bien. De l'intérieur, quelque chose s'est éteint. Comprendre — et sortir de — cette crise silencieuse qui touche tant de dirigeants.",
    date: "28 juillet 2026",
    dateISO: "2026-07-28",
    lecture: "6 min",
    image: "/blog/reussir-et-se-sentir-vide-cover.jpg",
    lede:
      "Vous avez coché toutes les cases : la carrière, la reconnaissance, la sécurité. Et pourtant, dans les rares moments de silence, une question revient, tenace — « Tout cela… pour quoi ? »",
    content: [
      { k: "p", t: "C'est l'un des paradoxes les plus troublants que je rencontre depuis plus de vingt ans : des femmes et des hommes qui ont extérieurement tout réussi, et qui portent, à l'intérieur, une forme de vide qu'ils n'osent nommer à personne. Ni burn-out spectaculaire, ni dépression visible. Juste une lumière qui a baissé, doucement, sans qu'on sache exactement quand." },
      { k: "h2", t: "Le vide n'est pas un manque de gratitude" },
      { k: "p", t: "La première chose que ces dirigeants se disent, c'est : « Je n'ai pas le droit de me plaindre. » Ils ont raison sur un point — leur vie est enviable. Mais confondre ce vide avec de l'ingratitude, c'est passer à côté de l'essentiel. Ce n'est pas un caprice de privilégié : c'est un **signal**. Celui d'une part de vous restée en retrait pendant que vous construisiez tout le reste." },
      { k: "image", src: "/blog/reussir-et-se-sentir-vide-1.jpg", alt: "Route de montagne à l'aube", caption: "Le vide n'est pas une impasse : c'est souvent le début d'un chemin." },
      { k: "h2", t: "Les signaux d'une crise silencieuse" },
      { k: "p", t: "Elle ne crie jamais. Elle se glisse dans les détails du quotidien :" },
      { k: "ul", items: [
        "Des tensions dans le couple qui s'installent sans qu'on sache vraiment pourquoi.",
        "Une distance avec vos enfants, malgré tout ce que vous leur offrez.",
        "Une fatigue profonde qu'aucune nuit ne répare.",
        "Un mode survie-performance permanent, où s'arrêter donne l'impression de reculer.",
        "Des refuges — travail, écrans, alcool — pour ne pas ressentir.",
        "Un sentiment de vide, même au sommet de ce que vous avez construit.",
      ] },
      { k: "p", t: "Si vous en reconnaissez deux ou trois, il vaut la peine de vous y arrêter." },
      { k: "quote", t: "Ce n'est pas votre réussite le problème — c'est ce qu'elle recouvre." },
      { k: "h2", t: "Pourquoi la performance ne comblera jamais ce vide" },
      { k: "p", t: "Nous croyons souvent qu'un cran de plus — un objectif, une acquisition, une reconnaissance — finira par apaiser cette sensation. C'est l'inverse qui se produit. La performance est précisément la stratégie que vous avez construite, très tôt, pour ne pas ressentir une blessure plus ancienne. Elle est devenue votre talent ; mais tant que la blessure n'est pas reconnue, aucune réussite ne sera jamais « assez »." },
      { k: "p", t: "C'est ce que j'appelle la **blessure originelle** : une empreinte profonde qui gouverne, en silence, vos choix et votre rapport à vous-même. La bonne nouvelle, c'est qu'une fois reconnue, elle cesse de commander — et l'équilibre revient." },
      { k: "h2", t: "Le premier pas : nommer, sans vouloir réparer" },
      { k: "p", t: "On ne sort pas de ce vide par un objectif de plus. On en sort en s'autorisant, enfin, à le regarder en face. Prenez cinq minutes, au calme, et écrivez ce que vous ressentez vraiment — sans le corriger, sans chercher de solution. Nommer ce qui est là, tel quel, est déjà un acte de transformation." },
      { k: "p", t: "Pour aller plus loin, j'ai réuni l'essentiel dans un **guide gratuit** : les six signaux, ce que révèle votre blessure originelle, et les premiers pas concrets pour retrouver l'équilibre." },
    ],
  },
  {
    slug: "la-blessure-originelle",
    categorie: "Transformation",
    titre: "La blessure originelle : cette faille d'enfance qui gouverne encore vos décisions",
    titreLead: "La blessure originelle :",
    titreAccent: "cette faille qui vous gouverne.",
    extrait:
      "Formée dans l'enfance ou héritée de votre lignée, elle a façonné vos talents — et continue de diriger, en silence, vos choix et vos relations. La comprendre, c'est commencer à s'en libérer.",
    date: "21 juillet 2026",
    dateISO: "2026-07-21",
    lecture: "7 min",
    image: "/blog/la-blessure-originelle-cover.jpg",
    lede:
      "Vos plus grandes forces et vos schémas les plus tenaces viennent souvent du même endroit : une blessure ancienne, si bien recouverte que vous avez fini par l'oublier.",
    content: [
      { k: "h2", t: "Qu'est-ce qu'une blessure originelle ?" },
      { k: "p", t: "C'est une empreinte profonde, formée très tôt — dans l'enfance, ou héritée des mémoires de votre lignée. Un moment, ou un climat, où un besoin fondamental n'a pas été pleinement rencontré : être vu, être aimé pour soi, être en sécurité, avoir sa juste place." },
      { k: "p", t: "L'enfant que vous étiez ne pouvait pas changer son environnement. Alors il a fait la seule chose possible : il s'est adapté. Il a développé une stratégie de survie — performer, contrôler, prendre soin des autres, se faire discret, ne jamais dépendre de personne." },
      { k: "image", src: "/blog/la-blessure-originelle-1.jpg", alt: "Silhouette bras ouverts face au lever du soleil", caption: "D'une blessure reconnue peut naître une liberté nouvelle." },
      { k: "h2", t: "Comment la blessure devient un talent" },
      { k: "p", t: "Avec le temps, ces stratégies de survie sont devenues vos **talents** — ceux-là mêmes qui expliquent votre réussite. Le sur-performant, celui qui contrôle tout, celui qui prend soin de chacun, celui qui n'a jamais besoin de rien. Derrière chaque force se cache souvent une blessure qui cherche encore à être reconnue." },
      { k: "quote", t: "Votre blessure a façonné vos talents. Reconnue, elle peut devenir la source de votre plus grande justesse." },
      { k: "h2", t: "Ce qu'elle gouverne, tant qu'elle reste dans l'ombre" },
      { k: "ul", items: [
        "Vos choix professionnels : ce que vous fuyez, ce que vous cherchez sans cesse à prouver.",
        "Vos relations : les mêmes scénarios qui se rejouent, avec d'autres visages.",
        "Votre rapport à vous-même : cette exigence qui ne s'apaise jamais tout à fait.",
      ] },
      { k: "p", t: "Tant qu'elle n'est pas reconnue, la blessure décide à votre place — et vous croyez décider librement." },
      { k: "h2", t: "De la compensation à l'Excellence Authentique" },
      { k: "p", t: "Se libérer d'une blessure originelle ne consiste pas à l'effacer, ni à accuser le passé. Il s'agit de la reconnaître et de l'apaiser. Alors les compensations se relâchent, les masques tombent, et vous revenez à votre **zone d'Excellence Authentique Unique** — cet espace où ce que vous êtes et ce que vous faites cessent de s'opposer." },
      { k: "p", t: "C'est un chemin, pas un interrupteur. Mais chaque pas compte : le premier consiste simplement à accepter de regarder là où, jusqu'ici, vous aviez appris à ne pas regarder." },
    ],
  },
  {
    slug: "la-fatigue-que-la-nuit-ne-repare",
    categorie: "Équilibre de vie",
    titre: "La fatigue qu'aucune nuit ne répare : burn-out ou perte de sens ?",
    titreLead: "La fatigue qu'aucune nuit ne répare :",
    titreAccent: "burn-out ou perte de sens ?",
    extrait:
      "Une fatigue que le sommeil, les vacances et le repos ne dissipent plus. Et si votre épuisement n'était pas qu'une question de charge — mais un appel à changer de rythme ?",
    date: "14 juillet 2026",
    dateISO: "2026-07-14",
    lecture: "6 min",
    image: "/blog/la-fatigue-que-la-nuit-ne-repare-cover.jpg",
    lede:
      "Vous dormez, et pourtant vous vous réveillez déjà fatigué. Vous partez en vacances, et la fatigue vous y suit. Cette fatigue-là ne parle pas seulement de votre agenda.",
    content: [
      { k: "h2", t: "La fatigue qui ne se répare pas au repos" },
      { k: "p", t: "Il existe une fatigue ordinaire — celle qu'une bonne nuit, un week-end, quelques jours au calme suffisent à dissiper. Et il en existe une autre, plus sourde, qu'aucun repos ne répare vraiment. Cette seconde fatigue n'est pas seulement physique : c'est l'épuisement de vivre, jour après jour, à côté de soi." },
      { k: "h2", t: "Le mode survie-performance" },
      { k: "p", t: "Toujours faire plus, tenir, contrôler, anticiper. S'arrêter donne l'impression de reculer — alors vous n'osez pas. Vous fonctionnez en pilote automatique, et le corps, lui, tient les comptes. La fatigue devient le seul langage qu'il vous reste pour dire : « quelque chose doit changer »." },
      { k: "image", src: "/blog/la-fatigue-que-la-nuit-ne-repare-1.jpg", alt: "Lever de soleil sur les montagnes", caption: "L'énergie stable revient quand on cesse de lutter contre soi." },
      { k: "quote", t: "Le repos ne suffit pas quand ce qui vous épuise, c'est la manière dont vous vivez." },
      { k: "h2", t: "Vivre selon vos saisons intérieures" },
      { k: "p", t: "La nature ne produit pas toute l'année. Elle traverse des cycles — et nous en faisons partie, même si nous l'avons oublié. À force de nous exiger un été permanent, nous nous coupons de notre propre rythme :" },
      { k: "ul", items: [
        "L'automne — le temps du lâcher-prise : on récolte, on rend, on laisse partir.",
        "L'hiver — le temps des racines : on se retire, on écoute, on se régénère.",
        "Le printemps — le temps de l'élan : ce qui a mûri sous terre se déploie.",
        "L'été — le temps du rayonnement : l'incarnation de ce qui est devenu juste.",
      ] },
      { k: "p", t: "Reconnaître la saison que vous traversez, c'est cesser de lutter contre elle. Un hiver intérieur vécu comme une faiblesse épuise ; le même hiver, honoré comme un temps de régénération, restaure." },
      { k: "h2", t: "Trois gestes pour retrouver une énergie stable" },
      { k: "ul", items: [
        "**Ralentir sans culpabilité** : dix minutes par jour, sans écran et sans objectif.",
        "**Honorer vos hivers** : le retrait n'est pas une faiblesse, c'est une régénération.",
        "**Demander une aide juste** : on ne sort pas de l'épuisement par la seule volonté — c'est souvent elle qui l'a créé.",
      ] },
      { k: "p", t: "La véritable énergie n'est pas celle que l'on force. C'est celle qui revient, naturellement, lorsque l'on cesse enfin de vivre contre soi." },
    ],
  },
  {
    slug: "couple-carriere-usure",
    categorie: "Couple & relation",
    titre: "Pourquoi votre couple s'use quand votre carrière décolle",
    titreLead: "Pourquoi votre couple s'use",
    titreAccent: "quand votre carrière décolle.",
    extrait:
      "Vous n'aimez pas moins. Vous êtes moins là. Comprendre le mécanisme silencieux qui éloigne les couples de dirigeants — et comment inverser la tendance.",
    date: "10 juillet 2026",
    dateISO: "2026-07-10",
    lecture: "8 min",
    image: "/blog/couple-carriere-usure-cover.jpg",
    lede:
      "Personne ne décide, un matin, de laisser son couple s'éteindre. Cela n'arrive jamais d'un coup. Cela arrive par petites absences, par reports successifs, par une attention qui glisse — ailleurs.",
    content: [
      { k: "p", t: "C'est l'une des situations que je rencontre le plus souvent : une personne qui réussit brillamment sa carrière, et dont le ou la partenaire se sent, année après année, de plus en plus seul·e — dans une maison confortable. Ce n'est pas une histoire d'amour qui s'arrête. C'est une histoire de présence qui s'est absentée sans qu'on y prenne garde." },
      { k: "h2", t: "Le paradoxe de la réussite conjugale" },
      { k: "p", t: "Vous avez construit, développé, sécurisé — souvent, au départ, pour offrir une vie meilleure à ceux que vous aimez. Et c'est précisément cette construction qui, peu à peu, vous a éloigné d'eux. La réussite censée protéger le couple finit par l'user. Non par manque d'amour, mais par manque de disponibilité intérieure." },
      { k: "p", t: "Le piège est subtil : plus vous réussissez, plus on vous sollicite, plus votre esprit reste happé par le prochain défi. Vous rentrez le soir, mais une partie de vous n'est jamais vraiment rentrée. Et votre partenaire, lui, ne partage pas votre lit avec une autre personne : il le partage avec votre charge mentale." },
      { k: "h2", t: "Vous n'êtes pas absent — vous êtes ailleurs" },
      { k: "p", t: "Physiquement, vous êtes là : les dîners, les week-ends, les vacances. Mais votre attention, elle, reste accrochée au dossier, à la décision, à ce qui n'est pas résolu. Ce décalage entre la présence du corps et l'absence de l'esprit est l'un des poisons les plus silencieux de la vie de couple." },
      { k: "p", t: "L'autre le ressent bien avant vous. Il cesse peu à peu de vous solliciter, pour ne pas déranger. Il n'insiste plus. Et le silence qui s'installe alors n'est pas de la paix : c'est un renoncement. On croit que le calme revenu est un signe d'harmonie ; c'est parfois le bruit feutré d'un lien qui se défait." },
      { k: "image", src: "/blog/couple-carriere-usure-1.jpg", alt: "Deux mains ouvertes qui se tendent l'une vers l'autre", caption: "L'attention est la première forme du désir." },
      { k: "h2", t: "Le désir ne meurt pas — il se déplace" },
      { k: "p", t: "On croit souvent que le désir s'éteint avec le temps ou la routine. En réalité, il meurt rarement : il se déplace. Il va là où va l'attention. Quand toute votre intensité est absorbée par votre activité, il reste peu d'intensité disponible pour le couple. Vous êtes encore capable d'un désir profond — mais ce désir, sans vous en rendre compte, vous l'adressez à vos projets." },
      { k: "p", t: "Le ou la partenaire perçoit cela très finement. Il ne se sent pas trahi par une autre personne, mais par une priorité. Et cette blessure-là, parce qu'elle n'a pas de coupable identifiable, est particulièrement difficile à nommer — donc à réparer." },
      { k: "quote", t: "Le contraire de l'amour, dans un couple qui dure, ce n'est pas la haine — c'est l'indifférence polie." },
      { k: "h2", t: "Les signes d'un couple qui s'use en silence" },
      { k: "p", t: "L'usure conjugale ne fait pas de bruit. Elle ne se manifeste presque jamais par des disputes spectaculaires, mais par une érosion discrète du lien. Quelques signes reviennent souvent :" },
      { k: "ul", items: [
        "Vous ne vous parlez plus que d'intendance : enfants, agenda, logistique du quotidien.",
        "Les conversations profondes se sont raréfiées — ou n'ont tout simplement plus lieu.",
        "Une distance s'est installée, sans dispute franche pour l'expliquer.",
        "L'un des deux a cessé de formuler ses besoins, par lassitude d'être entendu.",
        "La tendresse ordinaire s'est effacée, sans que personne ne l'ait vraiment décidé.",
      ] },
      { k: "p", t: "Aucun de ces signes n'est dramatique isolément. C'est leur accumulation, patiente et silencieuse, qui finit par vider un couple de sa substance." },
      { k: "h2", t: "Ce que votre couple révèle de vous" },
      { k: "p", t: "Très souvent, la manière dont vous êtes dans votre couple est le miroir de votre rapport à vous-même. Si vous ne vous valorisez qu'à travers ce que vous produisez, vous aurez du mal à être simplement présent, sans rien résoudre, sans rien accomplir. Or le couple demande exactement cela : une présence qui ne soit pas une performance." },
      { k: "p", t: "C'est ici que rejoue, en creux, la blessure originelle : fuir dans l'action pour ne pas ressentir. Le couple est le lieu où cette fuite devient la plus visible — et la plus coûteuse. Travailler sur son couple, c'est donc souvent, sans le savoir, travailler sur soi." },
      { k: "h2", t: "Trois gestes pour réinstaller la présence" },
      { k: "ul", items: [
        "**Créer des espaces sans agenda** : un temps régulier, sans écran ni logistique, où l'on ne parle que de soi et de l'autre — pas des enfants, pas du planning.",
        "**Écouter sans vouloir réparer** : votre partenaire n'attend pas toujours une solution. Souvent, il attend simplement d'être entendu, sans que vous transformiez sa parole en problème à régler.",
        "**Nommer ce qui s'est éteint** : reconnaître à deux qu'une distance s'est installée n'est pas un aveu d'échec — c'est le premier pas pour la traverser ensemble.",
      ] },
      { k: "p", t: "La bonne nouvelle tient en une phrase : un couple ne s'use pas par manque d'amour, mais par manque de présence. Et la présence, contrairement à ce que l'on croit, se réapprend — à condition de décider qu'elle mérite, elle aussi, une part de votre meilleure énergie." },
    ],
  },
  {
    slug: "trois-attentes-des-hommes",
    categorie: "Couple & relation",
    titre: "Les trois attentes que les hommes taisent — et qui fragilisent le couple",
    titreLead: "Les trois attentes que les hommes taisent",
    titreAccent: "et qui fragilisent le couple.",
    extrait:
      "Ils ne les formulent pas — parfois ils ne les connaissent pas eux-mêmes. Trois besoins profonds que beaucoup d'hommes portent en silence, et qui, ignorés, minent la relation.",
    date: "3 juillet 2026",
    dateISO: "2026-07-03",
    lecture: "8 min",
    image: "/blog/trois-attentes-des-hommes-cover.jpg",
    lede:
      "On reproche souvent aux hommes de ne pas parler. La vérité est plus subtile : beaucoup ne savent pas nommer ce qu'ils ressentent — parce qu'on ne le leur a jamais appris.",
    content: [
      { k: "h2", t: "Le silence n'est pas de l'indifférence" },
      { k: "p", t: "La culture a longtemps appris aux hommes à être solides, à pourvoir, à ne pas avoir besoin. Alors ils apprennent, très tôt, à se taire. Et ce silence est souvent interprété par leur partenaire comme de la froideur, voire de l'indifférence. C'est presque toujours l'inverse : la difficulté à accéder à une vulnérabilité qu'ils ont appris à enfouir." },
      { k: "p", t: "Ce silence a un coût. Ce qui n'est pas dit ne disparaît pas : cela se transforme en distance, en irritabilité, ou en fuite dans le travail. Comprendre les attentes qui se cachent sous ce silence, c'est offrir au couple une chance de sortir des malentendus qui l'épuisent." },
      { k: "h2", t: "Première attente : être admiré, pas seulement aimé" },
      { k: "p", t: "Beaucoup d'hommes ont besoin de sentir que leur partenaire les admire — non pour ce qu'ils produisent, mais pour ce qu'ils sont. Être aimé rassure ; être admiré rend vivant. Lorsque l'admiration s'efface, remplacée par l'habitude, la critique ou le reproche, quelque chose d'essentiel se referme en eux." },
      { k: "p", t: "Ce n'est pas de l'ego. C'est un besoin fondamental de reconnaissance, souvent enraciné dans une enfance où le garçon a senti qu'il devait mériter sa place, prouver sa valeur pour exister aux yeux des autres." },
      { k: "image", src: "/blog/trois-attentes-des-hommes-1.jpg", alt: "Un arbre solitaire se reflétant sur une eau calme", caption: "Ce qui n'est pas dit ne disparaît pas : cela travaille en silence." },
      { k: "h2", t: "Deuxième attente : un lieu où déposer les armes" },
      { k: "p", t: "Toute la journée, dehors, l'homme tient : il décide, protège, encaisse. Il a besoin d'un seul endroit où cesser de tenir — le couple. Non pour être fort, mais pour être, simplement. Lorsque le foyer devient une arène de plus, un lieu de jugement ou d'exigence, il n'a plus nulle part où respirer." },
      { k: "p", t: "Alors il retourne là où il se sent compétent, reconnu, en maîtrise : le travail. Ce n'est pas qu'il préfère son bureau à sa famille. C'est qu'il y trouve un répit que le foyer ne lui offre plus. La distance conjugale est parfois la conséquence, et non la cause, de cette fatigue-là." },
      { k: "quote", t: "Un homme qui ne peut nulle part déposer ses armes finit par les garder, même face à ceux qu'il aime." },
      { k: "h2", t: "Troisième attente : être désiré, pas seulement accepté" },
      { k: "p", t: "Derrière la demande d'intimité, il y a rarement qu'un besoin physique. Il y a le besoin de se sentir voulu, choisi, encore désirable. Pour beaucoup d'hommes, la sexualité est le principal langage de la connexion émotionnelle — le seul, souvent, qu'on leur ait autorisé. Ce n'est pas qu'ils veulent « plus » ; c'est qu'ils veulent se sentir désirés." },
      { k: "p", t: "Quand ce désir n'est plus que « toléré », l'homme se sent rejeté dans son être même, quand bien même rien n'est dit. Et cette blessure, il ne saura généralement pas la formuler autrement que par le repli ou la frustration." },
      { k: "h2", t: "Pourquoi ces attentes restent tues" },
      { k: "p", t: "Si ces besoins restent muets, ce n'est pas par mauvaise volonté. C'est parce que les nommer reviendrait, dans l'imaginaire de beaucoup d'hommes, à s'avouer faible. Plusieurs freins se conjuguent :" },
      { k: "ul", items: [
        "Il craint de paraître fragile, ou « en demande ».",
        "Il n'a jamais appris à mettre des mots sur ce qu'il ressent.",
        "Il redoute d'être jugé, minimisé, voire moqué.",
        "Il a intégré, enfant, que ses besoins passaient après ceux des autres.",
      ] },
      { k: "h2", t: "Ce qui change quand on ose nommer" },
      { k: "p", t: "Le jour où un homme parvient à nommer ces attentes — d'abord à lui-même, puis à sa partenaire — la dynamique du couple se transforme. Non parce que l'autre devrait tout combler, mais parce que l'invisible devient enfin partageable. Nommer n'est pas se plaindre : c'est ouvrir une porte." },
      { k: "p", t: "Ces trois attentes ne sont pas des exigences. Ce sont des appels à la connexion. Les entendre — en soi, ou chez l'autre — c'est déjà aimer mieux. Et souvent, c'est le début d'un chemin où l'homme réapprend, enfin, à habiter pleinement sa vie affective." },
    ],
  },
  {
    slug: "present-pour-ses-enfants",
    categorie: "Famille",
    titre: "Être présent pour ses enfants sans culpabilité : sortir de l'absence émotionnelle",
    titreLead: "Être présent pour ses enfants sans culpabilité :",
    titreAccent: "sortir de l'absence émotionnelle.",
    extrait:
      "Vous êtes là, et pourtant vous n'y êtes pas. La différence entre présence physique et présence réelle — et comment revenir, vraiment, auprès de ceux qui grandissent vite.",
    date: "26 juin 2026",
    dateISO: "2026-06-26",
    lecture: "7 min",
    image: "/blog/present-pour-ses-enfants-cover.jpg",
    lede:
      "« Je suis là tous les soirs. » C'est vrai. Et pourtant, votre enfant sent parfois que vous êtes ailleurs. Présent de corps, absent de présence.",
    content: [
      { k: "h2", t: "La culpabilité ne rend pas plus présent" },
      { k: "p", t: "Les parents qui travaillent beaucoup portent une culpabilité diffuse, presque permanente. Or, paradoxalement, cette culpabilité les rend souvent moins présents : elle les remplit de tension et de justifications intérieures, et les pousse à compenser par des cadeaux ou des activités plutôt que par une présence réelle." },
      { k: "p", t: "C'est une mécanique piégeuse : la culpabilité est tournée vers soi — « suis-je un bon parent ? » —, tandis que la présence, elle, est tournée vers l'autre — « de quoi mon enfant a-t-il besoin, maintenant ? ». Tant que l'on reste occupé à culpabiliser, on n'est pas vraiment disponible." },
      { k: "h2", t: "Ce que les enfants retiennent vraiment" },
      { k: "p", t: "Un enfant ne se souvient pas du prix d'un cadeau, ni du nombre d'activités du week-end. Il se souvient de la qualité de l'attention : les moments où il s'est senti vraiment vu, écouté, important. Dix minutes de présence pleine pèsent infiniment plus qu'une soirée entière de présence distraite." },
      { k: "p", t: "C'est une nouvelle plutôt rassurante pour un parent débordé : la présence ne se mesure pas en heures, mais en intensité. Encore faut-il que ces minutes soient réellement offertes — sans téléphone, sans esprit ailleurs, sans autre agenda que l'enfant lui-même." },
      { k: "image", src: "/blog/present-pour-ses-enfants-1.jpg", alt: "Une main tendant un téléphone au bord d'un lac", caption: "Un enfant ne rivalise pas avec une autre personne — il rivalise avec un écran." },
      { k: "h2", t: "L'ennemi invisible : la charge mentale" },
      { k: "p", t: "Vous êtes à table, mais votre esprit rejoue la réunion de l'après-midi. Le téléphone vibre. L'enfant vous parle ; vous répondez « mmh » sans lever les yeux. Il l'apprend très vite : papa ou maman est là, mais pas disponible. Et il finit par cesser de chercher à vous atteindre — c'est là que commence, insidieusement, la distance émotionnelle." },
      { k: "p", t: "Cette distance ne se répare pas plus tard, quand « les choses seront plus calmes ». Car les choses ne sont jamais plus calmes, et les enfants, eux, grandissent au présent. La disponibilité intérieure n'est pas une question de temps, mais de décision." },
      { k: "quote", t: "La présence, ce n'est pas être dans la même pièce. C'est être dans le même instant." },
      { k: "h2", t: "Pourquoi c'est si difficile de « juste être là »" },
      { k: "p", t: "Pour quelqu'un qui se valorise à travers l'action et le résultat, ne rien faire — être simplement présent auprès d'un enfant — peut être étrangement inconfortable, presque inutile. On se surprend à vouloir « optimiser » le moment, à le remplir, à le rendre productif. C'est encore la même mécanique : fuir dans le faire pour éviter la vulnérabilité du simple être." },
      { k: "p", t: "Or l'enfant demande précisément ce qui est le plus difficile : une présence qui ne soit pas une performance. Il ne veut pas un parent parfait, ni un animateur. Il veut quelqu'un qui soit là, entièrement, pour un moment." },
      { k: "h2", t: "Revenir, concrètement" },
      { k: "ul", items: [
        "**Des rituels courts et sacrés** : dix minutes par jour vraiment dédiées, sans écran, où l'enfant a toute votre attention.",
        "**Poser le téléphone hors de vue** : la présence commence par retirer ce qui la fragmente en permanence.",
        "**Écouter avec le corps** : se mettre à sa hauteur, le regarder, ne rien résoudre — juste accueillir ce qu'il vit.",
        "**Réparer sans se flageller** : dire « j'étais ailleurs, je reviens » vaut mieux que la culpabilité silencieuse.",
      ] },
      { k: "p", t: "Vos enfants n'ont pas besoin d'un parent parfait. Ils ont besoin d'un parent présent. Et la présence, contrairement au temps, ne se rattrape pas plus tard : elle se choisit, un instant après l'autre, maintenant." },
    ],
  },
  {
    slug: "polarites-masculin-feminin",
    categorie: "Leadership",
    titre: "Masculin, féminin : réconcilier vos polarités pour une réussite qui a du sens",
    titreLead: "Masculin, féminin :",
    titreAccent: "réconcilier vos polarités.",
    extrait:
      "Nous portons tous une polarité d'action et une polarité de présence. Quand l'une écrase l'autre, la réussite se paie cher. Rééquilibrer les deux, c'est retrouver une puissance juste.",
    date: "19 juin 2026",
    dateISO: "2026-06-19",
    lecture: "8 min",
    image: "/blog/polarites-masculin-feminin-cover.jpg",
    lede:
      "Ce ne sont pas des questions de genre. En chacun de nous vivent deux forces : celle qui agit, structure et conquiert — et celle qui accueille, ressent et relie. Notre équilibre dépend de leur dialogue.",
    content: [
      { k: "h2", t: "Deux polarités, en chacun de nous" },
      { k: "p", t: "La polarité dite masculine est celle de l'action, de la direction, de la structure, de la conquête. La polarité dite féminine est celle de la présence, de la réception, de l'intuition, de la relation. Ce ne sont pas des attributs d'hommes ou de femmes : chacun porte les deux, et notre santé intérieure dépend de leur équilibre." },
      { k: "p", t: "Or notre culture — et le monde du leadership en particulier — glorifie le pôle de l'action et réprime celui de la présence. On nous demande de performer, de contrôler, de produire. Rarement de ressentir, de recevoir, d'être. Résultat : des êtres immensément efficaces, et profondément coupés d'eux-mêmes." },
      { k: "h2", t: "Quand une polarité écrase l'autre" },
      { k: "p", t: "Lorsque l'action écrase la présence, on devient performant mais déconnecté. On réussit sans plus rien ressentir. Le corps suit, mais l'intérieur se vide. C'est le profil du dirigeant qui « fonctionne » — et qui, un jour, ne sait plus très bien pour quoi, ni pour qui." },
      { k: "p", t: "L'inverse existe aussi : une présence sans structure, une sensibilité sans direction, des intuitions qui ne s'incarnent jamais. Les deux pôles ont besoin l'un de l'autre. L'action sans présence épuise ; la présence sans action se disperse." },
      { k: "image", src: "/blog/polarites-masculin-feminin-1.jpg", alt: "Silhouette bras ouverts sur une eau qui reflète le ciel", caption: "La puissance juste naît de la rencontre entre l'action et la présence." },
      { k: "h2", t: "Le prix d'un déséquilibre" },
      { k: "p", t: "Un pôle qui écrase l'autre finit toujours par se payer. Les signes sont souvent lisibles avant même qu'on ne les nomme :" },
      { k: "ul", items: [
        "Une réussite qui ne procure plus de joie, seulement du soulagement.",
        "Des relations qui s'appauvrissent : on gère les liens plus qu'on ne les vit.",
        "Une coupure progressive d'avec le corps et les émotions.",
        "L'impression d'être devenu une fonction, plus tout à fait une personne.",
      ] },
      { k: "quote", t: "Agir sans présence épuise. Ressentir sans structure disperse. La justesse naît de leur alliance." },
      { k: "h2", t: "Réconcilier, pas choisir" },
      { k: "p", t: "Il ne s'agit pas de renoncer à l'action — c'est elle qui a bâti votre réussite. Il s'agit de réintégrer la présence. Un dirigeant qui se reconnecte à sa polarité de présence ne devient pas moins efficace : il devient plus juste. Il décide depuis un endroit plus profond, écoute mieux, et gouverne avec une présence que les autres ressentent." },
      { k: "p", t: "Cette réconciliation transforme le rapport même à la réussite : elle cesse d'être une fuite en avant pour devenir l'expression naturelle d'un être en paix avec lui-même. On ne réussit plus pour combler un manque, mais parce que l'on est aligné." },
      { k: "h2", t: "Réhabiliter le pôle négligé" },
      { k: "p", t: "Si vous vous reconnaissez dans l'excès d'action, le chemin consiste à réapprendre ce que vous avez appris à réprimer : recevoir plutôt que toujours donner, ralentir plutôt que toujours accélérer, ressentir plutôt que toujours analyser, lâcher le contrôle plutôt que tout maîtriser." },
      { k: "p", t: "C'est souvent inconfortable au début : le pôle négligé nous semble étranger, presque menaçant. Mais c'est précisément là que patiente une puissance plus pleine — celle qui ne s'épuise pas, parce qu'elle ne lutte plus contre une part d'elle-même." },
      { k: "p", t: "Une réussite qui a du sens n'oppose pas les deux forces : elle les épouse. Quand l'action sert la présence, et que la présence guide l'action, vous cessez de réussir contre vous-même — vous réussissez, enfin, avec vous-même." },
    ],
  },
  {
    slug: "le-cadre-qui-libere",
    categorie: "Liberté intérieure",
    titre: "Le cadre ne vous enferme pas, il vous libère : repenser la discipline intérieure",
    titreLead: "Le cadre ne vous enferme pas,",
    titreAccent: "il vous libère.",
    extrait:
      "Nous opposons souvent liberté et cadre. Pourtant, sans structure, la liberté se dissout dans le chaos. Comment un cadre juste devient la condition même de votre liberté intérieure.",
    date: "12 juin 2026",
    dateISO: "2026-06-12",
    lecture: "7 min",
    image: "/blog/le-cadre-qui-libere-cover.jpg",
    lede:
      "On rêve d'une liberté sans contraintes. Mais la liberté sans cadre n'est pas la liberté : c'est la dispersion. Le musicien n'est libre que parce qu'il a intégré, patiemment, la structure de son art.",
    content: [
      { k: "h2", t: "Le malentendu sur la liberté" },
      { k: "p", t: "Nous confondons souvent liberté et absence de règles. Pourtant, l'absence totale de structure ne libère pas : elle angoisse, disperse, et épuise dans le vertige du choix permanent. Le fleuve sans berges ne coule pas plus librement — il déborde et s'étale, jusqu'à ne plus être un fleuve." },
      { k: "p", t: "La vraie liberté n'est pas l'absence de cadre, mais un cadre choisi en conscience — une structure qui sert votre intention la plus profonde, au lieu de la contredire. La contrainte, alors, se retourne en appui." },
      { k: "h2", t: "Le cadre subi et le cadre choisi" },
      { k: "p", t: "Il existe un cadre subi — les règles que d'autres imposent et que l'on endure — et un cadre choisi — les structures que l'on adopte parce qu'elles nous alignent. Le premier asservit ; le second libère. Confondre les deux nous pousse à rejeter tout cadre, et à perdre du même coup la structure qui nous rendrait libres." },
      { k: "image", src: "/blog/le-cadre-qui-libere-1.jpg", alt: "Route droite traversant un paysage vers les montagnes", caption: "Une route tracée ne réduit pas le voyage : elle le rend possible." },
      { k: "h2", t: "Pourquoi les dirigeants s'épuisent sans cadre intérieur" },
      { k: "p", t: "C'est un paradoxe fréquent : ceux qui imposent partout de la structure dans leur entreprise vivent souvent sans aucun cadre intérieur. Toujours joignables, sans limites, sans rythme protégé, ils confondent le fait d'être sollicités avec celui d'être libres. Ce manque de cadre intime est une source d'épuisement que l'on sous-estime presque toujours." },
      { k: "p", t: "Sans structure choisie, chaque journée devient une négociation permanente, chaque sollicitation une urgence, chaque « oui » de trop une fuite d'énergie. Le cadre, ici, ne manque pas de rigueur : il manque de présence à soi." },
      { k: "quote", t: "Un cadre juste n'est pas une prison : c'est la forme qui empêche votre énergie de se perdre." },
      { k: "h2", t: "Le cadre au service du vivant" },
      { k: "p", t: "Un bon cadre n'est pas rigide ; il est vivant. Il structure sans étouffer — comme l'arbre qui grandit à l'intérieur de sa forme sans jamais cesser de croître. Il donne à vos journées un rythme, à vos priorités une hiérarchie, à votre énergie une direction. Concrètement, il peut prendre plusieurs visages :" },
      { k: "ul", items: [
        "Des horaires qui protègent vos temps de récupération, non négociables.",
        "Des limites claires : ce que vous acceptez, et ce que vous refusez sans culpabilité.",
        "Des rituels qui ancrent, plutôt que des injonctions qui contraignent.",
        "Un rythme respecté, plutôt qu'une disponibilité permanente qui vous dévore.",
      ] },
      { k: "h2", t: "De la contrainte à la structure libératrice" },
      { k: "p", t: "Le basculement est intérieur : cesser de voir le cadre comme une contrainte venue de l'extérieur, et commencer à choisir les structures qui vous alignent. La discipline, alors, n'est plus une punition : elle devient une forme de respect de soi. C'est le cadre qui tient — pour que vous n'ayez plus, vous, à tout tenir." },
      { k: "p", t: "Les personnes les plus libres ne sont pas celles qui vivent sans cadre, mais celles qui ont choisi le leur. Le cadre juste ne vous enferme pas : il vous rend, enfin, disponible à l'essentiel." },
    ],
  },
  {
    slug: "vivre-selon-ses-saisons",
    categorie: "Cycle des Saisons",
    titre: "Vivre selon vos saisons intérieures : arrêter de lutter contre soi",
    titreLead: "Vivre selon vos saisons intérieures :",
    titreAccent: "arrêter de lutter contre soi.",
    extrait:
      "La nature ne produit pas toute l'année. Vous non plus. Reconnaître vos saisons intérieures — automne, hiver, printemps, été — pour cesser de vous épuiser à contretemps.",
    date: "5 juin 2026",
    dateISO: "2026-06-05",
    lecture: "8 min",
    image: "/blog/vivre-selon-ses-saisons-cover.jpg",
    lede:
      "Nous exigeons de nous-mêmes un été permanent : produire, rayonner, avancer sans relâche. Mais aucun vivant ne fonctionne ainsi. Et se couper de ses saisons, c'est se condamner à lutter contre soi.",
    content: [
      { k: "h2", t: "Nous avons oublié que nous sommes vivants" },
      { k: "p", t: "La culture moderne exige une productivité constante — un été perpétuel. Mais la nature, elle, alterne. L'arbre ne porte pas de fruits en hiver : il se retire vers ses racines, il se régénère, il se prépare. Nous faisons partie de ce vivant, même si nous l'avons oublié — et cet oubli se paie en épuisement et en perte de sens." },
      { k: "p", t: "Reconnaître que nous traversons, nous aussi, des cycles, n'est pas une image poétique : c'est une clé très concrète pour cesser de nous épuiser. Car une grande part de notre fatigue vient d'un simple décalage — vivre à contretemps de notre saison intérieure." },
      { k: "h2", t: "Les quatre saisons intérieures" },
      { k: "p", t: "Reconnaître la saison que l'on traverse change tout. Chacune a sa fonction, sa beauté, sa nécessité :" },
      { k: "ul", items: [
        "**L'automne — le lâcher-prise** : le temps de récolter, de rendre, de laisser partir ce qui est arrivé à son terme.",
        "**L'hiver — les racines** : le temps du retrait et de la nuit longue, où l'on descend vers l'essentiel et l'on se régénère.",
        "**Le printemps — l'élan** : le temps du jaillissement, où ce qui a mûri sous terre se déploie enfin au grand jour.",
        "**L'été — le rayonnement** : le temps de la pleine lumière, de l'incarnation et de l'ampleur.",
      ] },
      { k: "image", src: "/blog/vivre-selon-ses-saisons-1.jpg", alt: "Sommets enneigés sous un ciel d'hiver", caption: "L'hiver n'est pas une faiblesse : c'est une saison de régénération." },
      { k: "h2", t: "L'hiver que l'on refuse de vivre" },
      { k: "p", t: "La saison la plus incomprise est l'hiver. Nous vivons le besoin de nous retirer, de ralentir, de nous reposer, comme un échec — comme une faiblesse dont il faudrait avoir honte. Alors nous nous forçons à rester en « été », coûte que coûte. Et l'hiver, non vécu, finit par se transformer en épuisement, en démotivation, parfois en effondrement." },
      { k: "p", t: "Un hiver honoré, au contraire, restaure. Se retirer à temps, écouter, se régénérer, ce n'est pas reculer : c'est préparer le printemps. Aucun élan durable ne naît sans un hiver qui l'a nourri en profondeur." },
      { k: "quote", t: "Un hiver intérieur vécu comme une faiblesse épuise ; le même hiver, honoré comme une régénération, restaure." },
      { k: "h2", t: "Lutter à contretemps" },
      { k: "p", t: "Une grande partie de notre fatigue vient de ce décalage : nous essayons de fleurir quand tout, en nous, demande à se retirer. Nous nous efforçons de tenir, de rayonner, alors qu'une saison de dépôt est en cours. Ce désaccord permanent entre notre exigence et notre rythme réel est l'une des formes les plus épuisantes de la lutte contre soi." },
      { k: "h2", t: "Coopérer avec sa saison" },
      { k: "p", t: "Il ne s'agit pas de moins avancer, mais d'avancer juste — au bon moment, avec la bonne énergie :" },
      { k: "ul", items: [
        "En automne : accepter de laisser partir, faire le tri, alléger ce qui pèse.",
        "En hiver : se retirer sans culpabilité, se régénérer, écouter ce qui monte du silence.",
        "Au printemps : oser l'élan, s'engager, formuler ce qui a mûri.",
        "En été : rayonner, incarner et partager ce qui est devenu juste.",
      ] },
      { k: "p", t: "Vivre selon ses saisons, c'est cesser de lutter contre le vivant en soi pour enfin coopérer avec lui. Et c'est souvent là, dans cette coopération retrouvée, que revient une énergie stable — celle que l'on avait cru perdue à force de vouloir un été qui ne finisse jamais." },
    ],
  },
  {
    slug: "pardonner-nest-pas-oublier",
    categorie: "Transformation",
    titre: "Pardonner n'est pas oublier : se libérer du poids de la rancœur",
    titreLead: "Pardonner n'est pas oublier :",
    titreAccent: "se libérer du poids de la rancœur.",
    extrait:
      "La rancœur enchaîne celui qui la porte, pas celui qu'elle vise. Comprendre ce qu'est vraiment le pardon — un acte de libération pour soi — et comment déposer ce que l'on traîne depuis trop longtemps.",
    date: "29 mai 2026",
    dateISO: "2026-05-29",
    lecture: "8 min",
    image: "/blog/pardonner-nest-pas-oublier-cover.jpg",
    lede:
      "On croit que pardonner, c'est excuser, oublier, ou se réconcilier. C'est pour cela que tant de personnes refusent de pardonner. Mais le pardon dont je parle n'a rien à voir avec cela.",
    content: [
      { k: "h2", t: "Ce que le pardon n'est pas" },
      { k: "p", t: "Pardonner n'est pas excuser : l'acte reste injuste. Ce n'est pas oublier : la mémoire demeure. Ce n'est pas se réconcilier : vous ne reverrez peut-être jamais la personne. Ce n'est pas renoncer à la justice. Tant que nous confondons le pardon avec ces gestes-là, nous le refusons — et nous restons enchaînés à ce qui nous a blessés." },
      { k: "p", t: "Le pardon véritable est autre chose : c'est cesser de laisser le passé décider de votre présent. C'est un acte tourné vers soi, pas vers l'autre. On ne pardonne pas pour libérer celui qui a fait du mal — on pardonne pour se libérer soi." },
      { k: "h2", t: "La rancœur enchaîne celui qui la porte" },
      { k: "p", t: "Nous gardons de la rancœur en croyant qu'elle punit l'autre. Mais, le plus souvent, l'autre vit sa vie, indifférent à ce que nous ruminons. Le seul être réellement empoisonné, c'est celui qui la porte. La rancœur est un poids que l'on traîne, une blessure que l'on maintient ouverte à force d'y revenir sans cesse." },
      { k: "p", t: "Elle occupe une place immense : elle colore vos pensées, tend vos relations, use votre énergie. Et plus le temps passe, plus elle s'incruste, jusqu'à sembler faire partie de vous. C'est précisément cette illusion qu'il faut défaire." },
      { k: "image", src: "/blog/pardonner-nest-pas-oublier-1.jpg", alt: "Mer calme au coucher du soleil", caption: "Déposer la rancœur, ce n'est pas absoudre l'autre — c'est se rendre à soi-même." },
      { k: "quote", t: "Garder de la rancœur, c'est boire du poison en espérant que l'autre en souffre." },
      { k: "h2", t: "Pourquoi c'est si difficile de lâcher" },
      { k: "p", t: "Si le pardon est si difficile, c'est que la rancœur protège quelque chose. Une fidélité à notre souffrance : lâcher semblerait trahir ce que nous avons vécu, ou en minimiser la gravité. Et parfois, une identité cachée — « je suis celui à qui l'on a fait du mal ». Renoncer à la rancœur, c'est aussi renoncer à ce rôle." },
      { k: "p", t: "Derrière la rancœur se tient presque toujours une douleur non ressentie : de la tristesse, le deuil de ce qui aurait dû être. Le pardon exige de traverser d'abord cette douleur-là. C'est pourquoi on ne peut pas le décréter : on ne se force pas à pardonner, on s'y laisse venir." },
      { k: "h2", t: "Un chemin qui passe par le corps" },
      { k: "p", t: "« Je te pardonne » dit du bout des lèvres ne libère rien. Le pardon véritable ne se décide pas par la seule volonté : il passe par le corps, par l'émotion enfin ressentie et traversée. Reconnaître la blessure, laisser monter ce qui était figé, et, un jour, sentir que le poids s'allège — sans même l'avoir cherché." },
      { k: "p", t: "Le pardon le plus difficile est souvent celui que l'on se doit à soi-même : pour ce que l'on a fait, ce que l'on n'a pas su faire, ce que l'on a laissé faire. Cette réconciliation avec soi est centrale, car la dureté que nous portons envers nous-mêmes nourrit la plupart de nos compensations." },
      { k: "h2", t: "Ce qui se libère" },
      { k: "p", t: "Quand la rancœur est enfin déposée, une énergie considérable se libère — celle qui restait figée à maintenir la blessure ouverte. On ne retrouve pas l'innocence du passé, mais on retrouve la pleine disponibilité du présent. Pardonner, ce n'est pas refermer une porte sur ce qui s'est passé : c'est enfin cesser de la tenir." },
    ],
  },
  {
    slug: "cultiver-lordre-interieur",
    categorie: "Équilibre de vie",
    titre: "Cultiver l'ordre intérieur : pourquoi la transformation ne tient pas sans structure",
    titreLead: "Cultiver l'ordre intérieur :",
    titreAccent: "la structure qui fait tenir le changement.",
    extrait:
      "On peut comprendre ses blocages en profondeur, et voir pourtant tout se déliter dans le quotidien. Sans ordre intérieur, aucune transformation ne dure. Comment ancrer ce qui a été compris.",
    date: "22 mai 2026",
    dateISO: "2026-05-22",
    lecture: "7 min",
    image: "/blog/cultiver-lordre-interieur-cover.jpg",
    lede:
      "Comprendre ses blessures, c'est une chose. Remettre de l'ordre dans son quotidien pour que le changement tienne dans la durée, c'en est une autre. C'est souvent là que tout se joue.",
    content: [
      { k: "h2", t: "Comprendre ne suffit pas" },
      { k: "p", t: "Beaucoup de personnes ont énormément compris sur elles-mêmes — lu, analysé, suivi des thérapies — et pourtant rien ne change durablement. Car la prise de conscience, seule, ne transforme pas. Entre comprendre et vivre, il y a un pont : la structure du quotidien. Sans elle, la plus belle réalisation s'évapore dès que la vie reprend son rythme." },
      { k: "p", t: "C'est une désillusion fréquente : on sort d'un stage, d'une lecture, d'un moment de clarté, transformé — et trois semaines plus tard, les anciens automatismes ont repris toute la place. Ce n'est pas que la prise de conscience était fausse. C'est qu'elle n'avait nulle part où s'ancrer." },
      { k: "h2", t: "Le désordre extérieur reflète le désordre intérieur" },
      { k: "p", t: "Notre environnement et notre rythme sont souvent le miroir de notre état intérieur. Le désordre chronique, la surcharge, le chaos permanent ne sont pas de simples questions de logistique : ils expriment et entretiennent un désordre du dedans. Remettre de l'ordre dans ses journées est une manière très concrète de remettre de l'ordre en soi." },
      { k: "image", src: "/blog/cultiver-lordre-interieur-1.jpg", alt: "Vue aérienne d'une forêt traversée par un chemin", caption: "L'ordre juste n'étouffe pas le vivant : il lui donne une forme où grandir." },
      { k: "quote", t: "Sans structure, la plus belle prise de conscience s'évapore dans le tumulte du quotidien." },
      { k: "h2", t: "L'ordre n'est pas la rigidité" },
      { k: "p", t: "Attention au contresens : l'ordre dont je parle n'est pas la rigidité, ni le contrôle. Le contrôle rigide est même une autre forme de désordre — une crispation de défense. L'ordre véritable est vivant : il respire, il s'ajuste, il évolue. C'est le tuteur qui permet à la plante de grimper, non la cage qui l'enferme." },
      { k: "h2", t: "Ce que l'ordre intérieur permet" },
      { k: "p", t: "Un ordre juste ne bride pas : il libère de l'énergie. Il rend possible ce que la seule volonté ne parvient pas à tenir :" },
      { k: "ul", items: [
        "Ancrer les prises de conscience dans des gestes concrets et répétés.",
        "Protéger votre énergie au lieu de la disperser en mille sollicitations.",
        "Créer la stabilité sur laquelle la transformation peut réellement s'appuyer.",
        "Traverser les tempêtes émotionnelles sans tout perdre à chaque fois.",
      ] },
      { k: "h2", t: "Par où commencer" },
      { k: "p", t: "Il ne s'agit pas d'une réorganisation totale de votre vie, mais de quelques ancrages : un rituel du matin, un temps protégé, un espace rangé, un rythme respecté. Les petites structures, répétées, font davantage que les grandes résolutions. C'est la régularité, et non l'intensité, qui transforme en profondeur." },
      { k: "p", t: "La transformation durable a besoin de deux jambes : la compréhension et la structure. L'une sans l'autre boite. Cultiver l'ordre intérieur, c'est offrir à ce que vous avez compris un sol où, enfin, s'enraciner." },
    ],
  },
  {
    slug: "accompagnement-initiatique-vs-coaching",
    categorie: "La méthode",
    titre: "Accompagnement initiatique : en quoi c'est différent du coaching",
    titreLead: "Accompagnement initiatique :",
    titreAccent: "en quoi c'est différent du coaching.",
    extrait:
      "Coaching, thérapie, développement personnel… et « accompagnement initiatique » ? Ce que recouvre vraiment cette approche qui unit science initiatique, sagesse ancestrale et puissance de l'Eau.",
    date: "15 mai 2026",
    dateISO: "2026-05-15",
    lecture: "8 min",
    image: "/blog/accompagnement-initiatique-vs-coaching-cover.jpg",
    lede:
      "« Est-ce du coaching ? De la thérapie ? » La question revient souvent. La réponse est : ni tout à fait l'un, ni tout à fait l'autre. L'accompagnement initiatique travaille à un autre endroit.",
    content: [
      { k: "h2", t: "Le coaching agit sur le faire" },
      { k: "p", t: "Le coaching est précieux pour ce qu'il est : atteindre un objectif, gagner en performance, structurer un projet, prendre une décision. Il travaille sur le « faire » — comment être plus efficace, comment obtenir un résultat. Il s'adresse à la surface où vous agissez, et c'est très utile." },
      { k: "p", t: "Mais la crise silencieuse, la blessure originelle, la perte de sens ne sont pas des problèmes de « faire ». Aucun objectif, aussi bien posé soit-il, ne comble un vide existentiel. C'est là que le coaching atteint sa limite : il optimise l'action, mais ne touche pas ce qui, en dessous, la gouverne." },
      { k: "h2", t: "L'accompagnement initiatique agit sur l'être" },
      { k: "p", t: "L'initiatique ne cherche pas d'abord à optimiser vos performances : il cherche à vous ramener à qui vous êtes. Il travaille sur ce qui gouverne vos choix en silence — les blessures, les schémas de compensation, l'endroit d'où vous agissez. Il n'ajoute pas une compétence de plus ; il retire ce qui fait obstacle." },
      { k: "image", src: "/blog/accompagnement-initiatique-vs-coaching-1.jpg", alt: "Silhouette en méditation sur un ponton au coucher du soleil", caption: "L'initiatique ne cherche pas à performer plus : il cherche à revenir à l'essentiel." },
      { k: "h2", t: "Trois fondements qui le distinguent" },
      { k: "p", t: "Cette approche repose sur trois fondements rarement réunis, et qui se complètent :" },
      { k: "ul", items: [
        "**La science initiatique** — reconnaître les lois du Vivant et les blessures qui gouvernent, à notre insu, nos choix et nos comportements.",
        "**La sagesse ancestrale** — des savoirs éprouvés du corps, du lien, du rythme et de la nature, bien antérieurs aux approches modernes.",
        "**La puissance transformatrice de l'Eau** — un élément vivant qui garde la mémoire, révèle et transforme.",
      ] },
      { k: "h2", t: "Pourquoi l'Eau ?" },
      { k: "p", t: "Depuis toujours, l'eau accompagne les grands passages de la vie : la naissance, les rituels de purification, les initiations, les renaissances. Dans l'eau chaude, le mental lâche prise, le système nerveux se régule, et ce qui était figé peut enfin se transformer. L'eau permet au corps de relâcher ce que le mental ne peut ni comprendre ni résoudre. Ce n'est pas un outil de plus : c'est une alliée de la transformation." },
      { k: "quote", t: "Le coaching optimise ce que vous faites. L'initiatique transforme la personne qui le fait." },
      { k: "h2", t: "Un chemin d'expérience, pas un discours" },
      { k: "p", t: "L'accompagnement initiatique n'est ni une religion, ni un dogme, ni un système de croyance. C'est un chemin d'expérience, qui invite chacun à explorer la conscience, le sens et la relation à travers son vécu direct. On n'y adhère pas à des idées : on y traverse des expériences qui transforment durablement." },
      { k: "p", t: "Le coaching et l'initiatique ne s'opposent pas — ils ne travaillent simplement pas au même étage. Si vous avez optimisé votre « faire » et que quelque chose, plus bas, demande encore à être entendu, c'est peut-être le signe qu'il est temps de travailler ailleurs : non plus sur ce que vous faites, mais sur qui vous êtes." },
    ],
  },
];

/** Slugs (sitemap + generateStaticParams). */
export const ARTICLE_SLUGS = ARTICLES.map((a) => a.slug);

/** Récupère un article par son slug. */
export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

/** Les N articles les plus récents (section « Journal » de l'accueil). */
export function getRecentArticles(n = 3): Article[] {
  return ARTICLES.slice(0, n);
}
