import { PostQueryResult } from "@/sanity.types"
import { urlForImage } from "@/sanity/lib/utils"
import { getImageProps, ImageProps } from "next/image"

export function PostCoverImage({ image }: { image: NonNullable<PostQueryResult>["coverImage"] }) {
  if (!image || !image?.asset?._ref) {
    return (
      <div className="bg-slate-50" style={{ paddingTop: "50%" }} />
    )
  }

  const common: Omit<ImageProps, "src"> = {
    alt: image?.alt || "",
    priority: true,
    blurDataURL: image?.lqip || "",
    placeholder: "blur",
  }

  const {
    props: { srcSet: mobile },
  } = getImageProps({ ...common, width: 700, height: 900, src: urlForImage(image)?.height(900).width(700).url() as string })

  const {
    props: { srcSet: desktop, ...rest },
  } = getImageProps({ ...common, width: 2000, height: 1000, src: urlForImage(image)?.height(1000).width(2000).url() as string })

  return (
    <picture>
      <source media={`(min-width: var(--breakpoint-md))`} srcSet={desktop} />
      <source media={`(max-width: var(--breakpoint-md))`} srcSet={mobile} />
      <img {...rest} />
    </picture>
  )
}