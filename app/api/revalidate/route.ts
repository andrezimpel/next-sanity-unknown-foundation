import { isValidSignature, SIGNATURE_HEADER_NAME } from "@sanity/webhook"
import { revalidateTag } from "next/cache"
import { setTimeout } from "node:timers/promises"

import { invalidateRedirects } from "@/sanity/lib/redirects"
import { getWebhookTags } from "@/sanity/lib/tags"

export async function POST(request: Request) {
  const secret = process.env.SANITY_REVALIDATE_SECRET?.trim()
  if (!secret) {
    console.error("Missing SANITY_REVALIDATE_SECRET")
    return new Response("Revalidation unavailable", { status: 500 })
  }

  try {
    const signature = request.headers.get(SIGNATURE_HEADER_NAME)
    if (!signature) return new Response("Invalid signature", { status: 401 })

    const text = await request.text()
    if (!(await isValidSignature(text, signature, secret).catch(() => false))) {
      return new Response("Invalid signature", { status: 401 })
    }

    let payload: { tags?: unknown; urlsChanged?: unknown } | null
    try {
      payload = JSON.parse(text)
    } catch {
      return new Response("Invalid payload", { status: 400 })
    }

    const tags = getWebhookTags(payload?.tags)
    if (!tags) return new Response("Invalid tags", { status: 400 })

    // Allow the Content Lake search store to catch up before a request can refill the cache.
    await setTimeout(3_000)
    try {
      // Older projections omit urlsChanged. Only an explicit false can skip expiration.
      if (payload?.urlsChanged !== false && (tags.includes("page") || tags.includes("post"))) {
        await invalidateRedirects()
      }
    } finally {
      for (const tag of tags) revalidateTag(tag, "max")
    }
    return Response.json({ revalidated: true })
  } catch (error) {
    console.error("Sanity revalidation failed", error)
    return new Response("Revalidation unavailable", { status: 500 })
  }
}
