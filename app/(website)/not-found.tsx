import { Button } from "@/components/ui/button"
import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Page not found",
}

export default function NotFound() {
  return (
    <div className="container mx-auto flex flex-col items-center justify-center space-y-4 text-center">
      <h1 className="text-8xl font-bold text-gray-800">404</h1>
      <h2 className="text-3xl font-semibold text-gray-700">Page Not Found</h2>
      <p className="text-lg text-gray-600">
        The page you are looking for does not exist.<br />
        It might have been moved or deleted.
      </p>
      <Button variant="default" className="mt-4">
        <Link href="/">Back to Home</Link>
      </Button>
    </div>
  )
}
