import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { toPlainText } from "next-sanity"
import { Suspense } from "react"
import type { BlogPosting, WithContext } from "schema-dts"

import DateComponent from "@/components/date"
import { JsonLd } from "@/components/jsonld"
import PortableText from "@/components/portable-text"
import { siteUrl } from "@/lib/site-url"
import { sanityFetch } from "@/sanity/lib/fetch"
import { contentTags } from "@/sanity/lib/tags"
import { postPathsQuery, postQuery } from "@/sanity/lib/queries"
import { decodeRouteSlug, isRoutableSlug, resolvePathname } from "@/sanity/lib/routes"
import { resolveOpenGraphImage } from "@/sanity/lib/utils"
import { contentMetadata } from "../../metadata"
import Avatar from "./avatar"
import { PostCoverImage } from "./cover-image"
import MoreStories from "./more-posts"

type Props = { params: Promise<{ slug: string }> }

async function fetchPost(params: Props["params"], mode: "preview-plain" | "preview-text") {
  const slug = decodeRouteSlug("post", (await params).slug)
  if (!slug) notFound()
  const post = await sanityFetch({
    query: postQuery,
    params: { slug },
    mode,
    tags: contentTags.post,
  })
  if (!post) notFound()
  return { post, slug }
}

export async function generateStaticParams() {
  const paths = await sanityFetch({ query: postPathsQuery, mode: "published", tags: ["post"] })
  return paths.flatMap(({ slug }) => isRoutableSlug("post", slug) ? [{ slug }] : [])
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { post, slug } = await fetchPost(params, "preview-plain")
  return contentMetadata({
    title: post.title,
    description: post.metaDescription || post.excerpt,
    socialTitle: post.ogTitle,
    image: resolveOpenGraphImage(post.ogImage || post.coverImage),
    pathname: resolvePathname("post", slug)!,
    noIndex: post.noIndex,
    type: "article",
  })
}

export default async function PostPage({ params }: Props) {
  const { post, slug } = await fetchPost(params, "preview-text")
  const image = resolveOpenGraphImage(post.ogImage || post.coverImage)
  const article: WithContext<BlogPosting> = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    image: image?.url,
    articleBody: post.content?.length ? toPlainText(post.content) : undefined,
    datePublished: post.date ?? undefined,
    dateModified: post._updatedAt,
    url: siteUrl(resolvePathname("post", slug)!),
    description: post.metaDescription || post.excerpt || undefined,
    author: post.author ? {
      "@type": "Person",
      name: post.author.name,
      jobTitle: post.author.position ?? undefined,
      url: post.author.profileUrl ?? undefined,
    } : undefined,
  }

  return (
    <>
      <div className="container mx-auto">
        <article className="space-y-8">
          <h1 className="text-4xl font-bold">{post.title}</h1>
          <div className="mb-8 md:mb-16">
            <PostCoverImage image={post.coverImage} />
          </div>
          {post.date && (
            <div className="my-4 text-sm">
              <DateComponent dateString={post.date} />
            </div>
          )}
          {post.author && (
            <div className="mt-6 mb-12">
              <Avatar author={post.author} />
            </div>
          )}
          <PortableText value={post.content} />
        </article>
        <aside className="mt-12 space-y-4">
          <h2 className="text-lg font-bold">Recent Stories</h2>
          <Suspense>
            <MoreStories slug={slug} from={0} to={3} />
          </Suspense>
        </aside>
      </div>
      <JsonLd jsonLd={article} />
    </>
  )
}
