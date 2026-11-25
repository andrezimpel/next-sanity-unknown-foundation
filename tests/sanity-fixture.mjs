import { appendFileSync, existsSync, readFileSync, renameSync, watchFile, unwatchFile } from "node:fs"
import { setTimeout as sleep } from "node:timers/promises"
import { evaluate, parse } from "groq-js"

export const projectId = "foundationfixture"
export const previewSecret = "fixture-preview-secret"
export const date = "2026-01-15T10:00:00Z"

export function titleSourceMap(document) {
  return {
    documents: [{ _id: document._id, _type: document._type }],
    paths: ["$['title']"],
    mappings: {
      "$['title']": { type: "value", source: { type: "documentValue", document: 0, path: 0 } },
    },
  }
}

if (process.env.FOUNDATION_FIXTURE) {
  if (process.env.VERCEL === "1") {
    const entries = new Map()
    const cache = {
      get: async (key) => entries.get(key)?.value ?? null,
      set: async (key, value, { tags = [] }) => {
        const hold = `${process.env.FOUNDATION_FIXTURE}.hold-redirect-write`
        if (value?.redirects && existsSync(hold)) {
          renameSync(hold, `${hold}.started`)
          while (existsSync(`${hold}.started`)) await sleep(10)
        }
        entries.set(key, { value, tags })
      },
      expireTag: async (tag) => {
        for (const [key, entry] of entries) {
          if (entry.tags.includes(tag)) entries.delete(key)
        }
      },
    }
    globalThis[Symbol.for("@vercel/request-context")] = { get: () => ({ cache }) }
  }

  const fetchFromNetwork = globalThis.fetch

  globalThis.fetch = async (input, init) => {
    const url = new URL(input instanceof Request ? input.url : input)
    if (url.hostname !== `${projectId}.api.sanity.io`) {
      if (url.hostname.endsWith(".sanity.io")) {
        throw new Error(`Unexpected Sanity request to ${url.hostname}`)
      }
      return fetchFromNetwork(input, init)
    }

    if (url.pathname.endsWith("/data/live/events/fixture")) {
      const request = new Request(input, init)
      if (url.searchParams.get("includeDrafts") !== "true" ||
          request.headers.get("authorization") !== "Bearer fixture-read-token") {
        return new Response(null, { status: 401 })
      }
      const path = process.env.FOUNDATION_FIXTURE + ".live-event"
      const encoder = new TextEncoder()
      let stop
      const stream = new ReadableStream({
        start(controller) {
          const send = () => controller.enqueue(encoder.encode('event: message\ndata: {"tags":["fixture"]}\n\n'))
          watchFile(path, { interval: 50 }, send)
          const abort = () => {
            stop()
            controller.close()
          }
          stop = () => {
            unwatchFile(path, send)
            request.signal.removeEventListener("abort", abort)
          }
          request.signal.addEventListener("abort", abort, { once: true })
          controller.enqueue(encoder.encode("event: welcome\ndata: {}\n\n"))
        },
        cancel() { stop() },
      })
      return new Response(stream, { headers: { "Content-Type": "text/event-stream" } })
    }

    const body = init?.method === "POST" ? JSON.parse(init.body) : {}
    const query = body.query ?? url.searchParams.get("query")
    if (query.includes('"aliases":')) {
      appendFileSync(process.env.FOUNDATION_REDIRECT_QUERY_LOG, "redirects\n")
    }
    const params = body.params ?? Object.fromEntries(
      [...url.searchParams.entries()]
        .filter(([key]) => key.startsWith("$"))
        .map(([key, value]) => [key.slice(1), JSON.parse(value)]),
    )

    if (params.secret) {
      const valid = params.secret === previewSecret
      return Response.json({ result: {
        private: valid ? { _id: "fixture", _updatedAt: date, secret: previewSecret } : null,
        public: null,
      } })
    }

    const fixture = JSON.parse(readFileSync(process.env.FOUNDATION_FIXTURE, "utf8"))
    const perspective = url.searchParams.get("perspective")
    const replacements = perspective === "drafts"
      ? fixture.drafts
      : perspective?.split(",").includes("fixture-release") ? fixture.release : []
    const dataset = new Map(fixture.published.map((document) => [document._id, document]))
    for (const document of replacements) dataset.set(document._id, document)

    // Content Lake accepts slice parameters. The local GROQ parser requires literal bounds.
    const source = query.replace("[$from...$to]", () => {
      if (!Number.isSafeInteger(params.from) || !Number.isSafeInteger(params.to)) {
        throw new Error("Invalid GROQ slice parameters")
      }
      return `[${params.from}...${params.to}]`
    })
    const value = await evaluate(parse(source), { dataset: [...dataset.values()], params })
    const result = await value.get()
    let resultSourceMap
    if (url.searchParams.has("resultSourceMap") && result?.title) {
      const source = [...dataset.values()].find((document) => document.title === result.title)
      if (source) resultSourceMap = titleSourceMap(source)
    }

    return Response.json({ result, resultSourceMap })
  }
}
