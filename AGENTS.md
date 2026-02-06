# agent.md

## Project Overview
- Next.js + Sanity CMS blog/website starter with embedded Sanity Studio
- Static site generation with tag-based revalidation webhooks
- Supports draft mode preview, visual editing (Presentation Tool), and SEO optimization
- Optimized for Vercel deployment with Plausible Analytics integration

## Stack & Versions (source: package.json)
- Next.js: `^16.1.6` (dev and build use Webpack via `--webpack` flag)
- React: `^19.2.4`
- React DOM: `^19.2.4`
- TypeScript: `5.9.3`
- sanity: `^5.8.1`
- next-sanity: `^12.1.0`
- Tailwind CSS: `^4.1.18`
- @tailwindcss/postcss: `^4.1.18`
- @tailwindcss/typography: `^0.5.19`

**Status (Feb 2026):** Dependencies are current. Next.js 16 optimizations applied: Webpack used for dev/build (avoids Turbopack issues); revalidation uses `revalidateTag(tag, 'max')` per Next.js 16 API; Turbopack filesystem cache enabled in config for optional use.

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

### Data Fetching & Type Safety
- **Query Result Types**: All GROQ queries defined with `defineQuery` in `sanity/lib/queries.ts` automatically generate corresponding type exports in `sanity.types.ts` (e.g., `PostQueryResult`, `PageQueryResult`, `CaseStudyQueryResult`)
- **Type Inference**: `sanityFetch` automatically infers return types from the query passed to it, providing type safety without explicit type annotations
- **Component Props**: When creating components that receive Sanity data, extract types from the query result types using TypeScript utilities:
  - Use `Pick<QueryResult, "field1" | "field2">` to select specific fields
  - Use `Extract<UnionType, { _type: "specificType" }>` to narrow union types
  - Use `NonNullable<QueryResult>["field"]` to unwrap optional fields
  - Example: `type ImageProps = { image: NonNullable<PostQueryResult>["coverImage"] }`
- **Pattern**: Fetch functions return the inferred type from `sanityFetch`, no explicit typing needed on the function signature itself

### Sanity Schemas: How We Write & Organize
- **Location**: All schema files live in `sanity/schemas/`.
- **Structure**:
  - `documents/` for regular content documents (e.g. `post`, `page`, `author`)
  - `singletons/` for single-instance docs (e.g. `homePage`, `settings`)
  - `objects/` for reusable object types (e.g. `youtube`)
  - Shared helpers like `metafields.ts` and `block-styles.ts` live at the root
- **Schema pattern**:
  - Use `defineType` + `defineField` from `sanity`
  - Keep validations in the field definition
  - Add `preview` config where helpful
  - Prefer shared helpers like `...metafields()` for SEO fields
- **Registration**:
  - Import schemas in `sanity.config.ts`
  - Group into `singletons`, `documents`, `objects`, then spread into `schema.types`
  - Add singletons to the `singletonPlugin` and `pageStructure` config
- **Required queries**: When creating a new document type with dynamic routes, add two queries to `sanity/lib/queries.ts`:
  - `[resourceName]Query` - fetches full document data (e.g., `postQuery`, `pageQuery`)
  - `[resourceName]PathsQuery` - generates static paths for `generateStaticParams` in `page.tsx` (e.g., `postPathsQuery`, `pagePathsQuery`)

### Sanity Schema Authoring & Portable Text Blocks
- **Schema type decision**: Always ask if a new schema is a `document` or `object`; suggest based on the prompt (Portable Text blocks are usually `object`).
- **Enable in Portable Text**: Add the new type to `sanity/schemas/block-styles.ts` with `defineArrayMember({ type: "<schemaName>" })` so editors can insert it.
- **Portable Text component**: Create a renderer at `components/portable-text/<schemaName>.tsx` that outputs all schema fields as a starting point.
- **GROQ fetch notes**: Include comments in the component describing how its data should be selected/dereferenced in GROQ queries.
- **Props typing example**:
  ```ts
  interface HeroProps extends Pick<
    Extract<
      NonNullable<NonNullable<PageQueryResult>["content"]>[number],
      { _type: "hero" }
    >,
    "headline" | "subline" | "link" | "coverImage"
  > {}
  ```

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
- **Sanity types only**: Always use generated types from `sanity.types.ts` (no ad-hoc interface shapes); fetch functions rely on type inference from `sanityFetch`
- **Query result types**: Component props receiving Sanity data must use `*QueryResult` types from `sanity.types.ts`, extracted with TypeScript utilities (Pick, Extract, NonNullable)
- **Singletons enforce structure**: home-page and settings are singletons (configured via `singletonPlugin` in `sanity.config.ts`)
- **CDN images only**: Image optimization restricted to `cdn.sanity.io` hostname (enforced in `next.config.ts`)
- **Always fetch LQIP**: Frontend image queries must include the `lqip` field for low-quality image placeholders
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

- **Cache components**: Next.js 16 supports cache components (`cacheComponents: true` in next.config), but not yet enabled; current strategy is tag-based revalidation. Can be adopted later if desired.
- **Sanity typegen**: If `yarn build` fails with `isHttpError` from `@sanity/client`, remove `node_modules` and run `yarn install` again to resolve.
