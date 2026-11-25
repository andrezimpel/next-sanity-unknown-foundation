import type { MetadataRoute } from "next"

import { siteUrl } from "@/lib/site-url"
import { sanityFetch } from "@/sanity/lib/fetch"
import { contentTags } from "@/sanity/lib/tags"
import { homePageQuery, pagePathsQuery, postPathsQuery } from "@/sanity/lib/queries"
import { resolveUrl } from "@/sanity/lib/utils"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [home, pages, posts] = await Promise.all([
    sanityFetch({ query: homePageQuery, mode: "published", tags: contentTags.homePage }),
    sanityFetch({ query: pagePathsQuery, mode: "published", tags: ["page"] }),
    sanityFetch({ query: postPathsQuery, mode: "published", tags: ["post"] }),
  ])

  const documents = [
    ...pages.map((page) => ({ ...page, type: "page" })),
    ...posts.map((post) => ({ ...post, type: "post" })),
  ]
  const urls = new Map<string, MetadataRoute.Sitemap[number]>()
  if (home && !home.noIndex) {
    const url = siteUrl("/")
    urls.set(url, { url, lastModified: home._updatedAt })
  }
  for (const document of documents) {
    const url = resolveUrl(document.type, document.slug)
    if (url && !document.noIndex && !urls.has(url)) {
      // Publishing or deleting a post also changes the listing.
      const listing = document.type === "page" && document.slug === "posts"
      urls.set(url, { url, lastModified: listing ? undefined : document._updatedAt })
    }
  }

  return [...urls.values()]
}
