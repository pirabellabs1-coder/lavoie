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
};

export default nextConfig;
