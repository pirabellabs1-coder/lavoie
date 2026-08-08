import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
