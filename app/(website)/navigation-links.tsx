import Link from "next/link"
import { stegaClean } from "next-sanity"

import { getSiteOrigin } from "@/lib/site-url"
import { sanityFetch } from "@/sanity/lib/fetch"
import { navigationZoneQuery } from "@/sanity/lib/queries"
import { resolvePathname } from "@/sanity/lib/routes"

export async function NavigationLinks({
  identifier,
  label,
  className,
}: {
  identifier: "header" | "legal"
  label: string
  className: string
}) {
  const navigation = await sanityFetch({
    query: navigationZoneQuery,
    params: { identifier },
    tags: ["navigationZone", "post", "page"],
  })
  if (!navigation?.items?.length) return null

  const origin = getSiteOrigin()
  return (
    <nav aria-label={label}>
      <ul>
        {navigation.items.map((item) => {
          const customUrl = stegaClean(item.url)
          const href = customUrl || resolvePathname(item.link?._type, stegaClean(item.link?.slug))
          if (!href || !URL.canParse(href, origin)) return null
          const url = new URL(href, origin)
          if (url.protocol !== "http:" && url.protocol !== "https:") return null
          const external = url.origin !== origin

          return (
            <li key={item._key}>
              <Link
                href={href}
                className={className}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
              >
                {item.title || item.link?.title || "Untitled"}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
