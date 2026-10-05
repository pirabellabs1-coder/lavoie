import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Le dépôt d'une photo de stage passe par une Server Action, et la limite
      // par défaut est d'un méga-octet — soit moins qu'une photo sortie d'un
      // téléphone.
      //
      // Ce réglage est global : il vaut aussi pour les actions joignables sans
      // session (désinscription, accès aux données, prérequis, proposition, et
      // l'acceptation d'une invitation, exemptée du proxy). On le tient
      // donc au plus près du besoin réel — le module d'images refuse au-delà de
      // quatre méga-octets, et le corps d'une requête de fonction est de toute
      // façon plafonné autour de quatre et demi chez Vercel.
      bodySizeLimit: "4.5mb",
    },
  },
  images: {
    // En dev local, l'optimiseur serveur (/_next/image) timeout (7s) en
    // récupérant les images distantes derrière le pare-feu local → on sert
    // les URLs directement au navigateur. En production (Vercel), l'optimiseur
    // fonctionne : on l'active pour servir des images optimisées (WebP, redim.).
    unoptimized: process.env.NODE_ENV !== "production",
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
    ],
  },
  // L'ancien catalogue de formations numériques a été remplacé par l'agenda
  // des événements (billetterie en ligne) → on préserve le jus SEO des liens
  // existants vers /formations.
  async redirects() {
    return [
      { source: "/formations", destination: "/evenements", permanent: true },
    ];
  },
};

export default nextConfig;
