import { sanityFetch } from "@/sanity/lib/fetch"
import { navigationZoneQuery, settingsQuery } from "@/sanity/lib/queries"
import { resolveHref } from "@/sanity/lib/utils"
import Link from "next/link"

export async function Footer() {
  const [settings, navigationZone] = await Promise.all([
    sanityFetch({ query: settingsQuery }),
    sanityFetch({
      query: navigationZoneQuery,
      params: {
        identifier: "legal",
      },
    })
  ])

  return (
    <footer className="container border-t border-gray-200 py-6 flex justify-between items-center text-sm">
      <div>
        Ⓒ {new Date().getFullYear()} {settings?.title || "Untitled"}
      </div>
      <nav>
        {navigationZone?.items?.map((item, index) => (
          <Link
            key={item?._key || index}
            href={resolveHref(item?.link?._type, item?.link?.slug) || item?.url || ""}
            className="px-2 py-1"
            target={item?.url && !item?.url.startsWith(process.env.SITE_URL || "") ? "_blank" : "_self"}
          >
            {item?.title || item?.link?.title || "Untitled"}
          </Link>
        ))}
      </nav>
    </footer>
  )
}
