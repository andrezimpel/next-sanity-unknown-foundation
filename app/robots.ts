import { sanityFetch } from '@/sanity/lib/fetch'
import { pagePathsQuery, postPathsQuery } from '@/sanity/lib/queries'
import { resolvePathname } from '@/sanity/lib/utils'
import type { MetadataRoute } from 'next'

export default async function robots(): Promise<MetadataRoute.Robots> {
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

  const noIndexPaths = [
    ...pages.filter(page => page.noIndex).map(page => resolvePathname("page", page.slug!)),
    ...posts.filter(post => post.noIndex).map(post => resolvePathname("post", post.slug!)),
  ].filter(Boolean) as string[]

  return {
    rules: [
      {
        // Google, Bing, and all standard search engine crawlers.
        // Do NOT block /_next/static/ or /_next/image/ — Google needs JS, CSS,
        // and optimized images to render pages. Blocking them causes Google to
        // see unstyled HTML and significantly reduces indexing.
        // Source: https://developers.google.com/search/docs/crawling-indexing/robots/intro
        userAgent: '*',
        allow: '/',
        disallow: ['/studio', '/api/', ...noIndexPaths],
      },
    ],
    sitemap: `${process.env.SITE_URL}/sitemap.xml`,
  }
}
