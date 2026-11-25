export const defaultLocale = "de-DE"

export function getLocale(value?: string | null) {
  try {
    return new Intl.Locale(value || defaultLocale)
  } catch {
    return new Intl.Locale(defaultLocale)
  }
}
