"use client";

import { useEffect } from "react";
import { capturer } from "@/lib/attribution";

/**
 * Monté une fois dans la mise en page du site : retient la provenance du
 * visiteur dès son arrivée, bien avant qu'il ne remplisse quoi que ce soit.
 * N'affiche rien et ne dépose aucun cookie — un seul enregistrement local.
 */
export default function CaptureOrigine() {
  useEffect(() => {
    capturer();
  }, []);
  return null;
}
