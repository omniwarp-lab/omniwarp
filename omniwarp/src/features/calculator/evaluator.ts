type Token =
  | { type: 'NUMBER'; value: number }
  | { type: 'PLUS' | 'MINUS' | 'MULTIPLY' | 'DIVIDE' }

function normalizeExpression(expr: string): string {
  return expr
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632))
    .replace(/−/g, '-')
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
}

function tokenize(expr: string): Token[] | null {
  const normalized = normalizeExpression(expr)
  const regex = /\s*(?:(\d+(?:\.\d+)?|\.\d+)|([+\-*/])|(\S))/g
  const tokens: Token[] = []
  let match: RegExpExecArray | null

  while ((match = regex.exec(normalized)) !== null) {
    if (match[3] !== undefined) return null

    if (match[1] !== undefined) {
      const val = Number(match[1])
      if (Number.isNaN(val)) return null
      tokens.push({ type: 'NUMBER', value: val })
    } else if (match[2] !== undefined) {
      const op = match[2]
      if (op === '+') tokens.push({ type: 'PLUS' })
      else if (op === '-') tokens.push({ type: 'MINUS' })
      else if (op === '*') tokens.push({ type: 'MULTIPLY' })
      else if (op === '/') tokens.push({ type: 'DIVIDE' })
    }
  }

  return tokens.length > 0 ? tokens : null
}

function parseAndEvaluate(
  tokens: Token[],
): { value: number; binaryOpCount: number } | null {
  let index = 0
  let binaryOpCount = 0

  function parseFactor(allowUnaryPlus: boolean): number | null {
    if (index >= tokens.length) return null

    let sign = 1
    const current = tokens[index]

    if (current.type === 'PLUS') {
      if (!allowUnaryPlus) return null
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

  function parseTerm(allowUnaryPlus: boolean): number | null {
    let term = parseFactor(allowUnaryPlus)
    if (term === null) return null

    while (index < tokens.length) {
      const opToken = tokens[index]
      if (opToken.type !== 'MULTIPLY' && opToken.type !== 'DIVIDE') break
      index++

      const nextFactor = parseFactor(false)
      if (nextFactor === null) return null

      binaryOpCount++
      if (opToken.type === 'MULTIPLY') {
        term *= nextFactor
      } else {
        if (nextFactor === 0) return null
        term /= nextFactor
      }
    }

    return term
  }

  function parseExpression(): number | null {
    let expr = parseTerm(true)
    if (expr === null) return null

    while (index < tokens.length) {
      const opToken = tokens[index]
      if (opToken.type !== 'PLUS' && opToken.type !== 'MINUS') return null
      index++

      const nextTerm = parseTerm(false)
      if (nextTerm === null) return null

      binaryOpCount++
      expr = opToken.type === 'PLUS' ? expr + nextTerm : expr - nextTerm
    }

    return expr
  }

  const result = parseExpression()
  if (result === null || index < tokens.length || !Number.isFinite(result)) {
    return null
  }

  return { value: result, binaryOpCount }
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

function formatCalculatorExpression(query: string): string {
  const clean = query
    .trim()
    .replace(/^=\s*/, '')
    .replace(/\s*([*×])\s*/g, ' × ')
    .replace(/\s*([/÷])\s*/g, ' ÷ ')
  return `${clean} =`
}

export { evaluateCalculator, formatCalculatorExpression }
