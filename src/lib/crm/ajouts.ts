import { categorie } from "./categories";
import { contactsDuSegment, type Segment } from "./campagnes";
import { enregistrerContact, journaliser } from "./contacts";
import { getDb } from "./db";
import { inscrireContact, semerSequences } from "./sequences";

/**
 * Ajouter des personnes dans une automatisation, à la main.
 *
 * Tout ce qui arrive du site entre tout seul dans la bonne séquence. Reste ce
 * qui n'y passe pas : la personne rencontrée en stage, l'adresse notée au
 * téléphone, la liste reprise d'un ancien outil. Ce fichier est leur porte
 * d'entrée, et il tient quatre règles.
 *
 *   · On entre par une catégorie de personnes, jamais par une séquence nue. La
 *     catégorie décide de la fiche créée — son statut, sa source — et de la
 *     séquence qui la prend en charge. C'est ce qui garde le fichier lisible
 *     six mois plus tard.
 *
 *   · Un désabonné ne rentre jamais, et une inscription qui attend encore sa
 *     confirmation (double opt-in) non plus. Les deux sont écartés avant même
 *     que leur fiche ne soit touchée : refuser quelqu'un ne doit pas laisser
 *     de traces d'un ajout qui n'a pas eu lieu.
 *
 *   · Rien n'est muet. Chaque ajout laisse une ligne dans la chronologie de la
 *     personne, avec le nom de qui l'a fait et la mention de l'accord — c'est
 *     la preuve de consentement, faute de double opt-in. Le compte rendu dit
 *     ce qui n'a pas marché autant que ce qui a marché.
 *
 *   · Rien ne commence si tout ne peut pas aboutir : séquence absente, en
 *     pause ou sans étape, on s'arrête avant d'écrire quoi que ce soit.
 */

export type Personne = { email: string; prenom?: string; nom?: string };

export type ResultatAjout = {
  /** Entrées neuves dans la séquence. */
  ajoutes: number;
  /** Séquences déjà terminées ou arrêtées, remises au début. */
  reprises: number;
  /** Personnes qui y étaient déjà : rien touché. */
  deja: number;
  /** Refusées parce que désabonnées. */
  desabonnes: number;
  /** Refusées parce qu'en attente de confirmation (double opt-in). */
  sansConsentement: number;
  /** Fiches créées au passage. */
  crees: number;
  /** Adresses valides mais sans prénom : leurs e-mails seront impersonnels. */
  sansPrenom: number;
  /** Lignes illisibles, en tout. */
  rejetees: number;
  /** Adresses en double dans la liste collée, ignorées. */
  doublons: number;
  /** Lignes perdues en route (base indisponible, séquence vide). */
  echecs: number;
  /**
   * Numéros des lignes illisibles (20 au plus). Des numéros, et non leur
   * contenu : ce compte rendu passe par l'URL, et une adresse e-mail n'a rien
   * à faire dans un journal d'accès.
   */
  lignesRejetees: number[];
  /** Vrai si la séquence est en pause : personne n'a été ajouté. */
  enPause: boolean;
  /** Vrai si la liste dépassait le maximum et a été tronquée. */
  tronquee: boolean;
};

function vide(): ResultatAjout {
  return {
    ajoutes: 0,
    reprises: 0,
    deja: 0,
    desabonnes: 0,
    sansConsentement: 0,
    crees: 0,
    sansPrenom: 0,
    rejetees: 0,
    doublons: 0,
    echecs: 0,
    lignesRejetees: [],
    enPause: false,
    tronquee: false,
  };
}

/** La ligne de chronologie d'une entrée réussie, partout la même. */
export function entreeDansLaSequence(cat: string, acteur: string): string {
  return `Entrée dans la séquence « ${cat} » — ajout par ${acteur}, qui atteste de son accord`;
}

/** Combien de personnes une seule liste collée peut porter. */
export const MAXIMUM_COLLE = 50;
/** Combien de contacts déjà connus un seul ajout en masse peut toucher. */
export const MAXIMUM_MASSE = 5000;
/** Longueur maximale d'une adresse acceptée (RFC 5321 : 254). */
const MAXIMUM_EMAIL = 254;

const RE_EMAIL = /^[^@\s,;]+@[^@\s,;]+\.[^@\s,;]+$/;

/** Une adresse, et rien d'autre : le test est borné avant d'être lancé. */
function estEmail(jeton: string): boolean {
  return jeton.length <= MAXIMUM_EMAIL && RE_EMAIL.test(jeton);
}

