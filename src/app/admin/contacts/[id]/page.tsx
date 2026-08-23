import Link from "next/link";
import { notFound } from "next/navigation";
import Cadre from "../../Cadre";
import { STATUTS, STATUT_LABEL, obtenirContact, nomAffiche } from "@/lib/crm/contacts";
import { actionChangerStatut, actionEnregistrerNote } from "./actions";

export const dynamic = "force-dynamic";

function dateLongue(d: Date | string): string {
  const v = d instanceof Date ? d : new Date(d);
  return v.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function FicheContact({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();

  const donnees = await obtenirContact(id);
  if (!donnees) notFound();
  const { contact, timeline } = donnees;

  return (
    <Cadre
      actif="/admin/contacts"
      titre={nomAffiche(contact)}
      sousTitre={contact.email}
      actions={
        <>
          <a href={`mailto:${contact.email}`} className="adm-btn">Écrire</a>
          <Link href="/admin/contacts" className="adm-btn fantome">Retour</Link>
        </>
      }
    >
      {contact.desabonne_le && (
        <div className="adm-alerte">
          <strong>Ce contact s&apos;est désabonné</strong> le {dateLongue(contact.desabonne_le)}.
          Aucun e-mail automatique ne lui sera plus envoyé.
        </div>
      )}

      <div className="adm-grille adm-g2">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="adm-carte">
            <p className="adm-titre">Où en est-il dans le parcours</p>
            <form action={actionChangerStatut} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <input type="hidden" name="id" value={contact.id} />
              <select name="statut" className="adm-champ" defaultValue={contact.statut} style={{ flex: 1, minWidth: 180 }}>
                {STATUTS.map((s) => (
                  <option key={s.cle} value={s.cle}>{s.label} — {s.aide}</option>
                ))}
              </select>
              <button type="submit" className="adm-btn">Mettre à jour</button>
            </form>
            <p style={{ color: "var(--adm-mute)", fontSize: 12, margin: "12px 0 0" }}>
              Statut actuel :{" "}
              <span className="adm-tag" data-s={contact.statut}>
                {STATUT_LABEL[contact.statut] ?? contact.statut}
              </span>
            </p>
          </div>

          <div className="adm-carte">
            <p className="adm-titre">Coordonnées</p>
            <table className="adm-t">
              <tbody>
                <tr><td style={{ width: 130, color: "var(--adm-mute)" }}>E-mail</td><td>{contact.email}</td></tr>
                <tr><td style={{ color: "var(--adm-mute)" }}>Téléphone</td><td>{contact.telephone || "—"}</td></tr>
                <tr><td style={{ color: "var(--adm-mute)" }}>Source</td><td>{contact.source || "—"}</td></tr>
                <tr><td style={{ color: "var(--adm-mute)" }}>Intérêt</td><td>{contact.interet || "—"}</td></tr>
                <tr><td style={{ color: "var(--adm-mute)" }}>Arrivé le</td><td>{dateLongue(contact.cree_le)}</td></tr>
              </tbody>
            </table>
          </div>

          {contact.message && (
            <div className="adm-carte">
              <p className="adm-titre">Son message</p>
              <p style={{ margin: 0, whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{contact.message}</p>
            </div>
          )}

          <div className="adm-carte">
            <p className="adm-titre">Vos notes</p>
            <form action={actionEnregistrerNote}>
              <input type="hidden" name="id" value={contact.id} />
              <textarea
                name="notes"
                className="adm-champ"
                defaultValue={contact.notes ?? ""}
                placeholder="Ce que vous voulez retenir : contexte, ce qui a été dit lors de l'appel, prochaine étape…"
              />
              <button type="submit" className="adm-btn" style={{ marginTop: 10 }}>
                Enregistrer la note
              </button>
            </form>
          </div>
        </div>

        <div className="adm-carte">
          <p className="adm-titre">Son historique</p>
          {timeline.length === 0 ? (
            <p className="adm-vide">Aucun événement.</p>
          ) : (
            <ul className="adm-chrono">
              {timeline.map((e) => (
                <li key={e.id}>
                  <time>{dateLongue(e.cree_le)}</time>
                  <span>{e.libelle}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Cadre>
  );
}
