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

- [Sanity Webhook for Tag-based Revalidation](https://www.sanity.io/manage/webhooks/share?name=Tag-based%20revalidation%20hook%20for%20slug%20based%20documents&description=&url=https%3A%2F%2F6f4f-91-0-56-217.ngrok-free.app%2Fapi%2Frevalidate%2Ftag&on=create&on=update&on=delete&filter=&projection=&httpMethod=POST&apiVersion=v2021-03-25&includeDrafts=&headers=%7B%7D)

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
