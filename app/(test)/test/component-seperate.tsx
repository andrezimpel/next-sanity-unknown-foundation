import { sanityFetch } from "@/sanity/lib/fetch"
import { homePageQuery, settingsQuery } from "@/sanity/lib/queries"

export default async function TestPageComponentAll() {
  const settings = await sanityFetch({
    query: settingsQuery,
    tags: ["settings"],
  })
  const homePage = await sanityFetch({
    query: homePageQuery,
    tags: ["homePage"],
  })

  return (
    <div>
      <div>Test Page: {settings?.title}</div>
      <div>Test Page: {homePage?.title}</div>
    </div>
  )
}
