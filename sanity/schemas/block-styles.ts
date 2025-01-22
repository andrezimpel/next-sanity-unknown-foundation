import { defineArrayMember } from "sanity"
import TipPreview from "../preview/tip"

export default [
  defineArrayMember({
    type: "block",
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
    type: 'image'
  }),
  defineArrayMember({
    type: 'youTube'
  }),
]