import { sanityFetch } from "@/sanity/lib/fetch"
import { pageQuery } from "@/sanity/lib/queries"
import { resolveOpenGraphImage } from "@/sanity/lib/utils"
import { Metadata } from 'next'
import { PortableText } from "next-sanity"
import { notFound } from "next/navigation"
import { PortableTextBlock } from "sanity"

async function fetchPage({ params }: Props) {
  return sanityFetch({
    query: pageQuery,
    params
  })
}

export type Props = {
  params: Promise<{ slug: string }>
}

// Function to generate metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await fetchPage({ params })
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
  }
}

export default async function Page({ params }: Props) {
  const page = await fetchPage({ params })

  if (!page) {
    return notFound()
  }

  return (
    <div className="container mx-auto space-y-6">
      <h1 className="text-4xl font-bold">{page?.title}</h1>
      <PortableText value={page?.content as PortableTextBlock[]} />
    </div>
  )
}
