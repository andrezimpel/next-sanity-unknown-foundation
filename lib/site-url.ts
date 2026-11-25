import "server-only"

export function getSiteOrigin() {
  const value = process.env.SITE_URL
  if (!value) throw new Error("Missing SITE_URL")

  const url = new URL(value)
  const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)
  if (
    (url.protocol !== "https:" && !(url.protocol === "http:" && loopback)) ||
    (loopback && process.env.VERCEL_ENV === "production") ||
    url.username || url.password || url.pathname !== "/" || url.search || url.hash
  ) {
    throw new Error("SITE_URL must be an HTTPS origin or a local loopback origin")
  }

  return url.origin
}

export function siteUrl(pathname: string) {
  return new URL(pathname, getSiteOrigin()).href
}
