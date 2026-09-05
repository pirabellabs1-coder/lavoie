import type { Metadata } from "next";
import Link from "next/link";
import DeposerTemoignage from "@/components/DeposerTemoignage";
import { aDejaTemoigne, contactDuJeton } from "@/lib/crm/avis";
import { nomAffiche } from "@/lib/crm/contacts";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Votre avis",
  // Page atteinte par lien personnel : elle n'a rien à faire dans un moteur.
  robots: { index: false, follow: false },
};

/**
 * Le dépôt d'un avis par lien personnel.
 *
 * Même formulaire que la page publique, mais le nom est déjà là et le
 * témoignage se rattachera à la fiche de la personne. Un lien périmé ou
 * illisible ne renvoie pas une erreur sèche : il ramène vers le dépôt public,
 * où le témoignage reste possible — simplement anonyme.
 */
export default async function AvisPage({ params }: { params: Promise<{ jeton: string }> }) {
  const { jeton } = await params;
  const invite = await contactDuJeton(jeton);
  const dejaFait = invite ? await aDejaTemoigne(invite.id) : false;

  return (
    <div className="page-fade">
      <section
        className="page-hero"
        style={{
          background: "var(--white)",
          borderBottom: "1px solid var(--line)",
          paddingBottom: 48,
        }}
      >
        <div className="container-narrow" style={{ textAlign: "center" }}>
          <p className="eyebrow" style={{ margin: "0 0 30px", justifyContent: "center" }}>
            <span className="dot" />
            Votre expérience
            <span className="dot" />
          </p>
          <h1
            className="display"
            style={{ fontSize: "clamp(32px, 4.2vw, 58px)", margin: "0 0 26px", lineHeight: 1.04 }}
          >
            {invite?.prenom ? (
              <>
                Merci, {invite.prenom}.
                <br />
                <em className="display-italic">Vos mots comptent.</em>
              </>
            ) : (
              <>
                Ce que vous avez vécu
                <br />
                <em className="display-italic">peut éclairer quelqu&apos;un.</em>
              </>
            )}
          </h1>
          <hr className="filet" style={{ margin: "0 auto 30px" }} />
          <p
            style={{
              fontSize: 17,
              lineHeight: 1.75,
              color: "var(--navy-ink)",
              maxWidth: 620,
              margin: "0 auto",
            }}
          >
            Quelques phrases suffisent. Ce qui aide vraiment celles et ceux qui hésitent, ce
            ne sont pas les compliments : c&apos;est ce qui était difficile, ce qui a bougé, et
            ce que vous en gardez aujourd&apos;hui. Rien n&apos;est publié sans relecture, et
            vous pouvez demander le retrait à tout moment.
          </p>
        </div>
      </section>

      <section className="section" style={{ background: "var(--paper)", paddingTop: 72 }}>
        <div className="container-narrow">
          {dejaFait && (
            <div
              style={{
                background: "var(--white)",
                border: "1px solid var(--line)",
                borderRadius: 18,
                padding: 28,
                marginBottom: 22,
                lineHeight: 1.75,
              }}
            >
              Vous avez déjà déposé un témoignage — merci encore. Si vous souhaitez le
              compléter ou le corriger, écrivez ci-dessous : c&apos;est la version la plus
              récente que nous relirons.
            </div>
          )}

          {!invite && (
            <div
              style={{
                background: "var(--white)",
                border: "1px solid var(--line)",
                borderRadius: 18,
                padding: 28,
                marginBottom: 22,
                lineHeight: 1.75,
              }}
            >
              Ce lien personnel n&apos;est plus valable — les liens expirent au bout de deux
              mois. Vous pouvez tout de même écrire ici, en indiquant votre nom, ou passer par
              la <Link href="/temoignages">page des témoignages</Link>.
            </div>
          )}

          <DeposerTemoignage
            nom={invite ? nomAffiche(invite) : ""}
            jeton={invite ? jeton : undefined}
            titre={invite?.prenom ? `Dites-le avec vos mots, ${invite.prenom}.` : undefined}
          />
        </div>
      </section>
    </div>
  );
}
