import type { Complex, EvaluationResult } from './types'

function formatNumber(
  val: number,
  locale: string,
  thousandSeparator: boolean,
): string {
  const stripped = Number.parseFloat(val.toPrecision(12))
  const safeValue = Object.is(stripped, -0) ? 0 : stripped

  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 10,
    useGrouping: thousandSeparator,
  }).format(safeValue)
}

function render(
  value: EvaluationResult,
  locale = 'en-US',
  thousandSeparator = true,
): string {
  if (value === 'Undefined') {
    return 'Undefined'
  }

  const complex: Complex =
    typeof value === 'number' ? { re: value, im: 0 } : value

  const rawRe = Number.parseFloat(complex.re.toPrecision(12))
  const safeRe = Object.is(rawRe, -0) || Math.abs(rawRe) === 0 ? 0 : rawRe

  const rawIm = Number.parseFloat(complex.im.toPrecision(12))
  const safeIm = Object.is(rawIm, -0) || Math.abs(rawIm) === 0 ? 0 : rawIm

  if (safeIm === 0) {
    return formatNumber(safeRe, locale, thousandSeparator)
  }

  if (safeRe === 0) {
    if (safeIm === 1) return 'i'
    if (safeIm === -1) return '-i'
    return `${formatNumber(safeIm, locale, thousandSeparator)}i`
  }

  const reStr = formatNumber(safeRe, locale, thousandSeparator)
  if (safeIm > 0) {
    const imStr =
      safeIm === 1 ? 'i' : `${formatNumber(safeIm, locale, thousandSeparator)}i`
    return `${reStr} + ${imStr}`
  }

  const absIm = Math.abs(safeIm)
  const imStr =
    absIm === 1 ? 'i' : `${formatNumber(absIm, locale, thousandSeparator)}i`
  return `${reStr} - ${imStr}`
}

export { render }
