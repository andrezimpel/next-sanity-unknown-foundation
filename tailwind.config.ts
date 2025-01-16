import typography from "@tailwindcss/typography"
import type { Config } from "tailwindcss"

export default {
  content: ["./app/**/*.{ts,tsx}", "./sanity/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      container: {
        center: true,
        padding: "1rem",
      },
      fontFamily: {
        sans: ["var(--font-inter)"],
      },
    },
  },
  future: {
    hoverOnlyWhenSupported: true,
  },
  plugins: [typography],
} satisfies Config
