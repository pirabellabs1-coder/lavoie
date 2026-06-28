import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollProgress from "@/components/ScrollProgress";
import CursorGlow from "@/components/CursorGlow";
import RevealObserver from "@/components/RevealObserver";
import JsonLd from "@/components/JsonLd";
import { SITE } from "@/lib/site";
import { organizationLd, founderLd, websiteLd } from "@/lib/jsonld";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "La Voie 2 la Conscience — Accompagnement initiatique",
    template: "%s | La Voie 2 la Conscience",
  },
  description:
    "Accompagnement initiatique haut de gamme pour dirigeants, cadres supérieurs et thérapeutes. 500+ personnes accompagnées par Domoïna en 15 ans de pratique.",
  applicationName: SITE.name,
  keywords: [
    "coaching transformation",
    "accompagnement initiatique",
    "retraite spirituelle dirigeants",
    "coaching dirigeant Sarthe",
    "Domoïna",
    "Centre HUT",
    "méthode AIME",
    "Voie Initiatique de l'Eau",
    "Cycle des Saisons",
    "excellence authentique",
  ],
  authors: [{ name: "Domoïna", url: `${SITE.url}/domoina` }],
  creator: "Domoïna",
  publisher: SITE.name,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: SITE.locale,
    url: SITE.url,
    siteName: SITE.name,
    title: "La Voie 2 la Conscience — Accompagnement initiatique",
    description:
      "Accompagnement initiatique haut de gamme pour dirigeants, cadres supérieurs et thérapeutes.",
    // og:image fourni par src/app/opengraph-image.tsx
  },
  twitter: {
    card: "summary_large_image",
    title: "La Voie 2 la Conscience — Accompagnement initiatique",
    description:
      "Accompagnement initiatique haut de gamme pour dirigeants, cadres supérieurs et thérapeutes.",
    // twitter:image fourni par src/app/twitter-image.tsx
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "Coaching & accompagnement",
  verification: {
    google: "dbrB7rDSpAVAafvLAeB6OH3y9U7-6qhKrs6YBqyfu2E",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      className={`${cormorant.variable} ${inter.variable}`}
    >
      <body>
        <JsonLd data={[organizationLd(), founderLd(), websiteLd()]} />
        <div className="cursor-glow" aria-hidden="true" />
        <ScrollProgress />
        <CursorGlow />
        <RevealObserver />
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
