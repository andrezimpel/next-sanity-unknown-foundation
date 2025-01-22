export function JsonLd<T>({ jsonLd }: { jsonLd: T }) {
  return (
    <script
      className="hidden sr-only"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}