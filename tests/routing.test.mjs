import assert from "node:assert/strict"
import { webhookConfig } from "../scripts/webhook-config.mjs"
import { test } from "node:test"
import { evaluate, parse } from "groq-js"

import { decodeRouteSlug, isNewSlug, resolvePathname } from "../sanity/lib/routes.ts"
import { navigationConflictQuery, slugConflictQuery } from "../sanity/lib/studio-queries.ts"
import { documentTags, getWebhookTags, isDocumentTag } from "../sanity/lib/tags.ts"

test("canonical paths preserve the post namespace and encode a single slug", () => {
  assert.equal(resolvePathname("page", "posts"), "/posts")
  assert.equal(resolvePathname("post", "öffentlicher-beitrag"), "/posts/%C3%B6ffentlicher-beitrag")
  assert.equal(resolvePathname("page", "about us"), "/about%20us")
  assert.equal(isNewSlug("page", "about us"), false)
  assert.equal(decodeRouteSlug("page", "about%20us"), "about us")
  assert.equal(decodeRouteSlug("page", "about%2520us"), undefined)
  for (const slug of ["studio", "robots.txt", "_next", "//outside", ".", "a/b", "a?b", "icon-1gp61b.svg", "apple-icon-1gp61b.png"]) {
    assert.equal(resolvePathname("page", slug), undefined)
  }
})

test("Studio validators check other documents across raw perspectives", async () => {
  const dataset = [
    { _type: "page", _id: "page", slug: { current: "published" } },
    { _type: "page", _id: "drafts.page", slug: { current: "draft" } },
    { _type: "page", _id: "versions.release.page", previousSlugs: ["former"] },
    { _type: "navigationZone", _id: "versions.release.nav", identifier: "header" },
  ]
  const run = async (query, params) => (await evaluate(parse(query), { dataset, params })).get()
  const checkSlug = (id, slug) => run(slugConflictQuery, { type: "page", id, slugs: [slug] })

  assert.equal(await checkSlug("other", "published"), "page")
  assert.equal(await checkSlug("other", "former"), "versions.release.page")
  assert.equal(await checkSlug("page", "former"), null)
  assert.equal(await run(navigationConflictQuery, { id: "other", identifier: "header" }), "versions.release.nav")
  assert.equal(await run(navigationConflictQuery, { id: "nav", identifier: "header" }), null)
})

test("webhook tags match the document dependency contract", () => {
  assert.deepEqual(documentTags.filter(isDocumentTag), documentTags)
  for (const value of [null, 1, "post:example", "navigationzone", {}]) {
    assert.equal(isDocumentTag(value), false)
  }
  assert.deepEqual(getWebhookTags(["page", "page"]), ["page"])
  assert.deepEqual(getWebhookTags(["page", "page:about us"]), ["page"])
  assert.deepEqual(getWebhookTags(["settings", null]), ["settings"])
  for (const value of [["page:example"], ["page", "post:example"], ["page", null, "post"], ["redirects"]]) {
    assert.equal(getWebhookTags(value), undefined)
  }
})

test("the generated Sanity webhook delivers every supported create, update and delete", async () => {
  const { rule } = webhookConfig("https://www.example.com", "production")
  const filter = parse(rule.filter, { mode: "delta" })
  const projection = parse(rule.projection, { mode: "delta" })
  for (const type of [...documentTags, "unrelated"]) {
    const doc = { _type: type, slug: { current: "example" } }
    for (const event of [{ after: doc }, { before: doc, after: doc }, { before: doc }]) {
      assert.equal(await (await evaluate(filter, event)).get(), type !== "unrelated", type)
      if (type !== "unrelated") {
        const payload = await (await evaluate(projection, event)).get()
        assert.deepEqual(getWebhookTags(payload.tags), [type])
        assert.equal(payload.urlsChanged, !(event.before && event.after))
      }
    }
  }
  const before = { _type: "page", slug: { current: "current" }, previousSlugs: ["old", "older"] }
  for (const [changes, expected] of [
    [{ title: "New title" }, false],
    [{ previousSlugs: ["older", "old"] }, false],
    [{ slug: { current: "renamed" } }, true],
    [{ previousSlugs: ["old", "added"] }, true],
    [{ previousSlugs: undefined }, true],
  ]) {
    const event = { before, after: { ...before, ...changes } }
    assert.equal((await (await evaluate(projection, event)).get()).urlsChanged, expected)
  }
})
