import type { NextConfig } from "next"
import { withPlausibleProxy } from 'next-plausible'

const nextConfig: NextConfig = {
  async redirects() {
    return [{ source: "/posts/page/:page(1|%31)", destination: "/posts", permanent: true }]
  },
  async headers() {
    return process.env.VERCEL_ENV === "preview"
      ? [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex" }] }]
      : []
  },
  env: {
    // Matches the behavior of `sanity dev` which sets styled-components to use the fastest way of inserting CSS rules in both dev and production. It's default behavior is to disable it in dev mode.
    SC_DISABLE_SPEEDY: "false",
  },
  images: {
    minimumCacheTTL: 2678400,
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        port: "",
        pathname: "/images/**",
      },
    ],
  },
}

export default process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ? withPlausibleProxy()(nextConfig) : nextConfig
