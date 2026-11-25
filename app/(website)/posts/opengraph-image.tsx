import { renderSocialImage, socialImageSize } from "@/components/social-image"
import { sanityFetch } from "@/sanity/lib/fetch"
import { contentTags } from "@/sanity/lib/tags"
import { pageQuery } from "@/sanity/lib/queries"
import { resolveOpenGraphImage } from "@/sanity/lib/utils"

export const alt = "Posts"
export const size = socialImageSize
export const contentType = "image/png"

export default async function Image() {
  const page = await sanityFetch({
    query: pageQuery,
    params: { slug: "posts" },
    tags: contentTags.page,
    mode: "published",
  })
  if (!page) return new Response(null, { status: 404 })
  return renderSocialImage(page.ogTitle || page.title, resolveOpenGraphImage(page.ogImage || page.coverImage)?.url)
}
