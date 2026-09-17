import type { ASTNode, BinaryOperator, Token } from './types'

function parse(rawTokens: readonly Token[]): ASTNode | null {
  // Drop trailing operators from incomplete input mid-typing
  const tokens = [...rawTokens]
  while (
    tokens.length > 0 &&
    tokens[tokens.length - 1].type !== 'NUMBER' &&
    tokens[tokens.length - 1].type !== 'RPAREN' &&
    tokens[tokens.length - 1].type !== 'PERCENT'
  ) {
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
      const op: '+' | '-' = previous().type === 'PLUS' ? '+' : '-'
      const right = parseTerm()

      if (right.type === 'Percent') {
        expr = {
          type: 'PercentAddSub',
          op,
          base: expr,
          percent: right.expr,
        }
      } else {
        expr = {
          type: 'BinaryOp',
          op,
          left: expr,
          right,
        }
      }
    }

    return expr
  }

  function parseTerm(): ASTNode {
    let expr = parsePower()

    while (true) {
      if (match('MULTIPLY', 'DIVIDE')) {
        const op: BinaryOperator = previous().type === 'MULTIPLY' ? '*' : '/'
        const right = parsePower()
        expr = {
          type: 'BinaryOp',
          op,
          left: expr,
          right,
        }
      } else if (check('LPAREN')) {
        // Implicit multiplication before parenthesis: 2(3) or (2)(3)
        const right = parsePower()
        expr = {
          type: 'BinaryOp',
          op: '*',
          left: expr,
          right,
        }
      } else {
        break
      }
    }

    return expr
  }

  function parsePower(): ASTNode {
    const expr = parseFactor()

    if (match('POWER')) {
      const right = parsePower()
      return {
        type: 'BinaryOp',
        op: '^',
        left: expr,
        right,
      }
    }

    return expr
  }

  function parseFactor(): ASTNode {
    let expr: ASTNode

    if (match('PLUS')) {
      expr = parseFactor()
    } else if (match('MINUS')) {
      const factor = parseFactor()
      if (factor.type === 'Number') {
        expr = { type: 'Number', value: -factor.value }
      } else {
        expr = {
          type: 'BinaryOp',
          op: '-',
          left: { type: 'Number', value: 0 },
          right: factor,
        }
      }
    } else if (match('LPAREN')) {
      expr = parseExpression()
      if (match('RPAREN')) {
        // Closed
      } else if (isAtEnd()) {
        // Auto-close unclosed paren mid-typing
      } else {
        throw new Error('Expected )')
      }
    } else if (match('NUMBER')) {
      const prev = previous()
      if (prev.type === 'NUMBER') {
        expr = { type: 'Number', value: prev.value }
      } else {
        throw new Error(`Unexpected token at position ${current}`)
      }
    } else {
      throw new Error(`Unexpected token at position ${current}`)
    }

    while (match('PERCENT')) {
      expr = {
        type: 'Percent',
        expr,
      }
    }

    return expr
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
