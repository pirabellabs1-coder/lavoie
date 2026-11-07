import Link from "next/link";
import Cadre from "../Cadre";
import { Tuile } from "../Graphes";
import { isDbConfigured } from "@/lib/crm/db";
import { exigerDroit } from "@/lib/crm/session";
import {
  ADRESSE_WEBHOOK,
  EVENEMENTS_WEBHOOK,
  bilanPaiements,
  derniersReglements,
  diagnosticStripe,
  euros,
  type EtatEtape,
  type LigneReglement,
} from "@/lib/crm/paiements";
import { enClair } from "@/lib/heure";

export const dynamic = "force-dynamic";

/**
 * L'argent, au même endroit : ce qui est encaissé, ce qui attend, et l'état du
 * branchement de Stripe.
 *
 * Réservé au propriétaire, comme les montants des propositions. Aucune clé
 * n'est jamais affichée : la page dit seulement si elle est posée, de quel
 * mode elle est, et si Stripe l'accepte.
 */

const ETIQUETTE: Record<EtatEtape, { texte: string; ton: string }> = {
  ok: { texte: "Fait", ton: "client" },
  "a-faire": { texte: "À faire", ton: "attente" },
  probleme: { texte: "À corriger", ton: "perdu" },
};

const STATUT: Record<LigneReglement["statut"], { texte: string; ton: string }> = {
  payee: { texte: "Payé par carte", ton: "client" },
  manuelle: { texte: "Reçu à la main", ton: "client" },
  attente: { texte: "Lien envoyé", ton: "attente" },
  expiree: { texte: "Lien remplacé", ton: "nouveau" },
  remboursee: { texte: "Remboursé", ton: "perdu" },
};

const GENRE: Record<LigneReglement["genre"], string> = {
  acompte: "Acompte",
  solde: "Solde",
  integral: "Intégral",
};

function qui(l: LigneReglement): string {
  return [l.prenom, l.nom].filter(Boolean).join(" ").trim() || l.email || "—";
}

