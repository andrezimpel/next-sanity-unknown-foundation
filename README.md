[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/andrezimpel/next-sanity-unknown-foundation&integration-ids=oac_hb2LITYajhRQ0i4QznmKH7gx&project-name=Next-Sanity-Foundation&repository-name=next-sanity-foundation&demo-description=A%20statically%20generated%20website%20example%20using%20Next.js%20and%20Sanity)

> **🚀 Quick Deploy**: Click the button above to deploy this project to Vercel with Sanity integration automatically configured!

### What happens during deployment:

1. **Repository Cloning**: Vercel clones this repository to your GitHub account
2. **Sanity Integration**: The Sanity integration is automatically enabled
3. **Project Setup**: A new Vercel project is created with suggested settings
4. **Environment Variables**: You'll be prompted to configure Sanity environment variables

### Post-Deployment Steps:

After deployment, you'll need to:

1. **Configure Sanity Studio**: Visit your Sanity Studio at `https://your-project.vercel.app/studio`
2. **Set up your Sanity project**: Create a new Sanity project or connect to an existing one
3. **Configure environment variables**: Add your Sanity project ID, dataset, and API tokens
4. **Create content**: Start creating pages, posts, and other content in Sanity Studio

## Setup Instructions

### Install Dependencies

To get started, install the latest versions of the necessary packages:

```bash
yarn add next@latest next-sanity@latest sanity@latest @sanity/vision@latest react@latest react-dom@latest schema-dts@latest postcss@latest tailwindcss@latest tailwindcss-animate@latest
```

### Environment Configuration

Set up your `.env.local` file with the following environment variables through Vercel:

- `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`
- `NEXT_PUBLIC_SANITY_DATASET`
- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `SANITY_API_READ_TOKEN`
- `SANITY_REVALIDATE_SECRET`
- `SITE_URL`

### Webhooks Setup

Configure webhooks in Sanity to revalidate data for pages and posts. Use the following URL for the webhook:

