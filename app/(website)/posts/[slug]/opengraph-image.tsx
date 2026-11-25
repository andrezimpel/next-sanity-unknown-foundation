import { renderSocialImage, socialImageSize } from "@/components/social-image"
import { sanityFetch } from "@/sanity/lib/fetch"
import { contentTags } from "@/sanity/lib/tags"
import { postPathsQuery, postQuery } from "@/sanity/lib/queries"
import { isRoutableSlug } from "@/sanity/lib/routes"
import { resolveOpenGraphImage } from "@/sanity/lib/utils"

export const alt = "Post"
export const size = socialImageSize
export const contentType = "image/png"

export async function generateStaticParams() {
  const paths = await sanityFetch({ query: postPathsQuery, mode: "published", tags: ["post"] })
  return paths.flatMap(({ slug }) =>
    isRoutableSlug("post", slug) ? [{ slug }] : [],
  )
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!isRoutableSlug("post", slug)) return new Response(null, { status: 404 })
  const document = await sanityFetch({
    query: postQuery,
    params: { slug },
    tags: contentTags.post,
    mode: "published",
  })
  if (!document) return new Response(null, { status: 404 })
  return renderSocialImage(
    document.ogTitle || document.title,
    resolveOpenGraphImage(document.ogImage || document.coverImage)?.url,
  )
}
