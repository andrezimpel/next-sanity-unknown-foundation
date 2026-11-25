import { defineQuery } from "groq"

export const studioValidationApiVersion = "2025-07-15"

export const slugConflictQuery = defineQuery(`
  *[_type == $type && !sanity::versionOf($id) && (slug.current in $slugs || count(previousSlugs[@ in $slugs]) > 0)][0]._id
`)

export const publishedSlugQuery = defineQuery(`*[_id == $id][0].slug.current`)

export const navigationConflictQuery = defineQuery(`
  *[_type == "navigationZone" && !sanity::versionOf($id) && identifier == $identifier][0]._id
`)
