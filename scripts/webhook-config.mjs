import { documentTags } from "../sanity/lib/tags.ts"

export function webhookConfig(origin, dataset) {
  if (!URL.canParse(origin)) throw new Error("Set SITE_URL or pass --origin with the deployed site's HTTPS origin")
  const site = new URL(origin)
  if (site.protocol !== "https:" || site.username || site.password || site.href !== site.origin + "/") {
    throw new Error("Pass the HTTPS origin of your deployment with --origin, e.g. https://www.example.com")
  }
  if (!/^[a-z0-9_-]+$/.test(dataset ?? "")) throw new Error("Set NEXT_PUBLIC_SANITY_DATASET to one dataset")
  return {
    type: "document",
    name: `Next.js revalidation (${site.host}, ${dataset})`,
    url: new URL("/api/revalidate", site).href,
    dataset,
    apiVersion: "v2025-07-15",
    httpMethod: "POST",
    includeDrafts: false,
    includeAllVersions: false,
    isDisabledByUser: false,
    rule: {
      on: ["create", "update", "delete"],
      filter: `coalesce(after()._type, before()._type) in ${JSON.stringify(documentTags)}`,
      projection: `{
  "tags": [coalesce(after()._type, before()._type)],
  "urlsChanged": before().slug.current != after().slug.current ||
    count(coalesce(before().previousSlugs, [])[!(@ in coalesce(after().previousSlugs, []))]) > 0 ||
    count(coalesce(after().previousSlugs, [])[!(@ in coalesce(before().previousSlugs, []))]) > 0
}`,
    },
  }
}

export async function applyWebhook(config, env, fetchApi = fetch) {
  const project = env.NEXT_PUBLIC_SANITY_PROJECT_ID
  if (!/^[a-z0-9-]+$/.test(project ?? "")) throw new Error("Set NEXT_PUBLIC_SANITY_PROJECT_ID")
  const token = env.SANITY_AUTH_TOKEN?.trim()
  if (!token) throw new Error("Run yarn sanity login and use yarn webhook:apply, or set SANITY_AUTH_TOKEN")
  const secret = env.SANITY_REVALIDATE_SECRET?.trim()
  if (!secret) throw new Error("Set SANITY_REVALIDATE_SECRET to the same secret used by the deployment")

  const endpoint = `https://${project}.api.sanity.io/${config.apiVersion}/hooks/projects/${project}`
  async function request(method, path = "", body) {
    const response = await fetchApi(endpoint + path, {
      method, redirect: "error",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: body && JSON.stringify(body),
    })
    // The API response can contain webhook secrets and custom headers.
    if (!response.ok) throw new Error(`Sanity webhook ${method} failed (HTTP ${response.status}) for project ${project}`)
    return response
  }

  const hooks = await (await request("GET")).json()
  const matches = hooks.filter((hook) => hook.url === config.url && [config.dataset, "*"].includes(hook.dataset))
  const [existing] = matches
  if (matches.length > 1 || (existing && (existing.dataset === "*" || existing.type !== "document"))) {
    throw new Error("Overlapping hooks already target this URL. Resolve them in Sanity Manage before applying.")
  }

  const { type, name, url, dataset, ...settings } = config
  const body = { ...settings, secret }
  const bypass = env.VERCEL_AUTOMATION_BYPASS_SECRET?.trim()
  if (bypass) {
    const header = "x-vercel-protection-bypass"
    if (Object.keys(existing?.headers ?? {}).some((key) => key.toLowerCase() !== header)) {
      throw new Error("This hook has custom headers. Set the bypass header in Sanity Manage or unset VERCEL_AUTOMATION_BYPASS_SECRET to preserve them.")
    }
    body.headers = { [header]: bypass }
  }
  if (existing) {
    await request("PATCH", "/" + encodeURIComponent(existing.id), body)
    return "Updated"
  }
  await request("POST", "", { type, name, url, dataset, ...body })
  return "Created"
}
