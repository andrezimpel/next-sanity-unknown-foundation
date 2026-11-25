import { perspectiveCookieName, variantCookieName } from "@sanity/preview-url-secret/constants"
import { cookies, draftMode } from "next/headers"

export async function POST(request: Request) {
  const { origin } = new URL(request.url)
  const source = request.headers.get("origin")
  const sameOrigin = request.headers.get("sec-fetch-site") === "same-origin"
  if (!source || (!sameOrigin && source !== origin)) {
    return new Response("Invalid origin", { status: 403 })
  }

  const returnTo = new URLSearchParams(await request.text()).get("returnTo")
  const target = returnTo?.startsWith("/") && URL.canParse(returnTo, origin)
    ? new URL(returnTo, origin)
    : null
  const location = target?.origin === origin && !target.pathname.startsWith("//")
    ? target.pathname + target.search
    : "/"

  const draft = await draftMode()
  if (draft.isEnabled) {
    draft.disable()
    const jar = await cookies()
    jar.delete(perspectiveCookieName)
    jar.delete(variantCookieName)
  }

  return new Response(null, { status: 303, headers: { location } })
}
