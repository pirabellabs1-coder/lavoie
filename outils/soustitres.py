# -*- coding: utf-8 -*-
"""Génère SOUS-TITRES.srt + VIDEO-MONTAGE.md depuis une seule source,
pour que les minutages des deux fichiers ne puissent pas diverger.

    python outils/soustitres.py

La vitesse de lecture se règle dans la fonction `duree`, plus bas :
le diviseur est un nombre de caractères par seconde."""

import io, os

ENTREES = []


def carton(txt, hold=3.6):
    ENTREES.append(["carton", txt, hold])


def st(txt, hold=None):
    ENTREES.append(["st", txt, hold])


def ecran(label):
    ENTREES.append(["ecran", label, 0.0])


def pause(d):
    ENTREES.append(["pause", "", d])


def chapitre(titre):
    ENTREES.append(["chapitre", titre, 0.0])


# ───────────────────────── 0 · Ouverture ─────────────────────────
chapitre("0 · Ouverture")
ecran("Page d'accueil du site — défilement lent")
carton(u"La Voie 2 la Conscience\nLe système complet", 5.0)
st(u"Tout ce qui a été mis en place,\npièce par pièce.")
st(u"Deux choses, qui n'en font qu'une :\nle site que vos visiteurs voient,")
st(u"et un tableau de bord\nqui n'appartient qu'à vous.")
st(u"Tout ce que le site produit y arrive :\nles personnes, leurs réponses, leurs places.")
st(u"Un seul système, chez vous,\nqui travaille même quand vous dormez.")
pause(1.6)

# ───────────────────── 1 · Le site qu'on voit ─────────────────────
chapitre("1 · Le site qu'on voit")
carton(u"1 — Le site qu'on voit")
ecran("Le menu, puis /domoina, /methodes, /cycle-des-saisons")
st(u"Une vingtaine de pages : qui vous êtes,\nce que vous proposez, pourquoi c'est à part.")
st(u"Votre présentation, les méthodes,\nle Centre HUT, le Cycle des Saisons.")
st(u"Les cercles, la masterclass, le blog,\nles témoignages, le cadre déontologique.")
st(u"Ce dernier n'est pas un détail :\nil dit que la maison a des règles.")
ecran("/evenements — s'arrêter sur les cartes")
st(u"Et puis l'agenda,\nle cœur commercial du site.")
st(u"Chaque rendez-vous a sa carte : date,\nlieu, tarif, places restantes.")
st(u"Ces cartes ne s'écrivent pas\nà la main, une par une.")
st(u"Le Cycle des Saisons vient du site.\nLe reste vient de votre tableau de bord.")
pause(1.4)

# ────────────────────── 2 · Réserver une place ─────────────────────
chapitre("2 · Réserver une place")
carton(u"2 — Réserver une place")
ecran("/evenements/hiver-rencontrer — haut de page, puis défilement")
st(u"La page d'un stage. En haut l'essentiel :\ndates, lieu, tarif, places libres.")
st(u"Plus bas, ce qui se vit\npendant ces jours.")
st(u"Juste avant de réserver — c'est l'endroit\noù l'on hésite — trois témoignages.")
ecran("Clic « Réserver ma place » : la date, le nombre de places, le total")
st(u"La réservation se fait en deux temps,\ncomme sur une billetterie.")
st(u"D'abord le jour, parmi les dates ouvertes,\npuis le nombre de places.")
st(u"On vient rarement seul.\nLe total s'affiche.")
st(u"Ensuite seulement, les coordonnées.")
st(u"Si le stage est complet, la demande\nn'est pas perdue : liste d'attente.")
st(u"Et cette liste se réveille toute seule.")
ecran("Montrer le lien « Ajouter la date à mon agenda »")
st(u"La date s'ajoute à son agenda\nen un clic.")
st(u"Une date notée dans un e-mail se perd.\nUne date dans l'agenda se tient.")
pause(1.4)

