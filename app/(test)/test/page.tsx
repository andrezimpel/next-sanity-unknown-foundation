import { sanityFetch } from "@/sanity/lib/fetch"
import { settingsQuery } from "@/sanity/lib/queries"

export default async function TestPage() {
  const settings = await sanityFetch({
    query: settingsQuery,
    perspective: "published",
    stega: false,
    tags: ["settings"],
  })


  return (
    <div>
      <div>Test Page: {settings?.title}</div>
    </div>
  )
}
