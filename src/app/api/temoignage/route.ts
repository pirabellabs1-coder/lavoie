import { deposerTemoignage } from "@/lib/crm/temoignages";
import { controlerFormulaire, reponseRefus } from "@/lib/crm/antispam";

/**
 * Dépôt d'un témoignage depuis le site.
 *
 * Rien n'est publié à cette étape : le texte entre en file d'attente et
 * n'apparaît sur la page que lorsque le secrétariat le valide. Le consentement
 * à la publication est obligatoire — sans lui, rien n'est enregistré.
 */
export async function POST(req: Request) {
  let data: Record<string, unknown>;
  try {
    data = await req.json();
  } catch {
    return Response.json({ error: "Requête invalide." }, { status: 400 });
  }

  const verdict = controlerFormulaire(req, data);
  if (!verdict.ok) return reponseRefus(verdict);

  const nom = String(data.nom ?? "").trim();
  const texte = String(data.texte ?? "").trim();
  const contexte = String(data.contexte ?? "").trim();
  const consentement = data.consentement === true;
  const noteBrute = Number(data.note);
  const note = Number.isFinite(noteBrute) && noteBrute >= 1 && noteBrute <= 5 ? noteBrute : null;

  if (!nom || texte.length < 20) {
    return Response.json(
      { error: "Merci d'indiquer votre nom et quelques phrases." },
      { status: 400 },
    );
  }
  if (!consentement) {
    return Response.json(
      { error: "L'accord de publication est nécessaire pour enregistrer votre témoignage." },
      { status: 400 },
    );
  }

  const ok = await deposerTemoignage({ nom, texte, note, contexte, consentement });
  // Sans base, on renvoie tout de même un succès : le visiteur a joué son rôle,
  // et rien de ce qu'il a écrit ne doit lui revenir comme une erreur.
  return Response.json({ ok: true, enregistre: ok });
}
