"use client";

import { useEffect, useRef, useState } from "react";
import { lire } from "@/lib/attribution";

/**
 * Protection des formulaires publics, côté navigateur.
 *
 * Fournit deux choses à un formulaire :
 *   · `champ`, un piège invisible qu'un humain ne remplit jamais ;
 *   · `donnees()`, à étaler dans le corps de la requête — le contenu du piège,
 *     le temps passé sur le formulaire, et l'origine du visiteur.
 *
 * Le contrôle se fait côté serveur (`src/lib/crm/antispam.ts`) : ce qui est
 * ici ne sert qu'à lui donner de quoi juger.
 */
export function useProtection() {
  const [piege, setPiege] = useState("");
  // Horodaté à l'affichage, pas au rendu : lire l'heure pendant le rendu est
  // impur, et le serveur n'a de toute façon pas la même que le navigateur.
  const debut = useRef(0);
  useEffect(() => {
    debut.current = Date.now();
  }, []);

  const donnees = () => ({
    _piege: piege,
    _delai: debut.current ? Date.now() - debut.current : 0,
    origine: lire(),
  });

  const champ = (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        left: -9999,
        width: 1,
        height: 1,
        overflow: "hidden",
      }}
    >
      <label>
        Ne remplissez pas ce champ
        <input
          type="text"
          name="site"
          tabIndex={-1}
          autoComplete="off"
          value={piege}
          onChange={(e) => setPiege(e.target.value)}
        />
      </label>
    </div>
  );

  return { champ, donnees };
}
