import type { Metadata } from "next"
import { notFound } from "next/navigation"
import type { WebPage, WebSite, WithContext } from "schema-dts"

import { JsonLd } from "@/components/jsonld"
import PortableText from "@/components/portable-text"
import { siteUrl } from "@/lib/site-url"
import { sanityFetch } from "@/sanity/lib/fetch"
import { contentTags } from "@/sanity/lib/tags"
import { homePageQuery } from "@/sanity/lib/queries"
import { resolveOpenGraphImage } from "@/sanity/lib/utils"
import { contentMetadata, fetchPlainSettings } from "./metadata"

function fetchHomePage(mode: "preview-plain" | "preview-text") {
  return sanityFetch({ query: homePageQuery, mode, tags: contentTags.homePage })
}

export async function generateMetadata(): Promise<Metadata> {
  const [home, settings] = await Promise.all([fetchHomePage("preview-plain"), fetchPlainSettings()])
  if (!home) notFound()

  const title = home.title || settings?.title || "Home"
  const metadata = await contentMetadata({
    title,
    description: home.metaDescription,
    socialTitle: home.ogTitle,
    image: resolveOpenGraphImage(home.ogImage),
    pathname: "/",
    noIndex: home.noIndex,
  })

  return {
    ...metadata,
    title: { absolute: settings?.title && settings.title !== title ? `${title} | ${settings.title}` : title },
  }
}

export default async function HomePage() {
  const [page, settings] = await Promise.all([fetchHomePage("preview-text"), fetchPlainSettings()])
  if (!page) notFound()

  const image = resolveOpenGraphImage(page.ogImage)
  const url = siteUrl("/")
  const name = settings?.title?.trim()
  const website: WithContext<WebSite> | undefined = name ? {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url,
  } : undefined
  const jsonLd: WithContext<WebPage> = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.title ?? undefined,
    image: image?.url,
    url,
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
      {website && <JsonLd jsonLd={website} />}
    </>
  )
}
