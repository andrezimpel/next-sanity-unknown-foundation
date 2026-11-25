import type { Metadata } from "next"
import { draftMode } from "next/headers"

import { siteUrl } from "@/lib/site-url"
import { sanityFetch } from "@/sanity/lib/fetch"
import { getLocale } from "@/sanity/lib/locale"
import { settingsQuery } from "@/sanity/lib/queries"
import { resolveOpenGraphImage } from "@/sanity/lib/utils"

export function fetchPlainSettings() {
  return sanityFetch({ query: settingsQuery, mode: "preview-plain", tags: ["settings"] })
}

export async function contentMetadata({
  title,
  description,
  socialTitle,
  image,
  pathname,
  noIndex,
  type = "website",
}: {
  title: string
  description?: string | null
  socialTitle?: string | null
  image?: ReturnType<typeof resolveOpenGraphImage>
  pathname: string
  noIndex?: boolean | null
  type?: "website" | "article"
}): Promise<Metadata> {
  const [settings, draft] = await Promise.all([fetchPlainSettings(), draftMode()])
  const locale = getLocale(settings?.locale)
  const url = siteUrl(pathname)
  const socialImage = image ?? resolveOpenGraphImage(settings?.ogImage)
  const summary = description || settings?.description || undefined

  return {
    title,
    description: summary,
    alternates: { canonical: url },
    robots: { index: !noIndex && !draft.isEnabled },
    openGraph: {
      type,
      url,
      title: socialTitle || title,
      description: summary,
      siteName: settings?.title,
      locale: locale.region ? `${locale.language}_${locale.region}` : undefined,
      ...(socialImage && { images: [socialImage] }),
    },
  }
}