# ──────────────────── 3 · Le questionnaire ────────────────────
chapitre("3 · Le questionnaire ✂")
carton(u"3 — Le questionnaire,\net à qui l'on parle")
ecran("/questionnaire — faire défiler quelques questions")
st(u"Avant un entretien, la personne remplit\nun questionnaire. Un quart d'heure.")
st(u"Ce n'est pas un formulaire administratif :\nc'est le premier pas du travail.")
ecran("/admin/questionnaires, puis une fiche — la carte du score")
st(u"Il fait deux choses.\nD'abord, il note.")
st(u"Chaque réponse rapporte des points :\nle chemin parcouru, la pratique en cours.")
st(u"Vous retrouvez la note, avec le détail\nde son calcul. Rien ne tombe du ciel.")
ecran("Fiche contact — la carte « À qui on parle »")
st(u"Ensuite, et c'est le plus utile :\nil décide à qui l'on parle.")
st(u"Cinq profils.")
st(u"Le dirigeant, qui a tout réussi\net ne sent plus rien.")
st(u"Celui qui est en transition,\nbudget réel mais mesuré.")
st(u"Celui dont le chemin est engagé\ndepuis des années.")
st(u"Celui qui fait son premier pas.")
st(u"Et celui dont le budget est serré :\non lui dit la vérité,")
st(u"plutôt que de lui vendre un accompagnement\nqu'il ne pourra pas suivre.")
st(u"Le budget passe avant tout le reste.\nC'est une règle de la maison.")
pause(1.4)

# ────────────── 4 · Les e-mails qui partent tout seuls ──────────────
chapitre("4 · Les e-mails")
carton(u"4 — Les e-mails\nqui partent tout seuls")
ecran("/admin/sequences — la vue des catégories")
st(u"Treize séquences d'e-mails.\nChacune a son déclencheur.")
st(u"Quelqu'un télécharge le guide :\nune séquence démarre.")
st(u"S'inscrit aux Lettres : une autre.\nUn appel, le questionnaire, une place…")
st(u"À chaque fois, la suite est déjà écrite.")
ecran("Ouvrir une séquence — le pipeline horizontal")
st(u"Chaque séquence se lit comme un chemin :\nl'événement, les e-mails, les délais.")
st(u"Vous pouvez les relire et les modifier.\nSans toucher au code.")
st(u"Quatre de ces séquences visent les quatre\nprofils. Cinq e-mails chacune.")
st(u"Pas un texte avec trois mots changés :\nquatre textes différents.")
st(u"Un dirigeant à qui l'on parle d'éveil\nse désabonne.")
st(u"Un débutant à qui l'on parle de plateau\nne comprend pas de quoi il s'agit.")
st(u"Ils ne reçoivent donc plus la même chose.")
st(u"Vous pouvez aussi ajouter quelqu'un\nà la main : après un salon, un appel.")
ecran("/admin/campagnes — ouvrir le filtre d'audience")
st(u"À côté, les campagnes :\nun e-mail unique, à un groupe choisi.")
st(u"Par statut, par source, par ancienneté,\npar stage, et par profil.")
st(u"Écrire à tous les dirigeants n'a rien\nà voir avec écrire à toute la liste.")
pause(1.4)

# ───────────────────── 5 · Tenir ses stages ─────────────────────
chapitre("5 · Tenir ses stages")
carton(u"5 — Tenir ses stages")
ecran("/admin/stages — le formulaire « Créer un stage »")
st(u"Ce que vous allez utiliser le plus souvent.\nVous créez un stage ici.")
st(u"Titre, lieu, places, tarif, résumé,\ntexte de la page, et une photo.")
st(u"La photo est retaillée et convertie\ntelle qu'elle sort de votre téléphone.")
ecran("Montrer la pastille « Brouillon » et le bouton « Publier »")
st(u"Un stage naît en brouillon.")
st(u"Il n'existe nulle part sur le site\ntant que vous n'avez pas publié.")
st(u"Personne ne doit réserver une place\nsur un stage dont le prix n'est pas arrêté.")
ecran("Bloc « Dates disponibles » : ouvrir, fermer, ajouter une date")
st(u"Puis vous lui posez ses dates.\nChaque date a ses propres places.")
st(u"Vous en ouvrez une, vous en ajoutez,\nvous en fermez une sans l'effacer.")
st(u"Une date qui se remplit affiche\n« dernières places », puis « complet ».")
st(u"Le jour où vous publiez : sa page,\nsa carte dans l'agenda,")
st(u"sa ligne dans le plan du site.\nSans que personne touche au code.")
ecran("Descendre sur le tableau des participants")
st(u"En dessous, les personnes : qui a demandé,\ncombien de places, pour quelle date.")
st(u"Vous confirmez, vous mettez en attente,\nvous marquez venue, vous retirez.")
pause(1.4)

