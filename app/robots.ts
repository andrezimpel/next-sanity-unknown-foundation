import { sanityFetch } from '@/sanity/lib/fetch'
import { pagePathsQuery, postPathsQuery } from '@/sanity/lib/queries'
import { resolveHref } from '@/sanity/lib/utils'
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

  const disallow = [
    ...pages.filter(page => page.noIndex).map(page => resolveHref("page", page.slug!)),
    ...posts.filter(post => post.noIndex).map(post => resolveHref("post", post.slug!)),
  ]

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: disallow
    },
    sitemap: `${process.env.SITE_URL}/sitemap.xml`,
  } as MetadataRoute.Robots
}