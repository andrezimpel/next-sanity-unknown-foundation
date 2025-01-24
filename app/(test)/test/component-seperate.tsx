import { sanityFetch } from "@/sanity/lib/fetch"
import { settingsQuery } from "@/sanity/lib/queries"

export default async function TestPageComponentSeperate() {
  const settings = await sanityFetch({
    query: settingsQuery,
    perspective: "published",
    tags: ["settings"],
  })

  return (
    <div>
      <div>Test Page Component: {settings?.title}</div>
    </div>
  )
}
