import { PreviewProps } from "sanity"

const YouTubeEmbed = (props: PreviewProps) => {
  const { title: url } = props

  const videoIdMatch = typeof url === 'string' ? url.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)|youtu\.be\/([^&]+)/) : null
  const videoId = videoIdMatch ? (videoIdMatch[1] || videoIdMatch[2]) : null

  const embedUrl = videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : ''

  return (
    <iframe
      width="560"
      height="315"
      src={embedUrl}
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    ></iframe>
  )
}

export default YouTubeEmbed