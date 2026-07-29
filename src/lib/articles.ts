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