- [Sanity Webhook for Tag-based Revalidation](https://www.sanity.io/manage/webhooks/share?name=Tag-based%20revalidation%20hook%20for%20slug%20based%20documents%202&description=&url=https%3A%2F%2F6f4f-91-0-56-217.ngrok-free.app%2Fapi%2Frevalidate&on=create&on=update&on=delete&filter=_type%20in%20%5B%22post%22%2C%20%22page%22%2C%20%22homePage%22%2C%20%22settings%22%5D&projection=%7B%22tags%22%3A%20%5B_type%2C%20_type%20%2B%20%22%3A%22%20%2B%20slug.current%5D%7D&httpMethod=POST&apiVersion=v2025-02-19&includeDrafts=&includeAllVersions=&headers=%7B%7D)

> **Note:** Do not forget to include the secret.

### Update Icons

- Update `favicon.ico`.
- Add icons in the following formats: `.ico`, `.jpg`, `.jpeg`, `.png`, `.svg`.
- Add Apple icons in the following formats: `.jpg`, `.jpeg`, `.png`.

For more details, see [Next.js App Icons Documentation](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/app-icons#image-files-ico-jpg-png).

### Internationalization

Set up internationalization if needed. Refer to the [Next.js Internationalization Guide](https://nextjs.org/docs/app/building-your-application/routing/internationalization).

### Layout Customization

Replace the viewport theme color in `layout.tsx`.

### Analytics Setup

Set up Plausible Analytics at [Plausible.io](https://plausible.io/).

### Content Creation

- Create settings.
- Create a home page document.
- Create pages.
- Create posts.
- Create navigation zones.

> **Tip:** Use the page as a base for other document types. Ensure to update `sitemap.tsx` and `robots.tsx` if needed.

### Deployment

Deploy your project using Vercel. Adjust the deployment settings as necessary:

- [Deploy with Vercel](https://vercel.com/new/clone?demo-description=A%20statically%20generated%20website%20example%20using%20Next.js%20and%20Sanity&from=templates&integration-ids=oac_hb2LITYajhRQ0i4QznmKH7gx&project-name=Blog+Starter+Kit+with+Sanity&repository-name=website-next-sanity&repository-url=https%3A%2F%2Fgithub.com%2Fandrezimpel%2Fnext-sanity-unknown-foundation)

Ensure all configurations are correctly set before deploying.

### Internationalization Setup

To implement internationalization in your project, follow these steps:

1. **Organize Content:**
   - Move the contents of your website into a new folder structure: `(website)/[lang]/contents`.

2. **Configure Locales:**
   - Export locales in `@next.config.ts`:
     ```javascript
     export const locales = {
       de: {
         title: "Deutsch",
         id: "de",
         defaultLocale: true
       },
       en: {
         title: "English",
         id: "en",
       },
     }

     export const defaultLocale = locales.de
     ```

3. **Middleware for Locale Redirection:**
   - Add a middleware to redirect users based on their browser's locale:
     ```javascript
     import { match } from '@formatjs/intl-localematcher'
     import Negotiator from 'negotiator'
     import { NextRequest, NextResponse } from "next/server"
     import { locales, defaultLocale } from './next.config'

     function getLocale(request: NextRequest) {
       const headers = Object.fromEntries(request.headers.entries())
       let languages = new Negotiator({ headers }).languages()
       return match(languages, locales.map(l => l.id), defaultLocale)
     }

     export function middleware(request: NextRequest) {
       const { pathname } = request.nextUrl
       const pathnameHasLocale = locales.some(
         (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
       )

       if (pathnameHasLocale) return

       const nextLocaleCookie = request.cookies.get('NEXT_LOCALE')
       if (nextLocaleCookie) {
         const localeValue = nextLocaleCookie.value
         request.nextUrl.pathname = `/${localeValue}${pathname}`
         return NextResponse.redirect(request.nextUrl)
       }

       const locale = getLocale(request)
       request.nextUrl.pathname = `/${locale}${pathname}`
       const response = NextResponse.redirect(request.nextUrl)
       response.cookies.set('NEXT_LOCALE', locale, { maxAge: 90 * 24 * 60 * 60 })
       return response
     }

     export const config = {
       matcher: ['/'],
     }
     ```

4. **Dictionaries:**
   - Create a `dictionaries.ts` file in the `(website)/[lang]` folder:
     ```javascript
     import { locales } from '@/next.config'
     import 'server-only'

     type LocaleKeys = (typeof locales)[number]['id']

     const dictionaries: Record<LocaleKeys, () => Promise<any>> = {
       de: () => import('@/dictionaries/de.json').then((module) => module.default),
       en: () => import('@/dictionaries/en.json').then((module) => module.default),
     }

     export const getDictionary = async (locale: LocaleKeys) =>
       dictionaries[locale]()
     ```

5. **Sanity Internationalization:**
   - Install `@sanity/document-internationalization` and configure it in `sanity.config.ts`:
     ```javascript
     import {defineConfig} from 'sanity'
     import {documentInternationalization} from '@sanity/document-internationalization'

     export const defineConfig({
       plugins: [
         documentInternationalization({
           supportedLanguages: locales,
           schemaTypes: [...singletons, ...documents].map((type) => type.name),
         })
       ]
     })
     ```

6. **Language Field in Content Types:**
   - Add a language field to content types for translations:
     ```javascript
     defineField({
       name: 'language',
       type: 'string',
       readOnly: true,
       hidden: true,
     })
     ```

  **Update the Slug Field**: Add a custom validation rule to the slug field in your document schema.

   ```javascript
   export default {
     name: 'yourDocumentType',
     type: 'document',
     title: 'Your Document Title',
     fields: [
       // ... other fields ...
       {
         name: 'slug',
         type: 'slug',
         title: 'Slug',
         options: {
           source: 'title', // or another field that generates the slug
           maxLength: 96,
         },
         validation: (Rule) => Rule.required().custom(async (slug, context) => {
           const isUnique = await isUniqueOtherThanLanguage(slug.current, context)
           return isUnique || 'This slug is already in use for the selected language.'
         }),
       },
       // ... other fields ...
     ],
   }
   ```

7. **Querying Translations:**
   - Use GROQ to query translations:
     ```javascript
     "_translations": * [_type == "translation.metadata" && references(^._id)].translations[].value -> {
       "slug": slug.current,
       language
     }
     ```

8. **Sanity AI Translations:**
   - Configure AI translations with Sanity Assist:
     ```javascript
     import { assist } from "@sanity/assist"

     assist({
       translate: {
         document: {
           languageField: 'language',
           documentTypes: [...singletons, ...documents].map((type) => type.name),
         }
       }
     })
     ```

Ensure to follow these steps to set up internationalization in your project effectively.
