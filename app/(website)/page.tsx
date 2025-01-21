import { sanityFetch } from "@/sanity/lib/fetch"
import { homePageQuery, settingsQuery } from "@/sanity/lib/queries"
import { resolveOpenGraphImage } from "@/sanity/lib/utils"
import { Metadata } from 'next'

const fetchHomePage = async () => {
  return await Promise.all([
    sanityFetch({ query: homePageQuery }),
    sanityFetch({ query: settingsQuery, stega: false }),
  ])
}

// Function to generate metadata
export async function generateMetadata(): Promise<Metadata> {
  const [homePage, settings] = await fetchHomePage()

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
  }
}

export default async function HomePage() {
  const page = await fetchHomePage()

  return (
    <div className="container mx-auto px-5">
      this is the home page: <h1>{page[0]?.title}</h1>
    </div>
  )
}
