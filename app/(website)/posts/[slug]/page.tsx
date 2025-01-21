import { type PortableTextBlock } from "next-sanity"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import CoverImage from "@/components/cover-image"
import DateComponent from "@/components/date"
import PortableText from "../../portable-text"
import Avatar from "./avatar"
import MoreStories from "./more-posts"

import * as demo from "@/sanity/lib/demo"
import { sanityFetch } from "@/sanity/lib/fetch"
import { postQuery, settingsQuery } from "@/sanity/lib/queries"

type Props = {
  params: Promise<{ slug: string }>
}

// export async function generateStaticParams() {
//   return await sanityFetch({
//     query: postsPathsQuery,
//     perspective: "published",
//     stega: false,
//   })
// }

export default async function PostPage({ params }: Props) {
  const [post, settings] = await Promise.all([
    sanityFetch({ query: postQuery, params }),
    sanityFetch({ query: settingsQuery }),
  ])

  if (!post?._id) {
    return notFound()
  }

  return (
    <div className="container mx-auto px-5" itemScope itemType="https://schema.org/BlogPosting">
      <h2 className="mb-16 mt-10 text-2xl font-bold leading-tight tracking-tight md:text-4xl md:tracking-tighter">
        <Link href="/" className="hover:underline" itemProp="publisher" itemScope itemType="https://schema.org/Organization">
          <span itemProp="name">{settings?.title || demo.title}</span>
        </Link>
      </h2>
      <article>
        <h1 className="text-balance mb-12 text-6xl font-bold leading-tight tracking-tighter md:text-7xl md:leading-none lg:text-8xl" itemProp="headline">
          {post.title}
        </h1>
        <div className="hidden md:mb-12 md:block" itemProp="author" itemScope itemType="https://schema.org/Person">
          {post.author && (
            <>
              <Avatar name={post.author.name} picture={post.author.picture} />
              <meta itemProp="name" content={post.author.name} />
            </>
          )}
        </div>
        <div className="mb-8 sm:mx-0 md:mb-16" itemProp="image">
          <CoverImage image={post.coverImage} priority height={1000} width={2000} />
        </div>
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 block md:hidden" itemProp="author" itemScope itemType="https://schema.org/Person">
            {post.author && (
              <>
                <Avatar name={post.author.name} picture={post.author.picture} />
                <meta itemProp="name" content={post.author.name} />
              </>
            )}
          </div>
          <div className="mb-6 text-lg">
            <div className="mb-4 text-lg" itemProp="datePublished" content={post.date}>
              <DateComponent dateString={post.date} />
            </div>
          </div>
        </div>
        {post.content?.length && (
          <div itemProp="articleBody">
            <PortableText
              className="mx-auto max-w-2xl"
              value={post.content as PortableTextBlock[]}
            />
          </div>
        )}
      </article>
      <aside>
        <hr className="border-accent-2 mb-24 mt-28" />
        <h2 className="mb-8 text-6xl font-bold leading-tight tracking-tighter md:text-7xl">
          Recent Stories
        </h2>
        <Suspense>
          <MoreStories slug={post.slug || ""} from={0} to={3} />
        </Suspense>
      </aside>
    </div>
  )
}
