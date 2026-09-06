import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd, courseLd, faqLd } from "@/lib/jsonld";
import { CYCLE_SAISONS, getEvenement } from "@/lib/evenements";

export const metadata: Metadata = {
  title: "Cycle des Saisons — Une année initiatique en quatre stages",
  description:
    "Le Cycle des Saisons de Domoïna : quatre stages immersifs au Centre HUT (Sarthe) — Automne, Hiver, Printemps, Été. Une année pour descendre, comprendre, manifester et rayonner.",
  alternates: { canonical: "/cycle-des-saisons" },
  openGraph: {
    type: "website",
    title: "Cycle des Saisons — Une année initiatique en quatre stages",
    description:
      "Quatre stages immersifs au Centre HUT pour traverser une année initiatique complète, au rythme des saisons intérieures.",
    images: [{ url: "/evenements/stage-automne.jpg" }],
  },
};

const MARINE = "linear-gradient(150deg, #142579 0%, #0f1d6e 50%, #0a1450 100%)";

const FAQ = [
  {
    q: "Faut-il faire les quatre stages ?",
    a: "Le cycle est conçu comme une progression : l'automne prépare, l'hiver descend, le printemps fait émerger et l'été récolte. Chaque saison s'appuie sur la précédente, et c'est cette continuité qui produit une transformation durable plutôt qu'un déclic sans lendemain. Une entrée en cours de cycle reste possible et se discute lors de l'appel préalable.",
  },
  {
    q: "Combien de temps dure le cycle complet ?",
    a: "Une année initiatique, rythmée par quatre rendez-vous en immersion — un par saison. Entre les stages, le travail se poursuit dans votre quotidien : c'est là que ce qui a été traversé s'ancre réellement.",
  },
  {
    q: "Où se déroulent les stages ?",
    a: "Au Centre HUT, en Sarthe (72), à environ une heure de Paris. Le lieu fait partie du dispositif : sa nature préservée, son bassin et son isolement créent les conditions que la vie ordinaire ne permet pas.",
  },
  {
    q: "Combien de personnes participent ?",
    a: "Les stages se vivent en groupe volontairement restreint — intime, uni et sécurisé. Ce format permet à chacun d'être vu, entendu et accompagné individuellement, tout en bénéficiant de la force du collectif.",
  },
  {
    q: "En quoi est-ce différent d'une formation ou d'un séminaire ?",
    a: "Une formation transmet des clés. Le Cycle des Saisons vous les fait traverser. Le travail engage le corps, l'eau, la parole en cercle et le temps long — pas seulement la compréhension intellectuelle, qui est nécessaire mais notoirement insuffisante pour changer un schéma.",
  },
  {
    q: "Le jeûne initiatique d'automne fait-il partie du cycle ?",
    a: "Non. Le cycle s'ouvre avec le stage Automne « Naître à soi », en septembre. Le jeûne initiatique est un rendez-vous autonome, qui peut préparer le corps et l'intention en amont — mais il n'est ni une étape du cycle ni une condition d'accès.",
  },
];

const SAISONS_SENS = [
  {
    saison: "Automne",
    element: "Terre",
    mot: "Accepter",
    texte:
      "Les fondations, le consentement, les racines, l'ancrage, la juste place. L'automne ouvre le chemin : celui de l'acceptation et de l'observation.",
  },
  {
    saison: "Hiver",
    element: "Eau",
    mot: "Descendre",
    texte:
      "La mémoire, les profondeurs, les émotions, les lignées, la purification. L'hiver conduit vers les racines invisibles.",
  },
  {
    saison: "Printemps",
    element: "Air",
    mot: "Manifester",
    texte:
      "Le souffle, l'ouverture, l'émergence, l'inspiration. Le printemps accompagne la naissance d'une nouvelle manière d'être.",
  },
  {
    saison: "Été",
    element: "Feu",
    mot: "Rayonner",
    texte:
      "La révélation, l'incarnation, la transmission. L'été révèle ce qui est désormais prêt à être pleinement vécu.",
  },
];

