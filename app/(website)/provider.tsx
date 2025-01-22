import PlausibleProvider from 'next-plausible'

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <PlausibleProvider domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN!}>
      {children}
    </PlausibleProvider>
  )
}