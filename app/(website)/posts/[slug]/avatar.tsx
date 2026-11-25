import Image from "next/image"
import { stegaClean } from "next-sanity"

import type { PostQueryResult } from "@/sanity.types"
import { urlForImage } from "@/sanity/lib/utils"

type Author = NonNullable<NonNullable<PostQueryResult>["author"]>

export default function Avatar({ author }: { author: Author }) {
  const image = urlForImage(author.picture)?.height(96).width(96).fit("crop").url()
  const profileUrl = stegaClean(author.profileUrl)
  const hasProfile = profileUrl && /^https?:\/\//i.test(profileUrl)

  return (
    <div className="flex items-center gap-2 text-xl">
      {image ? (
        <Image
          alt={stegaClean(author.picture?.alt) || ""}
          className="rounded-full object-cover"
          height={48}
          width={48}
          src={image}
        />
      ) : "By"}
      {hasProfile ? (
        <a className="font-bold underline" href={profileUrl}>{author.name}</a>
      ) : <span className="font-bold">{author.name}</span>}
    </div>
  )
}
