# AGENTS.md

This repo is a Next.js App Router website with embedded Sanity Studio at `/studio`. Use `package.json` for the supported Node 22 range and dependency requirements, `yarn.lock` for exact versions, and [README.md](README.md) for Yarn Classic setup and deployment.

<!-- BEGIN:nextjs-agent-rules -->
## Next.js documentation

Read the relevant version-matched guides in `node_modules/next/dist/docs/` before editing Next.js code.
<!-- END:nextjs-agent-rules -->

## Rendering, preview, and publishing

- Public routes prerender or generate on demand with ISR. The app requires a Next.js runtime for ISR, draft mode, and metadata handlers.
- Fetch Sanity data through `sanity/lib/fetch.ts`. Published reads use the Sanity live API and the tagged Next.js Data Cache. If a query dereferences another document, include its tag. Keep `sanity/lib/tags.ts`, fetch callers, and the README webhook contract in sync.
- Authenticated Studio Draft Mode is the only context that can enable stega. Use plain reads for metadata and published reads for sitemap, static params, redirects, and social image routes. Clean stega from machine-readable output and attributes. Keep credentials server-only. Changes to the fetch helper or a public renderer require the production-mode stega checks.
- Keep crawl and index directives separate. Leave public `noindex` URLs crawlable and remove them from the sitemap. Use the validated site origin for canonical URLs, social metadata, and JSON-LD. Escape CMS data when serializing JSON-LD into HTML.
- Use the shared route helpers for internal links. Keep current slugs and former slugs unique within their route namespace. The webhook expires the Proxy redirect map when page or post URLs change, or when a legacy payload omits the change flag. Proxy loads current redirects on the next lookup. Check the redirect and sitemap when changing URL behavior.

## Sanity changes

- Put standalone content in `sanity/schemas/documents`, singletons in `singletons`, and reusable values in `objects`. Ask when the editorial intent is ambiguous. Register new types in `sanity.config.ts` before creating content.
- Keep fixed IDs for the home and settings singletons. For Portable Text objects, update the schema array, central GROQ projection, and frontend renderer together. Project LQIP for images that render a blur placeholder.
- Use `defineQuery` from `next-sanity` for app queries and from `groq` for Studio validation queries, which the standalone CLI loads. Derive component props from generated query results and handle nullable legacy fields. Run `yarn typegen` after schema or query changes and commit both `schema.json` and `sanity.types.ts`.

## Checks

Run `yarn lint`, `yarn typecheck`, `yarn test`, and `yarn test:production`. Repeat the production test with `FOUNDATION_TEST_ENV=preview` for changes to caching, rendering, or index controls. The fixture tests use local data. Use a staging dataset for Studio and real webhook checks.
