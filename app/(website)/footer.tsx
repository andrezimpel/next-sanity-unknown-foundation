import { sanityFetch } from "@/sanity/lib/fetch"
import { settingsQuery } from "@/sanity/lib/queries"
import { NavigationLinks } from "./navigation-links"

export async function Footer() {
  const settings = await sanityFetch({ query: settingsQuery, tags: ["settings"] })
  return (
    <footer className="container flex items-center justify-between border-t border-gray-200 py-6 text-sm">
      <div>© {new Date().getFullYear()} {settings?.title}</div>
      <NavigationLinks identifier="legal" label="Legal" className="px-2 py-1 hover:underline" />
    </footer>
  )
}
