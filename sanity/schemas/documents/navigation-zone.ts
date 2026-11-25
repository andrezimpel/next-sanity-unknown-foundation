import { defineField, defineType } from 'sanity'
import { navigationConflictQuery, studioValidationApiVersion } from "@/sanity/lib/studio-queries"

export default defineType({
  name: 'navigationZone',
  title: 'Navigation Zone',
  type: 'document',
  preview: {
    select: {
      title: 'identifier',
      language: 'language',
    },
    prepare(selection) {
      const { title, language } = selection
      return {
        title: title || 'No title',
        subtitle: language || 'No language',
      }
    },
  },
  fields: [
    defineField({
      name: 'identifier',
      title: 'Identifier',
      type: 'string',
      description: 'Unique identifier for this navigation zone',
      validation: (rule) => rule.required().custom(async (identifier, context) => {
        if (!identifier) return true
        const id = context.document?._id.replace(/^(?:drafts\.|versions\.[^.]+\.)/, "") ?? ""
        const conflict = await context.getClient({ apiVersion: studioValidationApiVersion }).fetch(navigationConflictQuery, {
          id,
          identifier,
        }, { perspective: "raw", useCdn: false })
        return conflict ? "A navigation zone already uses this identifier." : true
      }),
    }),
    defineField({
      name: 'items',
      title: 'Navigation Items',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'navigationItem',
          title: 'Navigation Item',
          preview: {
            select: {
              title: 'title',
              linkTitle: 'link.title',
            },
            prepare(selection) {
              const { title, linkTitle } = selection
              return {
                title: title || linkTitle || 'No title',
              }
            },
          },
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              description: 'Optional title for the navigation item',
            }),
            defineField({
              name: 'link',
              title: 'Link',
              type: 'reference',
              to: [{ type: 'post' }, { type: 'page' }],
              description: 'Reference to a post or page',
            }),
            defineField({
              name: 'url',
              title: 'External URL',
              type: 'url',
              description: 'Optional external URL',
            }),
          ],
          validation: (Rule) =>
            Rule.custom((fields: any) => {
              // Ensure at least one of url or contentRef is provided
              if (!fields?.url && !fields?.link) {
                return 'At least one of URL or Content Reference must be provided'
              }
              return true
            }),
        },
      ],
    }),
  ],
}) 
