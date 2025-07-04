import { JsonLd } from "@/components/jsonld"
import { sanityFetch } from "@/sanity/lib/fetch"
import { homePageQuery, settingsQuery } from "@/sanity/lib/queries"
import { resolveOpenGraphImage } from "@/sanity/lib/utils"
import { Metadata } from 'next'
import { WebPage, WithContext } from "schema-dts"

// Add this to make the page static
export const dynamic = 'force-static'

const fetchHomePage = async (stega: boolean = true) => {
  return await Promise.all([
    sanityFetch({
      query: homePageQuery,
      stega,
      tags: ["homePage"]
    }),
    sanityFetch({
      query: settingsQuery,
      stega,
      tags: ["settings"]
    }),
  ])
}

// Function to generate metadata
export async function generateMetadata(): Promise<Metadata> {
  const [homePage, settings] = await fetchHomePage(false)

  const ogImage = resolveOpenGraphImage(homePage?.ogImage)
  const title = `${homePage?.title} | ${settings?.title}`

  return {
    title,
    ...(homePage?.metaDescription && { description: homePage.metaDescription }),
    openGraph: {
      ...(homePage?.ogTitle && { title: homePage.ogTitle }),
      ...(ogImage && { images: [ogImage] }),
    },
    robots: {
      index: !homePage?.noIndex
    },
    alternates: {
      canonical: "/"
    }
  }
}

export default async function HomePage() {
  const [page] = await fetchHomePage(true)

  const openGraphImage = resolveOpenGraphImage(page?.ogImage)

  return (
    <>
      <div className="container mx-auto">
        <h1>{page?.title}</h1>
      </div>
      <JsonLd jsonLd={{
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: page?.title,
        ...(openGraphImage && {
          image: openGraphImage?.url
        }),
        url: `${process.env.SITE_URL!}/`,
        ...(page?.metaDescription && { description: page.metaDescription }),
        ...(page?._updatedAt && { dateModified: page._updatedAt })
      } as WithContext<WebPage>} />
    </>
  )
}
