import { parseBody } from 'next-sanity/webhook'
import { revalidateTag } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'

type WebhookPayload = {
  tags: string[]
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.SANITY_REVALIDATE_SECRET) {
      console.error('Missing SANITY_REVALIDATE_SECRET')
      return new Response(
        'Missing environment variable SANITY_REVALIDATE_SECRET',
        { status: 500 },
      )
    }

    const { isValidSignature, body } = await parseBody<WebhookPayload>(
      req,
      process.env.SANITY_REVALIDATE_SECRET,
      true,
    )

    if (!isValidSignature) {
      console.error('Invalid signature in revalidation webhook')
      return new Response(JSON.stringify({ message: 'Invalid signature', isValidSignature, body }), {
        status: 401,
      })
    }

    if (!Array.isArray(body?.tags) || !body.tags.length) {
      console.error('Invalid tags in revalidation webhook', body)
      return new Response(JSON.stringify({ message: 'Bad Request - Invalid tags', body }), {
        status: 400
      })
    }

    // Revalidate all tags in parallel
    await Promise.all(
      body.tags.map(async (tag) => {
        try {
          await revalidateTag(tag)
          console.log(`Successfully revalidated tag: ${tag}`)
        } catch (error) {
          console.error(`Failed to revalidate tag: ${tag}`, error)
        }
      })
    )

    return NextResponse.json({
      revalidated: true,
      tags: body.tags
    })
  } catch (err) {
    console.error('Error in revalidation webhook:', err)
    return new Response((err as Error).message, { status: 500 })
  }
}