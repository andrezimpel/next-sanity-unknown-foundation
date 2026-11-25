import { existsSync } from "node:fs"
import { parseArgs } from "node:util"
import { applyWebhook, webhookConfig } from "./webhook-config.mjs"

try {
  if (existsSync(".env.local")) process.loadEnvFile(".env.local")
  const { values } = parseArgs({ options: { origin: { type: "string" }, apply: { type: "boolean" } } })
  const config = webhookConfig(values.origin || process.env.SITE_URL, process.env.NEXT_PUBLIC_SANITY_DATASET)
  if (values.apply) {
    const action = await applyWebhook(config, process.env)
    console.log(`${action} webhook for ${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${config.dataset} → ${config.url}`)
  } else {
    const preview = { ...config, secret: "<SANITY_REVALIDATE_SECRET>" }
    if (process.env.VERCEL_AUTOMATION_BYPASS_SECRET?.trim()) {
      preview.headers = { "x-vercel-protection-bypass": "<VERCEL_AUTOMATION_BYPASS_SECRET>" }
    }
    console.log(JSON.stringify(preview, null, 2))
  }
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
}
