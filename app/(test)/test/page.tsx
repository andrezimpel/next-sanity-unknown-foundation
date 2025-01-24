import { sanityFetch } from "@/sanity/lib/fetch"
import { homePageQuery, settingsQuery } from "@/sanity/lib/queries"

export default async function TestPage() {
  const [settings, homePage] = await Promise.all([
    sanityFetch({
      query: settingsQuery,
      tags: ["settings"],
    }),
    sanityFetch({
      query: homePageQuery,
      tags: ["homePage"],
    }),
  ])

  return (
    <div>
      <div>Test Page: {settings?.title}</div>
      <div>Test Page: {homePage?.title}</div>
    </div>
  )
}
