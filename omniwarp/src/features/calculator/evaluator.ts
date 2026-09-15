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
        | 'FACTORIAL'
        | 'PERCENT'
        | 'LPAREN'
        | 'RPAREN'
    }

function factorial(n: number): number | null {
  if (!Number.isInteger(n) || n < 0 || n > 170) return null
  let result = 1
  for (let i = 2; i <= n; i++) {
    result *= i
  }
  return result
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
    .replace(/٪/g, '%')
    .replace(/\bof\b/gi, '*')
}

function tokenize(expr: string): Token[] | null {
  const normalized = normalizeExpression(expr)
  const regex = /\s*(?:(\d+(?:\.\d+)?|\.\d+)|(sqrt)|([+\-*/^!%()])|(\S))/gi
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
      else if (op === '!') rawTokens.push({ type: 'FACTORIAL' })
      else if (op === '%') rawTokens.push({ type: 'PERCENT' })
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
      const isPrevNumberOrParenOrFactOrPct =
        prev.type === 'NUMBER' ||
        prev.type === 'RPAREN' ||
        prev.type === 'FACTORIAL' ||
        prev.type === 'PERCENT'
      const isCurrentLParenOrSqrt =
        current.type === 'LPAREN' || current.type === 'SQRT'
      const isCurrentNumber = current.type === 'NUMBER'

      if (
        (isPrevNumberOrParenOrFactOrPct && isCurrentLParenOrSqrt) ||
        ((prev.type === 'RPAREN' ||
          prev.type === 'FACTORIAL' ||
          prev.type === 'PERCENT') &&
          isCurrentNumber)
      ) {
        tokens.push({ type: 'MULTIPLY' })
      }
    }
    tokens.push(current)
  }

  return tokens
}

interface ParsedNode {
  value: number
  isPercent: boolean
}

function parseAndEvaluate(
  tokens: Token[],
): { value: number; binaryOpCount: number } | null {
  let index = 0
  let binaryOpCount = 0

  function parsePrimary(): ParsedNode | null {
    if (index >= tokens.length) return null
    const token = tokens[index]

    if (token.type === 'NUMBER') {
      index++
      return { value: token.value, isPercent: false }
    }

    if (token.type === 'LPAREN') {
      index++
      const exprValue = parseExpression()
      if (exprValue === null) return null
      if (index >= tokens.length || tokens[index].type !== 'RPAREN') return null
      index++
      return { value: exprValue.value, isPercent: false }
    }

    return null
  }

  function parseUnary(): ParsedNode | null {
    if (index >= tokens.length) return null
    const token = tokens[index]

    if (token.type === 'SQRT') {
      index++
      binaryOpCount++
      const operand = parseUnary()
      if (operand === null || operand.value < 0) return null
      return { value: Math.sqrt(operand.value), isPercent: false }
    }

    return parsePrimary()
  }

  function parsePostfix(): ParsedNode | null {
    let node = parseUnary()
    if (node === null) return null

    while (index < tokens.length) {
      const token = tokens[index]
      if (token.type === 'FACTORIAL') {
        index++
        binaryOpCount++
        const val = factorial(node.value)
        if (val === null) return null
        node = { value: val, isPercent: false }
      } else if (token.type === 'PERCENT') {
        index++
        binaryOpCount++
        node = { value: node.value / 100, isPercent: true }
      } else {
        break
      }
    }

    return node
  }

  function parsePower(): ParsedNode | null {
    const base = parsePostfix()
    if (base === null) return null

    if (index < tokens.length && tokens[index].type === 'POWER') {
      index++
      binaryOpCount++
      const exponent = parseFactor(true)
      if (exponent === null) return null
      const val = Math.pow(base.value, exponent.value)
      if (!Number.isFinite(val) || Number.isNaN(val)) return null
      return { value: val, isPercent: false }
    }

    return base
  }

  function parseFactor(allowUnaryPlus: boolean): ParsedNode | null {
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

    return {
      value: sign * powerValue.value,
      isPercent: powerValue.isPercent,
    }
  }

  function parseTerm(allowUnaryPlus: boolean): ParsedNode | null {
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
        term = {
          value: term.value * nextFactor.value,
          isPercent: term.isPercent || nextFactor.isPercent,
        }
      } else {
        if (nextFactor.value === 0) return null
        term = {
          value: term.value / nextFactor.value,
          isPercent: term.isPercent && !nextFactor.isPercent,
        }
      }
    }

    return term
  }

  function parseExpression(): ParsedNode | null {
    let expr = parseTerm(true)
    if (expr === null) return null

    while (index < tokens.length) {
      const opToken = tokens[index]
      if (opToken.type !== 'PLUS' && opToken.type !== 'MINUS') break
      index++

      const nextTerm = parseTerm(false)
      if (nextTerm === null) return null

      binaryOpCount++
      if (nextTerm.isPercent && !expr.isPercent) {
        expr = {
          value:
            opToken.type === 'PLUS'
              ? expr.value + expr.value * nextTerm.value
              : expr.value - expr.value * nextTerm.value,
          isPercent: false,
        }
      } else {
        expr = {
          value:
            opToken.type === 'PLUS'
              ? expr.value + nextTerm.value
              : expr.value - nextTerm.value,
          isPercent: expr.isPercent && nextTerm.isPercent,
        }
      }
    }

    return expr
  }

  const result = parseExpression()
  if (
    result === null ||
    index < tokens.length ||
    !Number.isFinite(result.value)
  ) {
    return null
  }

  return { value: result.value, binaryOpCount }
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
    /sqrt\s*(\d+(?:\.\d+)?!*)/gi,
    (_, m: string) => `\\sqrt{${m}}`,
  )

  while (/\^\s*([0-9.]+!*)\s*\^/.test(clean)) {
    clean = clean.replace(
      /\^\s*([0-9.]+!*)\s*\^\s*([0-9.]+!*)/g,
      '^{$1^{$2}}',
    )
  }

  while (/\^\s*\(([^()]+)\)/.test(clean)) {
    clean = clean.replace(/\^\s*\(([^()]+)\)/g, '^{$1}')
  }

  clean = clean.replace(/\^\s*(\\sqrt\{[^}]+\})/g, '^{$1}')
  clean = clean.replace(/\^\s*(-[0-9.]+!*)/g, '^{$1}')
  clean = clean.replace(/\^\s*([0-9.]+!+)/g, '^{$1}')

  clean = clean.replace(/%/g, '\\%')

  return `${clean} =`
}

export { evaluateCalculator, formatCalculatorExpression }
