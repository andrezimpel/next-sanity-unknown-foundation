import { defineQuery } from "next-sanity"

// Common fields
const metafields = `
  metaDescription,
  ogTitle,
  ogImage,
  noIndex
`

const coverImageFields = `
  coverImage {
    ...,
    "lqip": asset->metadata.lqip
  }
`

const authorFields = `
  "author": author->{"name": coalesce(name, "Anonymous"), picture, position, profileUrl}
`

// Keep this in sync with any new portable text components.
const portableTextFields = `
  ...,
  _type == "block" => {
    markDefs[] {
      ...,
      _type == "internalLink" => { "target": target->{_type, "slug": slug.current} }
    }
  },
  _type == "image" => {
    ...,
    "lqip": asset->metadata.lqip
  }
`

export const settingsQuery = defineQuery(`
  coalesce(*[_type == "settings" && _id == "settings"][0],
    select(count(*[_type == "settings"]) == 1 => *[_type == "settings"][0]))
`)

export const navigationZoneQuery = defineQuery(`
  *[_type == "navigationZone" && identifier == $identifier][0] {
    items[] {
      _key,
      title,
      url,
      link->{
        _type,
        title,
        "slug": slug.current,
      }
    }
  }
`)

export const homePageQuery = defineQuery(`
  coalesce(*[_type == "homePage" && _id == "homePage"][0],
    select(count(*[_type == "homePage"]) == 1 => *[_type == "homePage"][0])) {
  _updatedAt,
  title,
  content[] { ${portableTextFields} },
  ${metafields}
}`)

export const postPathsQuery = defineQuery(`
  *[_type == "post" && defined(slug.current)] | order(date desc, _updatedAt desc) {
    "slug": slug.current,
    _updatedAt,
    _id,
    noIndex
  }
`)

// posts
export const postsQuery = defineQuery(`
  *[_type == "post" && defined(slug.current) && slug.current != $slug] | order(date desc, _updatedAt desc, _id asc) [$from...$to] {
    _id,
    "title": coalesce(title, "Untitled"),
    "slug": slug.current,
    excerpt,
    ${coverImageFields}
  }
`)

export const postQuery = defineQuery(`
  *[_type == "post" && slug.current == $slug] [0] {
    _id,
    _updatedAt,
    "title": coalesce(title, "Untitled"),
    "slug": slug.current,
    excerpt,
    content[] {
      ${portableTextFields}
    },
    ${coverImageFields},
    date,
    ${authorFields},
    ${metafields}
  }
`)

// pages
export const pagePathsQuery = defineQuery(`
  *[_type == "page" && defined(slug.current)] | order(date desc, _updatedAt desc) {
    "slug": slug.current,
    _updatedAt,
    _id,
    noIndex
  }
`)

export const pageQuery = defineQuery(`
  *[_type == "page" && slug.current == $slug] [0] {
    _id,
    _updatedAt,
    "title": coalesce(title, "Untitled"),
    "slug": slug.current,
    content[] {
      ${portableTextFields}
    },
    ${coverImageFields},
    ${metafields}
  }
`)

const documentsWithAliases = `_type in ["page", "post"] && defined(slug.current) && count(previousSlugs) > 0`

export const redirectsQuery = defineQuery(`{
  "aliases": *[${documentsWithAliases}] | order(_id asc) {
    _type, "slug": slug.current, previousSlugs
  },
  "occupied": *[_type in ["page", "post"] && slug.current in *[${documentsWithAliases}].previousSlugs[]] {
    _type, "slug": slug.current
  }
}`)
