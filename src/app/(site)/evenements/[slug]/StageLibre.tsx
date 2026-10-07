import Link from "next/link";
import Image from "next/image";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd, eventLd } from "@/lib/jsonld";
import { SITE } from "@/lib/site";
import DemandeDePlace from "@/components/DemandeDePlace";
import AvisPublies from "@/components/AvisPublies";
import type { StagePublic } from "@/lib/crm/stages";
import {
  etatDeLaDate,
  placesRestantesDate,
  SANS_DATE,
  type DateStage,
} from "@/lib/crm/dates-stages";
import { periodeEnClair } from "@/lib/heure";
import { paragraphes, pluriel } from "@/lib/texte";

/**
 * La page publique d'un stage créé depuis le tableau de bord.
 *
 * Les six rendez-vous historiques ont chacun leur page écrite à la main, avec
 * leurs verbes, leur déroulé et leur FAQ — ce sont les pages qui vendent. Un
 * stage ajouté à l'écran n'a que ce qu'on lui a saisi : un titre, un lieu, un
 * tarif, un résumé, une description, une photo, des dates. Cette page-ci ne
 * feint donc pas la richesse de l'autre : elle présente ce qui existe, et mène
 * à la réservation sans détour.
 */

const MARINE = "linear-gradient(150deg, #142579 0%, #0f1d6e 50%, #0a1450 100%)";

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

