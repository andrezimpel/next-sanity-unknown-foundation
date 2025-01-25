// import TestPageComponentAll from "./component-all"
import { sanityFetch } from "@/sanity/lib/fetch"
import { settingsQuery } from "@/sanity/lib/queries"
import { unstable_cache } from 'next/cache'
import TestPageComponentSeperate from "./component-seperate"

const fetchSettings = unstable_cache(
  async () => sanityFetch({
    query: settingsQuery
  }),
  ['settings']
)

export default async function TestPage() {
  const settings = await fetchSettings()
  return (
    <div>
      <div>Test Page intself: {settings?.title}</div>
      <TestPageComponentSeperate />
    </div>
  )
}
