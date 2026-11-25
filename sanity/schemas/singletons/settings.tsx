import { CogIcon } from "@sanity/icons"
import { defineField, defineType } from "sanity"
import { defaultLocale } from "@/sanity/lib/locale"


export default defineType({
  name: "settings",
  title: "Settings",
  type: "document",
  icon: CogIcon,
  fields: [
    defineField({
      name: "title",
      description: "This field is used for the title template in the metadata.",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      description: "This field is used for the description in the metadata and is the default if a document has no description.",
      title: "Description",
      type: "text",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "locale",
      title: "Site language",
      type: "string",
      description: "A language tag such as de-DE or en-US.",
      initialValue: defaultLocale,
      validation: (rule) => rule.custom((value) => {
        if (!value) return true
        try {
          new Intl.Locale(value)
          return true
        } catch {
          return "Enter a valid language tag."
        }
      }),
    }),
    defineField({
      name: "ogImage",
      title: "Open Graph Image",
      type: "image",
      description: "The default image for social shares.",
      options: {
        hotspot: true,
      }
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Settings",
      }
    },
  },
})
