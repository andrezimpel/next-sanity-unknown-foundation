import assert from "node:assert/strict"
import { spawn } from "node:child_process"
import { once } from "node:events"
import { cp, mkdir, mkdtemp, readFile, rename, rm, symlink, writeFile } from "node:fs/promises"
import { createServer } from "node:net"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { setTimeout as sleep } from "node:timers/promises"
import { stegaClean, stegaEncodeSourceMap } from "@sanity/client/stega"
import { encodeSignatureHeader, SIGNATURE_HEADER_NAME } from "@sanity/webhook"
import { chromium } from "playwright"

import { date, previewSecret, projectId, titleSourceMap } from "./sanity-fixture.mjs"

const directory = await mkdtemp(join(tmpdir(), "foundation-test-"))
const workspace = join(directory, "workspace")
const fixturePath = join(directory, "dataset.json")
const webhookSecret = "fixture-webhook-secret"
const canonical = "https://foundation.example"
const deployment = process.env.FOUNDATION_TEST_ENV ?? "production"
const testPath = (name) => fileURLToPath(new URL(name, import.meta.url))
const next = testPath("../node_modules/next/dist/bin/next")

const home = { _type: "homePage", _id: "homePage", _updatedAt: date, title: "Published home" }
const encodedHome = stegaEncodeSourceMap(home, titleSourceMap(home), { enabled: true, studioUrl: "/studio" })
assert.notEqual(encodedHome.title, home.title)
const page = (slug, props = {}) => ({
  _type: "page", _id: slug, _updatedAt: date, slug: { current: slug }, title: slug, ...props,
})
const post = (slug, props = {}) => ({
  _type: "post", _id: slug, _updatedAt: date, date, slug: { current: slug }, title: slug, ...props,
})
const fixture = {
  published: [
    encodedHome,
    { ...home, _id: "duplicate-home", title: "Wrong singleton" },
    { _id: "settings", _type: "settings", title: "Fixture website", locale: "en-US", _updatedAt: date },
    page("posts", { title: "Articles" }),
    page("private-note", { noIndex: true, content: [{
      _type: "block", _key: "links",
      children: ["article", "page", "external", "unpublished"].map((key) => ({
        _type: "span", _key: key, text: key, marks: [key],
      })),
      markDefs: [
        { _type: "internalLink", _key: "article", target: { _type: "reference", _ref: "empty" } },
        { _type: "internalLink", _key: "page", target: { _type: "reference", _ref: "about us" } },
        { _type: "link", _key: "external", href: "https://example.com/" },
        { _type: "internalLink", _key: "unpublished", target: { _type: "reference", _ref: "unpublished" } },
      ],
    }] }),
    page("about us", { title: "Legacy whitespace slug" }),
    page("redirect-target", { previousSlugs: ["icon-1gp61b.svg", "private-note"] }),
    page("studio"),
    page("studio-services", { content: [
      {
        _type: "image", _key: "portrait", alt: "Portrait",
        asset: { _type: "reference", _ref: "image-portrait-600x900-jpg" },
      },
      {
        _type: "image", _key: "crop", alt: "Cropped portrait",
        asset: { _type: "reference", _ref: "image-portrait-600x900-jpg" },
        crop: { left: 0.1, right: 0.2, top: 0, bottom: 0.5 },
      },
      { _type: "image", _key: "unfinished-upload" },
      {
        _type: "image", _key: "empty-crop",
        asset: { _type: "reference", _ref: "image-portrait-600x900-jpg" },
        crop: { left: 0, right: 0, top: 0.5, bottom: 0.5 },
      },
    ] }),
    {
      _id: "author", _type: "author", name: "Fixture Author",
      profileUrl: "https://foundation.example/about",
    },
    {
      _id: "nav", _type: "navigationZone", identifier: "header",
      items: [{ _key: "nav-posts", link: { _type: "reference", _ref: "posts" } }],
    },
    post("empty", { metaDescription: '</script><script data-fixture="injected">', author: { _ref: "author" } }),
    ...Array.from({ length: 12 }, (_, index) => post(`archive-${String(index).padStart(2, "0")}`)),
  ],
  drafts: [
    { ...home, title: "Studio draft home" },
    { _id: "nav", _type: "navigationZone", identifier: "header", items: [
      { _key: "nav-draft", title: "Studio draft navigation", url: "/posts" },
    ] },
  ],
  release: [{ ...home, title: "Studio release home" }],
}

