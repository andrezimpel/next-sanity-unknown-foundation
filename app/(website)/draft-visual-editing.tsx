"use client"

import { useRouter } from "next/navigation"
import { VisualEditing } from "next-sanity/visual-editing"
import { useEffect } from "react"

export default function DraftVisualEditing() {
  const router = useRouter()

  useEffect(() => {
    const events = new EventSource("/api/draft-mode/events")
    const refresh = () => router.refresh()
    let polling: ReturnType<typeof setInterval> | undefined
    function poll() {
      events.close()
      polling ??= setInterval(refresh, 30_000)
    }

    events.onmessage = refresh
    events.addEventListener("welcome", refresh)
    events.addEventListener("restart", refresh)
    events.addEventListener("goaway", poll)
    events.onerror = () => { if (events.readyState === EventSource.CLOSED) poll() }
    return () => {
      events.close()
      clearInterval(polling)
    }
  }, [router])

  return <VisualEditing />
}
