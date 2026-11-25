import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { PostGrid } from "@/components/post-grid"
import { contentMetadata } from "../../../metadata"
import { fetchListing, fetchPostsPage, Pagination } from "../../listing"

export function generateStaticParams() {
  return []
}

type Props = { params: Promise<{ page: string }> }

async function getPageNumber(params: Props["params"]) {
  const { page } = await params
  const number = Number(page)
  if (!/^[1-9]\d*$/.test(page) || !Number.isSafeInteger(number) || number < 2) notFound()
  return number
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await getPageNumber(params)
  const [listing] = await Promise.all([fetchListing("preview-plain"), fetchPostsPage(page, "preview-plain")])
  return contentMetadata({
    title: `${listing.title} (${page})`,
    pathname: `/posts/page/${page}`,
    noIndex: listing.noIndex,
  })
}

export default async function ArchivePage({ params }: Props) {
  const page = await getPageNumber(params)
  const [listing, { posts, hasNext }] = await Promise.all([
    fetchListing("preview-text"),
    fetchPostsPage(page, "preview-text"),
  ])

  return (
    <div className="container mx-auto space-y-6">
      <h1 className="text-4xl font-bold">{listing.title} ({page})</h1>
      <PostGrid posts={posts} />
      <Pagination page={page} hasNext={hasNext} />
    </div>
  )
}
