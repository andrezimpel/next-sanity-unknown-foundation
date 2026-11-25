import { renderSocialImage, socialImageSize } from "@/components/social-image"
import { sanityFetch } from "@/sanity/lib/fetch"
import { contentTags } from "@/sanity/lib/tags"
import { homePageQuery } from "@/sanity/lib/queries"
import { resolveOpenGraphImage } from "@/sanity/lib/utils"

export const alt = "Home"
export const size = socialImageSize
export const contentType = "image/png"

export default async function Image() {
  const home = await sanityFetch({ query: homePageQuery, tags: contentTags.homePage, mode: "published" })
  if (!home) return new Response(null, { status: 404 })
  return renderSocialImage(home.ogTitle || home.title || "Home", resolveOpenGraphImage(home.ogImage)?.url)
}