function Arrow({ size = 14 }: { size?: number }) {
  return (
    <svg className="arrow" width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M1 8h13M9 3l5 5-5 5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function Eyebrow({ children, gold, style }: { children: React.ReactNode; gold?: boolean; style?: React.CSSProperties }) {
  return (
    <p className="eyebrow" style={{ margin: 0, color: gold ? "var(--gold)" : "var(--navy)", ...style }}>
      <span className="dot" style={gold ? { background: "var(--gold)" } : undefined} />
      {children}
      <span className="dot" style={gold ? { background: "var(--gold)" } : undefined} />
    </p>
  );
}

export default function CycleDesSaisonsPage() {
  const canal = getEvenement("canal-des-reves");

  return (
    <div className="page-fade">
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "Accueil", path: "/" },
            { name: "Cycle des Saisons", path: "/cycle-des-saisons" },
          ]),
          courseLd({
            name: "Cycle des Saisons",
            description:
              "Une année initiatique en quatre stages immersifs au Centre HUT : Automne, Hiver, Printemps, Été.",
            path: "/cycle-des-saisons",
            sessions: CYCLE_SAISONS.map((e) => ({
              name: e.titreLong,
              description: e.accroche,
              path: e.href,
            })),
          }),
          faqLd(FAQ),
        ]}
      />

      {/* HERO */}
      <section className="page-hero sec-blue" style={{ background: MARINE, borderBottom: "1px solid rgba(255,255,255,0.08)", position: "relative", overflow: "hidden" }}>
        <div
          aria-hidden="true"
          style={{ position: "absolute", inset: 0, background: "radial-gradient(70% 55% at 50% -8%, rgba(245,196,34,0.14) 0%, transparent 60%)", pointerEvents: "none" }}
        />
        <div className="container-narrow" style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
          <Eyebrow gold style={{ justifyContent: "center", marginBottom: 32 }}>Le programme phare</Eyebrow>
          <h1 className="display" style={{ fontSize: "clamp(34px, 4.4vw, 64px)", margin: "0 0 28px", lineHeight: 1.04, color: "var(--white)" }}>
            Le Cycle<br /><em className="display-italic" style={{ color: "var(--gold)" }}>des Saisons.</em>
          </h1>
          <hr className="filet" style={{ margin: "0 auto 32px" }} />
          <p style={{ fontSize: 18.5, lineHeight: 1.75, color: "rgba(255,255,255,0.82)", maxWidth: 660, margin: "0 auto 38px" }}>
            Une année initiatique en quatre stages immersifs, au Centre HUT. Parce qu&apos;on ne
            transforme pas une vie en un week-end&nbsp;: on la traverse, saison après saison.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/contact" className="btn btn-gold">
              Réserver un appel offert <Arrow />
            </Link>
            <Link href="/evenements" className="btn btn-ghost-white">
              Voir les prochaines dates
            </Link>
          </div>
        </div>
      </section>

      {/* POURQUOI LES SAISONS */}
      <section className="section" style={{ background: "var(--white)" }}>
        <div className="container-narrow">
          <Eyebrow style={{ marginBottom: 26 }}>Pourquoi les saisons&nbsp;?</Eyebrow>
          <h2 className="display" style={{ fontSize: "clamp(28px, 3.4vw, 46px)", margin: "0 0 32px", lineHeight: 1.08 }}>
            La nature ne force<br /><em className="display-italic">jamais rien.</em>
          </h2>
          <p style={{ fontSize: 19, lineHeight: 1.8, color: "var(--navy-ink)", margin: "0 0 24px" }}>
            Un arbre ne fleurit pas en décembre parce qu&apos;il l&apos;a décidé. Il descend d&apos;abord,
            il se dépouille, il attend — et l&apos;éclosion arrive alors sans effort. Nous, en revanche,
            nous exigeons de nous-mêmes un printemps permanent.
          </p>
          <p style={{ fontSize: 16.5, lineHeight: 1.8, color: "var(--mute)", margin: "0 0 24px" }}>
            C&apos;est précisément ce qui épuise tant de dirigeants, de cadres et de thérapeutes très
            compétents&nbsp;: produire, rayonner, tenir — sans jamais s&apos;autoriser la descente qui
            rend tout cela soutenable. Le corps finit par facturer ce que l&apos;agenda a refusé.
          </p>
          <p style={{ fontSize: 16.5, lineHeight: 1.8, color: "var(--mute)", margin: 0 }}>
            Le Cycle des Saisons remet ce mouvement à l&apos;endroit. Quatre rencontres jalonnent
            l&apos;année, au rythme des équinoxes et des solstices, dans le cadre naturel du Centre
            HUT — chacune avec sa fonction propre, chacune sous le signe d&apos;un élément.
          </p>

          <div style={{ marginTop: 52, display: "flex", flexDirection: "column", gap: 1, background: "var(--line)", border: "1px solid var(--line)", borderRadius: 14, overflow: "hidden" }}>
            {SAISONS_SENS.map((s) => (
              <div key={s.saison} style={{ background: "var(--white)", padding: "26px 30px", display: "flex", gap: 24, alignItems: "baseline", flexWrap: "wrap" }}>
                <span className="small" style={{ letterSpacing: ".18em", textTransform: "uppercase", color: "var(--gold)", fontSize: 10.5, fontWeight: 600, minWidth: 96 }}>
                  {s.saison}
                  <br />
                  <span style={{ color: "var(--mute)", fontWeight: 400 }}>{s.element}</span>
                </span>
                <span className="display" style={{ fontSize: 22, color: "var(--navy)", minWidth: 150 }}>{s.mot}</span>
                <span style={{ fontSize: 15.5, lineHeight: 1.65, color: "var(--mute)", flex: 1, minWidth: 240 }}>{s.texte}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LES QUATRE STAGES */}
      <section className="section" style={{ background: "var(--paper)" }}>
        <div className="container">
          <div className="section-head">
            <div>
              <Eyebrow style={{ marginBottom: 24 }}>Le parcours</Eyebrow>
              <h2>Quatre stages,<br /><em className="display-italic">une seule traversée.</em></h2>
            </div>
            <p>
              Chaque stage a sa fonction et son intensité propre. Ensemble, ils composent une
              progression cohérente — celle d&apos;une année qui vous rend à vous-même.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {CYCLE_SAISONS.map((e, i) => (
              <Link
                key={e.slug}
                href={e.href}
                className="card-hover"
                style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", background: "var(--white)", border: "1px solid var(--line)", borderRadius: 16, overflow: "hidden", textDecoration: "none" }}
              >
                <div className="rg-split" style={{ gap: 0, alignItems: "stretch" }}>
                  <div style={{ position: "relative", minHeight: 240, background: "var(--paper-alt)" }}>
                    <Image src={e.image} alt={`Affiche — ${e.titreLong}`} fill sizes="(max-width: 900px) 100vw, 50vw" style={{ objectFit: "cover" }} />
                    <span className="pill pill-gold" style={{ position: "absolute", top: 16, left: 16, fontSize: 9, zIndex: 2 }}>
                      Stage {i + 1} / {CYCLE_SAISONS.length}
                    </span>
                  </div>
                  <div style={{ padding: "clamp(26px, 3vw, 42px)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <p className="small" style={{ margin: "0 0 12px", letterSpacing: ".16em", textTransform: "uppercase", color: "var(--gold)", fontSize: 10.5, fontWeight: 600 }}>
                      {e.date}
                    </p>
                    <h3 className="display" style={{ fontSize: "clamp(22px, 2.4vw, 30px)", color: "var(--navy)", margin: "0 0 14px", lineHeight: 1.2 }}>
                      {e.titreLong}
                    </h3>
                    <p style={{ fontSize: 15.5, lineHeight: 1.7, color: "var(--mute)", margin: "0 0 20px" }}>{e.accroche}</p>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 22 }}>
                      {e.verbes.map((v) => (
                        <span key={v.mot} className="pill" style={{ background: "rgba(15,29,110,0.06)", color: "var(--blue)", borderColor: "rgba(15,29,110,0.18)" }}>
                          {v.mot}
                        </span>
                      ))}
                    </div>
                    <span className="link-underline" style={{ color: "var(--blue)", fontWeight: 500, fontSize: 13.5 }}>
                      Découvrir ce stage <Arrow size={12} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {canal && (
            <div style={{ marginTop: 40, background: "var(--white)", border: "1px dashed var(--line)", borderRadius: 16, padding: "clamp(28px, 3vw, 40px)", display: "flex", gap: 28, alignItems: "center", flexWrap: "wrap", justifyContent: "space-between" }}>
              <div style={{ flex: 1, minWidth: 280 }}>
                <p className="small" style={{ margin: "0 0 10px", letterSpacing: ".18em", textTransform: "uppercase", color: "var(--gold)", fontSize: 10.5, fontWeight: 600 }}>
                  Entre deux saisons
                </p>
                <h3 className="display" style={{ fontSize: 22, color: "var(--navy)", margin: "0 0 10px", lineHeight: 1.25 }}>Le Canal des Rêves</h3>
                <p style={{ fontSize: 15, lineHeight: 1.7, color: "var(--mute)", margin: 0, maxWidth: 560 }}>
                  Un fil continu entre les stages&nbsp;: vos rêves lus et travaillés en groupe privé,
                  toute l&apos;année. Souvent, ils disent en avance ce que la saison suivante viendra confirmer.
                </p>
              </div>
              <Link href={canal.href} className="btn btn-ghost">
                Découvrir le canal <Arrow />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* LE LIEU */}
      <section className="section sec-blue" style={{ background: MARINE, position: "relative", overflow: "hidden" }}>
        <div
          aria-hidden="true"
          style={{ position: "absolute", inset: 0, background: "radial-gradient(70% 55% at 50% -8%, rgba(245,196,34,0.12) 0%, transparent 60%)", pointerEvents: "none" }}
        />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div className="rg-split-bias" style={{ gap: "clamp(36px, 5vw, 72px)", alignItems: "center" }}>
            <div>
              <Eyebrow gold style={{ marginBottom: 22 }}>Le lieu</Eyebrow>
              <h2 className="display" style={{ color: "var(--white)", fontSize: "clamp(28px, 3.2vw, 46px)", lineHeight: 1.08, margin: "0 0 22px" }}>
                Le Centre HUT<br /><em className="display-italic" style={{ color: "var(--gold)" }}>n&apos;est pas un décor.</em>
              </h2>
              <p style={{ fontSize: 16.5, lineHeight: 1.8, color: "rgba(255,255,255,0.82)", margin: "0 0 20px", maxWidth: 540 }}>
                À une heure de Paris, en Sarthe, un sanctuaire de nature préservée. Sa quiétude,
                son bassin et son isolement créent des conditions que la vie ordinaire ne permet
                simplement pas&nbsp;: celles où l&apos;on peut enfin cesser de tenir.
              </p>
              <p style={{ fontSize: 16.5, lineHeight: 1.8, color: "rgba(255,255,255,0.7)", margin: "0 0 30px", maxWidth: 540 }}>
                C&apos;est là que se déroulent les quatre stages du cycle — et c&apos;est là que
                l&apos;eau joue son rôle d&apos;alliée de la transformation.
              </p>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                <Link href="/centre-hut" className="btn btn-gold">
                  Découvrir le Centre HUT <Arrow />
                </Link>
                <Link href="/methodes" className="btn btn-ghost-white">
                  Les méthodes employées
                </Link>
              </div>
            </div>

            <div style={{ position: "relative", aspectRatio: "4 / 5", borderRadius: 18, overflow: "hidden", border: "1px solid rgba(255,255,255,0.12)" }}>
              <Image src="/hut-jardin-zen.webp" alt="Le jardin zen du Centre HUT, en Sarthe" fill sizes="(max-width: 900px) 100vw, 420px" style={{ objectFit: "cover" }} />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section" style={{ background: "var(--white)" }}>
        <div className="container-narrow">
          <Eyebrow style={{ marginBottom: 26 }}>Questions fréquentes</Eyebrow>
          <h2 className="display" style={{ fontSize: "clamp(26px, 3vw, 40px)", margin: "0 0 40px", lineHeight: 1.1 }}>
            Avant de<br /><em className="display-italic">vous engager.</em>
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--line)", border: "1px solid var(--line)", borderRadius: 14, overflow: "hidden" }}>
            {FAQ.map((f, i) => (
              <div key={i} style={{ background: "var(--white)", padding: "28px 32px" }}>
                <h3 className="display" style={{ fontSize: 19, color: "var(--navy)", margin: "0 0 12px", lineHeight: 1.3 }}>{f.q}</h3>
                <p style={{ fontSize: 15.5, lineHeight: 1.75, color: "var(--mute)", margin: 0 }}>{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="section-tight" style={{ background: "var(--paper)", textAlign: "center" }}>
        <div className="container-narrow">
          <Eyebrow style={{ justifyContent: "center", marginBottom: 22 }}>Le premier pas</Eyebrow>
          <h2 className="display" style={{ fontSize: "clamp(26px, 3.2vw, 42px)", margin: "0 0 20px", lineHeight: 1.08 }}>
            On ne s&apos;engage pas dans une année<br /><em className="display-italic">sans en avoir parlé.</em>
          </h2>
          <p style={{ fontSize: 17, lineHeight: 1.75, color: "var(--mute)", maxWidth: 580, margin: "0 auto 34px" }}>
            L&apos;appel découverte est offert — 45 minutes, sans engagement — pour comprendre votre
            situation et voir ensemble si le cycle est juste pour vous, maintenant.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/contact" className="btn btn-primary btn-lg">
              Réserver mon appel offert <Arrow />
            </Link>
            <Link href="/temoignages" className="btn btn-ghost">
              Lire les témoignages
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
