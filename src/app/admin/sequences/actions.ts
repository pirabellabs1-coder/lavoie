"use server";

import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { identiteAvecDroit } from "@/lib/crm/session";
import { basculerSequence, majEtape } from "@/lib/crm/sequences";
import {
  ajoutUtile,
  ajouterContactsExistants,
  ajouterDesPersonnes,
  lirePersonnes,
  resumerAjout,
  MAXIMUM_MASSE,
  type ResultatAjout,
} from "@/lib/crm/ajouts";
import { nettoyerSegment, type Segment } from "@/lib/crm/campagnes";
import { categorie } from "@/lib/crm/categories";
import { tracer } from "@/lib/crm/journal";

async function exigerSession(): Promise<boolean> {
  return (await identiteAvecDroit("sequences")) !== null;
}

export async function actionBasculer(formData: FormData) {
  if (!(await exigerSession())) return;
  const id = String(formData.get("id") ?? "");
  const active = String(formData.get("active") ?? "") === "1";
  if (!id) return;
  await basculerSequence(id, active);
  revalidatePath("/admin/sequences");
}

/**
 * « M'envoyer un essai » : le texte tel qu'il est dans le formulaire, envoyé à
 * l'adresse du compte connecté. Ce qu'on lit dans un champ de saisie n'est pas
 * ce qu'on reçoit dans sa boîte — la seule façon de le savoir est de l'y voir.
 */
export async function actionEssaiEtape(formData: FormData) {
  const qui = await identiteAvecDroit("sequences");
  if (!qui) return;

  const cle = String(formData.get("cle") ?? "");
  const sujet = String(formData.get("sujet") ?? "").trim().slice(0, 300);
  const corps = String(formData.get("corps") ?? "").trim().slice(0, 20000);
  if (!sujet || !corps) {
    retour(cle, { souci: "L'objet et le message doivent être remplis." });
  }

  const { adresseParDefaut, envoyerEssai } = await import("@/lib/crm/essai");
  const destinataire = await adresseParDefaut();
  const erreur = await envoyerEssai({ sujet, corps, destinataire });
  retour(
    cle,
    erreur
      ? { souci: `L'essai n'est pas parti : ${erreur}` }
      : { fait: `Essai envoyé à ${destinataire}` },
  );
}

export async function actionMajEtape(formData: FormData) {
  if (!(await exigerSession())) return;
  const id = String(formData.get("id") ?? "");
  const sujet = String(formData.get("sujet") ?? "").slice(0, 300);
  const corps = String(formData.get("corps") ?? "").slice(0, 20000);
  const delai = Number(formData.get("delai_jours") ?? 0);
  if (!id || !sujet.trim() || !corps.trim() || !Number.isFinite(delai)) return;
  await majEtape(id, { sujet, corps, delai_jours: Math.trunc(delai) });
  revalidatePath("/admin/sequences");
}

// ─── Ajouter des personnes dans une catégorie ───────────────────────────────

/** Longueur maximale d'une liste collée, avant découpage en lignes. */
const MAXIMUM_TEXTE = 40000;

/** Le ciblage des contacts déjà connus, reconstruit depuis le formulaire. */
function lireSegment(donnees: FormData, prefixe = ""): Segment {
  const champ = (nom: string) => donnees.get(prefixe + nom);
  const statut = String(champ("statut") ?? "");
  const etat = String(champ("stage_etat") ?? "");
  return nettoyerSegment({
    statuts: statut ? [statut] : [],
    source: champ("source"),
    depuis_jours: champ("depuis_jours"),
    stage: champ("stage"),
    stage_etats: etat ? [etat] : [],
  });
}

/** Le ciblage, tel qu'il repasse dans l'URL pour recharger le formulaire. */
function ciblageEnParams(segment: Segment): Record<string, string | undefined> {
  return {
    statut: segment.statuts?.[0],
    source: segment.source,
    depuis_jours: segment.depuis_jours ? String(segment.depuis_jours) : undefined,
    stage: segment.stage,
    stage_etat: segment.stage_etats?.[0],
  };
}

/** Retour à la page, panneau de la catégorie ouvert, compte rendu affiché. */
function retour(cle: string, params: Record<string, string | undefined>): never {
  const url = new URLSearchParams({ cat: cle });
  for (const [k, v] of Object.entries(params)) if (v) url.set(k, v);
  redirect(`/admin/sequences?${url.toString()}#cat-${encodeURIComponent(cle)}`);
}

/**
 * Ce qui n'a pas pu être fait, s'il y a lieu. Les lignes illisibles sont
 * désignées par leur numéro : ce message passe par l'URL, et une adresse
 * e-mail n'a rien à faire dans un journal d'accès.
 */
function souci(r: ResultatAjout, masse = false): string | undefined {
  const bouts: string[] = [];
  if (r.enPause) {
    bouts.push(
      "Cette séquence est en pause : l'ajout s'est arrêté là. Activez-la, puis recommencez.",
    );
  }
  if (r.tronquee) {
    bouts.push(
      masse
        ? `Le ciblage dépassait le maximum : seules les ${MAXIMUM_MASSE} premières personnes ont été ajoutées.`
        : "La liste dépassait le maximum : les dernières lignes ont été ignorées.",
    );
  }
  if (r.lignesRejetees.length) {
    const numeros = r.lignesRejetees.slice(0, 10).join(", ");
    bouts.push(
      `Sans adresse lisible, à corriger — ligne${r.lignesRejetees.length > 1 ? "s" : ""} ${numeros}${
        r.rejetees > 10 ? "…" : ""
      }.`,
    );
  }
  if (r.sansPrenom) {
    bouts.push(
      `${r.sansPrenom} adresse${r.sansPrenom > 1 ? "s" : ""} sans prénom : leurs e-mails seront écrits sans prénom.`,
    );
  }
  return bouts.length ? bouts.join(" ") : undefined;
}

