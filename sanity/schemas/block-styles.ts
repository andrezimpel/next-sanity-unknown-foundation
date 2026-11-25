import { defineArrayMember, defineField } from "sanity"
import TipPreview from "../preview/tip"

const blockStyles = [
  defineArrayMember({
    type: "block",
    marks: {
      annotations: [
        defineArrayMember({
          name: "link",
          title: "URL link",
          type: "object",
          fields: [defineField({
            name: "href",
            type: "url",
            validation: (rule) => rule.uri({ scheme: ["http", "https", "tel", "mailto"], allowRelative: true }),
          })],
        }),
        defineArrayMember({
          name: "internalLink",
          title: "Internal link",
          type: "object",
          fields: [defineField({
            name: "target",
            type: "reference",
            to: [{ type: "page" }, { type: "post" }],
            validation: (rule) => rule.required(),
          })],
        }),
      ],
    },
    styles: [
      { title: "Normal", value: "normal" },
      { title: "H2", value: "h2" },
      { title: "H3", value: "h3" },
      { title: "H4", value: "h4" },
      { title: "H5", value: "h5" },
      { title: "Quote", value: "blockquote" },
      {
        title: "Tip",
        value: "tip",
        component: TipPreview
      }
    ]
  }),
  defineArrayMember({
    type: "image",
    fields: [
      { name: "alt", title: "Alternative text", type: "string" },
      { name: "caption", title: "Caption", type: "string" },
    ],
  }),
  defineArrayMember({
    type: 'youTube'
  }),
]

export default blockStyles
