import "../globals.css"

export default function RootTestLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <html lang="de" className="bg-white text-black">
      <body>
        {children}
      </body>
    </html>
  )
}
