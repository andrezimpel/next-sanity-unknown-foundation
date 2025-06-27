import { sanityFetch } from '@/sanity/lib/fetch'
import { postQuery } from '@/sanity/lib/queries'
import { ImageResponse } from 'next/og'
import { Props } from './page'

async function fetchPost({ params }: Props) {
  return sanityFetch({ query: postQuery, params, tags: ["post"] })
}

const size = {
  width: 1200,
  height: 630,
}

export async function generateImageMetadata({ params }: Props) {
  const post = await fetchPost({ params })
  return [
    {
      id: 'og-image',
      alt: post?.title,
      size,
      contentType: 'image/png',
    }
  ]
}

// Image generation
export default async function Image({ params }: Props) {
  const post = await fetchPost({ params })

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
        {post?.title || "Untitled"}
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