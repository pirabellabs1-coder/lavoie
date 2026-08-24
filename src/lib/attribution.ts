/**
 * D'où vient le visiteur.
 *
 * Retenu au premier passage, dans le navigateur, puis joint à toute
 * soumission de formulaire. Le premier contact l'emporte : quelqu'un arrivé
 * par une campagne Instagram en mars et inscrit en juin reste attribué à
 * Instagram — sauf s'il revient par une nouvelle campagne, qui prend alors
 * le relais.
 */

export type Origine = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  referent?: string;
  page_entree?: string;
  /** Code du parrain, retenu du paramètre `?parrain=` au premier passage. */
  parrain?: string;
};

const CLE = "v2c_origine";
const MAX = 200;

function borner(v: string | null): string | undefined {
  if (!v) return undefined;
  const propre = v.trim().slice(0, MAX);
  return propre || undefined;
}

/** À appeler une fois par chargement de page. Silencieux si le stockage est refusé. */
export function capturer(): void {
  if (typeof window === "undefined") return;
  try {
    const params = new URLSearchParams(window.location.search);
    const campagne: Origine = {
      utm_source: borner(params.get("utm_source")),
      utm_medium: borner(params.get("utm_medium")),
      utm_campaign: borner(params.get("utm_campaign")),
    };
    const parrain = borner(params.get("parrain"));
    const porteUneCampagne = Boolean(
      campagne.utm_source || campagne.utm_medium || campagne.utm_campaign,
    );

    const brut = window.localStorage.getItem(CLE);
    const deja: Origine = brut ? (JSON.parse(brut) as Origine) : {};

    // Rien à faire si rien de neuf : ni campagne, ni un parrain encore inconnu.
    const nouveauParrain = parrain && !deja.parrain;
    if (brut && !porteUneCampagne && !nouveauParrain) return;

    const referent =
      document.referrer && !document.referrer.startsWith(window.location.origin)
        ? borner(document.referrer)
        : undefined;

    const origine: Origine = porteUneCampagne
      ? {
          ...campagne,
          referent,
          page_entree: borner(window.location.pathname),
          // Le premier parrain fait foi : une nouvelle campagne ne l'efface pas.
          parrain: deja.parrain ?? parrain,
        }
      : {
          // Sans campagne, on ne touche qu'au parrain manquant.
          ...deja,
          parrain: deja.parrain ?? parrain,
          page_entree: deja.page_entree ?? borner(window.location.pathname),
          referent: deja.referent ?? referent,
        };

    window.localStorage.setItem(CLE, JSON.stringify(origine));
  } catch {
    // Navigation privée ou stockage bloqué : l'attribution est un confort,
    // jamais une condition pour envoyer un formulaire.
  }
}

/** L'origine retenue, ou un objet vide si elle est inconnue. */
export function lire(): Origine {
  if (typeof window === "undefined") return {};
  try {
    const brut = window.localStorage.getItem(CLE);
    return brut ? (JSON.parse(brut) as Origine) : {};
  } catch {
    return {};
  }
}

/**
 * Nettoie l'origine reçue dans le corps d'un formulaire. Le contenu vient du
 * navigateur : on n'en garde que cinq chaînes, bornées, et rien d'autre.
 */
export function depuisCorps(v: unknown): Origine {
  if (!v || typeof v !== "object") return {};
  const brut = v as Record<string, unknown>;
  const champ = (cle: keyof Origine): string | undefined => {
    const valeur = brut[cle];
    return typeof valeur === "string" ? borner(valeur) : undefined;
  };
  return {
    utm_source: champ("utm_source"),
    utm_medium: champ("utm_medium"),
    utm_campaign: champ("utm_campaign"),
    referent: champ("referent"),
    page_entree: champ("page_entree"),
    parrain: champ("parrain"),
  };
}