async function writeFixture() {
  const temporary = `${fixturePath}.tmp`
  await writeFile(temporary, JSON.stringify(fixture))
  await rename(temporary, fixturePath)
}

const env = {
  ...process.env,
  FOUNDATION_FIXTURE: fixturePath,
  FOUNDATION_REDIRECT_QUERY_LOG: join(directory, "redirect-queries.log"),
  NEXT_PUBLIC_SANITY_PROJECT_ID: projectId,
  NEXT_PUBLIC_SANITY_DATASET: "fixture",
  NEXT_PUBLIC_PLAUSIBLE_DOMAIN: deployment === "preview" ? "" : "foundation.example",
  NEXT_TELEMETRY_DISABLED: "1",
  SANITY_API_READ_TOKEN: "fixture-read-token",
  SANITY_REVALIDATE_SECRET: webhookSecret,
  SITE_URL: canonical,
  VERCEL: deployment === "preview" ? "1" : undefined,
  VERCEL_ENV: deployment,
  NODE_OPTIONS: `${process.env.NODE_OPTIONS ?? ""} --import=${new URL("./sanity-fixture.mjs", import.meta.url).href}`.trim(),
}

async function openPort() {
  const server = createServer()
  server.listen(0, "127.0.0.1")
  await once(server, "listening")
  const { port } = server.address()
  server.close()
  await once(server, "close")
  return port
}

function runNext(...args) {
  return spawn(process.execPath, [next, ...args], { cwd: workspace, env, stdio: "inherit" })
}

