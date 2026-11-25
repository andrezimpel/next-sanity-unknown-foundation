export const documentTags = ["page", "post", "author", "homePage", "settings", "navigationZone"] as const

export type DocumentTag = (typeof documentTags)[number]

// Each body can link to pages and posts. Post details also include the author.
export const contentTags = {
  homePage: ["homePage", "page", "post"],
  page: ["page", "post"],
  post: ["post", "page", "author"],
} satisfies Record<"homePage" | "page" | "post", DocumentTag[]>

export function isDocumentTag(value: unknown): value is DocumentTag {
  return typeof value === "string" && documentTags.some((tag) => tag === value)
}

export function getWebhookTags(value: unknown): DocumentTag[] | undefined {
  if (!Array.isArray(value) || value.length === 0) return
  if (value.every(isDocumentTag)) return [...new Set(value)]

  // The previous Sanity projection sent [_type, _type + ":" + slug.current].
  const [type, legacySlug] = value
  if (value.length === 2 && isDocumentTag(type) && (
    legacySlug === null ||
    (typeof legacySlug === "string" && legacySlug.startsWith(type + ":"))
  )) return [type]
}
