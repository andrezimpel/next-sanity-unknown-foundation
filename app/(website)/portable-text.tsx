/**
 * This component uses Portable Text to render a post body.
 *
 * You can learn more about Portable Text on:
 * https://www.sanity.io/docs/block-content
 * https://github.com/portabletext/react-portabletext
 * https://portabletext.org/
 *
 */

import { cn } from "@/lib/utils"
import {
  PortableText,
  type PortableTextBlock,
  type PortableTextComponents,
} from "next-sanity"

export default function CustomPortableText({
  className,
  value,
}: {
  className?: string
  value: PortableTextBlock[]
}) {
  const components: PortableTextComponents = {
    block: {
      h2: ({ children }) => (
        <h2 className="mb-2 text-3xl font-semibold">{children}</h2>
      ),
      h3: ({ children }) => (
        <h3 className="mb-2 text-2xl font-semibold">{children}</h3>
      ),
      h4: ({ children }) => (
        <h4 className="mb-2 text-lg font-semibold">{children}</h4>
      ),
      h5: ({ children }) => (
        <h5 className="mb-2 font-semibold">{children}</h5>
      ),
      blockquote: ({ children }) => (
        <blockquote className="mb-2 text-lg font-semibold border-l-4 border-primary pl-4">{children}</blockquote>
      ),
      tip: ({ children }) => (
        <div className="bg-muted p-4 rounded-lg">{children}</div>
      ),
    },
    marks: {
      link: ({ children, value }) => {
        return (
          <a href={value?.href} rel="noreferrer noopener">
            {children}
          </a>
        )
      },
    },
  }

  return (
    <div className={cn("space-y-4", className)}>
      <PortableText components={components} value={value} />
    </div>
  )
}
