import type { Metadata } from "next"
import type { WebPage, WithContext } from "schema-dts"

import { JsonLd } from "@/components/jsonld"
import PortableText from "@/components/portable-text"
import { PostGrid } from "@/components/post-grid"
import { siteUrl } from "@/lib/site-url"
import { resolveOpenGraphImage } from "@/sanity/lib/utils"
import { contentMetadata } from "../metadata"
import { fetchListing, fetchPostsPage, Pagination } from "./listing"

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchListing("preview-plain")
  return contentMetadata({
    title: page.title,
    description: page.metaDescription,
    socialTitle: page.ogTitle,
    image: resolveOpenGraphImage(page.ogImage || page.coverImage),
    pathname: "/posts",
    noIndex: page.noIndex,
  })
}

export default async function PostsPage() {
  const [page, { posts, hasNext }] = await Promise.all([
    fetchListing("preview-text"),
    fetchPostsPage(1, "preview-text"),
  ])

  const image = resolveOpenGraphImage(page.ogImage || page.coverImage)
  const jsonLd: WithContext<WebPage> = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.title,
    image: image?.url,
    url: siteUrl("/posts"),
    description: page.metaDescription ?? undefined,
  }

  return (
    <>
      <div className="container mx-auto space-y-6">
        <h1 className="text-4xl font-bold">{page.title}</h1>
        <PortableText value={page.content} />
        <PostGrid posts={posts} />
        <Pagination page={1} hasNext={hasNext} />
      </div>
      <JsonLd jsonLd={jsonLd} />
    </>
  )
}
