import { useMemo } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'

interface KatexRendererProps {
  expression: string
  className?: string
}

function KatexRenderer({ expression, className }: KatexRendererProps) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(expression, {
        throwOnError: false,
        displayMode: false,
      })
    } catch {
      return null
    }
  }, [expression])

  if (!html) {
    return <span className={className}>{expression}</span>
  }

  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

export { KatexRenderer }
export type { KatexRendererProps }
