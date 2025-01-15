import { HomeIcon } from "@sanity/icons"
import { defineField, defineType } from "sanity"

import metafields from "../metafields"

/**
 * This file is the schema definition for the home page.
 *
 * Here you'll be able to edit the different fields that appear when you 
 * create or edit the home page in the studio.
 */

export default defineType({
  name: "homePage",
  title: "Home Page",
  icon: HomeIcon,
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "The title of the home page.",
      validation: (rule) => rule.required(),
    }),
    ...metafields
  ],
  preview: {
    select: {
      title: "title",
    },
    prepare({ title }) {
      return { title }
    },
  },
})
