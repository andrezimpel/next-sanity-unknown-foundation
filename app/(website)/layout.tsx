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

export async function generateMetadata(): Promise<Metadata> {
  const settings = await sanityFetch({
    query: settingsQuery,
    // Metadata should never contain stega
    stega: false,
  })
  const title = settings?.title
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
      default: title || "Replace this title",
    },
    description: description,
    openGraph: {
      images: ogImage ? [ogImage] : [],
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
  const data = await sanityFetch({ query: settingsQuery })
  const { isEnabled: isDraftMode } = await draftMode()

  return (
    <html lang="de" className={`${inter.variable} bg-white text-black`}>
      <body>
        <section className="min-h-screen">
          {isDraftMode && <AlertBanner />}
          <main>{children}</main>
          <footer className="bg-accent-1 border-accent-2 border-t">
            footer
          </footer>
        </section>
        {isDraftMode && <VisualEditing />}
        <SpeedInsights />
      </body>
    </html>
  )
}
