interface YouTubeProps {
  value: {
    url: string
  }
}

export default function YouTube({ value }: YouTubeProps) {
  const { url } = value
  
  if (!url) {
    return null
  }

  const videoIdMatch = url.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)|youtu\.be\/([^&]+)/)
  const videoId = videoIdMatch ? (videoIdMatch[1] || videoIdMatch[2]) : null
  
  if (!videoId) {
    return null
  }

  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}`
  
  return (
    <div className="my-6">
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <iframe
          className="absolute top-0 left-0 w-full h-full rounded-lg"
          src={embedUrl}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  )
}
