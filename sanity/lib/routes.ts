const reservedPageSlugs = new Set(["_next", "api", "favicon.ico", "robots.txt", "sitemap.xml", "studio"])
const generatedIcon = /^(?:apple-icon|icon)(?:-[a-z0-9]{6})?\.(?:ico|png|svg|jpe?g)$/i
const generatedSocialImage = /^opengraph-image(?:-[a-z0-9]{6})?$/i

export function isRoutableSlug(type: "page" | "post", slug: unknown): slug is string {
  return typeof slug === "string" && !!slug &&
    slug !== "." && slug !== ".." && !/[\/\\?#%]/u.test(slug) &&
    !/[\u0000-\u001f\u007f\ud800-\udfff]/u.test(slug) &&
    !generatedSocialImage.test(slug) &&
    (type !== "page" || (!reservedPageSlugs.has(slug) && !generatedIcon.test(slug)))
}

export function isNewSlug(type: "page" | "post", slug: unknown): slug is string {
  return isRoutableSlug(type, slug) && !/\s/u.test(slug)
}

export function decodeRouteSlug(type: "page" | "post", encoded: string) {
  try {
    const slug = decodeURIComponent(encoded)
    if (isRoutableSlug(type, slug)) return slug
  } catch {
    // Malformed encodings cannot name a public route.
  }
}

export function resolvePathname(type?: string, slug?: string | null) {
  if ((type !== "page" && type !== "post") || !isRoutableSlug(type, slug)) return
  return type === "page" ? `/${encodeURIComponent(slug)}` : `/posts/${encodeURIComponent(slug)}`
}
