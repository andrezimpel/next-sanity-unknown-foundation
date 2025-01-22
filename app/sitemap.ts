import { sanityFetch } from '@/sanity/lib/fetch'
import { pagePathsQuery, postPathsQuery } from '@/sanity/lib/queries'
import { resolveHref } from '@/sanity/lib/utils'
import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [pages, posts] = await Promise.all([
    sanityFetch({
      query: pagePathsQuery,
      perspective: "published",
      stega: false,
    }),
    sanityFetch({
      query: postPathsQuery,
      perspective: "published",
      stega: false,
    }),
  ])

  const pageObjects = pages.map((page) => {
    return {
      url: `${process.env.SITE_URL}${resolveHref("page", page.slug!)}`,
      lastModified: page._updatedAt,
      changeFrequency: 'monthly',
      priority: 0.5,
    }
  })

  const postObjects = posts.map((post) => {
    return {
      url: `${process.env.SITE_URL}${resolveHref("post", post.slug!)}`,
      lastModified: post._updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    }
  })

  return [
    ...pageObjects,
    ...postObjects,
  ] as MetadataRoute.Sitemap
}