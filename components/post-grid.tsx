import CoverImage from "@/components/cover-image"
import { PostsQueryResult } from "@/sanity.types"
import Link from "next/link"

export function PostGrid({ posts }: { posts: PostsQueryResult }) {
  if (!posts || posts.length === 0) {
    return (
      <div>No posts found</div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {posts.map((post) => (
        <Link key={post._id} href={`/posts/${post.slug}`} className="block">
          <CoverImage
            image={post.coverImage}
            height={200}
            width={400}
          />
          <h2>{post.title}</h2>
          {post.excerpt && <p>{post?.excerpt}</p>}
        </Link>
      ))}
    </div>
  )
}
