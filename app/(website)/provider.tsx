import PlausibleProvider from 'next-plausible'

export default function Provider({ children }: { children: React.ReactNode }) {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN
  if (!domain) return children

  return (
    <PlausibleProvider
      domain={domain}
      trackOutboundLinks
      revenue
      hash
    >
      {children}
    </PlausibleProvider>
  )
}
