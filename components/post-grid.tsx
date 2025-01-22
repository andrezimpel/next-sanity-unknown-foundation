import { PostsQueryResult } from "@/sanity.types"
import { urlForImage } from "@/sanity/lib/utils"
import Image from "next/image"
import Link from "next/link"

const width = 315
const height = 200

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
          <div className="mb-2">
            {(post.coverImage && post.coverImage?.asset?._ref) ? (
              <Image
                className="h-auto w-full"
                width={width}
                height={height}
                alt={post.coverImage.alt || ""}
                src={urlForImage(post.coverImage)?.height(height).width(width).url() as string}
                blurDataURL={post.coverImage.lqip || ""}
              />
            ) : (
              <div className="bg-slate-50" style={{ paddingTop: "50%" }} />
            )}
          </div>
          <h2 className="text-lg font-bold">{post.title}</h2>
          {post.excerpt && <p className="text-sm">{post?.excerpt}</p>}
        </Link>
      ))}
    </div>
  )
}
