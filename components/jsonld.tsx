import { stegaClean } from "next-sanity"

export function JsonLd<T>({ jsonLd }: { jsonLd: T }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(stegaClean(jsonLd)).replace(/</g, "\\u003c"),
      }}
    />
  )
}
