import { sanityFetch } from '@/sanity/lib/fetch'
import { pagePathsQuery, pageQuery } from '@/sanity/lib/queries'
import { resolveOpenGraphImage } from '@/sanity/lib/utils'
import { ImageResponse } from 'next/og'

export const alt = 'Page'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export async function generateStaticParams() {
  const pagePaths = await sanityFetch({
    query: pagePathsQuery,
    perspective: "published",
    stega: false
  })

  const skipPaths = ["posts"]

  return pagePaths.filter((page) => page.slug && !skipPaths.includes(page.slug)).map((page) => ({ slug: page.slug }))
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params

  const content = await sanityFetch({
    query: pageQuery,
    params: resolvedParams,
    tags: ["page"],
    perspective: "published"
  })

  const ogImage = resolveOpenGraphImage(content?.ogImage || content?.coverImage)

  if (ogImage?.url) {
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 128,
            background: 'white',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ogImage.url} alt={content?.title || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      ),
      {
        ...size,
      }
    )
  }

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {content?.title || "Untitled"}
      </div>
    ),
    {
      ...size,
    }
  )
}