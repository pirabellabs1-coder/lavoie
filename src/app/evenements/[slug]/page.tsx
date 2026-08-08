import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd, eventLd, faqLd } from "@/lib/jsonld";
import {
  EVENEMENTS,
  EVENEMENT_SLUGS,
  getEvenement,
  type Evenement,
} from "@/lib/evenements";

const MARINE = "linear-gradient(150deg, #142579 0%, #0f1d6e 50%, #0a1450 100%)";

export function generateStaticParams() {
  return EVENEMENT_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const e = getEvenement(slug);
  if (!e) return { title: "Événement introuvable" };

  return {
    title: `${e.titreLong} — ${e.date}`,
    description: e.metaDescription,
    alternates: { canonical: e.href },
    openGraph: {
      type: "website",
      title: e.titreLong,
      description: e.metaDescription,
      images: [{ url: e.image }],
    },
  };
}

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

/** Bandeau d'infos pratiques répété sous le hero et avant le CTA final. */
function InfosPratiques({ e }: { e: Evenement }) {
  const infos = [
    { k: "Dates", v: e.date },
    ...(e.heure ? [{ k: "Durée", v: e.heure }] : []),
    { k: "Lieu", v: e.lieu },
    { k: "Tarif", v: e.prix },
  ];
  return (
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
  );
}

