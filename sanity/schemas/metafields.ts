import { defineField } from "sanity"

export default [
  defineField({
    name: 'metaDescription',
    title: 'Meta Description',
    type: 'text',
    description:
      'A brief description of the page content, displayed in search engine results.',
    validation: (Rule) =>
      Rule.required()
        .max(160)
        .warning(
          'Meta description should not exceed 160 characters for optimal SEO performance.'
        ),
  }),
  defineField({
    name: 'ogTitle',
    title: 'Open Graph Title',
    type: 'string',
    description: 'The title for the page, displayed in search engine results. Not the same as the regular title.',
    validation: (Rule) =>
      Rule.required()
        .max(60)
        .warning('Meta title should not exceed 60 characters for best SEO performance.'),
  }),
  defineField({
    name: "ogImage",
    title: 'Open Graph Image',
    type: "image",
    description: "The main image for the post.",
    options: {
      hotspot: true,
      aiAssist: {
        imageDescriptionField: "alt",
      },
    },
    fields: [
      {
        name: "alt",
        type: "string",
        title: "Alternative text",
        description: "Text for screen readers and SEO.",
        validation: (rule) => {
          return rule.custom((alt, context) => {
            if ((context.document?.coverImage as any)?.asset?._ref && !alt) {
              return "Required"
            }
            return true
          })
        },
      },
    ],
    validation: (rule) => rule.required(),
    hidden: ({ document }) => !!document?.coverImage,
  }),
  defineField({
    name: 'noIndex',
    title: 'No Index',
    type: 'boolean',
    description: 'If true, the page will not be indexed by search engines.',
    initialValue: false,
  }),
]
