import { getCache } from "@vercel/functions"

import { dataset, projectId } from "./api"
import { fetchPublishedRedirects } from "./fetch"
import { resolvePathname } from "./routes"

type Redirects = Record<string, string>

// Proxy and Route Handlers can bundle separate copies of the SDK's local fallback.
const shared = globalThis as typeof globalThis & { foundationRedirectCache?: ReturnType<typeof getCache> }
const cache = shared.foundationRedirectCache ??= getCache({ namespace: "sanity-redirects" })
const cacheKey = `v2:${projectId}:${dataset}`
const cacheTag = `sanity-redirects:${projectId}:${dataset}`
const generationKey = `${cacheKey}:generation`
let active: { generation: string; redirects: Promise<Redirects> } | undefined

async function loadRedirects() {
  const { aliases, occupied } = await fetchPublishedRedirects()
  const canonical = new Set(occupied.map(({ _type, slug }) => resolvePathname(_type, slug)))
  const redirects: Redirects = {}

  for (const { _type, slug, previousSlugs } of aliases) {
    const destination = resolvePathname(_type, slug)
    if (!destination) continue
    for (const previous of previousSlugs ?? []) {
      const source = resolvePathname(_type, previous)
      if (source && source !== "/posts" && source !== destination && !canonical.has(source)) {
        redirects[source] ??= destination
      }
    }
  }
  return redirects
}

async function redirectsForGeneration(generation: string) {
  const stored = await cache.get(cacheKey) as { generation: string; redirects: Redirects } | null
  if (stored?.generation === generation) return stored.redirects
  const redirects = await loadRedirects()
  await cache.set(cacheKey, { generation, redirects })
  return redirects
}

export function invalidateRedirects() {
  return cache.expireTag(cacheTag)
}

export async function getRedirect(pathname: string) {
  let generation = await cache.get(generationKey) as string | null
  if (!generation) {
    generation = crypto.randomUUID()
    // Publish the generation before reading Sanity so an older fill cannot become current.
    await cache.set(generationKey, generation, { tags: [cacheTag] })
  }
  if (active?.generation !== generation) {
    active = { generation, redirects: redirectsForGeneration(generation) }
  }
  const entry = active
  try {
    return (await entry.redirects)[pathname]
  } catch (error) {
    if (active === entry) active = undefined
    throw error
  }
}
