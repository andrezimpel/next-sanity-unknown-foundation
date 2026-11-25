/**
 * This component uses Portable Text to render a post body.
 *
 * You can learn more about Portable Text on:
 * https://www.sanity.io/docs/block-content
 * https://github.com/portabletext/react-portabletext
 * https://portabletext.org/
 *
 */

import { cn } from "@/lib/utils"
import { urlForImage } from "@/sanity/lib/utils"
import { resolvePathname } from "@/sanity/lib/routes"
import Image from "next/image"
import {
  PortableText,
  stegaClean,
  type PortableTextComponents,
} from "next-sanity"
import type { PageQueryResult } from "@/sanity.types"
import YouTube from "./portable-text/youtube"

export default function CustomPortableText({
  className,
  value,
}: {
  className?: string
  value: NonNullable<PageQueryResult>["content"]
}) {
  if (!value?.length) return null
  const components: PortableTextComponents = {
    block: {
      h2: ({ children }) => (
        <h2 className="mb-2 text-3xl font-semibold">{children}</h2>
      ),
      h3: ({ children }) => (
        <h3 className="mb-2 text-2xl font-semibold">{children}</h3>
      ),
      h4: ({ children }) => (
        <h4 className="mb-2 text-lg font-semibold">{children}</h4>
      ),
      h5: ({ children }) => (
        <h5 className="mb-2 font-semibold">{children}</h5>
      ),
      blockquote: ({ children }) => (
        <blockquote className="mb-2 text-lg font-semibold border-l-4 border-primary pl-4">{children}</blockquote>
      ),
      tip: ({ children }) => (
        <div className="bg-muted p-4 rounded-lg">{children}</div>
      ),
    },
    marks: {
      internalLink: ({ children, value }) => {
        const href = resolvePathname(value?.target?._type, stegaClean(value?.target?.slug))
        return href ? <a href={href}>{children}</a> : <>{children}</>
      },
      link: ({ children, value }) => {
        return (
          <a href={stegaClean(value?.href)} rel="noreferrer noopener">
            {children}
          </a>
        )
      },
    },
    types: {
      image: ({ value }) => {
        const dimensions = /^image-[^-]+-(\d+)x(\d+)-[a-z\d]+$/i.exec(value?.asset?._ref ?? "")
        if (!dimensions) return null
        const imageUrl = urlForImage(value)?.url()
        if (!imageUrl) return null
        // The Sanity builder includes the final pixel rectangle for an editorial crop.
        const crop = new URL(imageUrl).searchParams.get("rect")?.split(",")
        const width = Number(crop?.[2] ?? dimensions[1])
        const height = Number(crop?.[3] ?? dimensions[2])
        if (!(width > 0 && height > 0)) return null
        return (
          <div className="my-6">
            <Image
              src={imageUrl}
              alt={stegaClean(value.alt) || ""}
              width={width}
              height={height}
              sizes="100vw"
              blurDataURL={value.lqip || undefined}
              placeholder={value.lqip ? "blur" : "empty"}
              className="rounded-lg w-full h-auto"
            />
            {value.caption && (
              <p className="mt-2 text-sm text-muted-foreground text-center">
                {value.caption}
              </p>
            )}
          </div>
        )
      },
      youTube: YouTube,
    },
  }

  return (
    <div className={cn("space-y-4", className)}>
      <PortableText components={components} value={value} />
    </div>
  )
}
