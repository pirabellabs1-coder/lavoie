import type { Metadata } from "next";
import Link from "next/link";
import { parJeton } from "@/lib/crm/questionnaires";
import { actionConfirmerPrerequis } from "./actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Confirmation des prérequis",
  robots: { index: false, follow: false },
};

const VIDEO = "https://youtube.com/live/tMXW3wfZqqI";
const LIVRET = "https://formation-untout.com/comment-le-cadre-vous-rend-t-il-plus-libre";

function dateLongue(d: Date | string): string {
  const v = d instanceof Date ? d : new Date(d);
  return v.toLocaleString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Coquille({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-fade">
      <section className="section" style={{ paddingTop: 120 }}>
        <div className="container-narrow" style={{ maxWidth: 640 }}>{children}</div>
      </section>
    </div>
  );
}

export default async function PrerequisPage({
  params,
}: {
  params: Promise<{ jeton: string }>;
}) {
  const { jeton } = await params;
  const copie = await parJeton(jeton);

  if (!copie) {
    return (
      <Coquille>
        <h1 className="display" style={{ fontSize: 34, margin: "0 0 16px" }}>
          Ce lien n&apos;est plus valable.
        </h1>
        <p style={{ color: "var(--mute)", lineHeight: 1.75 }}>
          Il a peut-être été tronqué par votre messagerie. Ouvrez-le depuis l&apos;e-mail
          d&apos;origine, ou écrivez au secrétariat à contact@lavoie2laconscience.com.
        </p>
        <p style={{ marginTop: 28 }}>
          <Link href="/" className="btn">
            Retour à l&apos;accueil
          </Link>
        </p>
      </Coquille>
    );
  }

  if (copie.prerequis_le) {
    return (
      <Coquille>
        <p
          className="small"
          style={{
            letterSpacing: ".2em",
            textTransform: "uppercase",
            fontSize: 10.5,
            color: "var(--gold)",
            margin: "0 0 18px",
          }}
        >
          Confirmé
        </p>
        <h1 className="display" style={{ fontSize: 34, margin: "0 0 16px" }}>
          C&apos;est noté{copie.prenom ? `, ${copie.prenom}` : ""}.
        </h1>
        <p style={{ color: "var(--mute)", lineHeight: 1.75 }}>
          Votre confirmation a été enregistrée le {dateLongue(copie.prerequis_le)}. Le
          secrétariat en est informé, et votre entretien est maintenu.
          {copie.rdv_le ? ` Il est prévu le ${dateLongue(copie.rdv_le)}.` : ""}
        </p>
        <p style={{ color: "var(--mute)", lineHeight: 1.75, marginTop: 18 }}>
          Rien d&apos;autre à faire d&apos;ici là. Venez avec vos questions, pas avec des
          réponses préparées.
        </p>
      </Coquille>
    );
  }

  return (
    <Coquille>
      <p
        className="small"
        style={{
          letterSpacing: ".2em",
          textTransform: "uppercase",
          fontSize: 10.5,
          color: "var(--gold)",
          margin: "0 0 18px",
        }}
      >
        Avant votre entretien
      </p>
      <h1 className="display" style={{ fontSize: 34, margin: "0 0 18px", lineHeight: 1.1 }}>
        Deux choses à avoir faites
        {copie.prenom ? `, ${copie.prenom}` : ""}.
      </h1>
      <p style={{ color: "var(--mute)", lineHeight: 1.75, margin: "0 0 34px" }}>
        Elles ne prennent pas plus d&apos;une heure, et elles changent entièrement la
        qualité de ce que vous vivrez pendant l&apos;entretien.
        {copie.rdv_le
          ? ` Votre rendez-vous est prévu le ${dateLongue(copie.rdv_le)} : la confirmation est attendue au plus tard la veille.`
          : " La confirmation est attendue au plus tard la veille du rendez-vous."}
      </p>

      <ol style={{ display: "grid", gap: 18, margin: "0 0 36px", padding: "0 0 0 20px" }}>
        <li style={{ lineHeight: 1.7 }}>
          <strong>Visionner la vidéo sur la gratuité.</strong>
          <br />
          Elle vous permet de vous présenter dans une posture de responsabilité vis-à-vis
          de vos questions et de vos attentes envers le Guide.
          <br />
          <a href={VIDEO} target="_blank" rel="noopener noreferrer" style={{ color: "var(--blue)", textDecoration: "underline" }}>
            Ouvrir la vidéo
          </a>
        </li>
        <li style={{ lineHeight: 1.7 }}>
          <strong>Récupérer le livret sur le Cadre.</strong>
          <br />
          Comment une contrainte choisie rend plus libre — c&apos;est le socle de tout
          accompagnement ici.
          <br />
          <a href={LIVRET} target="_blank" rel="noopener noreferrer" style={{ color: "var(--blue)", textDecoration: "underline" }}>
            Ouvrir le livret
          </a>
        </li>
      </ol>

      <form action={actionConfirmerPrerequis}>
        <input type="hidden" name="jeton" value={jeton} />
        <button type="submit" className="btn btn-primary">
          J&apos;ai visionné la vidéo et pris le livret
        </button>
      </form>

      <p style={{ color: "var(--mute)", fontSize: 13, lineHeight: 1.7, marginTop: 22 }}>
        Sans cette confirmation, le rendez-vous est annulé la veille et la place est
        rendue à quelqu&apos;un d&apos;autre. Ce n&apos;est pas une sanction : c&apos;est
        le cadre, et il vaut aussi pour nous.
      </p>
    </Coquille>
  );
}
