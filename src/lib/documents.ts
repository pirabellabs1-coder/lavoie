// Documents du Cadre Déontologique — chartes & conditions de La Voie 2 la Conscience.
// Le contenu reprend exactement les textes fournis (captures du site).

export type DocBlock =
  | { type: "p"; html: string }
  | { type: "list"; items: string[] };

export type DocItem = {
  slug: string;
  category: string; // "Document en vedette" | "Charte"
  featured?: boolean;
  title: string;
  excerpt: string;
  pdf?: string;
  blocks: DocBlock[];
};

export const DOCUMENTS: DocItem[] = [
  {
    slug: "charte-accompagnement-v2c",
    category: "Document en vedette",
    featured: true,
    title:
      "Charte d'Accompagnement Voie 2 la Conscience (V2C) : Le Cadre Éthique et Thérapeutique",
    excerpt:
      "Découvrez les fondements de l'accompagnement V2C : une démarche thérapeutique et initiatique basée sur un cadre structurant, la responsabilité individuelle et le processus essentiel du « Bien Finir » pour une transformation profonde et autonome.",
    blocks: [
      {
        type: "p",
        html: "L'accompagnement <strong>Voie 2 la Conscience (V2C)</strong> est une démarche à la fois thérapeutique et initiatique. Il repose sur un cadre structurant qui protège la relation, responsabilise la personne accompagnée et garantit une transformation profonde et autonome.",
      },
      {
        type: "p",
        html: "Trois principes en constituent les fondements : un <strong>cadre clair</strong> qui sécurise le travail, la <strong>responsabilité individuelle</strong> de chacun dans son cheminement, et le processus essentiel du <strong>« Bien Finir »</strong> qui permet de clore chaque accompagnement de manière consciente.",
      },
      {
        type: "p",
        html: "Ce cadre éthique se décline dans deux documents complémentaires : la <strong>Charte d'Engagement « Bien-Finir » et de l'Usager</strong>, et les <strong>Conditions d'Usage et Reconnaissance du Parcours</strong>.",
      },
    ],
  },
  {
    slug: "charte-bien-finir",
    category: "Charte",
    title: "Charte d'Engagement « Bien-Finir » et de l'Usager",
    excerpt:
      "Découvrez l'importance du « Bien Finir » : un engagement éthique et thérapeutique pour clore chaque accompagnement de manière consciente.",
    pdf: "/documents/charte-bien-finir.pdf",
    blocks: [
      {
        type: "p",
        html: "Au sein de <strong>La Voie 2 la Conscience (V2C)</strong>, la fin d'un accompagnement est un acte thérapeutique important visant à clore le processus de manière consciente.",
      },
      {
        type: "p",
        html: "Engagements : respect de la dignité, liberté de conscience et confidentialité.",
      },
      {
        type: "p",
        html: "Le <strong>« Bien Finir »</strong> permet de reconnaître ce qui a été vécu, de restituer ce qui appartient à chacun et de clôturer le processus sans dette ni emprise.",
      },
      {
        type: "p",
        html: "La clôture est structurée selon la durée de l'accompagnement : minimum 3 séances pour un parcours court (~6 mois) et minimum 9 séances pour un parcours long (&gt;18 mois), autour de l'intégration du Corps, de l'Âme et de l'Esprit.",
      },
      {
        type: "p",
        html: "Ce processus est librement accepté ou refusé, avec une implication différente dans l'intégration du travail effectué.",
      },
    ],
  },
  {
    slug: "conditions-usage",
    category: "Charte",
    title: "Conditions d'Usage et Reconnaissance du Parcours",
    excerpt:
      "Informations relatives aux conditions de reconnaissance de votre parcours et aux règles d'usage de la référence V2C.",
    pdf: "/documents/conditions-usage.pdf",
    blocks: [
      {
        type: "p",
        html: "Ce document précise les modalités d'utilisation de la référence <strong>« La Voie 2 la Conscience » (V2C)</strong> afin de garantir l'intégrité de nos enseignements.",
      },
      { type: "p", html: "<strong>Points importants :</strong>" },
      {
        type: "list",
        items: [
          "<strong>Validation du parcours :</strong> La reconnaissance officielle est liée au fait d'avoir <strong>suivi et terminé l'intégralité</strong> des cycles d'accompagnement.",
          "<strong>Éthique professionnelle :</strong> Engagement à une utilisation juste et responsable des outils transmis.",
          "<strong>Protection de la marque :</strong> L'usage du nom V2C dans un cadre professionnel est soumis à une autorisation préalable pour protéger la qualité de notre approche.",
        ],
      },
    ],
  },
];

export const DOC_SLUGS = DOCUMENTS.map((d) => d.slug);

export function getDocument(slug: string): DocItem | undefined {
  return DOCUMENTS.find((d) => d.slug === slug);
}
