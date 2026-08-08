/**
 * Événements — Cycle des Saisons, jeûne initiatique et accompagnements en ligne.
 * Remplace l'ancien catalogue de formations numériques Chariow.
 *
 * Les contenus sont repris des affiches fournies (public/evenements/) et des
 * pages existantes du site (méthodes V.I.E., AIME, Ki-Zola, Centre HUT).
 *
 * ⚠ À COMPLÉTER — infos absentes des affiches :
 *   · les liens de billetterie directs (le profil Eventbrite n'expose
 *     publiquement aucun événement : `url` pointe vers la page organisateur) ;
 *   · les dates de l'Été, de l'Automne et de l'Hiver ;
 *   · les tarifs des quatre stages ;
 *   · le lieu du Jeûne initiatique d'automne.
 *
 * Chaque événement génère sa page de détail (`/evenements/<slug>`), sauf ceux
 * dont `href` pointe ailleurs — voir `EVENEMENT_SLUGS`.
 */

/** Page organisateur Eventbrite — lien de repli tant que les liens directs manquent. */
export const EVENTBRITE_ORGANISATEUR =
  "https://www.eventbrite.fr/o/domoina-fondatrice-de-la-voie-2-la-conscience-23408392711";

export type Evenement = {
  /** Identifiant d'URL. */
  slug: string;
  /** Page de détail sur le site (interne). */
  href: string;
  /** Titre court affiché sur la carte. */
  titre: string;
  /** Titre long affiché en h1 sur la page de détail. */
  titreLong: string;
  /** Une phrase : ce que la personne vient y chercher. */
  accroche: string;
  /** Thème court affiché en pastille. */
  tag: string;
  /** Date lisible, ex. « 18–21 mars 2026 ». */
  date: string;
  /** Durée ou créneau, ex. « 4 jours ». Optionnel. */
  heure?: string;
  /** Lieu, ex. « Centre HUT, Sarthe (72) ». */
  lieu: string;
  /** Tarif affiché. */
  prix: string;
  /** Lien de billetterie externe. */
  url: string;
  /** Couverture (format Eventbrite 2:1). */
  image: string;
  /** Met la carte en avant (pastille dorée « Prochaine date »). */
  featured?: boolean;
  /** Affiche « Complet » et désactive la réservation. */
  complet?: boolean;
  /** Appartient au Cycle des Saisons (4 stages annuels). */
  cycle?: boolean;
  /** Ordre dans le cycle initiatique (1 = automne). */
  rang?: number;

  /* ── Contenu de la page de détail ── */
  /** Meta description (150–160 caractères). */
  metaDescription: string;
  /** Phrase-manifeste reprise de l'affiche. */
  devise: string;
  /** Paragraphes d'introduction. */
  intro: string[];
  /** Les verbes-clés de l'affiche, explicités. */
  verbes: { mot: string; texte: string }[];
  /** Ce que la personne traverse concrètement. */
  vivrez: { t: string; b: string }[];
  /** À qui ce rendez-vous s'adresse. */
  pourQui: string[];
  /** Questions fréquentes — alimente le JSON-LD FAQPage. */
  faq: { q: string; a: string }[];
};

const CENTRE_HUT = "Centre HUT, Sarthe (72)";

