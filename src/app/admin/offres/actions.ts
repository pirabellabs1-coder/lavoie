"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { identiteAvecDroit } from "@/lib/crm/session";
import { annulerOffre, creerOffre, enCentimes, envoyerOffre } from "@/lib/crm/offres";
import { tracer } from "@/lib/crm/journal";

/**
 * Les propositions engagent de l'argent et partent au nom de Domoïna : elles
 * sont réservées au propriétaire, et le droit est revérifié dans chaque action.
 */

export async function actionCreerOffre(donnees: FormData) {
  const qui = await identiteAvecDroit("offres");
  if (!qui) return;

  const contactId = String(donnees.get("contact") ?? "");
  const intitule = String(donnees.get("intitule") ?? "").trim().slice(0, 200);
  const montant = enCentimes(String(donnees.get("montant") ?? ""));
  const echeancier = String(donnees.get("echeancier") ?? "").trim().slice(0, 200);
  const message = String(donnees.get("message") ?? "").trim().slice(0, 8000);
  const validite = String(donnees.get("validite") ?? "").trim();
  const probabilite = Number(donnees.get("probabilite") ?? 50);
  const envoyer = donnees.get("envoyer") === "on";

  const retour = `/admin/contacts/${contactId}`;
  if (!contactId || !intitule) return;
  if (montant === null) {
    redirect(`${retour}?erreur=${encodeURIComponent("Montant illisible. Exemple : 2400 ou 2400,50.")}`);
  }

  const id = await creerOffre({
    contactId,
    intitule,
    montantCents: montant,
    echeancier,
    probabilite: Number.isFinite(probabilite) ? probabilite : 50,
    message,
    valideJusquAu: validite || null,
  });
  if (id) await tracer(qui, "offre_creee", intitule);

  if (id && envoyer) {
    const parti = await envoyerOffre(id);
    revalidatePath(retour);
    revalidatePath("/admin/offres");
    redirect(
      parti
        ? `${retour}?offre=envoyee`
        : `${retour}?erreur=${encodeURIComponent("Proposition enregistrée, mais l'e-mail n'est pas parti.")}`,
    );
  }

  revalidatePath(retour);
  revalidatePath("/admin/offres");
  redirect(`${retour}?offre=creee`);
}

export async function actionEnvoyerOffre(donnees: FormData) {
  const qui = await identiteAvecDroit("offres");
  if (!qui) return;
  const id = String(donnees.get("id") ?? "");
  const retour = String(donnees.get("retour") ?? "/admin/offres");
  if (!id) return;

  const parti = await envoyerOffre(id);
  if (parti) await tracer(qui, "offre_envoyee", `offre ${id}`);
  revalidatePath("/admin/offres");
  revalidatePath(retour);
  redirect(
    parti
      ? `${retour}?offre=envoyee`
      : `${retour}?erreur=${encodeURIComponent("L'envoi a échoué. Vérifiez la clé Resend.")}`,
  );
}

export async function actionAnnulerOffre(donnees: FormData) {
  if (!(await identiteAvecDroit("offres"))) return;
  const id = String(donnees.get("id") ?? "");
  const retour = String(donnees.get("retour") ?? "/admin/offres");
  if (!id) return;

  await annulerOffre(id);
  revalidatePath("/admin/offres");
  revalidatePath(retour);
}
