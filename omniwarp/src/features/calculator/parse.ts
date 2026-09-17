import type { ASTNode, BinaryOperator, Token } from './types'

function parse(rawTokens: readonly Token[]): ASTNode | null {
  // Drop trailing operators from incomplete input mid-typing (e.g. "2 +", "2 + 3 *")
  const tokens = [...rawTokens]
  while (tokens.length > 0 && tokens[tokens.length - 1].type !== 'NUMBER') {
    tokens.pop()
  }

  if (tokens.length === 0) {
    return null
  }

  let current = 0

  function isAtEnd(): boolean {
    return current >= tokens.length
  }

  function peek(): Token | null {
    return isAtEnd() ? null : tokens[current]
  }

  function previous(): Token {
    return tokens[current - 1]
  }

  function advance(): Token {
    if (!isAtEnd()) current++
    return previous()
  }

  function check(type: Token['type']): boolean {
    if (isAtEnd()) return false
    return peek()!.type === type
  }

  function match(...types: Token['type'][]): boolean {
    for (const type of types) {
      if (check(type)) {
        advance()
        return true
      }
    }
    return false
  }

  function parseExpression(): ASTNode {
    let expr = parseTerm()

    while (match('PLUS', 'MINUS')) {
      const op: BinaryOperator = previous().type === 'PLUS' ? '+' : '-'
      const right = parseTerm()
      expr = {
        type: 'BinaryOp',
        op,
        left: expr,
        right,
      }
    }

    return expr
  }

  function parseTerm(): ASTNode {
    let expr = parseFactor()

    while (match('MULTIPLY', 'DIVIDE')) {
      const op: BinaryOperator = previous().type === 'MULTIPLY' ? '*' : '/'
      const right = parseFactor()
      expr = {
        type: 'BinaryOp',
        op,
        left: expr,
        right,
      }
    }

    return expr
  }

  function parseFactor(): ASTNode {
    if (match('PLUS')) {
      return parseFactor()
    }

    if (match('MINUS')) {
      const factor = parseFactor()
      if (factor.type === 'Number') {
        return { type: 'Number', value: -factor.value }
      }
      return {
        type: 'BinaryOp',
        op: '-',
        left: { type: 'Number', value: 0 },
        right: factor,
      }
    }

    if (match('NUMBER')) {
      const prev = previous()
      if (prev.type === 'NUMBER') {
        return { type: 'Number', value: prev.value }
      }
    }

    throw new Error(`Unexpected token at position ${current}`)
  }

  try {
    const ast = parseExpression()
    if (!isAtEnd()) {
      return null
    }
    return ast
  } catch {
    return null
  }
}

export { parse }