# ──────────────────────── 6 · L'argent ────────────────────────
chapitre("6 · L'argent")
carton(u"6 — L'argent")
ecran("/admin/stages — la colonne « Règlement »")
st(u"Jusqu'ici, un règlement se passait\nen dehors du système.")
st(u"Un virement, un mot au téléphone,\net rien nulle part.")
st(u"Pour chaque place : ce qui est dû,\nce qui est payé.")
st(u"Vous envoyez un lien d'acompte (30 %)\nou un lien pour la totalité.")
st(u"La personne paie par carte\nsur une page sécurisée.")
st(u"Aucun numéro de carte ne passe\npar votre site. C'est le prestataire.")
st(u"Un virement se note à la main, et la ligne\nse met à jour pareillement.")
st(u"Un règlement en attente est rappelé\nune fois, trois jours après.")
st(u"Au-delà, ce n'est plus un oubli :\nc'est une hésitation.")
st(u"Et une hésitation se traite de vive voix,\npas par un automate.")
ecran("Montrer le bandeau d'avertissement de la page")
st(u"Ce volet est construit et testé.")
st(u"Mais il dort tant que vos clés\nde paiement ne sont pas renseignées.")
st(u"Le tableau de bord vous le dit en clair,\net vous donne la marche à suivre.")
pause(1.4)

# ───────────────────── 7 · Piloter au quotidien ─────────────────────
chapitre("7 · Piloter au quotidien")
carton(u"7 — Piloter au quotidien")
ecran("/admin — s'arrêter sur « À faire aujourd'hui »")
st(u"L'écran que vous ouvrirez le matin.")
st(u"En haut, ce qui attend une décision.\nPas des chiffres : des choses à faire.")
st(u"Les demandes de place à confirmer,\nen rouge au-delà des 48 heures promises.")
st(u"Les entretiens à poser. Les règlements\njamais honorés. Les témoignages à relire.")
st(u"Chaque ligne vous emmène\nlà où ça se traite.")
st(u"Quand la liste est vide, elle vous le dit.\nC'est une bonne nouvelle.")
ecran("Descendre sur les chiffres, puis la barre « À qui on parle »")
st(u"En dessous, les chiffres : combien\nde personnes, d'où elles viennent.")
st(u"Et celui-ci est le plus utile de tous :")
st(u"combien de personnes par profil,\net combien deviennent clientes.")
st(u"Si les dirigeants se décident à 30 %\net les débutants à 2 %,")
st(u"la réponse n'est pas plus d'e-mails.\nC'est d'aller chercher plus de dirigeants.")
ecran("/admin/carnet")
st(u"Enfin le carnet de bord. Chacun y note\nce qu'il a fait, le jour où il l'a fait.")
st(u"Vous supervisez sans avoir à demander.")
pause(1.4)

# ─────────────────── 8 · Ce qui tourne sans vous ───────────────────
chapitre("8 · Ce qui tourne sans vous ✂")
carton(u"8 — Ce qui tourne sans vous")
ecran("/admin — la ligne de témoin du worker, sous le titre")
st(u"Chaque matin, sans que vous lanciez rien,\nle système fait sa tournée.")
st(u"Il envoie les e-mails de séquence\narrivés à échéance.")
st(u"Il poursuit les campagnes en cours.")
st(u"Il envoie la logistique aux participants,\nune semaine avant leur stage.")
st(u"Il demande un avis\nà ceux qui en reviennent.")
st(u"Il relance une demande de place\nrestée sans réponse.")
st(u"Il réveille les personnes qui n'ont\nplus donné signe de vie.")
st(u"Il rappelle les règlements en attente.")
st(u"Le lundi, il vous envoie\nle point de la semaine.")
st(u"Et il termine par une sauvegarde complète\nde vos données, envoyée par e-mail.")
st(u"Cette ligne dit quand il est passé\npour la dernière fois, et ce qu'il a fait.")
st(u"S'il cessait de passer,\nl'écran vous préviendrait en rouge.")
st(u"Un automate qui s'arrête ne se remarque,\nsinon, que le jour où le silence étonne.")
st(u"Et la liste d'attente : quand une place\nse libère, celui qui attendait est prévenu.")
st(u"Dans la minute. Et la place\nlui est réservée 48 heures.")
pause(1.4)