/** Le compte rendu, rangé du bon côté : un échec ne s'annonce pas en succès. */
function compteRendu(r: ResultatAjout, masse = false): Record<string, string | undefined> {
  const phrase = resumerAjout(r);
  if (ajoutUtile(r)) return { fait: `Ajout effectué — ${phrase}.`, souci: souci(r, masse) };
  return {
    souci: [`Personne n'a été ajouté — ${phrase}.`, souci(r, masse)]
      .filter(Boolean)
      .join(" "),
  };
}

/**
 * Ajoute une liste de personnes saisie à la main. La case d'accord n'est pas
 * une formalité : c'est la trace de ce qui autorise ces envois, et le journal
 * en garde le nom de qui l'a cochée.
 */
export async function actionAjouterPersonnes(donnees: FormData) {
  const qui = await identiteAvecDroit("sequences");
  if (!qui) return;

  const cle = String(donnees.get("cle") ?? "");
  const cat = categorie(cle);
  if (!cat.manuel) return;

  if (donnees.get("accord") !== "on") {
    retour(cle, { souci: "Sans l'accord des personnes concernées, rien n'est envoyé." });
  }

  // Une coupure au caractère près pourrait tomber au milieu d'une adresse et
  // en fabriquer une autre, parfaitement valide : la dernière ligne entamée
  // part à la poubelle.
  const brut = String(donnees.get("liste") ?? "");
  const liste =
    brut.length > MAXIMUM_TEXTE
      ? brut.slice(0, MAXIMUM_TEXTE).replace(/[^\n]*$/, "")
      : brut;

  const lecture = lirePersonnes(liste);
  if (!lecture.personnes.length) {
    retour(cle, {
      souci: lecture.rejetees
        ? `Aucune adresse lisible dans ces ${lecture.rejetees} ligne${lecture.rejetees > 1 ? "s" : ""}.`
        : "Aucune adresse dans la liste.",
    });
  }

  // La trace part avant l'ajout : si la fonction s'arrête en route, le journal
  // dit au moins ce qui a été tenté.
  await tracer(
    qui,
    "sequence_ajout_manuel",
    cat.cat,
    `${lecture.personnes.length} adresse(s), accord attesté`,
  );

  const resultat = await ajouterDesPersonnes({
    cle,
    personnes: lecture.personnes,
    acteur: qui.nom,
  });
  resultat.lignesRejetees = lecture.lignesRejetees;
  resultat.rejetees = lecture.rejetees;
  resultat.doublons = lecture.doublons;
  resultat.sansPrenom = lecture.sansPrenom;
  resultat.tronquee = resultat.tronquee || lecture.tronquee;

  await tracer(qui, "sequence_ajout_manuel", cat.cat, resumerAjout(resultat));

  // Le premier e-mail d'une catégorie part souvent à J+0 : il ne doit pas
  // attendre le passage du worker le lendemain matin.
  const partants = resultat.ajoutes + resultat.reprises;
  if (partants > 0) {
    after(async () => {
      const { traiterEcheances } = await import("@/lib/crm/sequences");
      await traiterEcheances(Math.min(20, partants));
    });
  }

  revalidatePath("/admin/sequences");
  retour(cle, compteRendu(resultat));
}

/**
 * « Compter » avant d'ajouter en masse : on repasse par l'URL plutôt que par
 * un état client, comme pour les campagnes. Le compte reste donc visible,
 * rechargeable et partageable.
 */
export async function actionCompterCible(donnees: FormData) {
  if (!(await exigerSession())) return;
  const cle = String(donnees.get("cle") ?? "");
  if (!categorie(cle).manuel) return;
  const segment = lireSegment(donnees);
  retour(cle, { apercu: "1", ...ciblageEnParams(segment) });
}

/** Ajoute d'un coup les contacts déjà connus qui répondent au ciblage. */
export async function actionAjouterExistants(donnees: FormData) {
  const qui = await identiteAvecDroit("sequences");
  if (!qui) return;

  const cle = String(donnees.get("cle") ?? "");
  const cat = categorie(cle);
  if (!cat.manuel) return;

  if (donnees.get("accord") !== "on") {
    retour(cle, { souci: "Sans l'accord des personnes concernées, rien n'est envoyé." });
  }

  const segment = lireSegment(donnees);

  // Le compte affiché engage : si le ciblage a bougé depuis, on refuse plutôt
  // que d'ajouter un nombre de personnes que personne n'a vu passer.
  const compte = lireSegment(donnees, "compte_");
  if (JSON.stringify(compte) !== JSON.stringify(segment)) {
    retour(cle, {
      souci: "Le ciblage a changé depuis le comptage. Recomptez avant d'ajouter.",
      ...ciblageEnParams(segment),
    });
  }

  const resultat = await ajouterContactsExistants({ cle, segment, acteur: qui.nom });

  await tracer(
    qui,
    "sequence_ajout_masse",
    cat.cat,
    `${JSON.stringify(segment)} — ${resumerAjout(resultat)}`,
  );

  revalidatePath("/admin/sequences");
  retour(cle, compteRendu(resultat, true));
}
