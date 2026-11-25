import { defineField, type ValidationContext } from "sanity"

import { slugConflictQuery, publishedSlugQuery, studioValidationApiVersion } from "@/sanity/lib/studio-queries"
import { isNewSlug, isRoutableSlug } from "@/sanity/lib/routes"

type RouteType = "page" | "post"

function publishedId(id = "") {
  return id.replace(/^(?:drafts\.|versions\.[^.]+\.)/, "")
}

async function validateUniqueSlugs(type: RouteType, slugs: string[], context: ValidationContext) {
  const id = publishedId(context.document?._id)
  const conflict = await context.getClient({ apiVersion: studioValidationApiVersion }).fetch(slugConflictQuery, {
    type,
    slugs,
    id,
  }, { perspective: "raw", useCdn: false })
  return conflict ? "This URL is already used by another document or redirect." : true
}

export function slugFields(type: RouteType) {
  return [
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      description: "The document’s public URL. Add the old slug to Previous slugs before publishing a rename.",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required().custom(async (value, context) => {
        const slug = value?.current
        if (!isRoutableSlug(type, slug)) return "Enter a valid, non-reserved URL slug."
        if ((!isNewSlug(type, slug) || (type === "page" && slug !== "posts")) && context.document?._id) {
          const liveSlug = await context.getClient({ apiVersion: studioValidationApiVersion }).fetch(publishedSlugQuery, {
            id: publishedId(context.document._id),
          }, { perspective: "published", useCdn: false })
          if (type === "page" && liveSlug === "posts") return "The posts listing must keep its posts slug."
          if (!isNewSlug(type, slug) && liveSlug !== slug) return "Use a slug without whitespace."
        } else if (!isNewSlug(type, slug)) {
          return "Use a slug without whitespace."
        }
        return validateUniqueSlugs(type, [slug], context)
      }),
    }),
    defineField({
      name: "previousSlugs",
      title: "Previous slugs",
      type: "array",
      of: [{ type: "string" }],
      description: "Old URLs that should redirect to the current slug.",
      validation: (rule) => rule.unique().custom((values, context) => {
        if (!values?.length) return true
        const current = (context.document?.slug as { current?: string } | undefined)?.current
        const formerSlugs = values.filter((slug): slug is string =>
          isRoutableSlug(type, slug) && slug !== current && (type !== "page" || slug !== "posts"),
        )
        if (formerSlugs.length !== values.length) {
          return "Use valid former slugs that differ from the current slug and the posts listing."
        }
        return validateUniqueSlugs(type, formerSlugs, context)
      }),
    }),
  ]
}