export type Lecture = {
  personnes: Personne[];
  /** Numéros des lignes illisibles (20 au plus), jamais leur contenu. */
  lignesRejetees: number[];
  rejetees: number;
  doublons: number;
  sansPrenom: number;
  tronquee: boolean;
};

/**
 * Lit une liste collée : une personne par ligne, « e-mail, prénom, nom ».
 *
 * Le séparateur peut être la virgule, le point-virgule ou la tabulation — un
 * copier-coller de tableur passe donc tel quel, guillemets compris. L'adresse
 * est reconnue où qu'elle soit dans la ligne, ce qui accepte aussi la forme
 * des carnets d'adresses, « Jean Dupont <jean@exemple.fr> ».
 */
export function lirePersonnes(texte: string, maximum = MAXIMUM_COLLE): Lecture {
  const personnes: Personne[] = [];
  const lignesRejetees: number[] = [];
  const vues = new Set<string>();
  let rejetees = 0;
  let doublons = 0;
  let sansPrenom = 0;
  let tronquee = false;

  const brutes = texte.split(/\r?\n/);
  for (let n = 0; n < brutes.length; n++) {
    const ligne = brutes[n].trim();
    if (!ligne) continue;

    // Les chevrons des carnets d'adresses valent séparateurs, et les
    // guillemets d'un export CSV ne font pas partie du nom.
    const nettoyee = ligne.replace(/[<>]/g, " ");
    const decouper = (s: string) =>
      s
        .split(/[,;\t]/)
        .map((m) => m.trim().replace(/^["']|["']$/g, "").trim())
        .filter(Boolean);
    let morceaux = decouper(nettoyee);
    if (morceaux.length <= 1) {
      morceaux = nettoyee.split(/\s+/).map((m) => m.replace(/^["']|["']$/g, "")).filter(Boolean);
    }

    const rang = morceaux.findIndex(estEmail);
    if (rang === -1) {
      rejetees += 1;
      if (lignesRejetees.length < 20) lignesRejetees.push(n + 1);
      continue;
    }

    const email = morceaux[rang].toLowerCase();
    if (vues.has(email)) {
      doublons += 1;
      continue;
    }

    // Le plafond ne se juge qu'ici : une ligne illisible ou en double n'a rien
    // pris de la place disponible.
    if (personnes.length >= maximum) {
      tronquee = true;
      break;
    }
    vues.add(email);

    const reste = morceaux
      .filter((_, i) => i !== rang)
      .join(" ")
      .split(/\s+/)
      .filter(Boolean);
    if (!reste.length) sansPrenom += 1;
    personnes.push({
      email,
      prenom: reste[0]?.slice(0, 80),
      nom: reste.slice(1).join(" ").slice(0, 80) || undefined,
    });
  }

  return { personnes, lignesRejetees, rejetees, doublons, sansPrenom, tronquee };
}

/** L'état d'une fiche avant qu'on y touche : a-t-elle le droit d'entrer ? */
type Etat = { id: string; desabonne: boolean; consentement: boolean };

async function etatsExistants(emails: string[]): Promise<Map<string, Etat>> {
  const etats = new Map<string, Etat>();
  const sql = await getDb();
  if (!sql || !emails.length) return etats;
  try {
    const lignes = await sql<
      { id: string; email: string; desabonne_le: Date | null; consentement: boolean }[]
    >`
      SELECT id, email, desabonne_le, consentement
      FROM contacts WHERE email = ANY(${emails}::text[])
    `;
    for (const l of lignes) {
      etats.set(l.email, {
        id: String(l.id),
        desabonne: l.desabonne_le !== null,
        consentement: l.consentement,
      });
    }
  } catch (e) {
    console.error("[crm] etatsExistants:", e);
  }
  return etats;
}

/**
 * Ajoute une poignée de personnes dans une catégorie : la fiche est créée si
 * elle manque, complétée si elle existe, puis inscrite à la séquence.
 */
export async function ajouterDesPersonnes(entree: {
  /** Clé de la catégorie, donc de la séquence. */
  cle: string;
  personnes: Personne[];
  /** Le nom qui apparaîtra dans la chronologie de chaque personne. */
  acteur: string;
}): Promise<ResultatAjout> {
  const resultat = vide();
  const cat = categorie(entree.cle);
  if (!cat.manuel) return resultat;

  const sql = await getDb();
  if (!sql) {
    resultat.echecs = entree.personnes.length;
    return resultat;
  }

  // ── Rien ne commence si tout ne peut pas aboutir ──
  try {
    await semerSequences();
    const [seq] = await sql<{ id: string; active: boolean }[]>`
      SELECT id, active FROM sequences WHERE cle = ${entree.cle}
    `;
    if (!seq) {
      resultat.echecs = entree.personnes.length;
      return resultat;
    }
    // Une séquence en pause n'envoie rien : mieux vaut refuser l'ajout que le
    // laisser disparaître dans une file qui ne tourne pas.
    if (!seq.active) {
      resultat.enPause = true;
      return resultat;
    }
    const [premiere] = await sql<{ id: string }[]>`
      SELECT id FROM sequence_etapes WHERE sequence_id = ${seq.id} LIMIT 1
    `;
    if (!premiere) {
      resultat.echecs = entree.personnes.length;
      return resultat;
    }
  } catch (e) {
    console.error("[crm] ajouterDesPersonnes (séquence):", e);
    resultat.echecs = entree.personnes.length;
    return resultat;
  }

  // Les refus se lisent d'abord, en une requête : une personne désabonnée ne
  // doit pas voir sa fiche mise à jour par un ajout qui n'aboutira pas.
  const etats = await etatsExistants(entree.personnes.map((p) => p.email));

  for (const p of entree.personnes) {
    const etat = etats.get(p.email);
    if (etat?.desabonne) {
      resultat.desabonnes += 1;
      await journaliser(etat.id, "sequence", "Ajout refusé : cette personne s'est désabonnée");
      continue;
    }
    if (etat && !etat.consentement) {
      resultat.sansConsentement += 1;
      await journaliser(
        etat.id,
        "sequence",
        "Ajout refusé : inscription en attente de confirmation",
      );
      continue;
    }

    // La ligne de chronologie dit ce qui a été fait à la fiche ; celle de
    // l'entrée en séquence n'est écrite que si l'entrée a bien eu lieu.
    const contact = await enregistrerContact({
      email: p.email,
      prenom: p.prenom,
      nom: p.nom,
      source: cat.source,
      statut: cat.statut,
      libelleEvenement: `Ajout manuel dans « ${cat.cat} » par ${entree.acteur}`,
    });
    if (!contact) {
      resultat.echecs += 1;
      continue;
    }
    if (contact.nouveau) resultat.crees += 1;

    const suite = await inscrireContact(contact.id, entree.cle, {
      reprendre: true,
      exigerConsentement: true,
    });
    if (suite === "inscrite" || suite === "reprise") {
      if (suite === "inscrite") resultat.ajoutes += 1;
      else resultat.reprises += 1;
      await journaliser(
        contact.id,
        "consentement",
        entreeDansLaSequence(cat.cat, entree.acteur),
      );
      continue;
    }
    if (suite === "deja") resultat.deja += 1;
    else if (suite === "desabonne") resultat.desabonnes += 1;
    else if (suite === "sans_consentement") resultat.sansConsentement += 1;
    else if (suite === "en_pause") {
      // La séquence vient d'être mise en pause sous nos pieds : on s'arrête là
      // plutôt que de laisser filer le reste de la liste sans le dire.
      resultat.enPause = true;
      break;
    } else resultat.echecs += 1;
  }

  return resultat;
}

/**
 * Ajoute d'un coup les contacts déjà connus qui répondent à un ciblage — la
 * reprise d'un ancien outil, ou le rattrapage d'une catégorie entière.
 *
 * L'inscription se fait en une seule requête : quelques milliers de personnes
 * ne doivent pas tenir la page ouverte. Les désabonnés et les fiches sans
 * consentement sont écartés deux fois — par le ciblage, puis par la jointure
 * de l'insertion, au cas où quelqu'un se désabonnerait entre les deux.
 */
export async function ajouterContactsExistants(entree: {
  cle: string;
  segment: Segment;
  acteur: string;
  limite?: number;
}): Promise<ResultatAjout> {
  const resultat = vide();
  const cat = categorie(entree.cle);
  if (!cat.manuel) return resultat;

  const sql = await getDb();
  if (!sql) return resultat;

  try {
    await semerSequences();
    const [seq] = await sql<{ id: string; active: boolean }[]>`
      SELECT id, active FROM sequences WHERE cle = ${entree.cle}
    `;
    if (!seq) {
      resultat.echecs = 1;
      return resultat;
    }
    if (!seq.active) {
      resultat.enPause = true;
      return resultat;
    }

    const [premiere] = await sql<{ delai_jours: number }[]>`
      SELECT delai_jours FROM sequence_etapes
      WHERE sequence_id = ${seq.id} ORDER BY ordre ASC LIMIT 1
    `;
    if (!premiere) {
      resultat.echecs = 1;
      return resultat;
    }

    const limite = Math.min(entree.limite ?? MAXIMUM_MASSE, MAXIMUM_MASSE);
    const contacts = await contactsDuSegment(entree.segment, limite + 1);
    resultat.tronquee = contacts.length > limite;
    const ids = contacts.slice(0, limite).map((c) => String(c.id));
    if (!ids.length) return resultat;

    const libelle = entreeDansLaSequence(cat.cat, entree.acteur);
    // Les deux écritures tiennent dans une transaction : une inscription sans
    // sa trace de consentement vaudrait moins que pas d'inscription du tout.
    const { lignes } = await sql.begin(async (tx) => {
      const rows = await tx<{ contact_id: string; nouvelle: boolean }[]>`
        INSERT INTO inscriptions (contact_id, sequence_id, etape_suivante, echeance)
        SELECT c.id, ${seq.id}, 1, NOW() + make_interval(days => ${premiere.delai_jours})
        FROM unnest(${ids}::text[]) AS t(id)
        JOIN contacts c ON c.id = t.id::bigint
        WHERE c.desabonne_le IS NULL AND c.consentement = TRUE
        ON CONFLICT (contact_id, sequence_id) DO UPDATE
          SET statut = 'active', etape_suivante = 1, cree_le = NOW(),
              echeance = NOW() + make_interval(days => ${premiere.delai_jours})
          WHERE inscriptions.statut <> 'active'
        RETURNING contact_id, (xmax = 0) AS nouvelle
      `;
      if (rows.length) {
        const touches = rows.map((l) => String(l.contact_id));
        await tx`
          INSERT INTO evenements (contact_id, type, libelle)
          SELECT t.id::bigint, 'consentement', ${libelle}
          FROM unnest(${touches}::text[]) AS t(id)
        `;
      }
      return { lignes: rows };
    });

    for (const l of lignes) {
      if (l.nouvelle) resultat.ajoutes += 1;
      else resultat.reprises += 1;
    }
    // Le reste était déjà en cours de séquence, ou vient de sortir du ciblage.
    resultat.deja = ids.length - lignes.length;
  } catch (e) {
    console.error("[crm] ajouterContactsExistants:", e);
    resultat.echecs += 1;
  }

  return resultat;
}

/** Le compte rendu d'un ajout, en une phrase, pour l'afficher au retour. */
export function resumerAjout(r: ResultatAjout): string {
  const s = (n: number) => (n > 1 ? "s" : "");
  const bouts: string[] = [];
  if (r.ajoutes) bouts.push(`${r.ajoutes} personne${s(r.ajoutes)} ajoutée${s(r.ajoutes)}`);
  if (r.reprises) bouts.push(`${r.reprises} séquence${s(r.reprises)} reprise${s(r.reprises)} au début`);
  if (r.crees) bouts.push(`${r.crees} nouvelle${s(r.crees)} fiche${s(r.crees)}`);
  if (r.deja) bouts.push(`${r.deja} y étai${r.deja > 1 ? "ent" : "t"} déjà`);
  if (r.desabonnes) bouts.push(`${r.desabonnes} désabonnée${s(r.desabonnes)}, écartée${s(r.desabonnes)}`);
  if (r.sansConsentement) {
    bouts.push(
      `${r.sansConsentement} en attente de confirmation, écartée${s(r.sansConsentement)}`,
    );
  }
  if (r.doublons) bouts.push(`${r.doublons} doublon${s(r.doublons)} ignoré${s(r.doublons)}`);
  if (r.rejetees) bouts.push(`${r.rejetees} ligne${s(r.rejetees)} illisible${s(r.rejetees)}`);
  if (r.sansPrenom) bouts.push(`${r.sansPrenom} sans prénom`);
  if (r.echecs) bouts.push(`${r.echecs} en échec`);
  return bouts.length ? bouts.join(", ") : "aucun changement";
}

/** Vrai si l'ajout a réellement produit quelque chose. */
export function ajoutUtile(r: ResultatAjout): boolean {
  return r.ajoutes > 0 || r.reprises > 0 || r.crees > 0;
}
