import { defineField } from "sanity"

type MetaFieldsConfig = {
  pick?: string[]
  omit?: string[]
}

const allFields = {
  metaDescription: defineField({
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
  ogTitle: defineField({
    name: 'ogTitle',
    title: 'Open Graph Title',
    type: 'string',
    description: 'The title for the page, displayed in search engine results. Not the same as the regular title.',
    validation: (Rule) =>
      Rule.max(60)
        .warning('Meta title should not exceed 60 characters for best SEO performance.'),
  }),
  ogImage: defineField({
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
    validation: (rule) => rule.custom((_, context) => {
      if (!context.document?.coverImage) {
        return "This field is required if there is no cover image."
      }
      return true
    }),
    hidden: ({ document }) => !!document?.coverImage,
  }),
  noIndex: defineField({
    name: 'noIndex',
    title: 'No Index',
    type: 'boolean',
    description: 'If true, the page will not be indexed by search engines.',
    initialValue: false,
  }),
}

export default function getMetaFields(config?: MetaFieldsConfig) {
  if (!config) {
    return Object.values(allFields)
  }

  if (config.pick) {
    return config.pick.map(fieldName => allFields[fieldName as keyof typeof allFields])
  }

  if (config.omit) {
    return Object.entries(allFields)
      .filter(([key]) => !config.omit?.includes(key))
      .map(([_, value]) => value)
  }

  return Object.values(allFields)
}
