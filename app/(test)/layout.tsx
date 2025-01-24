import { VisualEditing } from "next-sanity"
import { draftMode } from "next/headers"
import { Suspense } from "react"
import "../globals.css"
import { TestFooter } from "./footer"

export default async function RootTestLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isEnabled: isDraftMode } = await draftMode()

  return (
    <html lang="de" className="bg-white text-black">
      <body>
        {children}
        <div>
          <b>Test footer:</b><br />
          <Suspense>
            <TestFooter />
          </Suspense>
        </div>
        {isDraftMode && <VisualEditing />}
      </body>
    </html>
  )
}
