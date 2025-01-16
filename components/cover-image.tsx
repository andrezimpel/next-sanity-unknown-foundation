import { Image } from "next-sanity/image"

import { urlForImage } from "@/sanity/lib/utils"

interface CoverImageProps {
  image: any
  priority?: boolean
  height: number
  width: number
}

export default function CoverImage(props: CoverImageProps) {
  const { image: source, priority, height, width } = props
  const image = source?.asset?._ref ? (
    <Image
      className="h-auto w-full"
      width={width}
      height={height}
      alt={source?.alt || ""}
      src={urlForImage(source)?.height(height).width(width).url() as string}
      sizes="100vw"
      priority={priority}
    />
  ) : (
    <div className="bg-slate-50" style={{ paddingTop: "50%" }} />
  )

  return (
    <div className="shadow-md transition-shadow duration-200 group-hover:shadow-lg sm:mx-0">
      {image}
    </div>
  )
}