import createImageUrlBuilder from "@sanity/image-url"

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

export function resolveHref(
  documentType?: string,
  slug?: string | null,
): string | undefined {
  if (!slug) {
    return undefined // Return undefined if slug is not provided or is null
  }

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
