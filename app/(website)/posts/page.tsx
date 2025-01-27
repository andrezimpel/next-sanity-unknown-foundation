import { JsonLd } from "@/components/jsonld"
import PortableText from "@/components/portable-text"
import { PostGrid } from "@/components/post-grid"
import { sanityFetch } from "@/sanity/lib/fetch"
import { pageQuery, postsQuery } from "@/sanity/lib/queries"
import { resolveHref, resolveOpenGraphImage } from "@/sanity/lib/utils"
import { Metadata } from "next"
import { PortableTextBlock } from "next-sanity"
import { notFound } from "next/navigation"
import { WebPage, WithContext } from "schema-dts"

async function fetchPosts() {
  return sanityFetch({
    query: postsQuery,
    params: {
      slug: "",
      from: 0,
      to: 12,
    },
  })
}

async function fetchPage() {
  return sanityFetch({
    query: pageQuery,
    params: {
      slug: "posts",
    },
  })
}

// Function to generate metadata
export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchPage()
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
      canonical: resolveHref("page", "posts"),
    }
  }
}

export default async function PostsPage() {
  const [page, posts] = await Promise.all([
    fetchPage(),
    fetchPosts(),
  ])

  if (!page) return notFound()

  const openGraphImage = resolveOpenGraphImage(page?.ogImage || page?.coverImage)

  return (
    <>
      <div className="container mx-auto space-y-6">
        <h1 className="text-4xl font-bold">{page.title}</h1>
        <PortableText value={page.content as PortableTextBlock[]} />
        <PostGrid posts={posts} />
      </div>
      <JsonLd jsonLd={{
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: page?.title,
        ...(openGraphImage && {
          image: openGraphImage?.url
        }),
        url: resolveHref("page", "posts", true),
        ...(page?.metaDescription && { description: page.metaDescription }),
        ...(page?._updatedAt && { dateModified: page._updatedAt })
      } as WithContext<WebPage>} />
    </>
  )
}
