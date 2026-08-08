import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd, eventLd, faqLd } from "@/lib/jsonld";
import { getEvenement } from "@/lib/evenements";

const E_SLUG = "canal-des-reves";

export const metadata: Metadata = {
  title: "Canal des Rêves — Analyse de rêves en groupe",
  description:
    "Canal des Rêves : analyse de rêves en groupe sur Telegram avec Domoïna. Décodez vos rêves récurrents, recevez des analyses personnalisées. 60 € par mois, sans engagement.",
  alternates: { canonical: "/canal-des-reves" },
  openGraph: {
    type: "website",
    title: "Canal des Rêves — Analyse de rêves en groupe",
    description:
      "Vos rêves sont des messages. Apprenez à les décoder dans un groupe privé, avec des analyses personnalisées.",
    images: [{ url: "/evenements/canal-des-reves.png" }],
  },
};

const MARINE = "linear-gradient(150deg, #142579 0%, #0f1d6e 50%, #0a1450 100%)";

const SYMBOLES = [
  { t: "Le rêve récurrent", b: "Il ne se répète pas par hasard. Un scénario qui revient signale un point resté ouvert — et il insistera tant qu'il n'aura pas été entendu." },
  { t: "Le cauchemar", b: "Rarement une menace, souvent une alerte. Il force l'attention sur ce que la vie éveillée continue de contourner." },
  { t: "Les figures familières", b: "Un proche qui apparaît en rêve parle plus souvent de ce qu'il représente en vous que de la personne réelle." },
  { t: "L'eau, la maison, la chute", b: "Les grands symboles reviennent d'un rêveur à l'autre — mais leur sens, lui, reste strictement personnel. C'est là qu'un accompagnement change tout." },
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

export default function CanalDesRevesPage() {
  const e = getEvenement(E_SLUG);
  if (!e) notFound();

  return (
    <div className="page-fade">
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "Accueil", path: "/" },
            { name: "Événements", path: "/evenements" },
            { name: "Canal des Rêves", path: "/canal-des-reves" },
          ]),
          eventLd({
            name: e.titreLong,
            description: e.metaDescription,
            path: "/canal-des-reves",
            image: e.image,
            lieu: e.lieu,
            offerUrl: e.url,
            online: true,
            price: 60,
            currency: "EUR",
          }),
          faqLd(e.faq),
        ]}
      />

      {/* HERO */}
      <section className="page-hero sec-blue" style={{ background: MARINE, borderBottom: "1px solid rgba(255,255,255,0.08)", position: "relative", overflow: "hidden" }}>
        <div
          aria-hidden="true"
          style={{ position: "absolute", inset: 0, background: "radial-gradient(70% 55% at 50% -8%, rgba(245,196,34,0.14) 0%, transparent 60%)", pointerEvents: "none" }}
        />
        <div className="container-narrow" style={{ position: "relative", zIndex: 1 }}>
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

          <h1 className="display" style={{ fontSize: "clamp(32px, 4.2vw, 58px)", margin: "0 0 24px", lineHeight: 1.06, color: "var(--white)" }}>
            Canal des Rêves
          </h1>
          <hr className="filet" style={{ margin: "0 0 28px" }} />
          <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: "clamp(19px, 2.2vw, 26px)", lineHeight: 1.5, color: "var(--gold)", margin: "0 0 32px", maxWidth: 620 }}>
            {e.devise}
          </p>

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <a href={e.url} className="btn btn-gold">
              Rejoindre le canal <Arrow />
            </a>
            <Link href="/contact" className="btn btn-ghost-white">
              Poser une question
            </Link>
          </div>
        </div>
      </section>

      {/* VISUEL + INFOS */}
      <section className="section-tight" style={{ background: "var(--white)" }}>
        <div className="container">
          <div style={{ position: "relative", aspectRatio: "2 / 1", borderRadius: 16, overflow: "hidden", border: "1px solid var(--line)", marginBottom: 36 }}>
            <Image src={e.image} alt="Canal des Rêves — analyse de rêves en groupe" fill sizes="(max-width: 900px) 100vw, 1100px" style={{ objectFit: "cover" }} priority />
          </div>

          <div className="rg-4" style={{ gap: 1, background: "var(--line)", border: "1px solid var(--line)", borderRadius: 14, overflow: "hidden" }}>
            {[
              { k: "Format", v: "Groupe Telegram privé" },
              { k: "Rythme", v: "Ouvert toute l'année" },
              { k: "Tarif", v: "60 € par mois" },
              { k: "Engagement", v: "Aucun — au mois" },
            ].map((i) => (
              <div key={i.k} style={{ background: "var(--white)", padding: "22px 24px" }}>
                <p className="small" style={{ margin: "0 0 8px", letterSpacing: ".18em", textTransform: "uppercase", color: "var(--gold)", fontSize: 10 }}>{i.k}</p>
                <p style={{ margin: 0, fontSize: 15, color: "var(--navy)", lineHeight: 1.45 }}>{i.v}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="section" style={{ background: "var(--paper)" }}>
        <div className="container-narrow">
          <Eyebrow style={{ marginBottom: 26 }}>Pourquoi vos rêves comptent</Eyebrow>
          <h2 className="display" style={{ fontSize: "clamp(28px, 3.4vw, 46px)", margin: "0 0 32px", lineHeight: 1.08 }}>
            Une langue que<br /><em className="display-italic">personne ne vous a apprise.</em>
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

      {/* CE QUE VOUS RECEVEZ */}
      <section className="section" style={{ background: "var(--white)" }}>
        <div className="container">
          <div className="section-head">
            <div>
              <Eyebrow style={{ marginBottom: 24 }}>Ce que vous recevez</Eyebrow>
              <h2>Un accompagnement<br /><em className="display-italic">continu.</em></h2>
            </div>
            <p>
              Pas un cours enregistré, pas un dictionnaire des symboles&nbsp;: un espace vivant où
              vos rêves sont lus, travaillés et remis en lien avec ce que vous traversez.
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

      {/* CE QUE DISENT LES RÊVES */}
      <section className="section" style={{ background: "var(--paper)" }}>
        <div className="container">
          <div className="section-head">
            <div>
              <Eyebrow style={{ marginBottom: 24 }}>Décoder</Eyebrow>
              <h2>Ce que vos rêves<br /><em className="display-italic">essaient de dire.</em></h2>
            </div>
            <p>
              Quelques repères pour commencer à regarder autrement — sachant que le sens d&apos;un
              symbole n&apos;est jamais universel&nbsp;: il est le vôtre.
            </p>
          </div>

          <div className="rg-4" style={{ gap: 20, alignItems: "stretch" }}>
            {SYMBOLES.map((s, i) => (
              <div key={i} style={{ background: "var(--white)", border: "1px solid var(--line)", borderRadius: 16, padding: "28px 26px" }}>
                <h3 className="display" style={{ fontSize: 18.5, color: "var(--navy)", margin: "0 0 12px", lineHeight: 1.3 }}>{s.t}</h3>
                <p style={{ fontSize: 14.5, lineHeight: 1.7, color: "var(--mute)", margin: 0 }}>{s.b}</p>
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
            Le canal s&apos;adresse<br /><em className="display-italic" style={{ color: "var(--gold)" }}>à vous si…</em>
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
      <section className="section" style={{ background: "var(--white)" }}>
        <div className="container-narrow">
          <Eyebrow style={{ marginBottom: 26 }}>Questions fréquentes</Eyebrow>
          <h2 className="display" style={{ fontSize: "clamp(26px, 3vw, 40px)", margin: "0 0 40px", lineHeight: 1.1 }}>
            Avant de<br /><em className="display-italic">nous rejoindre.</em>
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

      {/* CTA FINAL */}
      <section className="section-tight" style={{ background: "var(--paper)", textAlign: "center" }}>
        <div className="container-narrow">
          <Eyebrow style={{ justifyContent: "center", marginBottom: 22 }}>Rejoindre</Eyebrow>
          <h2 className="display" style={{ fontSize: "clamp(26px, 3.2vw, 42px)", margin: "0 0 20px", lineHeight: 1.08 }}>
            Votre prochain rêve<br /><em className="display-italic">a quelque chose à vous dire.</em>
          </h2>
          <p style={{ fontSize: 17, lineHeight: 1.75, color: "var(--mute)", maxWidth: 560, margin: "0 auto 34px" }}>
            60 € par mois, sans engagement de durée. Écrivez-nous&nbsp;: vous recevez le lien
            d&apos;accès au groupe privé et vous pouvez déposer votre premier rêve dès ce soir.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <a href={e.url} className="btn btn-primary btn-lg">
              Rejoindre le Canal des Rêves <Arrow />
            </a>
            <Link href="/evenements" className="btn btn-ghost">
              Voir les autres rendez-vous
            </Link>
          </div>
          <p className="small" style={{ margin: "26px 0 0", color: "var(--mute)", fontSize: 12.5, letterSpacing: ".04em" }}>
            ✦ Espace fermé, confidentiel et bienveillant ✦
          </p>
        </div>
      </section>

    </div>
  );
}
