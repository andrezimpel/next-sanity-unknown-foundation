import { UserIcon } from "@sanity/icons"
import { defineField, defineType } from "sanity"

export default defineType({
  name: "author",
  title: "Author",
  icon: UserIcon,
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "position",
      title: "Position",
      type: "string",
    }),
    defineField({
      name: "profileUrl",
      title: "Profile URL",
      type: "url",
      description: "A public page identifying this author.",
      validation: (rule) => rule.uri({ scheme: ["https", "http"] }),
    }),
    defineField({
      name: "picture",
      title: "Picture",
      type: "image",
      fields: [
        {
          name: "alt",
          type: "string",
          title: "Alternative text",
          description: "Important for SEO and accessiblity.",
          validation: (rule) => {
            return rule.custom((alt, context) => {
              if ((context.document?.picture as any)?.asset?._ref && !alt) {
                return "Required"
              }
              return true
            })
          },
        },
      ],
      options: {
        hotspot: true,
      },
      validation: (rule) => rule.required(),
    }),
  ],
})