export default async function EvenementPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const e = getEvenement(slug);
  if (!e) notFound();

  const autres = EVENEMENTS.filter((x) => x.slug !== e.slug).slice(0, 3);

  return (
    <div className="page-fade">
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "Accueil", path: "/" },
            { name: "Événements", path: "/evenements" },
            { name: e.titre, path: e.href },
          ]),
          eventLd({
            name: e.titreLong,
            description: e.metaDescription,
            path: e.href,
            image: e.image,
            lieu: e.lieu,
            offerUrl: e.url,
          }),
          faqLd(e.faq),
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
            <span className="pill">{e.tag}</span>
            <span style={{ fontFamily: "var(--sans)", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--gold)", fontWeight: 600 }}>
              {e.date}
            </span>
          </div>

          <h1 className="display" style={{ fontSize: "clamp(30px, 4vw, 56px)", margin: "0 0 24px", lineHeight: 1.06, color: "var(--white)" }}>
            {e.titreLong}
          </h1>
          <hr className="filet" style={{ margin: "0 0 28px" }} />
          <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: "clamp(19px, 2.2vw, 26px)", lineHeight: 1.5, color: "var(--gold)", margin: "0 0 32px", maxWidth: 640 }}>
            {e.devise}
          </p>

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <a href={e.url} target="_blank" rel="noopener noreferrer" className="btn btn-gold">
              Réserver ma place <Arrow />
            </a>
            <Link href="/contact" className="btn btn-ghost-white">
              Poser une question
            </Link>
          </div>
        </div>
      </section>

      {/* VISUEL + INFOS PRATIQUES */}
      <section className="section-tight" style={{ background: "var(--white)" }}>
        <div className="container">
          <div style={{ position: "relative", aspectRatio: "2 / 1", borderRadius: 16, overflow: "hidden", border: "1px solid var(--line)", marginBottom: 36 }}>
            <Image
              src={e.image}
              alt={`Affiche — ${e.titreLong}`}
              fill
              sizes="(max-width: 900px) 100vw, 1100px"
              style={{ objectFit: "cover" }}
              priority
            />
          </div>
          <InfosPratiques e={e} />
        </div>
      </section>

      {/* INTRO */}
      <section className="section" style={{ background: "var(--paper)" }}>
        <div className="container-narrow">
          <Eyebrow style={{ marginBottom: 26 }}>De quoi s&apos;agit-il&nbsp;?</Eyebrow>
          <h2 className="display" style={{ fontSize: "clamp(26px, 3vw, 40px)", margin: "0 0 32px", lineHeight: 1.1 }}>
            {e.titre}
          </h2>
          {e.intro.map((p, i) => (
            <p
              key={i}
              style={{
                fontSize: i === 0 ? 19 : 16.5,
                lineHeight: 1.8,
                color: i === 0 ? "var(--navy-ink)" : "var(--mute)",
                margin: "0 0 24px",
              }}
            >
              {p}
            </p>
          ))}

          {/* Les verbes de la saison */}
          <div style={{ marginTop: 52, display: "flex", flexDirection: "column", gap: 1, background: "var(--line)", border: "1px solid var(--line)", borderRadius: 14, overflow: "hidden" }}>
            {e.verbes.map((v) => (
              <div key={v.mot} style={{ background: "var(--white)", padding: "24px 28px", display: "flex", gap: 24, alignItems: "baseline", flexWrap: "wrap" }}>
                <span className="display" style={{ fontSize: 22, color: "var(--navy)", minWidth: 150 }}>{v.mot}</span>
                <span style={{ fontSize: 15.5, lineHeight: 1.65, color: "var(--mute)", flex: 1, minWidth: 240 }}>{v.texte}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CE QUE VOUS VIVREZ */}
      <section className="section" style={{ background: "var(--white)" }}>
        <div className="container">
          <div className="section-head">
            <div>
              <Eyebrow style={{ marginBottom: 24 }}>Le déroulé</Eyebrow>
              <h2>Ce que vous<br /><em className="display-italic">traversez.</em></h2>
            </div>
            <p>
              Rien n&apos;est théorique : chaque temps engage le corps, la parole et le groupe.
              C&apos;est ce qui distingue une immersion d&apos;un contenu que l&apos;on écoute.
            </p>
          </div>

          <div className="rg-2" style={{ gap: 20, alignItems: "stretch" }}>
            {e.vivrez.map((v, i) => (
              <div key={i} style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 16, padding: "30px 32px" }}>
                <span className="display" style={{ display: "block", fontSize: 13, color: "var(--gold)", marginBottom: 14, fontFamily: "var(--sans)", letterSpacing: ".16em" }}>
                  0{i + 1}
                </span>
                <h3 className="display" style={{ fontSize: 21, color: "var(--navy)", margin: "0 0 12px", lineHeight: 1.25 }}>{v.t}</h3>
                <p style={{ fontSize: 15, lineHeight: 1.7, color: "var(--mute)", margin: 0 }}>{v.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* POUR QUI */}
      <section className="section sec-blue" style={{ background: MARINE, position: "relative", overflow: "hidden" }}>
        <div
          aria-hidden="true"
          style={{ position: "absolute", inset: 0, background: "radial-gradient(70% 55% at 50% -8%, rgba(245,196,34,0.12) 0%, transparent 60%)", pointerEvents: "none" }}
        />
        <div className="container-narrow" style={{ position: "relative", zIndex: 1 }}>
          <Eyebrow gold style={{ marginBottom: 24 }}>Est-ce pour vous&nbsp;?</Eyebrow>
          <h2 className="display" style={{ color: "var(--white)", fontSize: "clamp(28px, 3.2vw, 44px)", lineHeight: 1.08, margin: "0 0 32px" }}>
            Ce rendez-vous s&apos;adresse<br /><em className="display-italic" style={{ color: "var(--gold)" }}>à vous si…</em>
          </h2>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 18 }}>
            {e.pourQui.map((p, i) => (
              <li key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start", fontSize: 16.5, lineHeight: 1.7, color: "rgba(255,255,255,0.88)" }}>
                <span style={{ color: "var(--gold)", flexShrink: 0, marginTop: 3 }}>✦</span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="section" style={{ background: "var(--paper)" }}>
        <div className="container-narrow">
          <Eyebrow style={{ marginBottom: 26 }}>Questions fréquentes</Eyebrow>
          <h2 className="display" style={{ fontSize: "clamp(26px, 3vw, 40px)", margin: "0 0 40px", lineHeight: 1.1 }}>
            Ce que l&apos;on nous<br /><em className="display-italic">demande souvent.</em>
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--line)", border: "1px solid var(--line)", borderRadius: 14, overflow: "hidden" }}>
            {e.faq.map((f, i) => (
              <div key={i} style={{ background: "var(--white)", padding: "28px 32px" }}>
                <h3 className="display" style={{ fontSize: 19, color: "var(--navy)", margin: "0 0 12px", lineHeight: 1.3 }}>{f.q}</h3>
                <p style={{ fontSize: 15.5, lineHeight: 1.75, color: "var(--mute)", margin: 0 }}>{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RÉSERVATION */}
      <section className="section-tight" style={{ background: "var(--white)" }}>
        <div className="container">
          <InfosPratiques e={e} />
          <div style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 40, flexWrap: "wrap" }}>
            <a href={e.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-lg">
              Réserver ma place <Arrow />
            </a>
            <Link href="/contact" className="btn btn-ghost">
              Réserver un appel offert
            </Link>
          </div>
          <p className="small" style={{ textAlign: "center", margin: "26px 0 0", color: "var(--mute)", fontSize: 12.5, letterSpacing: ".04em" }}>
            ✦ Places limitées · Groupe intime, uni et sécurisé ✦
          </p>
        </div>
      </section>

      {/* AUTRES RENDEZ-VOUS */}
      <section className="section" style={{ background: "var(--paper)" }}>
        <div className="container">
          <div className="section-head">
            <div>
              <Eyebrow style={{ marginBottom: 24 }}>Poursuivre</Eyebrow>
              <h2>Les autres<br /><em className="display-italic">rendez-vous.</em></h2>
            </div>
            <p>
              Chaque saison prépare la suivante. Découvrez la suite du chemin — ou l&apos;accompagnement
              qui vous relie entre deux immersions.
            </p>
          </div>

          <div className="rg-3" style={{ gap: 20, alignItems: "stretch" }}>
            {autres.map((a) => (
              <Link
                key={a.slug}
                href={a.href}
                className="card-hover"
                style={{ display: "flex", flexDirection: "column", background: "var(--white)", border: "1px solid var(--line)", borderRadius: 16, textDecoration: "none", overflow: "hidden" }}
              >
                <div style={{ position: "relative", aspectRatio: "2 / 1", background: "var(--paper-alt)" }}>
                  <Image src={a.image} alt={`Affiche — ${a.titre}`} fill sizes="(max-width: 768px) 100vw, 33vw" style={{ objectFit: "cover" }} />
                </div>
                <div style={{ padding: "22px 24px 24px", flexGrow: 1, display: "flex", flexDirection: "column" }}>
                  <p className="small" style={{ margin: "0 0 10px", letterSpacing: ".14em", textTransform: "uppercase", color: "var(--gold)", fontSize: 10.5, fontWeight: 600 }}>
                    {a.date}
                  </p>
                  <h3 className="display" style={{ fontSize: 19, color: "var(--navy)", margin: "0 0 10px", lineHeight: 1.25 }}>{a.titre}</h3>
                  <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--mute)", margin: "0 0 18px", flexGrow: 1 }}>{a.accroche}</p>
                  <span className="link-underline" style={{ color: "var(--blue)", fontWeight: 500, fontSize: 13 }}>Découvrir <Arrow size={12} /></span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
