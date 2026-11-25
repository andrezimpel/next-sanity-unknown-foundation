# Next.js and Sanity Foundation

An App Router website with Sanity Studio at `/studio`, published pages served through tag-based ISR, and Studio Draft Mode for visual editing.

## Local setup

1. Use Node 22.20 or later on the Node 22 release line and Yarn Classic 1.22.
2. Run `yarn install --frozen-lockfile`.
3. For an existing Sanity project, copy `.env.example` to `.env.local` and fill in the project ID and public dataset. To create or select a project interactively, run `yarn setup` and add the remaining variables from the example.
4. Set `SITE_URL=http://localhost:3000` locally. For Studio Draft Mode, add a Viewer token as `SANITY_API_READ_TOKEN`. Draft previews subscribe to Sanity’s Live Content API through `/api/draft-mode/events`, which authenticates the stream on the server.
5. Run `yarn dev`. Open `http://localhost:3000/studio` and publish Settings and Home Page. Create a Page with slug `posts` for the blog listing. The navigation identifiers `header` and `legal` populate the header and footer.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity project ID |
| `NEXT_PUBLIC_SANITY_DATASET` | Public dataset for published reads |
| `NEXT_PUBLIC_SANITY_API_VERSION` | Optional override for the API date in `sanity/lib/api.ts` |
| `SITE_URL` | Canonical origin, such as `http://localhost:3000` locally or `https://www.example.com` for deployment |
| `SANITY_API_READ_TOKEN` | Server-only Viewer token for Studio Draft Mode |
| `SANITY_REVALIDATE_SECRET` | Shared secret for signed Sanity webhooks |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Plausible site identifier if analytics is configured |

Set `SITE_URL` to the production origin on Vercel, including on preview deployments. Keep preview deployments protected. The app adds `X-Robots-Tag: noindex` on Vercel previews. If Studio runs on a separate origin, configure the preview origin and allow it with credentials in Sanity’s CORS settings. Studio Draft Mode is the only entry point for stega overlays. [Sanity visual editing setup](https://www.sanity.io/docs/nextjs/visual-editing-with-next-js-app-router)

## Optional Studio plugins

Install either plugin independently and add its entry to the existing `plugins` array in `sanity.config.ts`.

| Feature | Install | Import in `sanity.config.ts` | Plugin entry |
| --- | --- | --- | --- |
| AI Assist | `yarn add --exact @sanity/assist@6.2.6` | `import { assist } from "@sanity/assist"` | `assist()` |
| Unsplash image picker | `yarn add --exact sanity-plugin-asset-source-unsplash@7.0.30` | `import { unsplashImageAsset } from "sanity-plugin-asset-source-unsplash"` | `unsplashImageAsset()` |

Run `yarn typegen` after changing the config, then restart `yarn dev` or rebuild the embedded Studio.

**AI Assist.** On a project with AI Assist access, open a document in `/studio`. A project member with token creation permission can finish setup from the sparkle menu under **Manage instructions → Enable AI assistance**. For generated image descriptions, add `aiAssist: { imageDescriptionField: "alt" }` to the `options` of an image field that has an `alt` subfield. [Sanity AI Assist setup](https://www.sanity.io/docs/studio/install-and-configure-sanity-ai-assist)

To use the starter’s original post-writing and excerpt presets, copy `sanity/plugins/assist.ts.example` to `sanity/plugins/assist.ts`. Use `import { assistWithPresets } from "./sanity/plugins/assist"` and register `assistWithPresets()` in place of `assist()`.

**Unsplash.** Open an image field in Studio and choose Unsplash from its asset sources. [Unsplash plugin documentation](https://github.com/sanity-io/plugins/tree/main/plugins/sanity-plugin-asset-source-unsplash)

## Sanity webhook

With the project ID and dataset in `.env.local`, print the webhook settings for the deployed site:

```sh
yarn webhook --origin https://www.example.com
```

Set `SANITY_REVALIDATE_SECRET` to the same value locally and in the deployment. Sign in once with a Sanity account that can manage the project's webhooks, then apply the configuration:

```sh
yarn sanity login
yarn webhook:apply --origin https://www.example.com
```

The command creates a signed document webhook for `/api/revalidate`, or updates and enables the existing webhook for that dataset and URL. It subscribes to published creates, updates, and deletes. Rerun it after changing the filter, projection, or signing secret. For automation, supply a server-side `SANITY_AUTH_TOKEN` with webhook read and create permissions and run `yarn webhook --apply --origin https://www.example.com`. [Sanity Webhooks API](https://www.sanity.io/docs/http-reference/webhooks)

Both commands default to `SITE_URL` when you omit `--origin`. For staging, pass its HTTPS origin explicitly and select its dataset using `NEXT_PUBLIC_SANITY_DATASET`. For a protected Vercel deployment, set `VERCEL_AUTOMATION_BYPASS_SECRET` in the setup environment to include the bypass header. Printed settings use placeholders for secrets.

Older signed payloads containing only `tags`, including `[type, "type:slug"]` and `[type, null]`, still invalidate content. Applying the current projection keeps the redirect map cached after content-only edits.

## Publishing for search

- In rich text, use **Internal link** to select a Page or Post. Publishing a new target slug updates the link on referring pages through the webhook. Use the URL link for external addresses.
- To rename a page or post, add its old slug to **Previous slugs** and publish the change. The listing’s `posts` slug stays fixed. When a current or former URL is added, removed, or changed, the webhook expires the redirect map. Proxy loads it on the next lookup and preserves query parameters. Redirects have no timer, so a missed URL-change delivery needs to be retried. Vercel Runtime Cache shares the map across function instances in each region. The in-memory fallback supports a single server process. Multi-process self-hosting needs shared cache invalidation.
- Set **Settings → Title** to the public site name. The homepage uses it and the canonical site URL for its `WebSite` structured data.
- Use **No Index** to exclude a public URL from the sitemap and request deindexing. Search crawlers can still visit it and read the directive. Robots rules allow search crawlers and opt out of OpenAI training crawl through the separate `GPTBot` rule.
- Set the content language in Settings. Add a homepage body and visible author details for real sites. Use the [Next.js internationalization guide](https://nextjs.org/docs/app/guides/internationalization) when adding translated routes.

## Verify changes

```sh
yarn lint
yarn typegen
yarn typecheck
yarn test
yarn playwright install --only-shell chromium
yarn test:production
FOUNDATION_TEST_ENV=preview yarn test:production
```

Commit the two generated files after schema or query changes. The production smoke tests build in a temporary directory with synthetic Sanity data and use a local server. Verify actual Studio overlays, webhook deliveries, and production host redirects on a staging deployment before cutover. After launch, verify index coverage and sitemap status in Google Search Console and Bing Webmaster Tools.
