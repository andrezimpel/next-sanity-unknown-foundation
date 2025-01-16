import { PostGrid } from "@/components/post-grid"
import { sanityFetch } from "@/sanity/lib/fetch"
import { postsQuery } from "@/sanity/lib/queries"

async function getPosts() {
  return sanityFetch({
    query: postsQuery,
    params: {
      slug: "",
      from: 0,
      to: 12,
    },
  })
}

export default async function PostsPage() {
  const posts = await getPosts()

  if (!posts || posts.length === 0) {
    return (
      <div>No posts found</div>
    )
  }

  return <PostGrid posts={posts} />
}
