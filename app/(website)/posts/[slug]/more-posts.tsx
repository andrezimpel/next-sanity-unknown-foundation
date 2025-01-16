

import { PostGrid } from "@/components/post-grid"
import { sanityFetch } from "@/sanity/lib/fetch"
import { postsQuery } from "@/sanity/lib/queries"

export default async function MoreStories(params: {
  slug: string
  from: number
  to: number
}) {
  const posts = await sanityFetch({ query: postsQuery, params })

  return (
    <PostGrid posts={posts} />
  )
}