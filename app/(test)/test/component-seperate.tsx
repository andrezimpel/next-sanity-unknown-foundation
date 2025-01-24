import { sanityFetch } from "@/sanity/lib/fetch"
import { settingsQuery } from "@/sanity/lib/queries"

export default async function TestPageComponentAll() {
  const settings = await sanityFetch({
    query: settingsQuery,
    tags: ["settings"],
  })

  return (
    <div>
      <div>Test Page Component: {settings?.title}</div>
    </div>
  )
}
