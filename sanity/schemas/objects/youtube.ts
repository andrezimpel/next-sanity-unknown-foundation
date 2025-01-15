import YouTubeEmbed from "@/sanity/preview/youtube"
import { defineType } from "sanity"

export default defineType({
  type: 'object',
  name: 'youTube',
  title: 'YouTube Video',
  preview: {
    select: { title: 'url' },
  },
  components: {
    preview: YouTubeEmbed,
  },
  fields: [
    {
      name: 'url',
      type: 'string',
      title: 'YouTube URL',
      validation: (rule) => rule.required().custom((url: string | undefined) => {
        // Regular expression for YouTube URLs
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/
        if (!youtubeRegex.test(url ?? "")) {
          return 'Please enter a valid YouTube URL.'
        }
        return true
      }),
    }
  ]
})