export default async function PaiementsPage() {
  await exigerDroit("offres");

  const branchee = isDbConfigured();
  const [diagnostic, bilan, lignes] = await Promise.all([
    diagnosticStripe(),
    branchee ? bilanPaiements() : Promise.resolve(null),
    branchee ? derniersReglements() : Promise.resolve([]),
  ]);

  const restant = diagnostic.etapes.filter((e) => e.etat !== "ok").length;
  const etatStripe =
    diagnostic.mode === null
      ? "Pas encore branché"
      : restant === 0
        ? diagnostic.mode === "essai"
          ? "Branché, en essai"
          : "Branché"
        : `${restant} point${restant > 1 ? "s" : ""} à régler`;

  return (
    <Cadre
      actif="/admin/paiements"
      titre="Paiements"
      sousTitre="Ce qui est encaissé, ce qui attend, et le branchement du paiement par carte."
      actions={
        <Link href="/admin/stages" className="adm-btn fantome">
          Voir les stages
        </Link>
      }
    >
      {!branchee && (
        <div className="adm-alerte">
          <strong>La base de données n&apos;est pas encore branchée.</strong> Ajoutez la
          variable <code>DATABASE_URL</code> dans les réglages Vercel, puis redéployez.
        </div>
      )}

      {bilan && (
        <div className="adm-grille adm-g4" style={{ marginBottom: 14 }}>
          <Tuile label="Encaissé ce mois-ci" valeur={euros(bilan.mois)} detail="cartes et virements notés" />
          <Tuile
            label="Encaissé en tout"
            valeur={euros(bilan.total)}
            detail={
              `${euros(bilan.carte)} par carte · ${euros(bilan.main)} à la main` +
              (bilan.rembourse ? ` · ${euros(bilan.rembourse)} remboursés` : "")
            }
          />
          <Tuile
            label="Liens en attente"
            valeur={String(bilan.ouverts)}
            detail={bilan.ouverts ? `${euros(bilan.montantOuvert)} demandés, pas encore réglés` : "rien qui attende"}
          />
          <Tuile
            label="Paiement par carte"
            valeur={diagnostic.mode === "production" && restant === 0 ? "Actif" : diagnostic.mode === "essai" ? "Essai" : "—"}
            detail={etatStripe}
          />
        </div>
      )}

      <section className="adm-carte" style={{ marginBottom: 14 }} aria-labelledby="branchement">
        <h2 className="adm-titre" id="branchement">
          Le branchement de Stripe{" "}
          <span className="appoint">
            — {diagnostic.compte ? `compte « ${diagnostic.compte} »` : "vérifié à chaque ouverture de la page"}
          </span>
        </h2>

        <ol className="etapes">
          {diagnostic.etapes.map((e) => (
            <li key={e.titre} className="etape" data-etat={e.etat}>
              <span className="adm-tag" data-s={ETIQUETTE[e.etat].ton}>
                {ETIQUETTE[e.etat].texte}
              </span>
              <span>
                <span className="quoi">{e.titre}</span>
                <span className="det">{e.detail}</span>
              </span>
            </li>
          ))}
        </ol>

        <div className="etapes-adresse">
          <p className="adm-titre" style={{ marginBottom: 8 }}>Ce qu&apos;il faut déclarer chez Stripe</p>
          <p style={{ margin: "0 0 6px" }}>
            Adresse du webhook : <code>{ADRESSE_WEBHOOK}</code>
          </p>
          <p style={{ margin: 0 }}>
            Événements :{" "}
            {EVENEMENTS_WEBHOOK.map((e, i) => (
              <span key={e}>
                {i > 0 && (i === EVENEMENTS_WEBHOOK.length - 1 ? " et " : ", ")}
                <code>{e}</code>
              </span>
            ))}
          </p>
        </div>

        <details className="etapes-guide">
          <summary>La marche à suivre, pas à pas</summary>
          <ol>
            <li>
              <strong>Créer le compte Stripe</strong> sur stripe.com, au nom de l&apos;activité : description,
              IBAN qui recevra les virements, pièce d&apos;identité. Tant que ce n&apos;est pas terminé, seul le
              mode essai fonctionne — c&apos;est par lui qu&apos;on commence.
            </li>
            <li>
              <strong>En mode essai</strong>, dans Développeurs → Clés API, copier la <em>clé secrète</em>{" "}
              (elle commence par <code>sk_test_</code>). Pas la clé publique.
            </li>
            <li>
              Dans Développeurs → Webhooks, <strong>ajouter une destination</strong> : l&apos;adresse et les
              événements ci-dessus. Stripe affiche alors un <em>secret de signature</em> (<code>whsec_…</code>).
            </li>
            <li>
              Dans Vercel, projet du site → Settings → Environment Variables, ajouter{" "}
              <code>STRIPE_SECRET_KEY</code> et <code>STRIPE_WEBHOOK_SECRET</code> pour l&apos;environnement
              Production, puis <strong>redéployer</strong>.
            </li>
            <li>
              Revenir sur cette page : toutes les lignes passent au vert, sauf la dernière, qui attend un
              premier paiement.
            </li>
            <li>
              <strong>Un paiement d&apos;essai</strong> : réserver une place sur le site avec sa propre adresse,
              s&apos;envoyer le lien d&apos;acompte depuis la page Stages, payer avec la carte{" "}
              <code>4242 4242 4242 4242</code> (date future, code au choix). La dernière ligne passe au vert, la
              place apparaît réglée. Retirer ensuite la place d&apos;essai.
            </li>
            <li>
              <strong>Passer en production</strong> : refaire les étapes 2 à 4 hors du mode essai — clé{" "}
              <code>sk_live_</code>, adresse déclarée une seconde fois côté production, avec son propre secret.
              Redéployer, revérifier cette page.
            </li>
          </ol>
          <p className="adm-carte-sous" style={{ marginTop: 10 }}>
            À régler aussi chez Stripe, une fois pour toutes : le nom qui apparaîtra sur les relevés bancaires,
            le logo et les couleurs de la page de paiement (Paramètres → Image de marque), et l&apos;envoi
            automatique des reçus (Paramètres → E-mails clients). Les moyens de paiement proposés — carte, Apple
            Pay, Google Pay — se choisissent dans Stripe, sans toucher au site.
          </p>
        </details>
      </section>

      <section className="adm-carte" aria-labelledby="reglements">
        <h2 className="adm-titre" id="reglements">
          Les règlements <span className="appoint">— les plus récents, tous stages confondus</span>
        </h2>
        {lignes.length === 0 ? (
          <p className="adm-vide">
            Aucun règlement pour l&apos;instant. Ils apparaissent ici dès qu&apos;un lien de paiement part, ou
            qu&apos;un virement est noté dans la colonne « Règlement » d&apos;un stage.
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="adm-t">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Personne</th>
                  <th>Stage</th>
                  <th>Nature</th>
                  <th style={{ textAlign: "right" }}>Montant</th>
                  <th>État</th>
                </tr>
              </thead>
              <tbody>
                {lignes.map((l) => (
                  <tr key={l.id}>
                    <td>{enClair(l.paye_le ?? l.cree_le)}</td>
                    <td>
                      {l.contact_id ? <Link href={`/admin/contacts/${l.contact_id}`}>{qui(l)}</Link> : qui(l)}
                    </td>
                    <td>{l.titre}</td>
                    <td>{GENRE[l.genre] ?? l.genre}</td>
                    <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                      {euros(l.montant)}
                      {l.rembourse > 0 && l.statut !== "remboursee" && (
                        <span className="adm-carte-sous" style={{ display: "block", margin: 0 }}>
                          dont {euros(l.rembourse)} remboursés
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="adm-tag" data-s={(STATUT[l.statut] ?? STATUT.attente).ton}>
                        {(STATUT[l.statut] ?? STATUT.attente).texte}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </Cadre>
  );
}
