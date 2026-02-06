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
  "author": author->{"name": coalesce(name, "Anonymous"), picture, position}
`

// Keep this in sync with any new portable text components.
const portableTextFields = `
  ...,
  _type == "image" => {
    ...,
    "lqip": asset->metadata.lqip
  }
`

export const settingsQuery = defineQuery(`*[_type == "settings"][0]`)

export const navigationZoneQuery = defineQuery(`
  *[_type == "navigationZone" && identifier == $identifier][0] {
    items[] {
      ...,
      link->{
        ...,
        title,
        "slug": slug.current,
      }
    }
  }
`)

export const homePageQuery = defineQuery(`*[_type == "homePage"][0] {
  ...,
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
  *[_type == "post" && defined(slug.current) && slug.current != $slug] | order(date desc, _updatedAt desc) [$from...$to] {
    _id,
    "title": coalesce(title, "Untitled"),
    "slug": slug.current,
    excerpt,
    ${coverImageFields},
    "date": coalesce(date, _updatedAt),
    ${authorFields}
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
    "date": coalesce(date, _updatedAt),
    ${authorFields},
    ${metafields}
  }
`)

export const moreStoriesQuery = defineQuery(`
  *[_type == "post" && _id != $skip && defined(slug.current)] | order(date desc, _updatedAt desc) [0...$limit] {
    _id,
    "title": coalesce(title, "Untitled"),
    "slug": slug.current,
    excerpt,
    ${coverImageFields},
    "date": coalesce(date, _updatedAt),
    ${authorFields}
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