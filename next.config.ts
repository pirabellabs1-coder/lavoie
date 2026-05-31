import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // En dev local, l'optimiseur serveur (/_next/image) timeout (7s) en
    // récupérant les images distantes derrière le pare-feu. On sert donc
    // les URLs Unsplash directement au navigateur, qui les atteint sans souci.
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
    ],
  },
};

export default nextConfig;
