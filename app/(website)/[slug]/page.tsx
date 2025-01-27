import { JsonLd } from "@/components/jsonld"
import PortableText from "@/components/portable-text"
import { sanityFetch } from "@/sanity/lib/fetch"
import { pagePathsQuery, pageQuery } from "@/sanity/lib/queries"
import { resolveHref, resolveOpenGraphImage } from "@/sanity/lib/utils"
import { Metadata } from 'next'
import { PortableTextBlock } from "next-sanity"
import { notFound } from "next/navigation"
import { WebPage, WithContext } from 'schema-dts'

async function fetchPage({ params }: Props) {
  return sanityFetch({
    query: pageQuery,
    params
  })
}

export type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return await sanityFetch({
    query: pagePathsQuery,
    perspective: "published",
    stega: false,
  })
}

// Function to generate metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await fetchPage({ params })
  const resolvedParams = await params
  const ogImage = resolveOpenGraphImage(page?.ogImage || page?.coverImage)

  return {
    ...(page?.title && { title: page?.title }),
    ...(page?.metaDescription && { description: page.metaDescription }),
    openGraph: {
      ...(page?.ogTitle && { title: page.ogTitle }),
      ...(ogImage && { images: [ogImage] }),
    },
    robots: {
      index: !page?.noIndex
    },
    alternates: {
      canonical: resolveHref("page", resolvedParams?.slug, true),
    }
  }
}

export default async function Page({ params }: Props) {
  const resolvedParams = await params
  const page = await fetchPage({ params })

  if (!page) {
    return notFound()
  }

  const openGraphImage = resolveOpenGraphImage(page?.ogImage || page?.coverImage)

  return (
    <>
      <div className="container mx-auto space-y-6">
        <h1 className="text-4xl font-bold">{page?.title}</h1>
        <PortableText value={page?.content as PortableTextBlock[]} />
      </div>
      <JsonLd jsonLd={{
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: page?.title,
        ...(openGraphImage && {
          image: openGraphImage?.url
        }),
        url: resolveHref("page", resolvedParams?.slug),
        ...(page?.metaDescription && { description: page.metaDescription }),
        ...(page?._updatedAt && { dateModified: page._updatedAt }),
      } as WithContext<WebPage>} />
    </>
  )
}
