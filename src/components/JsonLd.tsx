/**
 * Rend un bloc de données structurées JSON-LD.
 * Échappe le caractère "<" en son équivalent unicode pour prévenir les
 * injections XSS (recommandation officielle Next.js).
 */
export default function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
