import { sanityFetch } from "@/sanity/lib/fetch"
import { settingsQuery } from "@/sanity/lib/queries"

export async function TestFooter() {
  const settings = await sanityFetch({
    query: settingsQuery,
    perspective: "published"
  })

  return <div>Test Footer: {settings?.title}</div>
}
