import assert from "node:assert/strict"
import { test } from "node:test"

import { applyWebhook, webhookConfig } from "../scripts/webhook-config.mjs"

const config = webhookConfig("https://staging.example.com", "staging")
const env = {
  NEXT_PUBLIC_SANITY_PROJECT_ID: "testproject",
  SANITY_AUTH_TOKEN: "test-management-token",
  SANITY_REVALIDATE_SECRET: "test-signing-secret",
}
const endpoint = "https://testproject.api.sanity.io/v2025-07-15/hooks/projects/testproject"

test("apply creates once, then updates the same document hook and preserves existing custom headers", async () => {
  const hooks = [{ ...config, id: "other", dataset: "production" }]
  const writes = []
  async function api(url, options) {
    assert.equal(options.headers.Authorization, "Bearer test-management-token")
    if (options.method === "GET") {
      assert.equal(url, endpoint)
      return Response.json(hooks)
    }
    const body = JSON.parse(options.body)
    writes.push({ url, method: options.method, body })
    if (options.method === "POST") hooks.push({ ...body, id: "new" })
    return Response.json({})
  }
  assert.equal(await applyWebhook(config, { ...env, VERCEL_AUTOMATION_BYPASS_SECRET: "fixture-bypass" }, api), "Created")
  assert.deepEqual(writes[0].body, {
    ...config, isDisabledByUser: false, secret: env.SANITY_REVALIDATE_SECRET,
    headers: { "x-vercel-protection-bypass": "fixture-bypass" },
  })
  assert.equal(await applyWebhook(config, env, api), "Updated")
  assert.equal(writes[1].method, "PATCH")
  assert.equal(writes[1].url, endpoint + "/new")
  assert.ok(!("headers" in writes[1].body))
  assert.ok(!("type" in writes[1].body))
})

test("apply stops on overlapping hooks and leaves API secrets out of errors", async () => {
  for (const hooks of [[{ ...config, dataset: "*" }], [config, config], [{ ...config, type: "transaction" }]]) {
    await assert.rejects(applyWebhook(config, env, async (_, { method }) => {
      assert.equal(method, "GET")
      return Response.json(hooks)
    }), /Overlapping/)
  }
  await assert.rejects(applyWebhook(config, env, async () => new Response("secret-response", { status: 403 })),
    { message: "Sanity webhook GET failed (HTTP 403) for project testproject" })
})