export const EVENEMENTS: Evenement[] = [
  {
    slug: "jeune-initiatique-automne",
    href: "/evenements/jeune-initiatique-automne",
    titre: "Jeûne initiatique d'automne",
    titreLong: "Jeûne initiatique d'automne",
    accroche:
      "Purifier le corps, faire le vide, clarifier ses intentions — et poser les bases d'une année initiatique alignée.",
    tag: "Jeûne initiatique",
    date: "Automne 2026 · dates à confirmer",
    lieu: "Lieu à préciser",
    prix: "Tarif sur demande",
    url: EVENTBRITE_ORGANISATEUR,
    image: "/evenements/jeune-automne.png",
    // Rattaché au cycle : l'affiche Printemps annonce « troisième stage du CDS »,
    // ce qui place l'Automne en premier des quatre. À confirmer avec Domoïna.
    cycle: true,
    rang: 1,
    metaDescription:
      "Jeûne initiatique d'automne avec Domoïna : purifier le corps, clarifier ses intentions et préparer une nouvelle année du Vivant. Places limitées.",
    devise: "Préparer le corps pour accueillir une nouvelle année du Vivant.",
    intro: [
      "L'automne est la saison du dépouillement. L'arbre ne perd pas ses feuilles par accident : il retire sa sève, cesse de nourrir ce qui n'a plus lieu d'être, et concentre sa vie sur l'essentiel. Le jeûne initiatique fait exactement cela avec vous.",
      "Ce n'est pas une cure de détox de plus, ni une performance. C'est un passage. En allégeant le corps, on allège aussi ce que le mental n'arrivait plus à trier : les priorités devenues automatiques, les engagements pris par habitude, les liens qui pèsent sans qu'on ose le dire.",
      "Ce que le jeûne rend possible, c'est un silence rare — celui où l'on entend enfin ses véritables intentions, et non celles que l'on s'est imposées.",
    ],
    verbes: [
      { mot: "Purifier", texte: "Éliminer les toxines et alléger le corps en profondeur." },
      { mot: "Clarifier", texte: "Faire le vide pour entendre vos véritables intentions." },
      { mot: "Préparer", texte: "Poser les bases d'une année initiatique alignée." },
    ],
    vivrez: [
      { t: "Un jeûne encadré", b: "Un protocole progressif, accompagné pas à pas — descente, jeûne, reprise alimentaire. Vous n'êtes jamais seul·e face à votre corps." },
      { t: "Le silence comme outil", b: "Des temps de silence structurés, où l'agitation retombe et où ce qui compte vraiment remonte à la surface." },
      { t: "La pose des intentions", b: "Un travail écrit et parlé pour formuler ce que vous voulez voir naître dans l'année qui vient — et ce que vous acceptez de laisser derrière." },
      { t: "Un groupe restreint", b: "Un cercle intime, uni et sécurisé. Ce que l'on traverse ensemble ne se traverse pas de la même manière seul." },
    ],
    pourQui: [
      "Vous sentez que votre corps réclame une pause que votre agenda ne lui accorde jamais.",
      "Vous entamez une nouvelle année et vous voulez qu'elle démarre autrement que la précédente.",
      "Vous rejoignez le Cycle des Saisons et vous souhaitez y entrer le terrain déjà préparé.",
    ],
    faq: [
      { q: "Faut-il avoir déjà jeûné pour participer ?", a: "Non. Le protocole est progressif et encadré du début à la fin. Les personnes qui n'ont jamais jeûné sont accompagnées avec une attention particulière lors de la descente alimentaire et de la reprise." },
      { q: "Le jeûne initiatique fait-il partie du Cycle des Saisons ?", a: "Il en est la porte d'entrée naturelle : il prépare le corps et l'intention avant l'entrée dans le cycle des quatre stages. Il peut aussi se vivre seul, indépendamment du cycle." },
      { q: "Y a-t-il un suivi médical ?", a: "Un échange préalable permet de vérifier que le jeûne est adapté à votre situation. Certaines conditions de santé le contre-indiquent : parlons-en avant votre inscription." },
    ],
  },
  {
    slug: "hiver-rencontrer",
    href: "/evenements/hiver-rencontrer",
    titre: "Hiver — Rencontrer",
    titreLong: "Hiver — Rencontrer ses racines, sa mémoire, sa vérité",
    accroche:
      "Descendre, comprendre, transmettre : rencontrer ses racines, sa mémoire, sa vérité.",
    tag: "Cycle des Saisons",
    date: "Hiver 2026–2027 · dates à confirmer",
    lieu: CENTRE_HUT,
    prix: "Tarif sur demande",
    url: EVENTBRITE_ORGANISATEUR,
    image: "/evenements/stage-hiver.png",
    cycle: true,
    rang: 2,
    metaDescription:
      "Stage Hiver du Cycle des Saisons au Centre HUT : descendre à ses racines, comprendre sa mémoire familiale et transmettre autrement. Groupe intime.",
    devise: "Rencontrer ses racines, sa mémoire, sa vérité.",
    intro: [
      "L'hiver ne produit rien. C'est précisément sa force. Sous la terre gelée, l'arbre travaille — mais il travaille en profondeur, là où personne ne regarde. Le stage Hiver vous emmène à cet endroit-là.",
      "C'est la descente. Celle que la plupart des parcours de développement personnel évitent parce qu'elle ne promet pas de résultat immédiat. On y rencontre ce qui a été transmis avant nous : les loyautés familiales, les silences, les récits qu'on s'est racontés pour tenir.",
      "Comprendre n'est pas ressasser. Il ne s'agit pas d'accuser une histoire, mais de la regarder assez longtemps pour cesser d'être agi par elle. C'est à ce moment-là que la transmission peut changer de sens — et que ce que vous avez reçu peut devenir ce que vous choisissez de donner.",
    ],
    verbes: [
      { mot: "Descendre", texte: "Aller sous la surface, là où les schémas prennent racine." },
      { mot: "Comprendre", texte: "Relier votre histoire à ce qu'elle produit aujourd'hui, sans complaisance ni accusation." },
      { mot: "Transmettre", texte: "Choisir ce que vous laissez derrière — et ce que vous transmettez désormais." },
    ],
    vivrez: [
      { t: "Le rituel de l'eau", b: "La Voie Initiatique de l'Eau : dans l'eau chaude, le mental lâche prise, le système nerveux se régule, et ce qui était figé peut enfin se déplacer." },
      { t: "Le travail sur la lignée", b: "Cartographier ce qui vous a été transmis — les forces comme les fardeaux — et distinguer ce qui vous appartient de ce qui ne vous appartient pas." },
      { t: "La parole en cercle", b: "Dire devant témoins ce qui n'a jamais été dit. Le cercle tient ce que l'on ne peut pas porter seul." },
      { t: "Le silence habité", b: "Des temps sans production ni performance, où l'on cesse de faire pour commencer à entendre." },
    ],
    pourQui: [
      "Vous comprenez très bien votre histoire — et vous reproduisez pourtant les mêmes schémas.",
      "Vous portez quelque chose de familial dont vous n'avez jamais trouvé les mots.",
      "Vous voulez transmettre autre chose à vos enfants ou à vos équipes que ce que vous avez reçu.",
    ],
    faq: [
      { q: "Faut-il faire les quatre stages du Cycle des Saisons ?", a: "Le cycle est conçu comme une progression : chaque saison prépare la suivante. Il reste possible de rejoindre le cycle à l'Hiver, qui en constitue la descente fondatrice — parlons-en lors de l'appel préalable." },
      { q: "Le rituel de l'eau est-il obligatoire ?", a: "Il fait partie intégrante du stage, mais rien n'est imposé. Chacun avance à son rythme, et savoir nager n'est pas nécessaire : l'eau est chaude, peu profonde, et le groupe est encadré." },
      { q: "Combien de personnes dans le groupe ?", a: "Les stages se vivent en groupe intime et sécurisé. Le nombre volontairement restreint permet à chacun d'être vu, entendu et accompagné individuellement." },
    ],
  },
  {
    slug: "printemps-manifester",
    href: "/evenements/printemps-manifester",
    titre: "Printemps — Manifester",
    titreLong: "Printemps — Manifester ce qui veut naître",
    accroche:
      "Émerger, incarner, oser, rayonner : manifester ce qui veut naître, ce que vous êtes devenu·e. Troisième stage du CDS 2026–2027.",
    tag: "Cycle des Saisons",
    // ⚠ Date lue sur l'affiche : « 18–21 MARS 2026 (+ option J0 & J+1) ».
    // Elle est déjà passée et contredit la mention « CDS 2026–2027 » —
    // à confirmer (mars 2027 ?).
    date: "18–21 mars 2026 (+ option J0 & J+1)",
    heure: "4 jours",
    lieu: CENTRE_HUT,
    prix: "Tarif sur demande",
    url: EVENTBRITE_ORGANISATEUR,
    image: "/evenements/stage-printemps.png",
    cycle: true,
    rang: 3,
    metaDescription:
      "Stage Printemps du Cycle des Saisons au Centre HUT (Sarthe) : émerger, incarner, oser, rayonner. 4 jours en groupe intime pour manifester ce qui veut naître.",
    devise: "Le printemps ne demande pas la permission d'éclore. Il éclot.",
    intro: [
      "Après la descente, l'émergence. Après le silence, votre voix. Le stage Printemps est le moment où ce qui a été compris en profondeur pendant l'hiver cherche à prendre forme dans le réel.",
      "C'est la saison la plus exigeante du cycle, parce qu'elle demande de sortir. De montrer. D'oser une parole, une décision, une direction — alors même que tout n'est pas encore parfaitement clair. Le printemps n'attend pas d'avoir toutes les garanties pour éclore.",
      "Ces quatre jours ne servent pas à fabriquer un plan d'action de plus. Ils servent à vérifier, dans le corps et devant témoins, que ce que vous êtes devenu·e tient debout — et à faire le premier geste concret qui l'engage.",
    ],
    verbes: [
      { mot: "Émerger", texte: "Sortir de la réserve de l'hiver et laisser apparaître ce qui a mûri." },
      { mot: "Incarner", texte: "Faire descendre dans le corps et dans les actes ce qui n'était encore qu'une compréhension." },
      { mot: "Oser", texte: "Poser le geste, dire la phrase, prendre la décision que vous repoussez." },
      { mot: "Rayonner", texte: "Assumer votre présence sans la justifier ni la diminuer." },
    ],
    vivrez: [
      { t: "Quatre jours en immersion", b: "Du 18 au 21, avec une option J0 & J+1 pour arriver posé·e et repartir sans rupture brutale avec le quotidien." },
      { t: "Le rituel de l'eau", b: "L'eau comme alliée du passage : elle révèle, elle relâche, elle transforme ce que le mental ne peut ni comprendre ni résoudre." },
      { t: "Le passage devant le groupe", b: "Un moment où l'on prend la parole et la place — le cercle fait office de témoin, et ce qui est dit devant lui engage." },
      { t: "L'ancrage dans le réel", b: "Repartir avec un acte identifié, daté, engageant. Pas une intention : un geste." },
    ],
    pourQui: [
      "Vous savez ce que vous devez faire depuis des mois — et vous ne le faites pas.",
      "Quelque chose a bougé en profondeur et vous cherchez comment le rendre visible dans votre vie et votre travail.",
      "Vous poursuivez le Cycle des Saisons après l'Hiver et vous entrez dans son troisième temps.",
    ],
    faq: [
      { q: "Que recouvre l'option J0 & J+1 ?", a: "J0 permet d'arriver la veille pour se poser avant l'ouverture du stage. J+1 offre une journée d'atterrissage après la clôture, pour ne pas retourner brutalement au quotidien. Les deux sont facultatives." },
      { q: "Puis-je rejoindre le cycle directement au Printemps ?", a: "Le Printemps est le troisième stage du cycle et s'appuie sur le travail des saisons précédentes. Une entrée directe se discute au cas par cas lors de l'appel préalable." },
      { q: "Où se déroule le stage ?", a: "Au Centre HUT, en Sarthe (72), à environ une heure de Paris. Le lieu, sa nature préservée et son bassin font partie intégrante du dispositif." },
    ],
  },
  {
    slug: "ete-rayonner",
    href: "/evenements/ete-rayonner",
    titre: "Été — Rayonner",
    titreLong: "Été — Rayonner pleinement ce que vous êtes devenu·e",
    accroche:
      "Élever, incarner, rayonner : célébrer et vivre le Ki-Zola, pleinement ce que vous êtes devenu·e.",
    tag: "Cycle des Saisons",
    date: "Été 2027 · dates à confirmer",
    lieu: CENTRE_HUT,
    prix: "Tarif sur demande",
    url: EVENTBRITE_ORGANISATEUR,
    image: "/evenements/stage-ete.png",
    cycle: true,
    rang: 4,
    metaDescription:
      "Stage Été du Cycle des Saisons au Centre HUT : élever, incarner, rayonner. Célébrer le chemin parcouru et vivre le Ki-Zola en groupe intime.",
    devise: "Rayonner pleinement ce que tu es devenu(e).",
    intro: [
      "L'été est la saison de la plénitude. Rien n'est en train de se préparer : tout est là, visible, mûr. Le quatrième stage du cycle ne cherche donc pas à ajouter un travail de plus — il vient reconnaître ce qui a été traversé.",
      "Célébrer n'est pas un supplément décoratif. C'est un acte structurant, et probablement celui que les personnes très performantes savent le moins faire. On enchaîne, on passe au suivant, on ne s'arrête jamais assez longtemps pour laisser le corps enregistrer que quelque chose a effectivement changé.",
      "C'est aussi le moment du Ki-Zola : l'énergie vécue en collectif, autour du feu, de la table et du cercle. Ce qui se transmet là ne passe pas par les mots.",
    ],
    verbes: [
      { mot: "Élever", texte: "Passer de la transformation personnelle à ce qu'elle rend possible autour de vous." },
      { mot: "Incarner", texte: "Habiter durablement la place que vous avez reconquise." },
      { mot: "Rayonner", texte: "Laisser votre équilibre produire ses effets — sans le fabriquer." },
    ],
    vivrez: [
      { t: "La célébration", b: "Reconnaître, nommer et marquer ce qui a été traversé pendant l'année. Un temps que rien ne remplace." },
      { t: "Le Ki-Zola", b: "L'énergie du collectif : le feu, la table partagée, le cercle. Ce qui circule là ancre plus que n'importe quel enseignement." },
      { t: "La relecture du cycle", b: "Revenir sur les quatre saisons pour voir le chemin dans son ensemble — et ce qu'il ouvre pour l'année suivante." },
      { t: "Un groupe devenu cercle", b: "Après une année, le groupe n'est plus un groupe. C'est ce qui rend l'été si particulier." },
    ],
    pourQui: [
      "Vous achevez le Cycle des Saisons et vous voulez en récolter les fruits plutôt que passer au suivant.",
      "Vous savez avancer mais vous ne savez pas vous arrêter, ni reconnaître ce que vous avez accompli.",
      "Vous cherchez à faire de votre transformation quelque chose qui profite aussi à votre entourage et à vos équipes.",
    ],
    faq: [
      { q: "Qu'est-ce que le Ki-Zola ?", a: "C'est l'une des approches portées par La Voie 2 la Conscience : une pratique de l'énergie vécue en collectif, où le lien, le feu et le partage font le travail que la parole seule ne peut pas faire." },
      { q: "L'Été est-il accessible sans avoir fait le cycle ?", a: "L'Été referme une année de travail et prend tout son sens dans cette continuité. Une participation isolée se discute lors de l'appel préalable." },
      { q: "Faut-il prévoir quelque chose de particulier ?", a: "Le nécessaire vous est communiqué avant le stage. L'essentiel tient en peu de choses : de quoi être dehors, de quoi être dans l'eau, et de la disponibilité." },
    ],
  },
  {
    slug: "canal-des-reves",
    href: "/canal-des-reves",
    titre: "Canal des Rêves — analyse de rêves en groupe",
    titreLong: "Canal des Rêves — l'analyse de rêves en groupe",
    accroche:
      "Vos rêves sont des messages. Un groupe privé pour apprendre à les décoder, avec analyses et conseils personnalisés.",
    tag: "Rêves & symbolique",
    date: "Ouvert toute l'année",
    lieu: "En ligne · groupe Telegram privé",
    prix: "60 € par mois",
    url: "mailto:serviceclientsv2c@gmail.com?subject=Canal%20des%20R%C3%AAves%20%E2%80%94%20r%C3%A9server%20ma%20place",
    image: "/evenements/canal-des-reves.png",
    metaDescription:
      "Canal des Rêves : analyse de rêves en groupe sur Telegram avec Domoïna. Décodez vos rêves, recevez des analyses personnalisées. 60 € par mois.",
    devise: "Vos rêves sont des messages. Écoutez-les. Ils vous guident.",
    intro: [
      "Un rêve n'est pas un bruit de fond nocturne. C'est une langue — celle par laquelle une part de vous dit ce que votre conscience diurne ne parvient pas encore à formuler. Le problème n'est pas que vos rêves soient muets : c'est que personne ne vous a appris à les lire.",
      "Le Canal des Rêves est un espace d'apprentissage continu, hébergé dans un groupe Telegram privé. Vous y déposez vos rêves, vous recevez des analyses, et surtout vous apprenez progressivement la grammaire symbolique qui vous permettra de les décoder vous-même.",
      "Ce qui se joue là dépasse la curiosité. Un rêve récurrent signale presque toujours un point de blocage réel — et le comprendre, c'est souvent débloquer ce qui résistait ailleurs.",
    ],
    verbes: [
      { mot: "Explorer", texte: "Déposer vos rêves dans un espace sûr et apprendre à les observer sans les interpréter trop vite." },
      { mot: "Comprendre", texte: "Décoder les symboles, les récurrences et ce qu'ils disent de votre situation actuelle." },
      { mot: "Transformer", texte: "Faire du message onirique une décision concrète dans votre vie éveillée." },
    ],
    vivrez: [
      { t: "Un groupe privé Telegram", b: "Un espace fermé, confidentiel et bienveillant, accessible à votre rythme depuis votre téléphone." },
      { t: "Des analyses personnalisées", b: "Vos rêves lus et travaillés, avec des conseils adaptés à votre situation — pas des interprétations génériques de dictionnaire." },
      { t: "Des partages et échanges", b: "Lire le travail des autres apprend autant que le sien. Les symboles se répondent d'un rêveur à l'autre." },
      { t: "Ouvert toute l'année", b: "Aucun calendrier à suivre : vous entrez quand vous êtes prêt·e et vous avancez à votre rythme." },
    ],
    pourQui: [
      "Vous faites des rêves récurrents ou marquants dont vous sentez qu'ils veulent dire quelque chose.",
      "Vous voulez un accompagnement régulier et accessible, sans bloquer plusieurs jours dans votre agenda.",
      "Vous cheminez déjà avec La Voie 2 la Conscience et vous cherchez un fil continu entre deux rendez-vous.",
    ],
    faq: [
      { q: "Comment se passe l'accès ?", a: "L'accompagnement se déroule dans un groupe Telegram privé. Après votre inscription, vous recevez le lien d'accès et vous pouvez déposer votre premier rêve immédiatement." },
      { q: "Mes rêves restent-ils confidentiels ?", a: "Le groupe est fermé et l'espace est sécurisé. Ce qui s'y partage n'en sort pas — c'est la condition pour que chacun puisse déposer ce qu'il a réellement rêvé." },
      { q: "Puis-je arrêter quand je veux ?", a: "L'accès fonctionne au mois. Vous restez le temps qui vous est utile, sans engagement de durée." },
      { q: "Faut-il se souvenir de tous ses rêves ?", a: "Non, et c'est même rarement le cas au début. Se souvenir de ses rêves est une capacité qui se réveille avec la pratique — c'est l'une des premières choses que le groupe travaille." },
    ],
  },
];

/** Slugs des événements qui ont leur page sous /evenements/<slug>. */
export const EVENEMENT_SLUGS = EVENEMENTS.filter((e) =>
  e.href.startsWith("/evenements/"),
).map((e) => e.slug);

export function getEvenement(slug: string): Evenement | undefined {
  return EVENEMENTS.find((e) => e.slug === slug);
}

/** Les quatre stages du Cycle des Saisons, dans l'ordre initiatique. */
export const CYCLE_SAISONS = EVENEMENTS.filter((e) => e.cycle).sort(
  (a, b) => (a.rang ?? 0) - (b.rang ?? 0),
);
