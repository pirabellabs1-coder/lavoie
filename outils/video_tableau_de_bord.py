# -*- coding: utf-8 -*-
"""Monte la vidéo de présentation du tableau de bord, sans voix.

    python outils/video_tableau_de_bord.py

Entrées : les demi-captures de montage/brut/ (sNN-g.png à gauche, sNN-d.png
à droite, 960 × 743 chacune, prises à 80 % dans Chrome).
Sorties : montage/video-tableau-de-bord.mp4, et le même texte en
montage/video-tableau-de-bord.srt pour une mise en ligne sous-titrée.

Le minutage découle du texte : chaque sous-titre reste à l'écran le temps de
le lire (16 caractères par seconde). Un plan dont les captures manquent est
sauté, avec un avertissement : on peut monter un aperçu avant d'avoir tout.

    python outils/video_tableau_de_bord.py --apercu   # une image par plan

Pour refaire une capture : fenêtre Chrome visible (une fenêtre réduite ou
cachée ne se dessine plus), page à 80 % (document.documentElement.style.zoom),
adresses e-mail, téléphones et liens personnels floutés, puis chaque écran en
deux moitiés de 640 px de large, capturées à 1,5× : 960 × 743 chacune. Une
capture où l'extension a dessiné son halo orange sur les bords se reprend.
"""

import glob
import io
import math
import os
import shutil
import subprocess
import sys
import wave

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MONTAGE = os.path.join(RACINE, "montage")
BRUT = os.path.join(MONTAGE, "brut")
POLICES = os.path.join(MONTAGE, "polices")
SORTIE = os.path.join(MONTAGE, "video-tableau-de-bord.mp4")

W, H, FPS = 1920, 1080, 25
BLEU, OR, BLANC = (15, 29, 110), (245, 196, 34), (255, 255, 255)
ROGNE = 4  # un liseré de sécurité ; une capture prise avec le halo de l'extension se reprend

# ───────────────────────────── Le texte ─────────────────────────────

