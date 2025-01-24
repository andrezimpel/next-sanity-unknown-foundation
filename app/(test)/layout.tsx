import { Suspense } from "react"
import "../globals.css"
import { TestFooter } from "./footer"

export default async function RootTestLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
      </body>
    </html>
  )
}
