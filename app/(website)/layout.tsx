import "../globals.css"

import type { Metadata, Viewport } from "next"
import { draftMode } from "next/headers"

import AlertBanner from "./alert-banner"
import DraftVisualEditing from "./draft-visual-editing"

import { getSiteOrigin } from "@/lib/site-url"
import { getLocale } from "@/sanity/lib/locale"
import { Suspense } from "react"
import { Footer } from "./footer"
import { Header } from "./header"
import { fetchPlainSettings } from "./metadata"
import Provider from "./provider"

export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchPlainSettings()
  const title = settings?.title || "Website"

  return {
    metadataBase: new URL(getSiteOrigin()),
    title: {
      template: `%s | ${title}`,
      default: title,
    },
    description: settings?.description,
  }
}

export function generateViewport(): Viewport {
  return {
    themeColor: '#000000'
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [{ isEnabled: isDraftMode }, settings] = await Promise.all([draftMode(), fetchPlainSettings()])

  return (
    <html lang={getLocale(settings?.locale).baseName} className="bg-white text-black">
      <body>
        <Provider>
          {isDraftMode && <AlertBanner />}
          <Suspense>
            <Header />
          </Suspense>
          <main className="grid grid-cols-1 gap-y-12 py-12">{children}</main>
          <Suspense>
            <Footer />
          </Suspense>
          {isDraftMode && <DraftVisualEditing />}
        </Provider>
      </body>
    </html>
  )
}
