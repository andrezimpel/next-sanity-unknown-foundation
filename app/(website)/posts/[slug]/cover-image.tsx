import { getImageProps } from "next/image"
import { stegaClean } from "next-sanity"

import type { PostQueryResult } from "@/sanity.types"
import { urlForImage } from "@/sanity/lib/utils"

export function PostCoverImage({ image }: { image: NonNullable<PostQueryResult>["coverImage"] }) {
  const url = urlForImage(image)
  if (!url) return <div className="aspect-[2/1] bg-slate-50" />

  const alt = stegaClean(image?.alt) || ""
  const mobile = getImageProps({
    alt, width: 700, height: 900, sizes: "100vw",
    src: url.width(700).height(900).fit("crop").url(),
  }).props
  const desktop = getImageProps({
    alt, width: 2000, height: 1000, sizes: "100vw",
    src: url.width(2000).height(1000).fit("crop").url(),
    loading: "eager", fetchPriority: "high",
    className: "h-auto w-full",
  }).props

  return (
    <picture>
      <source media="(width < 48rem)" srcSet={mobile.srcSet} sizes={mobile.sizes} width={700} height={900} />
      {/* getImageProps generates the optimized sources for picture. */}
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <img {...desktop} />
    </picture>
  )
}
