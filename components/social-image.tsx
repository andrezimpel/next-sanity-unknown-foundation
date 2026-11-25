import { ImageResponse } from "next/og"

export const socialImageSize = { width: 1200, height: 630 }

export function renderSocialImage(title: string, imageUrl?: string) {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: "white",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {imageUrl ? (
          // ImageResponse renders this element on the server.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : title}
      </div>
    ),
    socialImageSize,
  )
}
