// import TestPageComponentAll from "./component-all"
import { sanityFetch } from "@/sanity/lib/fetch"
import { settingsQuery } from "@/sanity/lib/queries"
import TestPageComponentSeperate from "./component-seperate"

export default async function TestPage() {
  const settings = await sanityFetch({
    query: settingsQuery,
    tags: ["settings"],
  })

  return (
    <div>
      <div>Test Page intself: {settings?.title}</div>
      <TestPageComponentSeperate />
    </div>
  )
}
