import { sanityFetch } from '@/sanity/lib/fetch'
import { pageQuery } from '@/sanity/lib/queries'
import { resolveOpenGraphImage } from '@/sanity/lib/utils'
import { ImageResponse } from 'next/og'

export const alt = 'Posts'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
  const content = await sanityFetch({
    query: pageQuery,
    params: {
      slug: 'posts'
    },
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