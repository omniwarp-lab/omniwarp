import type { EvaluationResult } from './types'

function render(value: EvaluationResult, locale = 'en-US'): string {
  if (value === 'Undefined') {
    return 'Undefined'
  }

  // Strip floating point representation noise (e.g. 0.1 + 0.2 = 0.30000000000000004)
  const stripped = Number.parseFloat(value.toPrecision(12))
  const safeValue = Object.is(stripped, -0) ? 0 : stripped

  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 10,
    useGrouping: true,
  }).format(safeValue)
}

export { render }