SCRIPT = [
    ("ouverture",),

    ("carton", "1", "La vue d'ensemble"),
    ("plan", "s11", "1 · La vue d'ensemble", [
        "L'écran que vous ouvrez le matin.",
        "En haut, une ligne dit quand l'automate\nest passé, et tout ce qu'il a envoyé.",
        "S'il cessait de passer,\nun bandeau rouge vous préviendrait.",
        "« À faire aujourd'hui » : ce qui attend\nune décision de votre part.",
        "Ici, une demande de place à confirmer.\nLe rouge : les 48 heures sont dépassées.",
        "Un clic, et vous arrivez\nlà où ça se traite.",
        "Puis les chiffres : contacts, nouveaux,\nclients, e-mails ouverts et cliqués.",
    ]),
    ("plan", "s12", "1 · La vue d'ensemble", [
        "Les inscriptions jour par jour,\nsur les trente derniers jours.",
        "Le parcours : combien de personnes\nà chaque étape, jusqu'au client.",
    ]),
    ("plan", "s13", "1 · La vue d'ensemble", [
        "À qui on parle : combien de personnes\npar profil, et combien deviennent clientes.",
        "D'où elles viennent : quel formulaire,\nquel stage les a amenées.",
        "Les questionnaires reçus,\nles rendez-vous de la semaine.",
        "Et la sauvegarde : une copie complète\nde vos données part chaque jour par e-mail.",
    ]),

    ("carton", "2", "Les contacts"),
    ("plan", "s21", "2 · Les contacts", [
        "Toutes les personnes, au même endroit.",
        "On cherche par nom,\non filtre par statut et par profil.",
        "On ajoute quelqu'un à la main : après\nun salon, un appel, une recommandation.",
        "Et l'export du fichier en tableur,\nréservé au propriétaire.",
    ]),
    ("plan", "s22", "2 · Les contacts", [
        "Chaque personne a sa fiche.",
        "En tête : à qui l'on parle.\nLe profil vient du questionnaire.",
        "Puis où elle en est dans le parcours,\nde « Nouveau » jusqu'à « Client ».",
        "À droite, son historique :\ntout ce qui s'est passé, daté.",
    ]),
    ("plan", "s23", "2 · Les contacts", [
        "Son lien personnel pour déposer un avis,\ndéjà rattaché à sa fiche.",
        "Et ses automatisations : on la place\ndans une catégorie, avec son accord.",
    ]),

    ("carton", "3", "Les questionnaires"),
    ("plan", "s31", "3 · Les questionnaires", [
        "Les questionnaires reçus, notés sur 100.",
        "Au-dessus de 60,\nl'entretien est proposé.",
        "La note se lit avec le détail de son calcul.\nRien ne tombe du ciel.",
        "Le questionnaire décide aussi du profil,\net donc des e-mails que la personne reçoit.",
        "Le budget passe avant tout le reste :\nc'est une règle de la maison.",
    ]),

    ("carton", "4", "Les stages"),
    ("plan", "s41", "4 · Les stages", [
        "Ce que vous utiliserez le plus souvent.",
        "Chaque stage, avec ses places :\nconfirmées, demandées, libres.",
        "Le bandeau jaune : le paiement par carte\nattend vos clés Stripe.",
        "Il dit exactement quoi faire,\net disparaît une fois branché.",
    ]),
    ("plan", "s42", "4 · Les stages", [
        "Les personnes : qui a demandé, combien\nde places, pour quelle date.",
        "Vous confirmez, mettez en attente,\nannulez ou retirez.",
        "La colonne Règlement : ce qui est dû,\net ce qui est reçu.",
        "Un virement se note à la main,\net la ligne se met à jour.",
    ]),
    ("plan", "s43", "4 · Les stages", [
        "Les dates : chacune a ses propres places.",
        "On en ajoute une, on en ferme une\nsans l'effacer.",
        "Une date qui se remplit affiche\n« Dernières places », puis « Complet ».",
    ]),
    ("plan", "s44", "4 · Les stages", [
        "Créer un stage : titre, lieu, places,\ntarif, texte de la page, photo.",
        "Il naît en brouillon : rien n'apparaît\nsur le site avant la publication.",
    ]),

    ("carton", "5", "Les e-mails automatiques"),
    ("plan", "s51", "5 · Les e-mails automatiques", [
        "Qui reçoit quoi : chaque catégorie\nde personnes a son déclencheur.",
        "Le guide téléchargé, l'inscription\naux Lettres, une demande d'appel.",
    ]),
    ("plan", "s52", "5 · Les e-mails automatiques", [
        "Le questionnaire oriente selon le revenu :\nl'entretien, les stages ou les formations.",
        "Puis une suite après l'entretien,\net une autre après le stage.",
    ]),
    ("plan", "s53", "5 · Les e-mails automatiques", [
        "Et quatre séquences par profil,\ncinq e-mails chacune.",
        "Le dirigeant ne reçoit pas\nce que reçoit celui qui débute.",
    ]),
    ("plan", "s54", "5 · Les e-mails automatiques", [
        "Chaque séquence se lit comme un chemin :\nle déclencheur, les e-mails, les délais.",
        "Sous chaque e-mail, combien sont partis.\nLe texte se modifie ici même.",
        "Une séquence se met en pause d'un clic.",
    ]),

    ("carton", "6", "Campagnes et envois"),
    ("plan", "s62", "6 · Campagnes et envois", [
        "Les campagnes : un e-mail que vous\ndécidez d'écrire, à un groupe choisi.",
        "Par statut, par source, par ancienneté,\npar profil, par stage.",
    ]),
    ("plan", "s64", "6 · Campagnes et envois", [
        "Un aperçu, un essai dans votre boîte,\net le compte exact des destinataires.",
        "Les désabonnés sont toujours exclus.",
    ]),
    ("plan", "s63", "6 · Campagnes et envois", [
        "Les envois : chaque e-mail parti,\nson état, ouvert ou cliqué.",
    ]),

    ("carton", "7", "Avis, parrainage, propositions"),
    ("plan", "s71", "7 · Avis, parrainage, propositions", [
        "Les témoignages déposés sur le site.\nRien n'est en ligne sans votre accord.",
    ]),
    ("plan", "s72", "7 · Avis, parrainage, propositions", [
        "Le parrainage : qui amène du monde,\net combien deviennent clients.",
        "Le réveil : après six mois de silence,\nune dernière lettre, une seule.",
    ]),
    ("plan", "s73", "7 · Avis, parrainage, propositions", [
        "Les propositions : ce qui est en jeu,\nce qui est signé, ce qui traîne.",
        "Sans réponse, une proposition\nest relancée deux fois, toute seule.",
    ]),

    ("carton", "8", "Le carnet de bord"),
    ("plan", "s81", "8 · Le carnet de bord", [
        "Chacun note ce qu'il a fait,\nle jour où il l'a fait.",
        "Par catégorie : contenu, réseaux,\npublicité, e-mailing, relation…",
        "Vous voyez qui a travaillé sur quoi,\nsans avoir à demander.",
    ]),

    ("carton", "9", "Les accès"),
    ("plan", "s91", "9 · Les accès", [
        "Chacun a son compte, et un mot de passe\nque personne d'autre ne connaît.",
        "On invite par l'adresse e-mail : la personne\nchoisit elle-même son mot de passe.",
    ]),
    ("plan", "s92", "9 · Les accès", [
        "Deux rôles. Le propriétaire voit tout,\ny compris les montants.",
        "Le secrétariat : contacts, questionnaires,\nrendez-vous. Rien d'autre.",
    ]),
    ("plan", "s93", "9 · Les accès", [
        "Le journal : qui s'est connecté,\nqui a fait quoi, et quand.",
    ]),

    ("fin",),
]

