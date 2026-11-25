import Link from "next/link"
import { notFound } from "next/navigation"

import { sanityFetch } from "@/sanity/lib/fetch"
import { contentTags } from "@/sanity/lib/tags"
import { pageQuery, postsQuery } from "@/sanity/lib/queries"

const pageSize = 12

export async function fetchListing(mode: "preview-plain" | "preview-text") {
  const page = await sanityFetch({
    query: pageQuery,
    params: { slug: "posts" },
    mode,
    tags: contentTags.page,
  })
  if (!page) notFound()
  return page
}

export async function fetchPostsPage(page: number, mode: "preview-plain" | "preview-text") {
  const from = (page - 1) * pageSize
  const to = from + pageSize + 1
  if (!Number.isSafeInteger(to)) notFound()
  const posts = await sanityFetch({
    query: postsQuery,
    params: { slug: "", from, to },
    mode,
    tags: ["post"],
  })
  if (page > 1 && posts.length === 0) notFound()
  return { posts: posts.slice(0, pageSize), hasNext: posts.length > pageSize }
}

export function Pagination({ page, hasNext }: { page: number; hasNext: boolean }) {
  if (page === 1 && !hasNext) return null
  return (
    <nav aria-label="Post archive" className="flex gap-6">
      {page > 1 && (
        <Link href={page === 2 ? "/posts" : `/posts/page/${page - 1}`} rel="prev">
          Newer posts
        </Link>
      )}
      {hasNext && <Link href={`/posts/page/${page + 1}`} rel="next">Older posts</Link>}
    </nav>
  )
}
