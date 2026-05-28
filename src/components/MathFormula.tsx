import { useMemo } from 'react'
import katex from 'katex'

interface MathFormulaProps {
  math: string
  className?: string
}

function renderFormula(math: string, displayMode: boolean): string {
  return katex.renderToString(math, {
    displayMode,
    errorColor: '#94424e',
    strict: false,
    throwOnError: false,
  })
}

export function InlineMath({ math, className }: MathFormulaProps) {
  const html = useMemo(() => renderFormula(math, false), [math])

  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

export function BlockMath({ math, className }: MathFormulaProps) {
  const html = useMemo(() => renderFormula(math, true), [math])

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
