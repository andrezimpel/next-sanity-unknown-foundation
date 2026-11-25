import type { Metadata } from "next"
import { notFound } from "next/navigation"
import type { WebPage, WithContext } from "schema-dts"

import { JsonLd } from "@/components/jsonld"
import PortableText from "@/components/portable-text"
import { siteUrl } from "@/lib/site-url"
import { sanityFetch } from "@/sanity/lib/fetch"
import { contentTags } from "@/sanity/lib/tags"
import { pagePathsQuery, pageQuery } from "@/sanity/lib/queries"
import { decodeRouteSlug, isRoutableSlug, resolvePathname } from "@/sanity/lib/routes"
import { resolveOpenGraphImage } from "@/sanity/lib/utils"
import { contentMetadata } from "../metadata"

type Props = { params: Promise<{ slug: string }> }

async function fetchPage(params: Props["params"], mode: "preview-plain" | "preview-text") {
  const slug = decodeRouteSlug("page", (await params).slug)
  if (!slug) notFound()
  const page = await sanityFetch({ query: pageQuery, params: { slug }, mode, tags: contentTags.page })
  if (!page) notFound()
  return { page, slug }
}

export async function generateStaticParams() {
  const paths = await sanityFetch({ query: pagePathsQuery, mode: "published", tags: ["page"] })
  return paths.flatMap(({ slug }) =>
    isRoutableSlug("page", slug) && slug !== "posts" ? [{ slug }] : [],
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { page, slug } = await fetchPage(params, "preview-plain")
  return contentMetadata({
    title: page.title,
    description: page.metaDescription,
    socialTitle: page.ogTitle,
    image: resolveOpenGraphImage(page.ogImage || page.coverImage),
    pathname: resolvePathname("page", slug)!,
    noIndex: page.noIndex,
  })
}

export default async function Page({ params }: Props) {
  const { page, slug } = await fetchPage(params, "preview-text")
  const image = resolveOpenGraphImage(page.ogImage || page.coverImage)
  const jsonLd: WithContext<WebPage> = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.title,
    image: image?.url,
    url: siteUrl(resolvePathname("page", slug)!),
    description: page.metaDescription ?? undefined,
    dateModified: page._updatedAt,
  }

  return (
    <>
      <div className="container mx-auto space-y-6">
        <h1 className="text-4xl font-bold">{page.title}</h1>
        <PortableText value={page.content} />
      </div>
      <JsonLd jsonLd={jsonLd} />
    </>
  )
}
