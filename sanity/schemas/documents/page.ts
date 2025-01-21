import { DocumentIcon } from "@sanity/icons"
import { defineField, defineType } from "sanity"

import blockStyles from "../block-styles"
import metafields from "../metafields"

/**
 * This file is the schema definition for a page.
 *
 * Here you'll be able to edit the different fields that appear when you 
 * create or edit a page in the studio.
 * 
 * Here you can see the different schema types that are available:

  https://www.sanity.io/docs/schema-types

 */

export default defineType({
  name: "page",
  title: "Page",
  icon: DocumentIcon,
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "The title of the page.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      description: "A unique identifier for the page, used in URLs.",
      options: {
        source: "title",
        maxLength: 96,
        isUnique: (value, context) => context.defaultIsUnique(value, context),
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "content",
      title: "Content",
      type: "array",
      description: "The main content of the page.",
      of: blockStyles,
    }),
    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      description: "The main image for the page.",
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
      ]
    }),
    ...metafields()
  ],
  preview: {
    select: {
      title: "title",
      media: "coverImage",
    }
  },
})