# ───────────────────────────── Le minutage ─────────────────────────────

CARTON = 3.4         # durée d'un carton de chapitre
OUVERTURE = 4.6
FIN = 5.2
ENTREE = 0.8         # le plan respire avant le premier sous-titre
SORTIE_PLAN = 0.5
FONDU_PLAN = 0.45    # fondu enchaîné entre deux plans
FONDU_TEXTE = 0.16   # fondu entre deux sous-titres du même plan


def lecture(txt):
    n = len(txt.replace("\n", " "))
    return round(min(5.6, max(2.0, n / 16.0 + 0.5)), 2)


# ───────────────────────────── Les polices ─────────────────────────────

def polices():
    """Les polices du site (Inter, Cormorant Garamond), prises dans le cache
    du build Next.js puis gardées dans montage/polices/. À défaut, celles de
    Windows."""
    os.makedirs(POLICES, exist_ok=True)
    voulu = {
        "inter.woff2": ("Inter", "Regular"),
        "cormorant.woff2": ("Cormorant Garamond Light", "Regular"),
        "cormorant-italique.woff2": ("Cormorant Garamond Light", "Italic"),
    }
    manque = [k for k in voulu if not os.path.exists(os.path.join(POLICES, k))]
    if manque:
        for f in glob.glob(os.path.join(RACINE, ".next", "static", "media", "*.p.*.woff2")):
            try:
                nom = ImageFont.truetype(f, 20).getname()
            except Exception:
                continue
            for k, v in voulu.items():
                if k in manque and nom == v:
                    shutil.copy(f, os.path.join(POLICES, k))
    def charge(k, repli, taille):
        p = os.path.join(POLICES, k)
        try:
            return ImageFont.truetype(p if os.path.exists(p) else repli, taille)
        except Exception:
            return ImageFont.truetype(repli, taille)
    return charge


CHARGE = polices()
SEGOE = r"C:\Windows\Fonts\segoeui.ttf"
GEORGIA = r"C:\Windows\Fonts\georgia.ttf"
GEORGIA_I = r"C:\Windows\Fonts\georgiai.ttf"


def inter(taille, graisse="Regular"):
    f = CHARGE("inter.woff2", SEGOE, taille)
    try:
        f.set_variation_by_name(graisse)
    except Exception:
        pass
    return f


def cormorant(taille, italique=False):
    if italique:
        return CHARGE("cormorant-italique.woff2", GEORGIA_I, taille)
    return CHARGE("cormorant.woff2", GEORGIA, taille)


# ───────────────────────────── Le dessin ─────────────────────────────

def fond():
    x = np.linspace(0.0, 1.0, W, dtype=np.float32)[None, :]
    y = np.linspace(0.0, 1.0, H, dtype=np.float32)[:, None]
    g = np.clip(0.62 * x + 0.38 * y, 0, 1)
    haut = np.array([20, 34, 118], np.float32)
    bas = np.array([6, 11, 42], np.float32)
    img = haut * (1 - g)[..., None] + bas * g[..., None]
    return Image.fromarray(np.clip(img, 0, 255).astype(np.uint8), "RGB")