let server
let browser
try {
  await mkdir(workspace)
  const paths = [
    "app", "components", "lib", "sanity", "sanity.config.ts", "sanity.cli.ts",
    "sanity.types.ts", "next.config.ts", "postcss.config.js", "proxy.ts", "tsconfig.json", "package.json", "yarn.lock",
  ]
  await Promise.all([
    ...paths.map((path) => cp(testPath(`../${path}`), join(workspace, path), { recursive: true })),
    symlink(testPath("../node_modules"), join(workspace, "node_modules"), "dir"),
  ])
  await writeFixture()
  await writeFile(fixturePath + ".live-event", "")
  const build = runNext("build", "--webpack")
  assert.equal((await once(build, "exit"))[0], 0, "production build")

  const port = await openPort()
  server = runNext("start", "--hostname", "127.0.0.1", "--port", String(port))
  const origin = `http://127.0.0.1:${port}`
  const request = (path, init) => fetch(`${origin}${path}`, {
    redirect: "manual",
    ...init,
  })

  async function eventually(check) {
    const deadline = Date.now() + 20_000
    let error
    do {
      try {
        return await check()
      } catch (failure) {
        error = failure
        await sleep(250)
      }
    } while (Date.now() < deadline)
    throw error
  }

  async function html(path, headers, status = 200) {
    const response = await request(path, { headers })
    assert.equal(response.status, status, path)
    return response.text()
  }

  function assertClean(value, context) {
    const decoded = value.replace(/\\u([0-9a-f]{4})/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    assert.ok(stegaClean(decoded) === decoded, `stega in ${context}`)
    assert.doesNotMatch(value, /fixture-read-token/)
  }

  async function webhook(payload, status = 200, signed = true) {
    const body = typeof payload === "string" ? payload : JSON.stringify(Array.isArray(payload) ? { tags: payload } : payload)
    const signature = signed ? await encodeSignatureHeader(body, Date.now(), webhookSecret) : "invalid"
    const response = await request("/api/revalidate", {
      method: "POST",
      headers: { [SIGNATURE_HEADER_NAME]: signature, "content-type": "application/json" },
      body,
    })
    assert.equal(response.status, status, await response.text())
  }

  const publicHome = await eventually(() => html("/"))
  const structuredData = (html) => Array.from(html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g),
    ([, json]) => JSON.parse(json))
  const nodes = structuredData(publicHome)
  assert.ok(nodes.some((node) => node["@type"] === "WebPage"))
  assert.deepEqual(nodes.filter((node) => node["@type"] === "WebSite"), [{
    "@context": "https://schema.org", "@type": "WebSite", name: "Fixture website", url: canonical + "/",
  }])
  assert.match(publicHome, /Published home/)
  assert.match(publicHome, /lang="en-US"/)
  assert.doesNotMatch(publicHome, /Wrong singleton|Studio draft home/)
  const rewrites = JSON.parse(await readFile(join(workspace, ".next/routes-manifest.json"), "utf8")).rewrites
  assert.equal(JSON.stringify(rewrites).includes("plausible.io"), Boolean(env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN))
  assert.equal(publicHome.includes("next-plausible-init"), Boolean(env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN))
  const previewHeader = (await request("/")).headers.get("x-robots-tag")
  assert.equal(previewHeader, deployment === "preview" ? "noindex" : null)

  const ogPath = publicHome.match(/property="og:image" content="([^"]+)"/)?.[1]
  assert.ok(ogPath, "homepage has an Open Graph image URL")
  const image = new URL(ogPath).pathname
  const publicImage = Buffer.from(await (await request(image)).arrayBuffer())
  assert.ok(publicImage.subarray(1, 4).equals(Buffer.from("PNG")))

  const privatePage = await html("/private-note")
  assert.match(privatePage, /href="\/posts\/empty">article<\/a>/)
  assert.match(privatePage, /href="\/about%20us">page<\/a>/)
  assert.match(privatePage, /href="https:\/\/example\.com\/"[^>]*>external<\/a>/)
  assert.match(privatePage, /<\/a>unpublished<\/p>/)
  assert.match(privatePage, /name="robots" content="noindex"/)
  const legacyPage = await html("/about%20us")
  assert.match(legacyPage, /Legacy whitespace slug/)
  assert.match(legacyPage, /rel="canonical" href="https:\/\/foundation.example\/about%20us"/)
  const legacyImage = legacyPage.match(/property="og:image" content="([^"]+)"/)?.[1]
  assert.ok(legacyImage, "legacy page has an Open Graph image URL")
  assert.match((await request(new URL(legacyImage).pathname)).headers.get("content-type"), /^image\/png/)
  const icon = await request("/icon-1gp61b.svg")
  assert.equal(icon.status, 200)
  assert.match(icon.headers.get("content-type"), /image\/svg/)
  const robots = await html("/robots.txt")
  assert.match(robots, /User-Agent: GPTBot\s+Disallow: \/\s/)
  assert.match(robots, /User-Agent: \*\s+Allow: \//)
  assert.match(robots, /^Disallow: \/studio\$$/m)
  assert.match(robots, /^Disallow: \/studio\/$/m)
  assert.doesNotMatch(robots, /^Disallow: \/studio$/m)
  assert.doesNotMatch(robots, /private-note/)
  let sitemap = await html("/sitemap.xml")
  assert.match(sitemap, /https:\/\/foundation.example\//)
  assert.doesNotMatch(sitemap, /private-note|\/studio<\/loc>/)
  assert.match(sitemap, /\/studio-services<\/loc>/)
  assertClean(sitemap, "sitemap")
  assert.match(sitemap, /<loc>https:\/\/foundation\.example\/posts<\/loc>\s*<\/url>/)

  const emptyPost = await html("/posts/empty")
  assert.equal((await readFile(env.FOUNDATION_REDIRECT_QUERY_LOG, "utf8")).trim().split("\n").length, 1)
  assert.match(emptyPost, /"headline":"empty"/)
  assert.match(emptyPost, /"url":"https:\/\/foundation.example\/about"/)
  assert.match(emptyPost, /\\u003c\/script>/)
  assert.doesNotMatch(emptyPost, /<script data-fixture=/)
  assert.match(await html("/posts"), /href="\/posts\/page\/2"/)
  assert.match(await html("/posts/page/2"), /rel="canonical" href="https:\/\/foundation.example\/posts\/page\/2"/)
  for (const path of ["/posts/page/1", "/posts/page/%31"]) {
    const archiveRedirect = await request(path)
    assert.equal(archiveRedirect.status, 308)
    assert.equal(archiveRedirect.headers.get("location"), "/posts")
  }
  await html("/posts/page/3", undefined, 404)

  const enableUrl = `/api/draft-mode/enable?sanity-preview-secret=${previewSecret}&sanity-preview-pathname=/`
  for (const headers of [{}, { cookie: "__prerender_bypass=expired" }]) {
    assert.equal((await request("/api/draft-mode/events", { headers })).status, 401)
  }
  assert.equal((await request(enableUrl.replace(previewSecret, "wrong-secret"))).status, 401)
  const enabled = await request(enableUrl)
  assert.equal(enabled.status, 307)
  const cookie = enabled.headers.getSetCookie().map((value) => value.split(";")[0]).join("; ")
  assert.match(cookie, /__prerender_bypass=/)
  const draft = await html("/", { cookie })
  assert.doesNotMatch(draft, /fixture-read-token/)
  assert.match(draft, /Studio draft home/)
  assert.match(draft, /Studio draft navigation/)
  assert.match(draft, /name="robots" content="noindex"/)
  assert.notEqual(stegaClean(draft), draft, "draft title contains real overlay data")
  assert.equal((await request("/api/draft-mode/disable", {
    method: "POST",
    headers: { cookie, origin: "https://outside.example" },
    body: new URLSearchParams({ returnTo: "/" }),
  })).status, 403)
  for (const fragment of draft.matchAll(/<head>[\s\S]*?<\/head>|<script type="application\/ld\+json">[\s\S]*?<\/script>|\s(?:href|src|alt|lang)="[^"]*"/g)) {
    assertClean(fragment[0], "draft machine-readable output")
  }
  const release = await html("/", { cookie: `${cookie}; sanity-preview-perspective=fixture-release,published` })
  assert.ok(release.includes("Studio release home"), "Studio release perspective is honored")
  assert.ok((await html("/", { cookie: `${cookie}; sanity-preview-perspective=raw` })).includes("Studio draft home"))
  const draftImage = Buffer.from(await (await request(image, { headers: { cookie } })).arrayBuffer())
  assert.deepEqual(draftImage, publicImage, "social image ignores Draft Mode")

  for (const path of ["/", "/posts", "/posts/empty", "/private-note"]) {
    const body = await html(path)
    assert.doesNotMatch(body, /Studio draft|Studio release/)
    assertClean(body, path)
  }
  const rsc = await request("/", { headers: { RSC: "1" }, redirect: "follow" })
  assert.equal(rsc.status, 200)
  assert.match(rsc.headers.get("content-type"), /text\/x-component/)
  assertClean(await rsc.text(), "public RSC")

  browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH })
  const browserContext = await browser.newContext()
  let liveRequests = 0
  browserContext.on("request", (request) => {
    if (new URL(request.url()).pathname === "/api/draft-mode/events") liveRequests++
  })
  await browserContext.route("**/*", (route) => {
    const url = new URL(route.request().url())
    if (url.origin === origin && url.pathname === "/studio-preview-fixture") {
      return route.fulfill({ contentType: "text/html", body: "<iframe title=\"Preview\" src=\"/\"></iframe>" })
    }
    return url.origin === origin && !url.pathname.startsWith("/js/") ? route.continue() : route.abort()
  })
  const browserPage = await browserContext.newPage()
  await browserPage.route("**/_next/image?**", (route) => route.abort())
  await browserPage.goto(origin + "/studio-services")
  const dimensions = await browserPage.locator("main img").evaluateAll((images) =>
    images.map((image) => [image.getAttribute("width"), image.getAttribute("height")]),
  )
  assert.deepEqual(dimensions, [["600", "900"], ["420", "450"]])
  await browserPage.goto(origin + "/posts/empty")
  assert.equal(await browserPage.locator("script[data-fixture]").count(), 0)
  assertClean(await browserPage.locator("html").innerHTML(), "rendered public DOM")
  assert.equal(liveRequests, 0)
  await browserPage.goto(origin + enableUrl + "&sanity-preview-perspective=drafts")
  const draftHeading = await browserPage.locator("h1").textContent()
  assert.equal(stegaClean(draftHeading), "Studio draft home")
  assert.notEqual(draftHeading, "Studio draft home")
  assertClean(await browserPage.locator("head").innerHTML(), "rendered preview head")
  await browserPage.goto(origin + "/posts/page/2")
  const archiveHeading = await browserPage.locator("h1").textContent()
  assert.equal(stegaClean(archiveHeading), "Articles (2)")
  assert.notEqual(archiveHeading, "Articles (2)", "draft archive title contains overlay data")
  assertClean(await browserPage.title(), "draft archive metadata title")
  const [liveStream] = await Promise.all([
    browserPage.waitForResponse((r) => r.url() === origin + "/api/draft-mode/events", { timeout: 10_000 }),
    browserPage.goto(origin + "/studio-preview-fixture"),
  ])
  assert.equal(liveStream.status(), 200)
  assert.equal(liveStream.headers()["content-type"], "text/event-stream")
  await browserPage.evaluate(() => {
    const frame = document.querySelector("iframe")
    const connectionId = "studio-preview-fixture"
    const send = (type, data) => frame.contentWindow.postMessage({
      domain: "sanity/channels", from: "presentation", to: "overlays",
      connectionId, id: crypto.randomUUID(), type, data,
    }, location.origin)
    const handshake = setInterval(() => send("handshake/syn", { id: connectionId }), 100)
    window.addEventListener("message", (event) => {
      if (event.source === frame.contentWindow && event.data?.type === "handshake/syn-ack") {
        send("handshake/ack", { id: connectionId })
        clearInterval(handshake)
        document.body.dataset.studioConnected = "true"
      }
    })
  })
  await browserPage.locator("[data-studio-connected]").waitFor()
  for (const title of ["First live edit", "Studio mutation refreshed"]) {
    fixture.drafts[0].title = title
    await writeFixture()
    await writeFile(fixturePath + ".live-event", title)
    await browserPage.frameLocator("iframe").locator("h1").filter({ hasText: title }).waitFor({ timeout: 8_000 })
  }
  assert.doesNotMatch(await html("/"), /Studio mutation refreshed/)
  await browserPage.goto(origin)
  const [exit] = await Promise.all([
    browserPage.waitForResponse((response) => response.url() === origin + "/api/draft-mode/disable"),
    browserPage.getByRole("button", { name: "Back to published" }).click(),
  ])
  assert.equal(exit.status(), 303, "Draft Mode exit redirect")
  await browserPage.waitForFunction(() => document.querySelector("h1")?.textContent === "Published home", undefined, { timeout: 5000 })
  assertClean(await browserPage.locator("html").innerHTML(), "DOM after exiting preview")
  const remainingCookies = await browserContext.cookies()
  assert.ok(!remainingCookies.some(({ name }) => ["__prerender_bypass", "sanity-preview-perspective"].includes(name)))
  await browser.close()
  browser = undefined

  await webhook("{bad-json", 401, false)
  await webhook("{bad-json", 400)
  await webhook(["page", null, "post"], 400)
  await webhook(["page", "post:private-note"], 400)
  await webhook(["page:private-note"], 400)

  const redirectQueries = () => readFile(env.FOUNDATION_REDIRECT_QUERY_LOG, "utf8")
  const warmRedirectQueries = await redirectQueries()
  fixture.published.find(({ _id }) => _id === "empty").title = "Edited article title"
  await writeFixture()
  await webhook({ tags: ["post"], urlsChanged: false })
  await eventually(async () => assert.match(await html("/posts/empty"), /<h1[^>]*>Edited article title/))
  assert.equal(await redirectQueries(), warmRedirectQueries, "content-only publish reuses the warm redirect map")

  await html("/new-page", undefined, 404)
  fixture.published.push(page("new-page"))
  await writeFixture()
  await webhook(["page", "page:new-page"])
  await eventually(async () => assert.match(await html("/new-page"), /<h1[^>]*>new-page/))

  const renamed = fixture.published.find(({ _id }) => _id === "new-page")
  renamed.slug.current = "renamed-page"
  renamed.previousSlugs = ["new-page"]
  renamed.title = "Renamed page"
  const note = fixture.published.find(({ _id }) => _id === "private-note")
  note.noIndex = false
  const updatedHome = fixture.published.find(({ _id }) => _id === "homePage")
  updatedHome.noIndex = true
  updatedHome.title = "Updated public home"
  await writeFixture()
  const publishing = webhook(["homePage", "page"])
  assert.equal((await request("/new-page")).status, 200)
  await publishing

  for (const headers of [undefined, { cookie: "__prerender_bypass=previous-deploy" }]) {
    const response = await request("/new-page?ref=old&ref=extra", { headers })
    assert.equal(response.status, 308)
    const location = response.headers.get("location")
    assert.ok(location, "permanent redirect sends Location")
    const destination = new URL(location, origin)
    assert.equal(destination.pathname + destination.search, "/renamed-page?ref=old&ref=extra")
  }
  await html("/new-page", { cookie }, 404)
  fixture.drafts.push(page("new-page", { title: "Draft at the former slug" }))
  await writeFixture()
  const draftAlias = await html("/new-page", { cookie })
  assert.match(draftAlias, /Draft at the former slug/)
  assert.match(draftAlias, /name="robots" content="noindex"/)
  assert.equal((await request("/new-page")).status, 308)
  fixture.drafts.pop()
  await writeFixture()
  assert.match(await html("/renamed-page"), /<h1[^>]*>Renamed page/)
  await eventually(async () => {
    sitemap = await html("/sitemap.xml")
    assert.match(sitemap, /renamed-page/)
    assert.match(sitemap, /private-note/)
    assert.doesNotMatch(sitemap, /new-page|<loc>https:\/\/foundation.example\/<\/loc>/)
    assertClean(sitemap, "regenerated sitemap")
  })
  await eventually(async () => {
    assert.match(await html("/"), /name="robots" content="noindex"/)
    assert.doesNotMatch(await html("/private-note"), /name="robots" content="noindex"/)
    const updatedImage = Buffer.from(await (await request(image)).arrayBuffer())
    assert.ok(updatedImage.subarray(1, 4).equals(Buffer.from("PNG")))
    assert.notDeepEqual(updatedImage, publicImage, "published social image regenerated")
  })

  fixture.published.find(({ _id }) => _id === "author").name = "Updated Author"
  await writeFixture()
  await webhook(["author"])
  await eventually(async () => assert.match(await html("/posts/empty"), /Updated Author/))

  fixture.published.find(({ _id }) => _id === "nav").items[0].title = "Updated Navigation"
  await writeFixture()
  await webhook(["navigationZone"])
  await eventually(async () => assert.match(await html("/posts/empty"), /Updated Navigation/))

  const settings = fixture.published.find(({ _id }) => _id === "settings")
  settings.locale = "de-DE"
  delete settings.title
  await writeFixture()
  await webhook(["settings", null])
  await eventually(async () => assert.match(await html("/posts/empty"), /lang="de-DE"/))
  await eventually(async () => assert.ok(!structuredData(await html("/")).some((node) => node["@type"] === "WebSite")))

  const renamedPost = fixture.published.find(({ _id }) => _id === "empty")
  renamedPost.slug.current = "renamed-post"
  renamedPost.previousSlugs = ["empty"]
  await writeFixture()
  await webhook({ tags: ["post"], urlsChanged: true })
  const oldPost = await request("/posts/empty?ref=archive", { method: "HEAD" })
  assert.equal(oldPost.status, 308)
  assert.equal(new URL(oldPost.headers.get("location"), origin).href, origin + "/posts/renamed-post?ref=archive")
  await eventually(async () => assert.match(await html("/sitemap.xml"), /\/posts\/renamed-post</))
  await eventually(async () => assert.match(await html("/private-note"), /href="\/posts\/renamed-post">article<\/a>/))

  fixture.published = fixture.published.filter(({ _id }) => _id !== "new-page")
  note.noIndex = true
  await writeFixture()
  await webhook(["page"])
  await eventually(() => html("/renamed-page", undefined, 404))
  await eventually(() => html("/new-page", undefined, 404))
  await eventually(async () => assert.doesNotMatch(await html("/sitemap.xml"), /renamed-page|private-note/))

  if (deployment === "preview") {
    const former = "/concurrent-rename"
    const target = page("first-target", { previousSlugs: [former.slice(1)] })
    fixture.published.push(target)
    await writeFixture()
    await webhook(["page"])

    // Park an old Proxy cache write until a second publish and lookup have finished.
    const hold = `${fixturePath}.hold-redirect-write`
    await writeFile(hold, "")
    const earlierLookup = request(former)
    try {
      await eventually(() => readFile(`${hold}.started`))
      target.slug.current = "second-target"
      await writeFixture()
      await webhook(["page"])
      const current = await request(former, { signal: AbortSignal.timeout(10_000) })
      assert.equal(current.status, 308)
      assert.equal(new URL(current.headers.get("location"), origin).pathname, "/second-target")
    } finally {
      await rm(`${hold}.started`, { force: true })
      await earlierLookup
    }
    // The stale-cookie rewrite also resolves the map in a separate App Router bundle.
    const afterLateWrite = await request(former, { headers: { cookie: "__prerender_bypass=previous-deploy" } })
    assert.equal(afterLateWrite.status, 308)
    assert.equal(new URL(afterLateWrite.headers.get("location"), origin).pathname, "/second-target")
  }

  console.log(`Production-mode smoke tests passed for ${deployment}`)
} finally {
  await browser?.close()
  if (server && server.exitCode === null) {
    server.kill()
    await once(server, "exit")
  }
  await rm(directory, { recursive: true, force: true })
}