function euros(cents: number): string {
  return (cents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

/** Le tarif en toutes lettres, ou l'aveu qu'il n'est pas encore fixé. */
function tarifEnClair(cents: number | null): string {
  return cents == null
    ? "Le tarif vous est communiqué sur demande"
    : `${euros(cents)} par personne`;
}

/** « 3 places restantes », « 1 place restante ». */
function restantes(n: number): string {
  return `${pluriel(n, "place")} restante${n > 1 ? "s" : ""}`;
}

export default function StageLibre({
  stage,
  dates,
}: {
  stage: StagePublic;
  dates: DateStage[];
}) {
  const prochaine = dates[0] ?? null;
  const corps = paragraphes(stage.description);
  const chemin = `/evenements/${stage.slug}`;
  const image = stage.image_id ? `/api/images/${stage.image_id}` : null;

  const infos = [
    {
      k: "Dates",
      v: prochaine ? periodeEnClair(prochaine.debut_le, prochaine.fin_le) : SANS_DATE,
    },
    ...(stage.lieu ? [{ k: "Lieu", v: stage.lieu }] : []),
    { k: "Tarif", v: stage.prix_cents == null ? "Sur demande" : euros(stage.prix_cents) },
    {
      k: "Groupe",
      v: prochaine
        ? restantes(placesRestantesDate(prochaine))
        : pluriel(stage.places, "place"),
    },
  ];

  return (
    <div className="page-fade">
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "Accueil", path: "/" },
            { name: "Événements", path: "/evenements" },
            { name: stage.titre, path: chemin },
          ]),
          ...(prochaine
            ? [
                eventLd({
                  name: stage.titre,
                  description: stage.resume ?? stage.titre,
                  path: chemin,
                  image: image ?? "/og.jpg",
                  lieu: stage.lieu ?? "Lieu communiqué à l'inscription",
                  offerUrl: `${SITE.url}${chemin}#reserver`,
                  ...(stage.prix_cents == null ? {} : { price: stage.prix_cents / 100 }),
                  startDate: new Date(prochaine.debut_le).toISOString(),
                  endDate: prochaine.fin_le
                    ? new Date(prochaine.fin_le).toISOString()
                    : undefined,
                }),
              ]
            : []),
        ]}
      />

      {/* HERO */}
      <section className="page-hero sec-blue" style={{ background: MARINE, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="container-narrow">
          <Link
            href="/evenements"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", textDecoration: "none", marginBottom: 40, fontFamily: "var(--sans)" }}
          >
            ← Tous les événements
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 26, flexWrap: "wrap" }}>
            <span className="pill">Stage</span>
            {prochaine && (
              <span style={{ fontFamily: "var(--sans)", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--gold)", fontWeight: 600 }}>
                {periodeEnClair(prochaine.debut_le, prochaine.fin_le)}
              </span>
            )}
          </div>

          <h1 className="display" style={{ fontSize: "clamp(30px, 4vw, 56px)", margin: "0 0 24px", lineHeight: 1.06, color: "var(--white)" }}>
            {stage.titre}
          </h1>
          <hr className="filet" style={{ margin: "0 0 28px" }} />
          {stage.resume && (
            <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: "clamp(19px, 2.2vw, 26px)", lineHeight: 1.5, color: "var(--gold)", margin: "0 0 32px", maxWidth: 640 }}>
              {stage.resume}
            </p>
          )}

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
            <a href="#reserver" className="btn btn-gold">
              Réserver ma place <Arrow />
            </a>
            <Link href="/contact" className="btn btn-ghost-white">
              Poser une question
            </Link>
            {prochaine && (
              /* Une date notée dans un e-mail se perd ; une date dans
                 l'agenda se tient. */
              <a
                href={`/api/agenda/${stage.slug}?d=${prochaine.id}`}
                style={{ fontSize: 13, color: "rgba(255,255,255,0.62)", textDecoration: "underline", textUnderlineOffset: 3 }}
              >
                Ajouter à mon agenda
              </a>
            )}
          </div>
        </div>
      </section>

      {/* VISUEL + INFOS PRATIQUES */}
      <section className="section-tight" style={{ background: "var(--white)" }}>
        <div className="container">
          {image && (
            <div style={{ position: "relative", aspectRatio: "2 / 1", borderRadius: 16, overflow: "hidden", border: "1px solid var(--line)", marginBottom: 36 }}>
              <Image
                src={image}
                alt={stage.image_alt ?? `Visuel — ${stage.titre}`}
                fill
                sizes="(max-width: 900px) 100vw, 1100px"
                style={{ objectFit: "cover" }}
                priority
              />
            </div>
          )}
          <div className="rg-4" style={{ gap: 1, background: "var(--line)", border: "1px solid var(--line)", borderRadius: 14, overflow: "hidden" }}>
            {infos.map((i) => (
              <div key={i.k} style={{ background: "var(--white)", padding: "22px 24px" }}>
                <p className="small" style={{ margin: "0 0 8px", letterSpacing: ".18em", textTransform: "uppercase", color: "var(--gold)", fontSize: 10 }}>
                  {i.k}
                </p>
                <p style={{ margin: 0, fontSize: 15, color: "var(--navy)", lineHeight: 1.45 }}>{i.v}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DESCRIPTION */}
      {corps.length > 0 && (
        <section className="section" style={{ background: "var(--paper)" }}>
          <div className="container-narrow">
            {/* Le titre du héros ne se répète pas ici : deux en-têtes
                identiques à la suite ne disent rien de plus, et la navigation
                par titres d'un lecteur d'écran les entend deux fois. */}
            <h2 className="display" style={{ fontSize: "clamp(26px, 3vw, 40px)", margin: "0 0 32px", lineHeight: 1.1 }}>
              De quoi s&apos;agit-il&nbsp;?
            </h2>
            {corps.map((p, i) => (
              <p
                key={i}
                style={{
                  fontSize: i === 0 ? 19 : 16.5,
                  lineHeight: 1.8,
                  color: i === 0 ? "var(--navy-ink)" : "var(--mute)",
                  margin: "0 0 24px",
                  whiteSpace: "pre-line",
                }}
              >
                {p}
              </p>
            ))}
          </div>
        </section>
      )}

      {/* LES DATES OUVERTES */}
      {dates.length > 1 && (
        <section className="section-tight" style={{ background: "var(--white)" }}>
          <div className="container-narrow">
            <Eyebrow style={{ marginBottom: 26 }}>Les dates ouvertes</Eyebrow>
            <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--line)", border: "1px solid var(--line)", borderRadius: 14, overflow: "hidden" }}>
              {dates.map((d) => {
                const etat = etatDeLaDate(d);
                return (
                  <div key={String(d.id)} style={{ background: "var(--white)", padding: "20px 26px", display: "flex", gap: 18, alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap" }}>
                    <span style={{ fontSize: 15.5, color: "var(--navy)" }}>
                      {periodeEnClair(d.debut_le, d.fin_le)}
                    </span>
                    <span className="small" style={{ fontSize: 12.5, color: etat === "complet" ? "var(--mute)" : "var(--blue)" }}>
                      {etat === "complet"
                        ? "Complet — liste d'attente"
                        : restantes(placesRestantesDate(d))}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* CE QU'ILS EN DISENT — juste avant de décider. */}
      <AvisPublies />

      {/* RÉSERVATION */}
      <section className="section" style={{ background: "var(--paper)" }}>
        <div className="container">
          <div style={{ textAlign: "center" }}>
            <Eyebrow style={{ justifyContent: "center", marginBottom: 24 }}>Réserver</Eyebrow>
            <h2 className="display" style={{ fontSize: "clamp(26px, 3vw, 40px)", margin: "0 0 14px", lineHeight: 1.1 }}>
              Prendre sa place.
            </h2>
            <p style={{ fontSize: 15.5, lineHeight: 1.7, color: "var(--mute)", maxWidth: 520, margin: "0 auto" }}>
              {tarifEnClair(stage.prix_cents)}. Le groupe reste restreint&nbsp;: votre demande est
              relue à la main, puis confirmée par e-mail.
            </p>
          </div>

          <div id="reserver" style={{ maxWidth: 620, margin: "40px auto 0", scrollMarginTop: 90 }}>
            {/* Pas de prop « complet » : une page n'existe que si le stage est
                publié — un stage retiré rend un 404, pas une page barrée. */}
            <DemandeDePlace
              slug={stage.slug}
              titre={stage.titre}
              prixTexte={stage.prix_cents == null ? undefined : euros(stage.prix_cents)}
            />
          </div>

          <p className="small" style={{ textAlign: "center", margin: "26px 0 0", color: "var(--mute)", fontSize: 12.5, letterSpacing: ".04em" }}>
            ✦ Places limitées · Groupe intime, uni et sécurisé ✦
          </p>
        </div>
      </section>

      {/* POURSUIVRE */}
      <section className="section-tight" style={{ background: "var(--white)" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <p style={{ fontSize: 16, lineHeight: 1.75, color: "var(--mute)", margin: "0 auto 26px", maxWidth: 520 }}>
            Hésitant·e&nbsp;? Découvrez les autres rendez-vous, ou parlons-en de vive voix avant
            de vous engager.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/evenements" className="btn btn-primary">
              Tous les événements <Arrow />
            </Link>
            <Link href="/contact" className="btn btn-ghost">
              Réserver un appel offert
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
