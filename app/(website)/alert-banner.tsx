"use client"

import { usePathname } from "next/navigation"
import { useSyncExternalStore } from "react"
import { useFormStatus } from "react-dom"

const emptySubscribe = () => () => {}

function ExitButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className="underline">
      {pending ? "Disabling draft mode…" : "Back to published"}
    </button>
  )
}

export default function AlertBanner() {
  const pathname = usePathname()
  const shouldShow = useSyncExternalStore(
    emptySubscribe,
    () => window.top === window,
    () => false,
  )
  if (!shouldShow) return null

  return (
    <div className="fixed top-0 left-0 z-50 w-full border-b bg-white/95 text-black backdrop-blur">
      <form action="/api/draft-mode/disable" method="post" className="py-2 text-center text-sm">
        <input type="hidden" name="returnTo" value={pathname} />
        {"Previewing drafts. "}
        <ExitButton />
      </form>
    </div>
  )
}
