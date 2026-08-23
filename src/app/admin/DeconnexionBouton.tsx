"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeconnexionBouton() {
  const router = useRouter();
  const [enCours, setEnCours] = useState(false);

  return (
    <button
      type="button"
      className="adm-btn fantome petit"
      disabled={enCours}
      style={{ width: "100%", justifyContent: "center" }}
      onClick={async () => {
        setEnCours(true);
        await fetch("/api/admin/logout", { method: "POST" });
        router.replace("/admin/login");
        router.refresh();
      }}
    >
      {enCours ? "…" : "Se déconnecter"}
    </button>
  );
}
