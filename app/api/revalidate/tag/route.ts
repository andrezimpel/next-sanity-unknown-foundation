import { parseBody } from 'next-sanity/webhook'
import { revalidatePath, revalidateTag } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'

type WebhookPayload = {
  tags: string[]
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.SANITY_REVALIDATE_SECRET) {
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

    console.log({ body })

    revalidateTag('settings')
    revalidatePath('/', "layout")

    if (!isValidSignature) {
      const message = 'Invalid signature'
      return new Response(JSON.stringify({ message, isValidSignature, body }), {
        status: 401,
      })
    } else if (!Array.isArray(body?.tags) || !body.tags.length) {
      const message = 'Bad Request'
      return new Response(JSON.stringify({ message, body }), { status: 400 })
    }

    console.log({ body, tags: body.tags })

    await Promise.all(body?.tags?.map(async (tag) => {
      await new Promise(resolve => setTimeout(resolve, 500))
      await revalidateTag(tag)
    }))

    return NextResponse.json({ body })
  } catch (err) {
    console.error(err)
    return new Response((err as Error).message, { status: 500 })
  }
}