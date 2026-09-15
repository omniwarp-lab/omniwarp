type Token = { type: 'NUMBER'; value: number } | { type: 'PLUS' | 'MINUS' }

function normalizeExpression(expr: string): string {
  return expr
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632))
    .replace(/−/g, '-')
}

function tokenize(expr: string): Token[] | null {
  const normalized = normalizeExpression(expr)
  const regex = /\s*(?:(\d+(?:\.\d+)?|\.\d+)|([+-])|(\S))/g
  const tokens: Token[] = []
  let match: RegExpExecArray | null

  while ((match = regex.exec(normalized)) !== null) {
    if (match[3] !== undefined) return null

    if (match[1] !== undefined) {
      const val = Number(match[1])
      if (Number.isNaN(val)) return null
      tokens.push({ type: 'NUMBER', value: val })
    } else if (match[2] !== undefined) {
      tokens.push({ type: match[2] === '+' ? 'PLUS' : 'MINUS' })
    }
  }

  return tokens.length > 0 ? tokens : null
}

function parseAndEvaluate(
  tokens: Token[],
): { value: number; binaryOpCount: number } | null {
  let index = 0

  function parseSignedNumber(allowUnaryPlus = true): number | null {
    if (index >= tokens.length) return null

    let sign = 1
    const current = tokens[index]

    if (current.type === 'PLUS') {
      if (!allowUnaryPlus) return null
      sign = 1
      index++
    } else if (current.type === 'MINUS') {
      sign = -1
      index++
    }

    if (index >= tokens.length) return null
    const numToken = tokens[index]
    if (numToken.type !== 'NUMBER') return null

    index++
    return sign * numToken.value
  }

  let result = parseSignedNumber(true)
  if (result === null) return null

  let binaryOpCount = 0

  while (index < tokens.length) {
    const opToken = tokens[index]
    if (opToken.type !== 'PLUS' && opToken.type !== 'MINUS') return null
    index++

    const nextTerm = parseSignedNumber(false)
    if (nextTerm === null) return null

    binaryOpCount++
    result = opToken.type === 'PLUS' ? result + nextTerm : result - nextTerm
  }

  return Number.isFinite(result) ? { value: result, binaryOpCount } : null
}

function evaluateCalculator(query: string): string | null {
  const trimmed = query.trim()
  if (!trimmed) return null

  const hasEqualPrefix = trimmed.startsWith('=')
  const expr = hasEqualPrefix ? trimmed.slice(1).trim() : trimmed
  if (!expr) return null

  const tokens = tokenize(expr)
  if (!tokens) return null

  const evaluated = parseAndEvaluate(tokens)
  if (!evaluated || (!hasEqualPrefix && evaluated.binaryOpCount === 0)) {
    return null
  }

  if (Object.is(evaluated.value, -0) || evaluated.value === 0) return '0'
  return String(Number(evaluated.value.toPrecision(12)))
}

export { evaluateCalculator }
