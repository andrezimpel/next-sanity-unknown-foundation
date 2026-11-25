import { draftMode } from "next/headers"
import { notFound, permanentRedirect } from "next/navigation"

import { getRedirect } from "@/sanity/lib/redirects"
import { decodeRouteSlug, resolvePathname } from "@/sanity/lib/routes"
import Page, { generateMetadata as pageMetadata } from "../../../../[slug]/page"
import Post, { generateMetadata as postMetadata } from "../../../../posts/[slug]/page"

export const dynamic = "force-dynamic"

type Props = {
  params: Promise<{ type: string; slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ params }: Props) {
  if (!(await draftMode()).isEnabled) return { robots: { index: false } }
  const { type, slug } = await params
  const props = { params: Promise.resolve({ slug }) }
  return type === "post" ? postMetadata(props) : pageMetadata(props)
}

export default async function RedirectPreview({ params, searchParams }: Props) {
  const { type, slug } = await params
  if (type !== "page" && type !== "post") notFound()
  const pathname = resolvePathname(type, decodeRouteSlug(type, slug))
  if (!pathname) notFound()

  const { isEnabled } = await draftMode()
  if (isEnabled) {
    const documentParams = Promise.resolve({ slug })
    return type === "post" ? <Post params={documentParams} /> : <Page params={documentParams} />
  }

  const destination = await getRedirect(pathname)
  if (!destination) notFound()
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(await searchParams)) {
    if (value !== undefined) {
      for (const item of [value].flat()) query.append(key, item)
    }
  }
  permanentRedirect(query.size ? `${destination}?${query}` : destination)
}
