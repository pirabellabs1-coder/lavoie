import Link from "next/link";
import Cadre from "../Cadre";
import { Tuile } from "../Graphes";
import { isDbConfigured } from "@/lib/crm/db";
import { exigerIdentite } from "@/lib/crm/session";
import { classementParrains } from "@/lib/crm/parrainage";
import { statsReveil } from "@/lib/crm/reveil";

export const dynamic = "force-dynamic";

export default async function ParrainagePage() {
  await exigerIdentite();

  const branchee = isDbConfigured();
  const parrains = branchee ? await classementParrains() : [];
  const reveil = branchee ? await statsReveil() : { dormants: 0, reveilles: 0 };

  const totalFilleuls = parrains.reduce((s, p) => s + p.filleuls, 0);
  const totalClients = parrains.reduce((s, p) => s + p.clients, 0);

  return (
    <Cadre
      actif="/admin/parrainage"
      titre="Parrainage & réveil"
      sousTitre="Qui amène du monde, et ce que devient la liste au fil du temps."
    >
      {!branchee && (
        <div className="adm-alerte">
          <strong>La base de données n&apos;est pas encore branchée.</strong> Ajoutez la
          variable <code>DATABASE_URL</code> dans les réglages Vercel, puis redéployez.
        </div>
      )}

      <div className="adm-grille adm-g4" style={{ marginBottom: 14 }}>
        <Tuile label="Parrains actifs" valeur={parrains.length} detail="ont amené au moins une personne" />
        <Tuile label="Filleuls" valeur={totalFilleuls} detail={`dont ${totalClients} devenus clients`} />
        <Tuile
          label="Contacts dormants"
          valeur={reveil.dormants}
          detail="six mois sans le moindre signe"
        />
        <Tuile
          label="En sursis"
          valeur={reveil.reveilles}
          detail="réveillés, en attente d'un signe"
        />
      </div>

      <div className="adm-carte" style={{ marginBottom: 14 }}>
        <p className="adm-titre">Les parrains</p>
        {parrains.length === 0 ? (
          <p className="adm-vide">
            Personne n&apos;a encore parrainé de contact. Le lien de parrainage se copie
            depuis la fiche de chaque contact.
          </p>
        ) : (
          <div className="adm-table-scroll">
            <table className="adm-t">
              <thead>
                <tr>
                  <th>Parrain</th>
                  <th className="num">Amenés</th>
                  <th className="num">Devenus clients</th>
                  <th>Lien</th>
                </tr>
              </thead>
              <tbody>
                {parrains.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <Link href={`/admin/contacts/${p.id}`}>{p.nom}</Link>
                      <div style={{ fontSize: 11.5, color: "var(--adm-mute)", marginTop: 2 }}>
                        {p.email}
                      </div>
                    </td>
                    <td className="num" style={{ fontWeight: 650 }}>{p.filleuls}</td>
                    <td className="num">{p.clients}</td>
                    <td style={{ fontSize: 12, color: "var(--adm-mute)" }}>
                      {p.code ? `/?parrain=${p.code}` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="adm-carte">
        <p className="adm-titre">Le réveil des dormants</p>
        <p style={{ margin: 0, lineHeight: 1.7 }}>
          Après six mois sans le moindre signe, une dernière lettre part — une seule.
          Trente jours plus tard, faute de réaction, le contact sort de la liste active :
          il reste dans le fichier mais ne reçoit plus rien. Les clients ne sont jamais
          concernés.
        </p>
        <p style={{ margin: "12px 0 0", color: "var(--adm-mute)", fontSize: 13, lineHeight: 1.7 }}>
          C&apos;est ce qui garde la liste saine : une adresse morte qui ne s&apos;ouvre
          jamais coûte de l&apos;argent et abîme la délivrabilité de tous les autres
          envois. Le nettoyage se fait tout seul, chaque jour.
        </p>
      </div>
    </Cadre>
  );
}
