import { sanityFetch } from "@/sanity/lib/fetch"
import { navigationZoneQuery, settingsQuery } from "@/sanity/lib/queries"
import { resolveHref } from "@/sanity/lib/utils"
import Link from "next/link"

export async function Header() {
  const [settings, navigationZone] = await Promise.all([
    sanityFetch({
      query: settingsQuery,
      tags: ["settings"]
    }),
    sanityFetch({
      query: navigationZoneQuery,
      perspective: "published",
      params: {
        identifier: "header",
      },
      tags: ["navigationZone", "post", "page", "homePage"]
    })
  ])

  return (
    <header className="container border-b border-gray-200 py-6 flex justify-between items-center">
      <Link href="/" className="text-lg font-bold uppercase">
        {settings?.title || "Untitled"}
      </Link>
      <nav>
        <ul>
          {navigationZone?.items?.map((item, index) => (
            <li key={item?._key || index}>
              <Link
                href={item?.url || resolveHref(item?.link?._type, item?.link?.slug) || ""}
                className="px-2 py-1"
                target={item?.url && !item?.url.startsWith(process.env.SITE_URL || "") ? "_blank" : "_self"}
              >
                {item?.title || item?.link?.title || "Untitled"}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