# ───────────────── 9 · À plusieurs, et en sécurité ─────────────────
chapitre("9 · À plusieurs, et en sécurité ✂")
carton(u"9 — À plusieurs,\net en sécurité")
ecran("/admin/comptes")
st(u"Vous n'êtes pas seule sur cet outil.")
st(u"Chacun a son compte, avec son propre\nmot de passe, connu de lui seul.")
st(u"Vous invitez quelqu'un en renseignant\nson adresse : il reçoit un lien personnel,")
st(u"et choisit son mot de passe lui-même.")
st(u"Deux rôles. Le propriétaire, c'est vous :\nvous voyez tout.")
st(u"Les montants, les campagnes,\nl'export du fichier.")
st(u"Le secrétariat voit les contacts,\nles questionnaires, les rendez-vous.")
st(u"Rien d'autre.")
ecran("/admin/journal")
st(u"Tout ce qui compte est écrit au journal :\nqui s'est connecté, qui a exporté.")
st(u"Côté personnes inscrites : personne n'entre\ndans une liste sans avoir confirmé.")
st(u"Chacun se désabonne en un clic.")
st(u"Et une personne désabonnée n'est jamais\nréinscrite par une automatisation.")
st(u"C'est ce que la loi demande. Et c'est ainsi\nqu'on arrive dans les boîtes de réception.")
pause(1.4)

# ─────────────────── 10 · Ce qu'il reste à faire ───────────────────
chapitre("10 · Ce qu'il reste à faire")
carton(u"10 — Ce qu'il reste à faire")
ecran("/admin/stages — le bloc « Dates disponibles »")
st(u"Trois choses vous attendent.\nAucune ne demande un développeur.")
st(u"La première, la plus urgente : poser\nles dates de vos prochains stages.")
st(u"Celles du Cycle des Saisons sont passées.\nRien n'est réservable aujourd'hui.")
st(u"Dix minutes dans « Dates disponibles »,\net l'agenda revit.")
ecran("Le bandeau d'avertissement des réglages")
st(u"La deuxième : deux réglages de sécurité\nà ajouter chez l'hébergeur.")
st(u"Le tableau de bord vous affiche\nlesquels, en clair.")
st(u"La troisième, quand vous serez prête :\nvos clés de paiement.")
st(u"Et c'est tout. Le reste tourne.")
ecran("Retour sur la page d'accueil, défilement lent")
st(u"Un site qui raconte votre travail.\nUn agenda qui se remplit tout seul.")
st(u"Un fichier qui sait à qui il parle.")
st(u"Des e-mails qui partent au bon moment,\nà la bonne personne.")
st(u"Un suivi de l'argent. Et un écran qui vous\ndit chaque matin ce qui vous attend.")
pause(1.2)
carton(u"La Voie 2 la Conscience\nlavoie2laconscience.com", 5.5)


# ───────────────────────── Minutage ─────────────────────────
# Vitesse de lecture : ~16 caractères par seconde, plus une amorce.
def duree(txt):
    n = len(txt.replace("\n", " "))
    return round(min(5.4, max(1.9, n / 16.0 + 0.4)), 1)


ECART = 0.08          # respiration entre deux sous-titres
ECART_CARTON = 0.45   # après un carton de chapitre

t = 0.0
srt = []          # (index, debut, fin, texte)
plan = []         # (debut, label ecran, chapitre)
chap = []         # (debut, titre)
titre_courant = ""
n = 0
for genre, txt, hold in ENTREES:
    if genre == "chapitre":
        titre_courant = txt
        chap.append((t, txt))
        continue
    if genre == "ecran":
        plan.append((t, txt, titre_courant))
        continue
    if genre == "pause":
        t += hold
        continue
    d = hold if hold else duree(txt)
    n += 1
    srt.append((n, t, t + d, txt))
    t += d + (ECART_CARTON if genre == "carton" else ECART)

total = t

# Durée de chaque chapitre, pour chiffrer honnêtement la version courte.
bornes = [d for d, _ in chap] + [total]
durees_chap = [(chap[i][1], bornes[i + 1] - bornes[i]) for i in range(len(chap))]
coupes = [d for ti, d in durees_chap if u"✂" in ti]
court = total - sum(coupes)


