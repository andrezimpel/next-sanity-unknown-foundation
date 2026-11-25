"use client"
/**
 * This config is used to set up Sanity Studio that's mounted on the `app/(sanity)/studio/[[...tool]]/page.tsx` route
 */
import { visionTool } from "@sanity/vision"
import { defineConfig } from "sanity"
import {
  defineDocuments,
  defineLocations,
  presentationTool,
  type DocumentLocation,
} from "sanity/presentation"
import { structureTool } from "sanity/structure"

import { apiVersion, dataset, projectId, studioUrl } from "@/sanity/lib/api"
import { resolvePathname } from "@/sanity/lib/routes"
import { pageStructure, singletonPlugin } from "@/sanity/plugins/settings"
import author from "@/sanity/schemas/documents/author"
import post from "@/sanity/schemas/documents/post"
import settings from "@/sanity/schemas/singletons/settings"
import navigationZone from "./sanity/schemas/documents/navigation-zone"
import page from "./sanity/schemas/documents/page"
import youtube from "./sanity/schemas/objects/youtube"
import homePage from "./sanity/schemas/singletons/home-page"

const homeLocation = {
  title: "Home",
  href: "/",
} satisfies DocumentLocation

function documentLocations(type: "page" | "post") {
  return defineLocations({
    select: { title: "title", slug: "slug.current" },
    resolve: (doc) => {
      const href = resolvePathname(type, doc?.slug)
      return { locations: href ? [{ title: doc?.title || "Untitled", href }] : [] }
    },
  })
}

const singletons = [homePage, settings]
const documents = [page, post, author, navigationZone]
const objects = [youtube]

export default defineConfig({
  basePath: studioUrl,
  projectId,
  dataset,
  schema: {
    types: [
      // Singletons
      ...singletons,
      // Documents
      ...documents,
      // Objects
      ...objects,
    ],
  },
  plugins: [
    presentationTool({
      resolve: {
        mainDocuments: defineDocuments([
          {
            route: "/",
            filter: '_type == "homePage" && (_id == "homePage" || count(*[_type == "homePage"]) == 1)',
          },
          {
            route: "/posts/:slug",
            filter: `_type == "post" && slug.current == $slug`,
          },
          {
            route: "/:slug",
            filter: '_type == "page" && slug.current == $slug',
          },
        ]),
        locations: {
          settings: defineLocations({
            locations: [homeLocation],
            message: "This document is used on all pages",
            tone: "caution",
          }),
          homePage: defineLocations({ locations: [homeLocation] }),
          page: documentLocations("page"),
          post: documentLocations("post"),
        },
      },
      previewUrl: { previewMode: { enable: "/api/draft-mode/enable" } },
    }),
    structureTool({ structure: pageStructure([...singletons]) }),
    // Configures the global "new document" button, and document actions, to suit the Settings document singleton
    singletonPlugin(singletons.map((singleton) => singleton.name)),
    // Vision lets you query your content with GROQ in the studio
    // https://www.sanity.io/docs/the-vision-plugin
    visionTool({ defaultApiVersion: apiVersion }),
  ],
})
