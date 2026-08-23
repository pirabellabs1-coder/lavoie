import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollProgress from "@/components/ScrollProgress";
import CursorGlow from "@/components/CursorGlow";
import RevealObserver from "@/components/RevealObserver";
import FloatingCTA from "@/components/FloatingCTA";
import JsonLd from "@/components/JsonLd";
import { organizationLd, founderLd, websiteLd } from "@/lib/jsonld";

/**
 * Habillage du site public : navigation, pied de page et données structurées.
 * Le tableau de bord (/admin) vit hors de ce groupe et n'en hérite donc pas.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={[organizationLd(), founderLd(), websiteLd()]} />
      <div className="cursor-glow" aria-hidden="true" />
      <ScrollProgress />
      <CursorGlow />
      <RevealObserver />
      <Navbar />
      <main>{children}</main>
      <Footer />
      <FloatingCTA />
    </>
  );
}
