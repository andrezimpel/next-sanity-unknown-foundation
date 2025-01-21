import { sanityFetch } from "@/sanity/lib/fetch"
import { navigationZoneQuery, settingsQuery } from "@/sanity/lib/queries"
import Link from "next/link"


export async function Header() {
  const [settings, navigationZone] = await Promise.all([
    sanityFetch({ query: settingsQuery }),
    sanityFetch({
      query: navigationZoneQuery,
      params: {
        identifier: "header",
      },
    })
  ])

  return (
    <header className="container border-b border-gray-200 py-6 flex justify-between items-center">
      <Link href="/" className="text-lgxl font-bold uppercase">
        {settings?.title || "Untitled"}
      </Link>
      <nav>
        {navigationZone?.items?.map((item) => (
          <Link key={item?._key} href={item?.link?.slug || item?.url || ""}>
            {item?.title || "Untitled"}
          </Link>
        ))}
      </nav>
    </header>
  )
}