FOND = fond()


def capitales(draw, xy, texte, police, couleur, espace=0.18, centre=False):
    """Des petites capitales espacées, comme les surtitres du site."""
    texte = texte.upper()
    pas = police.size * espace
    largeurs = [draw.textlength(c, font=police) for c in texte]
    total = sum(largeurs) + pas * (len(texte) - 1)
    x, y = xy
    if centre:
        x -= total / 2
    for c, l in zip(texte, largeurs):
        draw.text((x, y), c, font=police, fill=couleur)
        x += l + pas
    return total


def assemble(code):
    g = os.path.join(BRUT, code + "-g.png")
    d = os.path.join(BRUT, code + "-d.png")
    if not (os.path.exists(g) and os.path.exists(d)):
        return None
    a, b = Image.open(g).convert("RGB"), Image.open(d).convert("RGB")
    h = min(a.height, b.height)
    tout = Image.new("RGB", (a.width + b.width, h))
    tout.paste(a.crop((0, 0, a.width, h)), (0, 0))
    tout.paste(b.crop((0, 0, b.width, h)), (a.width, 0))
    return tout.crop((ROGNE, ROGNE, tout.width - ROGNE, h - ROGNE))


PANNEAU_L = 1728
PANNEAU_X, PANNEAU_Y = (W - PANNEAU_L) // 2, 44


def base_plan(code, etiquette):
    ecran = assemble(code)
    if ecran is None:
        return None
    h = round(ecran.height * PANNEAU_L / ecran.width)
    ecran = ecran.resize((PANNEAU_L, h), Image.LANCZOS)
    img = FOND.copy().convert("RGBA")
    # ombre portée
    ombre = Image.new("L", (W, H), 0)
    ImageDraw.Draw(ombre).rounded_rectangle(
        (PANNEAU_X, PANNEAU_Y + 18, PANNEAU_X + PANNEAU_L, PANNEAU_Y + 18 + h), 18, fill=150)
    ombre = ombre.filter(ImageFilter.GaussianBlur(26))
    noir = Image.new("RGBA", (W, H), (0, 0, 0, 255))
    noir.putalpha(ombre)
    img.alpha_composite(noir)
    # l'écran, coins arrondis
    masque = Image.new("L", (PANNEAU_L, h), 0)
    ImageDraw.Draw(masque).rounded_rectangle((0, 0, PANNEAU_L - 1, h - 1), 18, fill=255)
    img.paste(ecran, (PANNEAU_X, PANNEAU_Y), masque)
    # l'étiquette du chapitre, sous l'écran
    dr = ImageDraw.Draw(img)
    y = PANNEAU_Y + h + 30
    dr.line((PANNEAU_X, y + 11, PANNEAU_X + 34, y + 11), fill=OR, width=2)
    capitales(dr, (PANNEAU_X + 48, y), etiquette, inter(21, "SemiBold"), OR)
    return img, y + 40


def avec_texte(base, haut_zone, texte):
    img = base.copy()
    if texte:
        dr = ImageDraw.Draw(img)
        police = inter(44)
        lignes = texte.split("\n")
        interligne = 62
        bloc = interligne * len(lignes)
        centre = (haut_zone + H - 24) / 2
        y = centre - bloc / 2
        for l in lignes:
            larg = dr.textlength(l, font=police)
            dr.text(((W - larg) / 2, y), l, font=police, fill=BLANC)
            y += interligne
    return np.asarray(img.convert("RGB"), dtype=np.uint8)


def titre_mixte(dr, y, morceaux, taille):
    """Un titre où certains mots passent en italique doré, comme sur le site."""
    polices_ = [(cormorant(taille, it), BLANC if not it else OR, t) for t, it in morceaux]
    larg = sum(dr.textlength(t, font=p) for p, _, t in polices_)
    x = (W - larg) / 2
    for p, c, t in polices_:
        dr.text((x, y), t, font=p, fill=c)
        x += dr.textlength(t, font=p)


