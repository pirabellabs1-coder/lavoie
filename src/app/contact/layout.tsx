import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact — Réserver votre appel découverte offert",
  description:
    "Réservez votre appel découverte offert (45 minutes, sans engagement) avec Domoïna Ramiadana. Formulaire confidentiel et agenda en ligne. Réponse sous 24 h ouvrées.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact — Réserver votre appel découverte offert",
    description:
      "Réservez votre appel découverte offert (45 minutes, sans engagement) avec Domoïna Ramiadana.",
    url: "/contact",
    type: "website",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
