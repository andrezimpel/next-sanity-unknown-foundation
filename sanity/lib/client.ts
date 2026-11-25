import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId, studioUrl } from "@/sanity/lib/api";

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  perspective: "published",
  stega: {
    enabled: false,
    studioUrl,
    filter: ({ sourcePath }) =>
      ["title", "name", "excerpt", "caption", "text"].includes(String(sourcePath.at(-1))),
  },
});
