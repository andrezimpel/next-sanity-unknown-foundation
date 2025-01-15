import { sanityFetch } from "@/sanity/lib/fetch"
import { homePageQuery } from "@/sanity/lib/queries"
import { resolveOpenGraphImage } from "@/sanity/lib/utils"
import { Metadata } from 'next'

const fetchHomePage = async () => {
  return sanityFetch({ query: homePageQuery })
}

// Function to generate metadata
export async function generateMetadata(): Promise<Metadata> {
  const homePage = await fetchHomePage()

  const ogImage = resolveOpenGraphImage(homePage?.ogImage)

  return {
    ...(homePage?.title && { title: homePage.title }),
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

export default async function Page() {
  const page = await fetchHomePage()

  return (
    <div className="container mx-auto px-5">
      this is the home page: {page?.title}
    </div>
  )
}
