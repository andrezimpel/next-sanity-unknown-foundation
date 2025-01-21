import { defineQuery } from "next-sanity"

const metafields = `
  metaDescription,
  ogTitle,
  ogImage,
  noIndex
`

export const settingsQuery = defineQuery(`*[_type == "settings"][0]`)
export const homePageQuery = defineQuery(`*[_type == "homePage"][0] {
  ...,
  ${metafields}
}`)

export const postsPathsQuery = defineQuery(`
  *[_type == "post" && defined(slug.current)] | order(date desc, _updatedAt desc) {
    "slug": slug.current
  }
`)

export const postsQuery = defineQuery(`
  *[_type == "post" && defined(slug.current) && slug.current != $slug] | order(date desc, _updatedAt desc) [$from...$to] {
    _id,
    "title": coalesce(title, "Untitled"),
    "slug": slug.current,
    excerpt,
    coverImage,
    "date": coalesce(date, _updatedAt),
    "author": author->{"name": coalesce(name, "Anonymous"), picture, position}
  }
`)

export const postQuery = defineQuery(`
  *[_type == "post" && slug.current == $slug] [0] {
    _id,
    "title": coalesce(title, "Untitled"),
    "slug": slug.current,
    excerpt,
    content,
    coverImage,
    "date": coalesce(date, _updatedAt),
    "author": author->{"name": coalesce(name, "Anonymous"), picture, position},
    ${metafields}
  }
`)

export const moreStoriesQuery = defineQuery(`
  *[_type == "post" && _id != $skip && defined(slug.current)] | order(date desc, _updatedAt desc) [0...$limit] {
    _id,
    "title": coalesce(title, "Untitled"),
    "slug": slug.current,
    excerpt,
    coverImage,
    "date": coalesce(date, _updatedAt),
    "author": author->{"name": coalesce(name, "Anonymous"), picture, position}
  }
`)

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

export const pageQuery = defineQuery(`
  *[_type == "page" && slug.current == $slug] [0] {
    _id,
    "title": coalesce(title, "Untitled"),
    "slug": slug.current,
    content,
    coverImage,
    ${metafields}
  }
`)