def carton_image(numero, titre):
    img = FOND.copy()
    dr = ImageDraw.Draw(img)
    capitales(dr, (W / 2, 420), "Chapitre " + numero, inter(24, "SemiBold"), OR, 0.24, centre=True)
    police = cormorant(104)
    larg = dr.textlength(titre, font=police)
    dr.text(((W - larg) / 2, 470), titre, font=police, fill=BLANC)
    dr.line((W / 2 - 40, 640, W / 2 + 40, 640), fill=OR, width=2)
    return np.asarray(img, dtype=np.uint8)


def ouverture_image():
    img = FOND.copy()
    dr = ImageDraw.Draw(img)
    capitales(dr, (W / 2, 380), "La Voie 2 la Conscience", inter(26, "SemiBold"), OR, 0.26, centre=True)
    titre_mixte(dr, 430, [("Votre ", False), ("tableau de bord", True)], 124)
    dr.line((W / 2 - 40, 626, W / 2 + 40, 626), fill=OR, width=2)
    p = inter(34)
    t = "Le tour complet, écran par écran."
    dr.text(((W - dr.textlength(t, font=p)) / 2, 660), t, font=p, fill=(214, 220, 240))
    return np.asarray(img, dtype=np.uint8)


def fin_image():
    img = FOND.copy()
    dr = ImageDraw.Draw(img)
    capitales(dr, (W / 2, 380), "La Voie 2 la Conscience", inter(26, "SemiBold"), OR, 0.26, centre=True)
    titre_mixte(dr, 430, [("Le reste tourne ", False), ("tout seul.", True)], 112)
    dr.line((W / 2 - 40, 616, W / 2 + 40, 616), fill=OR, width=2)
    p = inter(34)
    t = "Chaque matin, l'automate fait sa tournée."
    dr.text(((W - dr.textlength(t, font=p)) / 2, 650), t, font=p, fill=(214, 220, 240))
    return np.asarray(img, dtype=np.uint8)


# ───────────────────────────── La frise ─────────────────────────────

def frise():
    """Une suite d'états (une image fixe chacun) avec leur durée et le fondu
    qui mène au suivant. Le rendu se fait plus tard, à la demande."""
    etats, sautes = [], []
    # un carton de chapitre dont tous les plans manquent ne sert à rien
    presents = [it for it in SCRIPT if it[0] != "plan" or (
        os.path.exists(os.path.join(BRUT, it[1] + "-g.png"))
        and os.path.exists(os.path.join(BRUT, it[1] + "-d.png")))]
    script = [it for k, it in enumerate(presents)
              if not (it[0] == "carton" and (k + 1 >= len(presents) or presents[k + 1][0] != "plan"))]
    for item in script:
        genre = item[0]
        if genre == "ouverture":
            etats.append({"rendu": ("ouverture",), "duree": OUVERTURE, "texte": None, "plan": "ouverture"})
        elif genre == "fin":
            etats.append({"rendu": ("fin",), "duree": FIN, "texte": None, "plan": "fin"})
        elif genre == "carton":
            etats.append({"rendu": ("carton", item[1], item[2]), "duree": CARTON, "texte": None,
                          "plan": "carton-" + item[1]})
        else:
            _, code, etiquette, textes = item
            etats.append({"rendu": ("plan", code, etiquette, None), "duree": ENTREE, "texte": None, "plan": code})
            for t in textes:
                etats.append({"rendu": ("plan", code, etiquette, t), "duree": lecture(t), "texte": t, "plan": code})
            etats.append({"rendu": ("plan", code, etiquette, None), "duree": SORTIE_PLAN, "texte": None, "plan": code})
    t = 0.0
    for i, e in enumerate(etats):
        e["debut"] = t
        t += e["duree"]
        e["fin"] = t
        suivant = etats[i + 1] if i + 1 < len(etats) else None
        e["fondu"] = 0.0 if suivant is None else (FONDU_TEXTE if suivant["plan"] == e["plan"] else FONDU_PLAN)
    sautes = [it[1] for it in SCRIPT if it[0] == "plan" and it not in presents]
    return etats, t, sautes


class Rendu:
    def __init__(self):
        self.bases = {}
        self.cache = {}

    def image(self, etats, i):
        if i in self.cache:
            return self.cache[i]
        r = etats[i]["rendu"]
        if r[0] == "ouverture":
            a = ouverture_image()
        elif r[0] == "fin":
            a = fin_image()
        elif r[0] == "carton":
            a = carton_image(r[1], r[2])
        else:
            code, etiquette, texte = r[1], r[2], r[3]
            if code not in self.bases:
                self.bases = {code: base_plan(code, etiquette)}  # une seule base en mémoire
            base, haut = self.bases[code]
            a = avec_texte(base, haut, texte)
        # on ne garde que le voisinage immédiat
        for k in list(self.cache):
            if abs(k - i) > 1:
                del self.cache[k]
        self.cache[i] = a
        return a


