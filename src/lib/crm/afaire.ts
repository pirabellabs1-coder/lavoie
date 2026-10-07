import { getDb } from "./db";

/**
 * Ce qui attend une main aujourd'hui.
 *
 * Le tableau de bord sait tout compter, mais ne dit nulle part quoi faire en
 * ouvrant l'écran le matin. Une demande de place reçue jeudi, un questionnaire
 * excellent sans rendez-vous posé, un témoignage qui dort en modération : rien
 * de tout cela ne se signale, et tout cela se perd.
 *
 * Cette liste ne montre que ce qui ne peut pas s'automatiser — ce qui demande
 * une décision. Quand elle est vide, elle le dit, et c'est une bonne nouvelle.
 */

export type Tache = {
  cle: string;
  nombre: number;
  /** Ce qu'il y a à faire, au singulier et au pluriel. */
  quoi: string;
  quoiPluriel: string;
  /** Depuis quand ça attend, quand la question a un sens. */
  detail?: string;
  lien: string;
  /** « urgent » passe la ligne en rouge, « tenir » en ambre. */
  ton: "urgent" | "tenir" | "calme";
};

/** Au-delà, une demande de place n'est plus en attente : elle est oubliée. */
const HEURES_PROMISES = 48;

export async function cequiAttend(): Promise<Tache[]> {
  const sql = await getDb();
  if (!sql) return [];

  try {
    const [l] = await sql<
      {
        places: number;
        places_vieilles: number;
        questionnaires: number;
        temoignages: number;
        reglements: number;
        avis: number;
      }[]
    >`
      SELECT
        -- Les demandes de place qui attendent une confirmation.
        (SELECT COUNT(*) FROM participations WHERE statut = 'demande')::int AS places,
        (SELECT COUNT(*) FROM participations
          WHERE statut = 'demande'
            AND cree_le < NOW() - make_interval(hours => ${HEURES_PROMISES}))::int AS places_vieilles,
        -- Les copies qui méritent un entretien et n'ont pas de date posée.
        (SELECT COUNT(*) FROM questionnaires
          WHERE eligible = TRUE AND rdv_le IS NULL AND annule_le IS NULL)::int AS questionnaires,
        -- Ce qui dort en modération.
        (SELECT COUNT(*) FROM temoignages WHERE statut = 'attente')::int AS temoignages,
        -- Les règlements ouverts et jamais honorés.
        (SELECT COUNT(DISTINCT x.participation_id) FROM paiements x
          WHERE x.statut = 'attente'
            -- Une ligne ouverte avant que Stripe réponde n'a pas de session :
            -- personne n'a jamais reçu de lien, il n'y a rien à attendre.
            AND x.session_id IS NOT NULL
            AND NOT EXISTS (
              SELECT 1 FROM paiements y
              WHERE y.participation_id = x.participation_id
                AND y.statut IN ('payee', 'manuelle')
            ))::int AS reglements,
        -- Les avis demandés, relancés, et toujours sans réponse.
        (SELECT COUNT(*) FROM contacts c
          WHERE c.avis_relance_le IS NOT NULL
            AND NOT EXISTS (SELECT 1 FROM temoignages t WHERE t.contact_id = c.id))::int AS avis
    `;
    if (!l) return [];

    const taches: Tache[] = [
      {
        cle: "places",
        nombre: l.places,
        quoi: "demande de place à confirmer",
        quoiPluriel: "demandes de place à confirmer",
        detail: l.places_vieilles
          ? `dont ${l.places_vieilles} au-delà des 48 h promises`
          : undefined,
        lien: "/admin/stages",
        ton: l.places_vieilles > 0 ? "urgent" : "tenir",
      },
      {
        cle: "questionnaires",
        nombre: l.questionnaires,
        quoi: "entretien à poser",
        quoiPluriel: "entretiens à poser",
        detail: "questionnaire retenu, pas encore de date",
        lien: "/admin/questionnaires",
        ton: "tenir",
      },
      {
        cle: "reglements",
        nombre: l.reglements,
        quoi: "règlement en attente",
        quoiPluriel: "règlements en attente",
        detail: "lien envoyé, rien encaissé",
        lien: "/admin/stages",
        ton: "calme",
      },
      {
        cle: "temoignages",
        nombre: l.temoignages,
        quoi: "témoignage à relire",
        quoiPluriel: "témoignages à relire",
        lien: "/admin/temoignages",
        ton: "calme",
      },
      {
        cle: "avis",
        nombre: l.avis,
        quoi: "avis resté sans réponse",
        quoiPluriel: "avis restés sans réponse",
        detail: "relancé une fois ; la suite se fait de vive voix",
        lien: "/admin/contacts",
        ton: "calme",
      },
    ];

    return taches.filter((t) => t.nombre > 0);
  } catch (e) {
    console.error("[crm] cequiAttend:", e);
    return [];
  }
}
