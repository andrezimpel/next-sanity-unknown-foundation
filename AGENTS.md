# agent.md

## Project Overview
- Next.js + Sanity CMS blog/website starter with embedded Sanity Studio
- Static site generation with tag-based revalidation webhooks
- Supports draft mode preview, visual editing (Presentation Tool), and SEO optimization
- Optimized for Vercel deployment with Plausible Analytics integration

## Stack & Versions (source: package.json)
- Next.js: `^16.1.6`
- React: `^19.2.4`
- React DOM: `^19.2.4`
- TypeScript: `5.9.3`
- sanity: `^5.8.1`
- next-sanity: `^12.1.0`
- Tailwind CSS: `^4.1.18`
- @tailwindcss/postcss: `^4.1.18`
- @tailwindcss/typography: `^0.5.19`

## Architecture & Conventions

### Routing & Rendering
- **App Router only** (found in `/app`, no `/pages` directory exists)
- Force static generation: `export const dynamic = 'force-static'` (found in `/app/(website)/page.tsx`)
- Route groups: `(website)` for public pages, `(sanity)` for Studio
- Dynamic routes: `[slug]` for pages and posts
- API routes: `/api/draft-mode/enable`, `/api/revalidate`
- **No cache components used** (Next.js 16 cache components feature not detected in codebase)

### Sanity (Studio and next-sanity)
- **Studio v5** mounted at `/studio` route via `app/(sanity)/studio/[[...tool]]/page.tsx`
- Config: `sanity.config.ts` (client-side), `sanity.cli.ts` (CLI)
- Schemas: `sanity/schemas/` (documents: author, navigation-zone, page, post; singletons: home-page, settings; objects: youtube)
- Client: `sanity/lib/client.ts` (createClient with stega/visual editing support)
- Data fetching: `sanity/lib/fetch.ts` (sanityFetch with draft/published perspective switching)
- Queries: `sanity/lib/queries.ts` (GROQ queries using defineQuery from next-sanity)
- Type generation: `npm run typegen` runs `sanity schema extract && sanity typegen generate` (outputs to `sanity.types.ts`)
- Plugins: presentation tool, structure tool, vision, unsplash asset source, AI assist

### Revalidation & Preview
- Tag-based revalidation: `/app/api/revalidate/route.ts` validates webhook signatures and revalidates Next.js cache tags
- Draft mode: `/app/api/draft-mode/enable/route.ts` enables preview of unpublished content
- Perspective switching: sanityFetch automatically uses "drafts" perspective when draft mode enabled, "published" otherwise
- Visual editing: stega enabled in draft mode and Vercel preview deployments

### UI & Styling
- Tailwind CSS v4 with @tailwindcss/postcss
- shadcn/ui components: button component found in `components/ui/button.tsx`
- Class utilities: `class-variance-authority`, `clsx`, `tailwind-merge`
- Portable Text rendering: `components/portable-text.tsx`
- Custom components: date formatter, JSON-LD schema markup, post grid

### Environment Variables (source: README.md)
Required env vars (configured via Vercel or `.env.local`):
- `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`
- `NEXT_PUBLIC_SANITY_DATASET`
- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `SANITY_API_READ_TOKEN`
- `SANITY_REVALIDATE_SECRET`
- `SITE_URL`

## Guardrails
- **Do not create content without schema**: All document types must be defined in `sanity/schemas/` before creating content
- **Webhook secret required**: Revalidation endpoint validates HMAC signatures; missing `SANITY_REVALIDATE_SECRET` causes 500 errors
- **Draft tokens required**: Fetching draft content requires `SANITY_API_READ_TOKEN` (enforced in `sanity/lib/fetch.ts`)
- **Typed queries only**: Use `defineQuery` from next-sanity for type-safe GROQ queries (pattern in `sanity/lib/queries.ts`)
- **Singletons enforce structure**: home-page and settings are singletons (configured via `singletonPlugin` in `sanity.config.ts`)
- **CDN images only**: Image optimization restricted to `cdn.sanity.io` hostname (enforced in `next.config.ts`)
- **Static export**: Pages use `force-static` to ensure static generation at build time

## Source of Truth (Repo Files)
- `/package.json` — dependency versions
- `/sanity.config.ts` — Sanity Studio configuration, schema registration, plugins
- `/sanity.cli.ts` — Sanity CLI configuration
- `/sanity/lib/api.ts` — API versioning, project ID, dataset, studio URL
- `/sanity/lib/client.ts` — Sanity client setup with stega/visual editing
- `/sanity/lib/fetch.ts` — Server-side data fetching with perspective switching
- `/sanity/lib/queries.ts` — GROQ query definitions
- `/sanity/schemas/` — Document type definitions
- `/next.config.ts` — Next.js configuration (images, styled-components, Plausible proxy)
- `/app/(website)/` — Public website routes
- `/app/(sanity)/studio/` — Embedded Sanity Studio
- `/app/api/` — API routes for draft mode and revalidation
- `/README.md` — Setup instructions, environment variables, deployment guide

## Ambiguities / TODOs
- **Salt**: Not found as dependency in package.json or referenced in codebase. TODO: Verify if "Salt" refers to a design system, component library, or if it's not used in this project.
- **Internationalization**: README describes i18n setup patterns (middleware, dictionaries, locale routing) but no evidence of implementation in current codebase. TODO: Check if i18n is planned or removed.
- **Cache components**: Next.js 16 supports cache components, but no `"use cache"` directives found in codebase. TODO: Verify if cache components will be adopted or if traditional caching strategy (revalidation tags) is preferred.
