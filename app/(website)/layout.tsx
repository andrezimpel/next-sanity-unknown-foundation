import "../globals.css"

import { SpeedInsights } from "@vercel/speed-insights/next"
import type { Metadata } from "next"
import {
  VisualEditing
} from "next-sanity"
import { Inter } from "next/font/google"
import { draftMode } from "next/headers"

import AlertBanner from "./alert-banner"

import { sanityFetch } from "@/sanity/lib/fetch"
import { settingsQuery } from "@/sanity/lib/queries"
import { resolveOpenGraphImage } from "@/sanity/lib/utils"
import { Suspense } from "react"
import { Footer } from "./footer"
import { Header } from "./header"

export async function generateMetadata(): Promise<Metadata> {
  const settings = await sanityFetch({
    query: settingsQuery,
    // Metadata should never contain stega
    stega: false,
  })
  const title = settings?.title || "Replace this title"
  const description = settings?.description

  const ogImage = resolveOpenGraphImage(settings?.ogImage)
  let metadataBase: URL | undefined = undefined
  try {
    metadataBase = process.env.SITE_URL
      ? new URL(process.env.SITE_URL)
      : undefined
  } catch {
    // ignore
  }

  return {
    metadataBase,
    title: {
      template: `%s | ${title}`,
      default: title,
    },
    description: description,
    openGraph: {
      images: ogImage ? [ogImage] : [],
      ...(settings?.title && { title: settings.title }),
    },
    robots: {
      index: true,
    },
  }
}

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
})

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isEnabled: isDraftMode } = await draftMode()

  return (
    <html lang="de" className={`${inter.variable} bg-white text-black`}>
      <body>
        {isDraftMode && <AlertBanner />}
        <Suspense>
          <Header />
        </Suspense>
        <main className="space-y-12 py-12">{children}</main>
        <Suspense>
          <Footer />
        </Suspense>
        {isDraftMode && <VisualEditing />}
        <SpeedInsights />
      </body>
    </html>
  )
}
