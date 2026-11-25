import { NextResponse, type NextRequest } from "next/server"

import { getRedirect } from "@/sanity/lib/redirects"
import { decodeRouteSlug, resolvePathname } from "@/sanity/lib/routes"

export async function proxy(request: NextRequest) {
  if (request.method !== "GET" && request.method !== "HEAD") return NextResponse.next()

  const { pathname, search } = request.nextUrl
  if (pathname === "/posts") return NextResponse.next()

  const type = pathname.startsWith("/posts/") ? "post" : "page"
  const encoded = pathname.slice(type === "post" ? "/posts/".length : 1)
  const path = resolvePathname(type, decodeRouteSlug(type, encoded))
  if (!path) return NextResponse.next()

  try {
    const destination = await getRedirect(path)
    if (destination) {
      if (request.cookies.has("__prerender_bypass")) {
        // The App Router validates Draft Mode against the current build.
        const preview = new URL(`/api/redirect-preview/${type}/${encoded}${search}`, request.url)
        return NextResponse.rewrite(preview)
      }

      return NextResponse.redirect(new URL(destination + search, request.url), {
        status: 308,
        headers: { "Cache-Control": "no-store" },
      })
    }
  } catch (error) {
    console.error("Could not check Sanity redirects", error)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/:slug", "/posts/:slug"],
}