def tc(s):
    ms = int(round(s * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    sec, ms = divmod(ms, 1000)
    return "%02d:%02d:%02d,%03d" % (h, m, sec, ms)


def mmss(s):
    return "%d:%02d" % (int(s) // 60, int(s) % 60)


racine = r"C:\Users\HP\lavoix"

with io.open(os.path.join(racine, "SOUS-TITRES.srt"), "w", encoding="utf-8", newline="\r\n") as f:
    for i, deb, fin, txt in srt:
        f.write(u"%d\n%s --> %s\n%s\n\n" % (i, tc(deb), tc(fin), txt))

cps = max(round(len(x.replace("\n", " ")) / (b - a), 1) for _, a, b, x in srt)
ligne_max = max(len(l) for _, _, _, x in srt for l in x.split("\n"))

# ─────────────────────── Plan de tournage ───────────────────────
tableau = []
for i, (deb, label, titre) in enumerate(plan):
    fin = plan[i + 1][0] if i + 1 < len(plan) else total
    nb = len([1 for _, a, _, _ in srt if deb <= a < fin])
    tableau.append(u"| **%s – %s** | %s | %s | %d |" % (mmss(deb), mmss(fin), titre, label, nb))

chapitres = u"\n".join(
    u"| **%s** | %s | %s |" % (mmss(bornes[i]), durees_chap[i][0], mmss(durees_chap[i][1]))
    for i in range(len(chap))
)

doc = u"""# La vidéo sans voix — montage

Pas de commentaire parlé. Des captures d'écran, des sous-titres, une musique.
Tout le texte est déjà minuté dans **`SOUS-TITRES.srt`** : vous le déposez dans
le logiciel de montage et il se place tout seul.

- **Durée : {duree}** · {nb} sous-titres, cartons de chapitre compris.
- Vitesse de lecture : au plus **{cps} caractères par seconde** — le standard du
  sous-titrage. Deux lignes au maximum, {ligne} caractères par ligne au plus.
- Les chapitres marqués ✂ (3, 8 et 9) se coupent pour une version courte.

---

## Comment on s'y prend, en trois temps

**1. Filmer.** Un seul long enregistrement d'écran, dans l'ordre du tableau
ci-dessous. On ne cherche pas à être minuté à la seconde : on filme chaque
écran un peu plus longtemps que nécessaire, on coupe après.

**2. Déposer les sous-titres.** Dans CapCut : *Texte → Sous-titres locaux →
importer* `SOUS-TITRES.srt`. Dans DaVinci Resolve : clic droit dans la médiathèque
→ *Importer un sous-titre*. Dans Premiere : *Fichier → Importer* puis glisser sur
la timeline. Sur YouTube, le même fichier s'ajoute dans *Sous-titres*.

**3. Caler la vidéo sur le texte**, et non l'inverse. Les sous-titres sont la
colonne vertébrale : on allonge ou on raccourcit chaque plan d'écran pour qu'il
tienne jusqu'au sous-titre suivant. Le tableau donne la durée de chaque plan.

---

## Les chapitres

| Commence à | Chapitre | Durée |
|---|---|---|
{chapitres}

---

## Plan de tournage

Chaque ligne est un plan : un écran, et le temps qu'il doit rester à l'image.

| Minutage | Chapitre | À l'écran | Sous-titres |
|---|---|---|---|
{tableau}

---

## La musique

Une seule piste, instrumentale, sans voix — une voix chantée entre en
concurrence avec un texte à lire. Du piano ou des cordes, tempo lent.

- **Niveau :** autour de **−20 dB**. La musique n'a rien à couvrir ici, elle
  occupe le silence. Si elle attire l'attention, elle est trop forte.
- **Fondus :** 2 secondes à l'ouverture, 3 à la fermeture.
- **Durée :** il faut au moins {duree} de musique. Si la piste est plus courte,
  la reboucler en coupant sur un temps, avec un fondu croisé d'une seconde.
- **Où en trouver, libre de droits :** la bibliothèque audio de YouTube Studio
  (gratuite, utilisable sur YouTube sans démarche), Pixabay Music, ou Uppbeat.
  Vérifiez la mention « usage commercial » si la vidéo sert à vendre.

---

## Les sous-titres à l'image

Les réglages comptent plus qu'on ne croit, puisqu'ici le texte *est* la voix.

- **Taille :** grande. Le texte doit se lire sur un téléphone — comptez environ
  5 % de la hauteur de l'image.
- **Position :** en bas, mais remontée d'environ 10 % : les barres de navigation
  du navigateur et les boutons du lecteur mangent le bas de l'image.
- **Lisibilité :** blanc sur un bandeau sombre semi-transparent, ou blanc avec
  une ombre portée. Du texte blanc posé sur une capture d'écran claire disparaît.
- **Couleurs de la marque, si vous voulez les utiliser :** le bleu `#0f1d6e`
  pour le bandeau, le jaune `#f5c422` pour les cartons de chapitre.
- **Police :** Inter pour les sous-titres (celle du site). Pour les cartons de
  chapitre, Cormorant Garamond donne le ton de la marque.

---

## Version courte — {court}

Couper les chapitres **3**, **8** et **9** — repérés par ✂ dans le tableau des
chapitres. Les sous-titres correspondants se suppriment dans le logiciel, le
reste ne bouge pas.

Pour que le fil tienne, ajouter deux sous-titres de liaison, à écrire à la main :

- **à la fin du chapitre 4 :** « Ces quatre séquences visent quatre profils de
  personnes, que le questionnaire attribue tout seul. »
- **à la fin du chapitre 7 :** « Tout cela se met à jour seul : chaque matin, le
  système fait sa tournée et sauvegarde vos données. »

Descendre plus bas que {court} obligerait à sacrifier un chapitre qui parle
d'argent ou de stages — ce qui intéresse le plus une cliente. Mieux vaut garder
{court} que d'arriver à cinq minutes en coupant l'essentiel.

---

## Avant d'appuyer sur « enregistrer »

**Posez au moins une date avant de filmer.** Aujourd'hui les quatre saisons
n'ont plus aucune date ouverte. Sans date : le panneau de réservation n'a rien à
proposer, les cartes de l'agenda annoncent « prochaine date à venir », et le
lien « Ajouter la date à mon agenda » ne s'affiche pas. Une seule date posée
rend vivants les chapitres 1, 2 et 5.

**Les adresses e-mail des vrais contacts.** Si elles apparaissent à l'écran, les
flouter au montage — ou filtrer sur un seul contact d'essai avant de filmer. La
vidéo sera peut-être revue par d'autres que vous.

**Fenêtre large pour le tableau de bord :** au moins 1400 pixels, sinon la barre
latérale se replie en mode téléphone et l'écran ne ressemble plus à ce qu'on
décrit.

**Ne pas filmer un paiement qui aboutit :** tant que les clés ne sont pas
posées, le lien de règlement n'existe pas. Le chapitre 6 se filme sur la colonne
« Règlement » telle qu'elle est, bandeau d'avertissement visible.

---

Le texte intégral, chapitre par chapitre, reste dans
[SCRIPT-VIDEO.md](SCRIPT-VIDEO.md) — utile si vous préférez réécrire une phrase
avant de l'incruster.

Si le défilement vous paraît trop rapide à la lecture, le fichier se régénère
avec `python outils/soustitres.py` : la vitesse de lecture se règle sur une
seule ligne, en haut de la fonction `duree`. Ce script réécrit à la fois
`SOUS-TITRES.srt` et cette page, pour que leurs minutages ne puissent pas
diverger. Ou dites-le-moi, et je le fais.
""".format(
    duree=mmss(total),
    court=mmss(court),
    nb=len(srt),
    cps=("%.1f" % cps).replace(".", ","),
    ligne=ligne_max,
    chapitres=chapitres,
    tableau=u"\n".join(tableau),
)

with io.open(os.path.join(racine, "VIDEO-MONTAGE.md"), "w", encoding="utf-8", newline="\n") as f:
    f.write(doc)

print("sous-titres :", len(srt))
print("duree totale :", mmss(total), "(%.0f s)" % total)
print("version courte :", mmss(court))
print("cps max :", cps)
print("ligne la plus longue :", ligne_max, "caracteres")
print("plans :", len(plan), "| chapitres :", len(chap))
for ti, d in durees_chap:
    print("   %-34s %s" % (ti.encode("ascii", "replace").decode(), mmss(d)))
