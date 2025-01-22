import { PostQueryResult } from "@/sanity.types"
import { urlForImage } from "@/sanity/lib/utils"
import tailwindConfig from "@/tailwind.config"
import { getImageProps, ImageProps } from "next/image"
import resolveConfig from "tailwindcss/resolveConfig"

export function PostCoverImage({ image }: { image: NonNullable<PostQueryResult>["coverImage"] }) {
  if (!image || !image?.asset?._ref) {
    return (
      <div className="bg-slate-50" style={{ paddingTop: "50%" }} />
    )
  }
  const { theme } = resolveConfig(tailwindConfig)

  const common: Omit<ImageProps, "src"> = {
    alt: image?.alt || "Untitled",
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
      <source media={`(min-width: ${theme.screens.md})`} srcSet={desktop} />
      <source media={`(max-width: ${theme.screens.md})`} srcSet={mobile} />
      <img {...rest} />
    </picture>
  )
}