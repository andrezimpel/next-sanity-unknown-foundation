import { defineEnableDraftMode } from "next-sanity/draft-mode"
import type { NextRequest } from "next/server"

import { client } from "@/sanity/lib/client"
import { getReadToken } from "@/sanity/lib/token"

export function GET(request: NextRequest) {
  const preview = defineEnableDraftMode({ client: client.withConfig({ token: getReadToken() }) })
  return preview.GET(request)
}
