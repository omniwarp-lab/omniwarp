type Token =
  | { type: 'NUMBER'; value: number }
  | {
      type:
        | 'PLUS'
        | 'MINUS'
        | 'MULTIPLY'
        | 'DIVIDE'
        | 'POWER'
        | 'SQRT'
        | 'LPAREN'
        | 'RPAREN'
    }

function normalizeExpression(expr: string): string {
  return expr
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632))
    .replace(/−/g, '-')
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/（/g, '(')
    .replace(/）/g, ')')
    .replace(/\*\*/g, '^')
    .replace(/√/g, 'sqrt ')
}

function tokenize(expr: string): Token[] | null {
  const normalized = normalizeExpression(expr)
  const regex = /\s*(?:(\d+(?:\.\d+)?|\.\d+)|(sqrt)|([+\-*/^()])|(\S))/gi
  const rawTokens: Token[] = []
  let match: RegExpExecArray | null

  while ((match = regex.exec(normalized)) !== null) {
    if (match[4] !== undefined) return null

    if (match[1] !== undefined) {
      const val = Number(match[1])
      if (Number.isNaN(val)) return null
      rawTokens.push({ type: 'NUMBER', value: val })
    } else if (match[2] !== undefined) {
      rawTokens.push({ type: 'SQRT' })
    } else if (match[3] !== undefined) {
      const op = match[3]
      if (op === '+') rawTokens.push({ type: 'PLUS' })
      else if (op === '-') rawTokens.push({ type: 'MINUS' })
      else if (op === '*') rawTokens.push({ type: 'MULTIPLY' })
      else if (op === '/') rawTokens.push({ type: 'DIVIDE' })
      else if (op === '^') rawTokens.push({ type: 'POWER' })
      else if (op === '(') rawTokens.push({ type: 'LPAREN' })
      else if (op === ')') rawTokens.push({ type: 'RPAREN' })
    }
  }

  if (rawTokens.length === 0) return null

  const tokens: Token[] = []
  for (let i = 0; i < rawTokens.length; i++) {
    const current = rawTokens[i]
    if (i > 0) {
      const prev = rawTokens[i - 1]
      const isPrevNumberOrRParen =
        prev.type === 'NUMBER' || prev.type === 'RPAREN'
      const isCurrentLParenOrSqrt =
        current.type === 'LPAREN' || current.type === 'SQRT'
      const isCurrentNumber = current.type === 'NUMBER'

      if (
        (isPrevNumberOrRParen && isCurrentLParenOrSqrt) ||
        (prev.type === 'RPAREN' && isCurrentNumber)
      ) {
        tokens.push({ type: 'MULTIPLY' })
      }
    }
    tokens.push(current)
  }

  return tokens
}

function parseAndEvaluate(
  tokens: Token[],
): { value: number; binaryOpCount: number } | null {
  let index = 0
  let binaryOpCount = 0

  function parsePrimary(): number | null {
    if (index >= tokens.length) return null
    const token = tokens[index]

    if (token.type === 'NUMBER') {
      index++
      return token.value
    }

    if (token.type === 'LPAREN') {
      index++
      const exprValue = parseExpression()
      if (exprValue === null) return null
      if (index >= tokens.length || tokens[index].type !== 'RPAREN') return null
      index++
      return exprValue
    }

    return null
  }

  function parseUnary(): number | null {
    if (index >= tokens.length) return null
    const token = tokens[index]

    if (token.type === 'SQRT') {
      index++
      binaryOpCount++
      const operand = parseUnary()
      if (operand === null || operand < 0) return null
      return Math.sqrt(operand)
    }

    return parsePrimary()
  }

  function parsePower(): number | null {
    const base = parseUnary()
    if (base === null) return null

    if (index < tokens.length && tokens[index].type === 'POWER') {
      index++
      binaryOpCount++
      const exponent = parseFactor(true)
      if (exponent === null) return null
      const val = Math.pow(base, exponent)
      if (!Number.isFinite(val) || Number.isNaN(val)) return null
      return val
    }

    return base
  }

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

    const powerValue = parsePower()
    if (powerValue === null) return null

    return sign * powerValue
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
      if (opToken.type !== 'PLUS' && opToken.type !== 'MINUS') break
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
  let clean = normalizeExpression(query.trim())
    .replace(/^=\s*/, '')
    .replace(/\s*([*×])\s*/g, ' × ')
    .replace(/\s*([/÷])\s*/g, ' ÷ ')

  while (/sqrt\s*\(([^()]+)\)/i.test(clean)) {
    clean = clean.replace(
      /sqrt\s*\(([^()]+)\)/gi,
      (_, m: string) => `\\sqrt{${m}}`,
    )
  }
  clean = clean.replace(
    /sqrt\s*(\d+(?:\.\d+)?)/gi,
    (_, m: string) => `\\sqrt{${m}}`,
  )

  while (/\^\s*\(([^()]+)\)/.test(clean)) {
    clean = clean.replace(/\^\s*\(([^()]+)\)/g, '^{$1}')
  }
  clean = clean.replace(/\^\s*(\\sqrt\{[^}]+\})/g, '^{$1}')
  clean = clean.replace(/\^\s*(-(?:\d+(?:\.\d+)?|\\sqrt\{[^}]+\}))/g, '^{$1}')

  while (/\^([^{}()\s]+)\^/.test(clean)) {
    clean = clean.replace(/\^([^{}()\s]+)\^([^{}()\s]+)/g, '^{$1^{$2}}')
  }

  return `${clean} =`
}

export { evaluateCalculator, formatCalculatorExpression }
