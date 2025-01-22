import { sanityFetch } from '@/sanity/lib/fetch'
import { pageQuery } from '@/sanity/lib/queries'
import { ImageResponse } from 'next/og'

export const runtime = 'edge'

async function fetchPage() {
  return sanityFetch({
    query: pageQuery,
    params: {
      slug: 'posts'
    }
  })
}

const size = {
  width: 1200,
  height: 630,
}

export async function generateImageMetadata() {
  const page = await fetchPage()
  return [
    {
      id: 'og-image',
      alt: page?.title,
      size,
      contentType: 'image/png',
    }
  ]
}

// Image generation
export default async function Image() {
  const page = await fetchPage()

  // Font
  // const interSemiBold = fetch(
  //   new URL('./Inter-SemiBold.ttf', import.meta.url)
  // ).then((res) => res.arrayBuffer())

  return new ImageResponse(
    (
      // ImageResponse JSX element
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
        {page?.title || "Untitled"}
      </div>
    ),
    // ImageResponse options
    {
      // For convenience, we can re-use the exported opengraph-image
      // size config to also set the ImageResponse's width and height.
      ...size,
      // fonts: [
      //   {
      //     name: 'Inter',
      //     data: await interSemiBold,
      //     style: 'normal',
      //     weight: 400,
      //   },
      // ],
    }
  )
}