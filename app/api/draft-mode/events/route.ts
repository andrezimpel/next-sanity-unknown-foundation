import { draftMode } from "next/headers"

import { client } from "@/sanity/lib/client"
import { getReadToken } from "@/sanity/lib/token"

export async function GET(request: Request) {
  if (!(await draftMode()).isEnabled) return new Response(null, { status: 401 })

  const url = new URL(client.getUrl(client.getDataUrl("live/events")))
  url.searchParams.set("includeDrafts", "true")
  const headers = new Headers({ Authorization: `Bearer ${getReadToken()}`, Accept: "text/event-stream" })
  const lastEventId = request.headers.get("last-event-id")
  if (lastEventId) headers.set("Last-Event-ID", lastEventId)

  const stream = await fetch(url, { headers, cache: "no-store", signal: request.signal })
  if (!stream.ok || !stream.headers.get("content-type")?.startsWith("text/event-stream")) {
    await stream.body?.cancel()
    return new Response(null, { status: 502 })
  }

  return new Response(stream.body, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "private, no-store, no-transform" },
  })
}
