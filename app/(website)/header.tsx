import Link from "next/link"

import { sanityFetch } from "@/sanity/lib/fetch"
import { settingsQuery } from "@/sanity/lib/queries"
import { NavigationLinks } from "./navigation-links"

export async function Header() {
  const settings = await sanityFetch({ query: settingsQuery, tags: ["settings"] })
  return (
    <header className="container flex items-center justify-between border-b border-gray-200 py-6">
      <Link href="/" className="text-lg font-bold uppercase">
        {settings?.title || "Home"}
      </Link>
      <NavigationLinks identifier="header" label="Main" className="px-2 py-1" />
    </header>
  )
}
