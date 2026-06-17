/**
 * Source UNIQUE des articles du blog.
 *
 * Utilisée par :
 *   - src/app/blog/page.tsx          (liste des articles)
 *   - src/app/blog/[slug]/page.tsx   (article détaillé)
 *   - src/app/sitemap.ts             (slugs du sitemap)
 *   - src/app/page.tsx               (section « Journal » de l'accueil)
 *
 * NOTE — Les textes des articles sont une PREMIÈRE RÉDACTION dans la voix de
 * la marque, à relire/ajuster par Domoina. Pour modifier un article, éditez
 * simplement le tableau `content` ci-dessous : tout le site se met à jour.
 *
 * Format du contenu (`content`) — un tableau de blocs :
 *   { k: "p",     t: "..." }            paragraphe (gras avec **texte**)
 *   { k: "h2",    t: "..." }            titre de section
 *   { k: "quote", t: "..." }            citation mise en exergue
 *   { k: "ul",    items: ["...", ...] } liste à puces
 */

export type Block =
  | { k: "p"; t: string }
  | { k: "h2"; t: string }
  | { k: "quote"; t: string }
  | { k: "ul"; items: string[] };

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
  /** Paragraphe d'introduction, en serif. */
  lede: string;
  content: Block[];
};

export const ARTICLES: Article[] = [
  {
    slug: "blessures-originelles-transformation",
    categorie: "Transformation",
    titre: "Pourquoi vos blessures sont vos plus grands atouts",
    titreLead: "Pourquoi vos blessures sont vos plus grands",
    titreAccent: "atouts.",
    extrait:
      "Ce que nous croyons devoir cacher — nos failles, nos peurs, nos blessures originelles — est souvent la source de notre puissance la plus profonde. Voici comment opérer ce retournement fondamental.",
    date: "12 mai 2026",
    dateISO: "2026-05-12",
    lecture: "8 min",
    lede:
      "Ce que nous croyons devoir cacher — nos failles, nos peurs, nos blessures originelles — est souvent la source de notre puissance la plus profonde.",
    content: [
      {
        k: "p",
        t: "Depuis des années que j’accompagne des dirigeants, des thérapeutes et des cadres en quête de sens, j’observe un paradoxe constant : les personnes les plus accomplies en apparence sont souvent celles qui portent les blessures les plus profondes. Et c’est précisément pour cela qu’elles ont bâti autant — comme pour compenser, prouver, s’élever au-dessus de quelque chose d’indicible.",
      },
      { k: "h2", t: "La blessure comme moteur" },
      {
        k: "p",
        t: "Le problème n’est pas la blessure elle-même. C’est le fait qu’elle reste dans l’ombre, non reconnue, non intégrée. Dans cet état, elle dirige notre vie à notre insu — guidant nos décisions, colorant nos relations, dictant nos peurs et nos élans.",
      },
      {
        k: "p",
        t: "Mais quand elle est regardée en face, acceptée dans toute sa profondeur, puis intégrée — la blessure se transforme. Elle devient la source d’une empathie rare, d’une intuition aiguisée, d’une résilience que rien d’autre n’aurait pu forger.",
      },
      {
        k: "quote",
        t: "La blessure non intégrée nous gouverne. La blessure transformée nous libère.",
      },
      { k: "h2", t: "Les cinq blessures originelles" },
      {
        k: "p",
        t: "La tradition initiatique en reconnaît cinq : le rejet, l’abandon, l’humiliation, la trahison et l’injustice. Chacune façonne un masque derrière lequel nous nous protégeons. Reconnaître son masque, c’est déjà commencer à s’en libérer.",
      },
      {
        k: "ul",
        items: [
          "Le rejet engendre la fuite — et, transformé, la capacité à créer son propre espace.",
          "L’abandon engendre la dépendance — et, transformé, une présence rare à l’autre.",
          "La trahison engendre le contrôle — et, transformé, un leadership qui sait faire confiance.",
        ],
      },
      { k: "h2", t: "Le Parcours AIME : un chemin concret" },
      {
        k: "p",
        t: "C’est de cette conviction que le Parcours AIME est né : **Accepter, Intégrer, Manifester, Élever**. Pas une approche théorique, mais un chemin vécu, corporel, qui engage l’être entier.",
      },
      {
        k: "p",
        t: "L’acceptation n’est pas la résignation. C’est le courage de regarder ce qui est vraiment là, sans le fuir, sans l’embellir. C’est le premier pas — et souvent le plus difficile. Mais c’est aussi celui qui ouvre tous les autres.",
      },
    ],
  },
  {
    slug: "eau-element-guerison",
    categorie: "Méthode V.I.E.",
    titre: "L'eau comme élément de guérison : ce que la science dit",
    titreLead: "L’eau comme élément de guérison :",
    titreAccent: "ce que la science dit.",
    extrait:
      "De la mémoire de l'eau aux études sur l'hydrothérapie, les preuves scientifiques s'accumulent autour de la puissance thérapeutique de l'eau. Découvrez les fondements de la méthode V.I.E.",
    date: "28 avril 2026",
    dateISO: "2026-04-28",
    lecture: "12 min",
    lede:
      "De la réponse au froid aux pratiques d’immersion rituelle, l’eau accompagne l’humanité dans ses passages les plus intimes. La méthode V.I.E. en fait un véritable outil de transformation.",
    content: [
      {
        k: "p",
        t: "Nous sommes faits d’eau à près de soixante pour cent. Avant même de respirer l’air, nous avons vécu neuf mois dans un milieu liquide. L’eau n’est pas seulement autour de nous : elle est notre première mémoire, notre premier langage.",
      },
      { k: "h2", t: "Ce que dit la science" },
      {
        k: "p",
        t: "La recherche contemporaine confirme ce que les traditions savaient depuis toujours. L’immersion en eau fraîche active le nerf vague, ralentit le rythme cardiaque et fait basculer le système nerveux du mode « alerte » au mode « récupération ». Les travaux sur l’hydrothérapie, la cohérence cardiaque et la réponse au froid documentent des effets mesurables sur le stress, l’inflammation et l’humeur.",
      },
      {
        k: "p",
        t: "L’eau agit aussi par sa simple présence : le bruit d’une source, le rythme des vagues, la sensation du courant sur la peau ramènent l’attention dans le corps et dans l’instant — là où toute transformation devient possible.",
      },
      {
        k: "quote",
        t: "On ne traverse jamais deux fois la même eau. C’est pourtant toujours en elle que l’on se retrouve.",
      },
      { k: "h2", t: "La Voie Initiatique de l’Eau" },
      {
        k: "p",
        t: "La méthode V.I.E. ne se contente pas d’utiliser l’eau comme un décor apaisant. Elle en fait un partenaire de travail, à travers cinq pratiques complémentaires :",
      },
      {
        k: "ul",
        items: [
          "La purification — se déposer, laisser partir ce qui n’est plus à porter.",
          "Les immersions rituelles — franchir un seuil, marquer un passage dans le corps.",
          "Le travail respiratoire — relier le souffle au mouvement de l’eau.",
          "La mémoire de l’eau — laisser remonter ce que le corps a gardé.",
          "La méditation aquatique — retrouver le silence d’avant les mots.",
        ],
      },
      { k: "h2", t: "Une pratique, pas une croyance" },
      {
        k: "p",
        t: "Il n’est pas nécessaire d’adhérer à une théorie pour ressentir ce que l’eau opère. Il suffit d’entrer dedans, attentivement, accompagné. Le reste se passe à un niveau que le mental ne contrôle pas — et c’est précisément là que se joue l’essentiel.",
      },
    ],
  },
  {
    slug: "diriger-authenticite",
    categorie: "Leadership",
    titre: "Diriger avec authenticité : la nouvelle compétence du XXIe siècle",
    titreLead: "Diriger avec authenticité : la nouvelle compétence",
    titreAccent: "du XXIᵉ siècle.",
    extrait:
      "Les dirigeants les plus efficaces ne sont pas ceux qui ont le plus de certitudes, mais ceux qui ont le courage d'être profondément eux-mêmes. Une réflexion sur l'authenticité comme puissance.",
    date: "14 avril 2026",
    dateISO: "2026-04-14",
    lecture: "10 min",
    lede:
      "Les dirigeants les plus efficaces ne sont pas ceux qui ont le plus de certitudes, mais ceux qui ont le courage d’être profondément eux-mêmes.",
    content: [
      {
        k: "p",
        t: "Pendant longtemps, diriger a signifié projeter une image : la maîtrise, l’assurance, la réponse à tout. Une génération entière de leaders a appris à séparer la personne du rôle, quitte à porter un masque du matin au soir. Le coût de cette scission, on le mesure aujourd’hui : épuisement, perte de sens, solitude au sommet.",
      },
      { k: "h2", t: "L’autorité ne vient plus du masque" },
      {
        k: "p",
        t: "Les équipes d’aujourd’hui ne suivent plus une fonction ; elles suivent une présence. Elles repèrent en quelques instants ce qui sonne faux. À l’inverse, un dirigeant qui assume ses doutes, ses limites et ses valeurs crée autour de lui une sécurité rare — celle qui autorise chacun à donner le meilleur.",
      },
      {
        k: "quote",
        t: "On ne peut pas demander à ses équipes une vérité que l’on ne s’autorise pas à soi-même.",
      },
      { k: "h2", t: "Authenticité n’est pas transparence totale" },
      {
        k: "p",
        t: "Être authentique ne veut pas dire tout dire, ni se livrer sans filtre. Cela signifie être **aligné** : que les actes, la parole et l’intérieur racontent la même histoire. Cet alignement ne se décrète pas — il se travaille, souvent en partant des zones que l’on évite le plus.",
      },
      { k: "h2", t: "Le retour intérieur comme compétence" },
      {
        k: "p",
        t: "C’est pour cela que de plus en plus de dirigeants entreprennent un travail initiatique. Non pour « performer mieux », mais pour habiter pleinement la place qu’ils occupent. Quand le dedans et le dehors cessent de se contredire, l’énergie cesse de fuir — et le leadership devient enfin soutenable.",
      },
      {
        k: "p",
        t: "L’authenticité est la compétence du siècle parce qu’elle ne s’imite pas. On peut copier une stratégie, jamais une présence.",
      },
    ],
  },
  {
    slug: "cycle-saisons-rythmes-naturels",
    categorie: "Cycle des Saisons",
    titre: "Retrouver ses rythmes naturels dans un monde qui s'accélère",
    titreLead: "Retrouver ses rythmes naturels dans un monde",
    titreAccent: "qui s’accélère.",
    extrait:
      "Nous vivons en décalage permanent avec nos cycles naturels. Cette rupture est à l'origine de nombreux épuisements et pertes de sens. Le Cycle des Saisons propose un autre rapport au temps.",
    date: "1er avril 2026",
    dateISO: "2026-04-01",
    lecture: "7 min",
    lede:
      "Nous vivons en décalage permanent avec nos cycles naturels. Cette rupture est à l’origine de bien des épuisements — et le Cycle des Saisons propose un autre rapport au temps.",
    content: [
      {
        k: "p",
        t: "Le monde moderne ne connaît qu’une saison : l’été permanent. Toujours produire, toujours croître, toujours être disponible. Or aucun être vivant ne fonctionne ainsi. La nature, elle, alterne : elle se repose, s’éveille, déploie, puis se dépouille.",
      },
      { k: "h2", t: "Quatre temps, un même mouvement" },
      {
        k: "p",
        t: "Le Cycle des Saisons propose de réapprendre ce rythme en quatre temps, et de le reconnaître en soi :",
      },
      {
        k: "ul",
        items: [
          "L’hiver — le repos, l’introspection, le vide nécessaire avant tout renouveau.",
          "Le printemps — l’éveil, les premières intentions, l’élan encore fragile.",
          "L’été — l’expansion, la pleine puissance, la mise au monde.",
          "L’automne — le bilan, la gratitude, le lâcher-prise de ce qui doit partir.",
        ],
      },
      {
        k: "p",
        t: "Aucune de ces saisons n’est meilleure qu’une autre. Vouloir un printemps perpétuel épuise autant que craindre l’hiver.",
      },
      {
        k: "quote",
        t: "On ne reproche pas à un arbre de perdre ses feuilles. Pourquoi se le reprocher à soi-même ?",
      },
      { k: "h2", t: "Faire la paix avec ses hivers" },
      {
        k: "p",
        t: "La plupart des personnes que j’accompagne arrivent en plein hiver intérieur — souvent en le confondant avec une panne ou un échec. Or l’hiver n’est pas l’absence de vie : c’est la vie qui travaille en profondeur, hors de vue. L’accompagner plutôt que le combattre change tout.",
      },
      {
        k: "p",
        t: "Retrouver ses rythmes naturels, ce n’est pas ralentir par principe. C’est cesser de lutter contre le mouvement du vivant — et y puiser, enfin, une énergie qui dure.",
      },
    ],
  },
  {
    slug: "parcours-aime-comment-ca-fonctionne",
    categorie: "Méthode AIME",
    titre: "Le Parcours AIME : comment fonctionne la transformation en 4 phases",
    titreLead: "Le Parcours AIME : comment fonctionne la transformation",
    titreAccent: "en 4 phases.",
    extrait:
      "Accepter, Intégrer, Manifester, Élever. Derrière ces quatre mots se cache une architecture précise de la transformation. Plongée dans les mécanismes du Parcours AIME.",
    date: "15 mars 2026",
    dateISO: "2026-03-15",
    lecture: "9 min",
    lede:
      "Accepter, Intégrer, Manifester, Élever. Derrière ces quatre mots se cache une architecture précise de la transformation.",
    content: [
      {
        k: "p",
        t: "Beaucoup d’approches de développement personnel proposent de « passer à l’action » sans avoir traversé ce qui précède l’action. On veut manifester avant d’avoir intégré, élever avant d’avoir accepté. Le Parcours AIME suit l’ordre du vivant — chaque phase autorise la suivante.",
      },
      { k: "h2", t: "A — Accepter" },
      {
        k: "p",
        t: "Tout commence par le courage de voir ce qui est, sans le fuir ni l’embellir. Accepter n’est ni approuver ni se résigner : c’est cesser de dépenser son énergie à nier la réalité. Ce premier pas, le plus inconfortable, libère déjà une force considérable.",
      },
      { k: "h2", t: "I — Intégrer" },
      {
        k: "p",
        t: "Ce qui est accepté doit ensuite être digéré. L’intégration est un travail du corps autant que de l’esprit : c’est là que l’eau, le souffle et le temps long font leur œuvre. On ne pense pas une blessure pour la résoudre ; on la traverse.",
      },
      { k: "h2", t: "M — Manifester" },
      {
        k: "p",
        t: "Vient alors le moment de créer consciemment. Non plus depuis la compensation ou la peur, mais depuis un centre clarifié. Ce que l’on manifeste à cette étape porte une autre qualité : c’est juste, sobre, durable.",
      },
      { k: "h2", t: "É — Élever" },
      {
        k: "p",
        t: "Enfin, ce qui a été traversé se met au service de plus grand que soi. Élever, c’est transmettre, rayonner, redonner. La transformation cesse d’être un projet personnel pour devenir une contribution.",
      },
      {
        k: "quote",
        t: "On ne s’élève jamais en sautant les étapes. On s’élève en les traversant.",
      },
      {
        k: "p",
        t: "Ces quatre phases ne sont pas linéaires une fois pour toutes : on les reparcourt à chaque seuil de la vie, à des profondeurs nouvelles. AIME n’est pas une destination — c’est une manière de marcher.",
      },
    ],
  },
  {
    slug: "burnout-opportunite-renaissance",
    categorie: "Transformation",
    titre: "Le burnout comme porte d'entrée vers une vie plus vraie",
    titreLead: "Le burnout comme porte d’entrée",
    titreAccent: "vers une vie plus vraie.",
    extrait:
      "Souvent vécu comme une catastrophe, le burnout peut être un signal fondamental du vivant : « Ce chemin n'est plus le tien. » Comment traverser l'effondrement pour accéder à la renaissance.",
    date: "5 mars 2026",
    dateISO: "2026-03-05",
    lecture: "11 min",
    lede:
      "Souvent vécu comme une catastrophe, le burnout peut être un signal fondamental du vivant : « Ce chemin n’est plus le tien. »",
    content: [
      {
        k: "p",
        t: "Personne ne choisit le burnout. Il arrive comme un mur, soudain, après des mois — parfois des années — où l’on a tenu, encore et encore. Et pourtant, j’entends souvent la même phrase, des mois plus tard : « C’est ce qui m’est arrivé de mieux. » Non parce que la chute fut douce, mais parce qu’elle a rendu un mensonge impossible à tenir.",
      },
      { k: "h2", t: "Un effondrement qui dit quelque chose" },
      {
        k: "p",
        t: "Le burnout n’est pas une faiblesse de caractère. C’est l’épuisement d’un système qui a fonctionné trop longtemps en contradiction avec lui-même. Le corps finit par dire ce que la volonté refusait d’entendre. En ce sens, ce n’est pas une panne : c’est un message.",
      },
      {
        k: "quote",
        t: "Le corps présente toujours la facture que l’esprit a refusé de regarder.",
      },
      { k: "h2", t: "Traverser, et non rebondir" },
      {
        k: "p",
        t: "La tentation, après un effondrement, est de « rebondir » au plus vite — de reconstruire à l’identique. C’est souvent ce qui mène au deuxième burnout. La voie initiatique propose autre chose : descendre d’abord, comprendre ce qui s’est rompu, avant de remonter autrement.",
      },
      {
        k: "ul",
        items: [
          "Accueillir l’arrêt sans le combattre, comme un hiver nécessaire.",
          "Distinguer ce qui était vraiment à soi de ce que l’on portait par devoir.",
          "Laisser émerger, sans précipitation, ce qui demande à naître.",
        ],
      },
      { k: "h2", t: "La renaissance n’est pas un retour" },
      {
        k: "p",
        t: "On ne revient jamais « comme avant » d’une traversée de ce genre — et c’est heureux. Ce qui renaît est plus sobre, plus vrai, mieux ajusté. Le burnout ferme une porte ; le travail intérieur en ouvre une autre, que l’on n’aurait jamais osé pousser autrement.",
      },
      {
        k: "p",
        t: "Si vous traversez cela en ce moment : vous n’êtes peut-être pas en train de vous effondrer. Vous êtes peut-être en train de vous déposer là où, enfin, quelque chose de juste pourra repousser.",
      },
    ],
  },
];

export const ARTICLE_SLUGS = ARTICLES.map((a) => a.slug);

export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}
