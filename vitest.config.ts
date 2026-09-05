import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

/**
 * Les tests portent sur la logique pure — celle qui décide qui reçoit quoi.
 *
 * Rien ici ne touche à la base ni n'envoie d'e-mail : les fonctions testées
 * prennent des données et en rendent d'autres. C'est justement là que se
 * cachent les erreurs coûteuses (un score mal pondéré, une adresse mal lue, un
 * prénom manquant qui casse un objet d'e-mail), et c'est ce qui se teste sans
 * infrastructure.
 */
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
  },
});