def melange(a, b, x):
    x = x * x * (3 - 2 * x)  # douceur aux deux bouts
    w = int(round(x * 256))
    return ((a.astype(np.uint16) * (256 - w) + b.astype(np.uint16) * w) >> 8).astype(np.uint8)


# ───────────────────────────── La musique ─────────────────────────────

def musique(duree, chemin, sr=32000):
    """Une nappe d'ambiance, lente et douce, synthétisée ici : aucun droit à
    payer, aucune piste à télécharger. Quatre accords qui se fondent."""
    n = int(duree * sr)
    t = np.arange(n, dtype=np.float32) / sr
    accords = [
        [50, 57, 62, 66, 69, 76],   # ré  — ré la ré fa# la mi
        [47, 54, 62, 66, 69, 74],   # si mineur
        [43, 50, 59, 62, 66, 71],   # sol majeur septième
        [45, 52, 57, 61, 64, 69],   # la
    ]
    seg, fondu = 9.0, 4.5
    g = np.zeros(n, np.float32)
    d = np.zeros(n, np.float32)
    k = 0
    while k * seg - fondu < duree:
        t0 = k * seg
        a = int(max(0.0, t0 - fondu / 2) * sr)
        b = int(min(duree, t0 + seg + fondu / 2) * sr)
        if a < b:
            tt = t[a:b]
            m1 = np.clip((tt - (t0 - fondu / 2)) / fondu, 0, 1)
            m2 = np.clip(((t0 + seg + fondu / 2) - tt) / fondu, 0, 1)
            env = (np.sin(np.pi / 2 * m1) ** 2) * (np.sin(np.pi / 2 * m2) ** 2)
            for j, note in enumerate(accords[k % 4]):
                f = 440.0 * 2 ** ((note - 69) / 12.0)
                amp = (0.075, 0.05, 0.045, 0.04, 0.035, 0.018)[j]
                ph = 2 * np.pi * f * tt
                g[a:b] += env * amp * (np.sin(ph) + 0.18 * np.sin(2 * ph + 0.3))
                d[a:b] += env * amp * (np.sin(ph * 1.0021 + 0.9) + 0.18 * np.sin(2 * ph * 1.0021))
        k += 1
    houle = 0.82 + 0.18 * np.sin(2 * np.pi * t / 27.0)
    g *= houle
    d *= 0.82 + 0.18 * np.sin(2 * np.pi * t / 31.0 + 1.0)
    sec_g, sec_d = g.copy(), d.copy()
    for retard, gain in ((0.29, 0.30), (0.53, 0.21), (0.87, 0.13), (1.31, 0.07)):
        r = int(retard * sr)
        g[r:] += gain * sec_d[:-r]
        d[r:] += gain * sec_g[:-r]
    del sec_g, sec_d
    entree, sortie = int(3.0 * sr), int(4.5 * sr)
    rampe = np.ones(n, np.float32)
    rampe[:entree] = np.linspace(0, 1, entree)
    rampe[-sortie:] = np.linspace(1, 0, sortie)
    g *= rampe
    d *= rampe
    crete = max(np.abs(g).max(), np.abs(d).max(), 1e-6)
    g *= 0.32 / crete
    d *= 0.32 / crete
    pcm = np.empty(2 * n, np.int16)
    pcm[0::2] = (g * 32767).astype(np.int16)
    pcm[1::2] = (d * 32767).astype(np.int16)
    with wave.open(chemin, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes(pcm.tobytes())


# ───────────────────────────── Le montage ─────────────────────────────

def ffmpeg():
    p = shutil.which("ffmpeg")
    if p:
        return p
    motif = os.path.join(os.environ.get("LOCALAPPDATA", ""), "Microsoft", "WinGet", "Packages",
                         "Gyan.FFmpeg*", "*", "bin", "ffmpeg.exe")
    trouves = glob.glob(motif)
    if not trouves:
        sys.exit("ffmpeg introuvable : winget install Gyan.FFmpeg.Essentials")
    return trouves[0]


def tc(s):
    ms = int(round(s * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    se, ms = divmod(ms, 1000)
    return "%02d:%02d:%02d,%03d" % (h, m, se, ms)


def srt(etats, chemin):
    n = 0
    with io.open(chemin, "w", encoding="utf-8", newline="\r\n") as f:
        for e in etats:
            if e["texte"]:
                n += 1
                f.write(u"%d\n%s --> %s\n%s\n\n" % (n, tc(e["debut"]), tc(e["fin"]), e["texte"]))
    return n


def verifie_glyphes():
    """Les polices du site sont des sous-ensembles latins : une flèche ou un
    « ≤ » y sortirait en carré blanc. Mieux vaut le savoir avant le rendu."""
    hors = set()
    for item in SCRIPT:
        if item[0] == "plan":
            for t in item[3]:
                for c in t:
                    if ord(c) > 0x17F and c not in u"’‘“”…—–«»€ ":
                        hors.add(c)
    if hors:
        sys.exit("Caractères absents des polices : " + " ".join(sorted(hors)))


def main():
    apercu = "--apercu" in sys.argv
    verifie_glyphes()
    etats, total, sautes = frise()
    if sautes:
        print("Plans sautés faute de captures :", ", ".join(sautes))
    print("Durée : %d min %02d s, %d états, %d sous-titres"
          % (total // 60, total % 60, len(etats), sum(1 for e in etats if e["texte"])))
    os.makedirs(MONTAGE, exist_ok=True)
    srt(etats, os.path.join(MONTAGE, "video-tableau-de-bord.srt"))

    if apercu:
        # une image par plan, pour juger la composition sans tout rendre
        r = Rendu()
        dossier = os.path.join(MONTAGE, "apercu")
        os.makedirs(dossier, exist_ok=True)
        vus = set()
        for i, e in enumerate(etats):
            cle = e["plan"]
            if cle in vus or (e["rendu"][0] == "plan" and not e["texte"]):
                continue
            vus.add(cle)
            Image.fromarray(r.image(etats, i)).save(os.path.join(dossier, "%03d-%s.png" % (i, cle)))
        print("Aperçus dans", dossier)
        return

    son = os.path.join(MONTAGE, "musique.wav")
    musique(total + 0.5, son)
    print("Musique prête.")

    cmd = [ffmpeg(), "-y", "-loglevel", "error",
           "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", "%dx%d" % (W, H), "-r", str(FPS), "-i", "-",
           "-i", son,
           "-map", "0:v", "-map", "1:a",
           "-c:v", "libx264", "-preset", "faster", "-tune", "stillimage", "-crf", "19",
           "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "160k",
           "-shortest", "-movflags", "+faststart", SORTIE]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    r = Rendu()
    n_images = int(round(total * FPS))
    i = 0
    fixe_i, fixe = -1, None
    for k in range(n_images):
        t = (k + 0.5) / FPS
        while i + 1 < len(etats) and t >= etats[i]["fin"]:
            i += 1
        e = etats[i]
        image = None
        if i + 1 < len(etats) and e["fondu"] and t > e["fin"] - e["fondu"] / 2:
            x = (t - (e["fin"] - e["fondu"] / 2)) / e["fondu"]
            image = melange(r.image(etats, i), r.image(etats, i + 1), min(1.0, x)).tobytes()
        elif i > 0 and etats[i - 1]["fondu"] and t < e["debut"] + etats[i - 1]["fondu"] / 2:
            f = etats[i - 1]["fondu"]
            x = (t - (e["debut"] - f / 2)) / f
            image = melange(r.image(etats, i - 1), r.image(etats, i), max(0.0, x)).tobytes()
        else:
            if fixe_i != i:
                fixe_i, fixe = i, r.image(etats, i).tobytes()
            image = fixe
        proc.stdin.write(image)
        if k % (FPS * 30) == 0:
            print("  %d s / %d s" % (k // FPS, total), flush=True)
    proc.stdin.close()
    code = proc.wait()
    if code:
        sys.exit("ffmpeg a échoué (code %d)" % code)
    print("Vidéo :", SORTIE)


if __name__ == "__main__":
    main()
