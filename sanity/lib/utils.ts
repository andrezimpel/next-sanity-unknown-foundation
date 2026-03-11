import { createImageUrlBuilder } from "@sanity/image-url"
import { type PortableTextBlock } from "next-sanity"

import { dataset, projectId } from "@/sanity/lib/api"

const imageBuilder = createImageUrlBuilder({
  projectId: projectId || "",
  dataset: dataset || "",
})

export const urlForImage = (source: any) => {
  // Ensure that source image contains a valid reference
  if (!source?.asset?._ref) {
    return undefined
  }

  return imageBuilder?.image(source).auto("format").fit("max")
}

export function resolveOpenGraphImage(image: any, width = 1200, height = 627) {
  if (!image) return
  const url = urlForImage(image)?.width(1200).height(627).fit("crop").url()
  if (!url) return
  return { url, alt: image?.alt as string, width, height }
}

/**
 * Returns a root-relative pathname for a document, e.g. "/posts/my-slug".
 * Use for internal <Link href>, <a href>, and robots.txt entries.
 */
export function resolvePathname(
  documentType?: string,
  slug?: string | null,
): string | undefined {
  if (!slug) return undefined

  switch (documentType) {
    case "page":
      return `/${slug}`
    case "post":
      return `/posts/${slug}`
    default:
      console.warn("Invalid document type:", documentType)
      return undefined
  }
}

/**
 * Returns an absolute URL for a document, e.g. "https://example.com/posts/my-slug".
 * Use for canonical tags, JSON-LD, sitemap entries, and OG metadata.
 */
export function resolveUrl(
  documentType?: string,
  slug?: string | null,
): string | undefined {
  const pathname = resolvePathname(documentType, slug)
  if (!pathname) return undefined
  return `${process.env.SITE_URL}${pathname}`
}

export function toPlainText(blocks: PortableTextBlock[] = []) {
  return blocks
    // loop through each block
    .map(block => {
      // if it's not a text block with children, 
      // return nothing
      if (block._type !== 'block' || !block.children) {
        return ''
      }
      // loop through the children spans, and join the
      // text strings
      return block.children.map((child) => child.text).join('')
    })
    // join the paragraphs leaving split by two linebreaks
    .join('\n\n')
}