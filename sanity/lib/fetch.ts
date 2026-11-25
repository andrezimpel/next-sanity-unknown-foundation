import "server-only"

import type { ClientPerspective } from "@sanity/client"
import { perspectiveCookieName } from "@sanity/preview-url-secret/constants"
import { cookies, draftMode } from "next/headers"
import { stegaClean, type QueryParams } from "next-sanity"

import { client } from "./client"
import { redirectsQuery } from "./queries"
import type { DocumentTag } from "./tags"
import { getReadToken } from "./token"

export async function fetchPublishedRedirects() {
  const result = await client.fetch(redirectsQuery, {}, {
    perspective: "published",
    stega: false,
    cache: "no-store",
    signal: AbortSignal.timeout(2_000),
  })
  return stegaClean(result)
}

async function getPreviewPerspective(): Promise<ClientPerspective> {
  const selected = (await cookies()).get(perspectiveCookieName)?.value ?? "drafts"
  if (selected === "published" || selected === "drafts") return selected
  const stack = selected.split(",")
  return stack.every((id) => id !== "raw" && /^[a-zA-Z0-9_-]+$/.test(id))
    ? stack
    : "drafts"
}

export async function sanityFetch<const Query extends string>({
  query,
  params = {},
  mode = "preview-text",
  tags,
}: {
  query: Query
  params?: QueryParams
  mode?: "published" | "preview-text" | "preview-plain"
  tags: DocumentTag[]
}) {
  if (mode !== "published" && (await draftMode()).isEnabled) {
    const encode = mode === "preview-text"
    const result = await client.fetch(query, params, {
      perspective: await getPreviewPerspective(),
      token: getReadToken(),
      stega: encode,
      cache: "no-store",
    })
    return encode ? result : stegaClean(result)
  }

  const result = await client.fetch(query, params, {
    perspective: "published",
    stega: false,
    cache: "force-cache",
    next: { tags },
  })
  return stegaClean(result)
}
