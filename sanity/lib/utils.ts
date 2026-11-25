import { createImageUrlBuilder } from "@sanity/image-url"
import { stegaClean } from "next-sanity"

import { siteUrl } from "@/lib/site-url"

import { dataset, projectId } from "@/sanity/lib/api"
import { resolvePathname } from "./routes"

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
  const url = urlForImage(image)?.width(width).height(height).fit("crop").url()
  if (!url) return
  return { url, alt: stegaClean(image.alt ?? ""), width, height }
}

export function resolveUrl(documentType?: string, slug?: string | null) {
  const pathname = resolvePathname(documentType, slug)
  return pathname ? siteUrl(pathname) : undefined
}
