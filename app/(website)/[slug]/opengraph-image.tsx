import { renderSocialImage, socialImageSize } from "@/components/social-image"
import { sanityFetch } from "@/sanity/lib/fetch"
import { contentTags } from "@/sanity/lib/tags"
import { pagePathsQuery, pageQuery } from "@/sanity/lib/queries"
import { isRoutableSlug } from "@/sanity/lib/routes"
import { resolveOpenGraphImage } from "@/sanity/lib/utils"

export const alt = "Page"
export const size = socialImageSize
export const contentType = "image/png"

export async function generateStaticParams() {
  const paths = await sanityFetch({ query: pagePathsQuery, mode: "published", tags: ["page"] })
  return paths.flatMap(({ slug }) =>
    isRoutableSlug("page", slug) && slug !== "posts" ? [{ slug }] : [],
  )
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!isRoutableSlug("page", slug)) return new Response(null, { status: 404 })
  const document = await sanityFetch({
    query: pageQuery,
    params: { slug },
    tags: contentTags.page,
    mode: "published",
  })
  if (!document) return new Response(null, { status: 404 })
  return renderSocialImage(
    document.ogTitle || document.title,
    resolveOpenGraphImage(document.ogImage || document.coverImage)?.url,
  )
}
