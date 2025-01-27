import DateComponent from "@/components/date"
import { JsonLd } from "@/components/jsonld"
import PortableText from "@/components/portable-text"
import { sanityFetch } from "@/sanity/lib/fetch"
import { postPathsQuery, postQuery } from "@/sanity/lib/queries"
import { resolveHref, resolveOpenGraphImage } from "@/sanity/lib/utils"
import { Metadata } from "next"
import { toPlainText, type PortableTextBlock } from "next-sanity"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { BlogPosting, WithContext } from "schema-dts"
import Avatar from "./avatar"
import { PostCoverImage } from "./cover-image"
import MoreStories from "./more-posts"

export type Props = {
  params: Promise<{ slug: string }>
}

async function fetchPost({ params }: Props) {
  const resolvedParams = await params
  return await sanityFetch({
    query: postQuery,
    params: params,
    tags: [`post:${resolvedParams.slug}`],
  })
}

export async function generateStaticParams() {
  return await sanityFetch({
    query: postPathsQuery,
    perspective: "published",
    stega: false,
  })
}

// Function to generate metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await fetchPost({ params })
  const resolvedParams = await params
  const ogImage = resolveOpenGraphImage(post?.ogImage)

  return {
    ...(post?.title && { title: post?.title }),
    ...(post?.metaDescription && { description: post.metaDescription }),
    openGraph: {
      ...(post?.ogTitle && { title: post.ogTitle }),
      ...(ogImage && { images: [ogImage] }),
    },
    robots: {
      index: !post?.noIndex
    },
    alternates: {
      canonical: resolveHref("post", resolvedParams?.slug),
    }
  }
}

export default async function PostPage({ params }: Props) {
  const post = await fetchPost({ params })
  const resolvedParams = await params

  if (!post) {
    return notFound()
  }

  const openGraphImage = resolveOpenGraphImage(post?.ogImage)

  return (
    <>
      <div className="container mx-auto" itemScope itemType="https://schema.org/BlogPosting">
        <article className="space-y-8">
          <h1 className="text-4xl font-bold" itemProp="headline">{post.title}</h1>
          <div className="mb-8 sm:mx-0 md:mb-16" itemProp="image">
            <PostCoverImage image={post.coverImage} />
          </div>
          {post.date && (
            <div className="my-4 text-sm" itemProp="datePublished" content={post.date}>
              <DateComponent dateString={post.date} />
            </div>
          )}
          {post.author && (
            <div className="mt-6 mb-12 md:block" itemProp="author" itemScope itemType="https://schema.org/Person">
              <Avatar name={post.author.name} picture={post.author.picture} />
              <meta itemProp="name" content={post.author.name} />
            </div>
          )}
          {post.content?.length && (
            <div itemProp="articleBody">
              <PortableText
                value={post.content as PortableTextBlock[]}
              />
            </div>
          )}
        </article>
        <aside className="mt-12 space-y-4">
          <h2 className="text-lg font-bold">
            Recent Stories
          </h2>
          <Suspense>
            <MoreStories slug={post.slug || ""} from={0} to={3} />
          </Suspense>
        </aside>
      </div>
      <JsonLd jsonLd={{
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        name: post?.title,
        ...(openGraphImage && {
          image: openGraphImage?.url
        }),
        articleBody: toPlainText(post.content as PortableTextBlock[]),
        ...(post.date && { datePublished: post.date }),
        ...(post?._updatedAt && { dateModified: post._updatedAt }),
        url: resolveHref("post", resolvedParams?.slug, true),
        ...(post?.metaDescription && { description: post.metaDescription }),
        ...((post?.author && post.author.name) && {
          author: {
            '@type': 'Person',
            name: post.author.name,
            ...(post.author.position && { occupation: post.author.position }),
          }
        })
      } as WithContext<BlogPosting>} />
    </>
  )
}
