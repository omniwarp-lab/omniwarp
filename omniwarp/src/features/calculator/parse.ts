import type { AngleUnit, ASTNode, BinaryOperator, Token } from './types'

function parse(
  rawTokens: readonly Token[],
  defaultAngleUnit: AngleUnit = 'rad',
): ASTNode | null {
  // Drop trailing operators from incomplete input mid-typing
  const tokens = [...rawTokens]
  while (
    tokens.length > 0 &&
    tokens[tokens.length - 1].type !== 'NUMBER' &&
    tokens[tokens.length - 1].type !== 'RPAREN' &&
    tokens[tokens.length - 1].type !== 'PERCENT' &&
    tokens[tokens.length - 1].type !== 'FACTORIAL' &&
    tokens[tokens.length - 1].type !== 'ANGLE_UNIT'
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
      if (match('MULTIPLY', 'DIVIDE', 'MOD')) {
        const prevType = previous().type
        const op: BinaryOperator =
          prevType === 'MULTIPLY' ? '*' : prevType === 'DIVIDE' ? '/' : 'mod'
        const right = parsePower()
        expr = {
          type: 'BinaryOp',
          op,
          left: expr,
          right,
        }
      } else if (check('LPAREN') || check('SQRT') || check('TRIG')) {
        // Implicit multiplication before parenthesis, sqrt or trig: 2(3), 2 sqrt 9 or 2 sin 30
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
    } else if (match('SQRT')) {
      let inner: ASTNode
      if (match('LPAREN')) {
        inner = parseExpression()
        if (match('RPAREN')) {
          // Closed
        } else if (isAtEnd()) {
          // Auto-close unclosed paren mid-typing
        } else {
          throw new Error('Expected )')
        }
      } else {
        inner = parseFactor()
      }
      expr = {
        type: 'Sqrt',
        expr: inner,
      }
    } else if (match('TRIG')) {
      const prev = previous()
      if (prev.type !== 'TRIG') {
        throw new Error(`Unexpected token at position ${current}`)
      }
      const fn = prev.fn
      const fnUnit = prev.unit
      let inner: ASTNode
      let explicitUnit: AngleUnit | null = null
      if (match('LPAREN')) {
        inner = parseExpression()
        // Unit inside parens: sin(90deg)
        if (match('ANGLE_UNIT')) {
          const unitTok = previous()
          if (unitTok.type === 'ANGLE_UNIT') {
            explicitUnit = unitTok.unit
          }
        }
        if (match('RPAREN')) {
          // Closed
        } else if (isAtEnd()) {
          // Auto-close unclosed paren mid-typing
        } else {
          throw new Error('Expected )')
        }
        // Trailing unit outside parens: sin(90)deg
        if (match('ANGLE_UNIT')) {
          const unitTok = previous()
          if (unitTok.type === 'ANGLE_UNIT') {
            explicitUnit = unitTok.unit
          }
        }
      } else {
        // Bare form: sin 30, sin 30deg, sind 30
        inner = parseFactor()
        if (match('ANGLE_UNIT')) {
          const unitTok = previous()
          if (unitTok.type === 'ANGLE_UNIT') {
            explicitUnit = unitTok.unit
          }
        }
      }
      expr = {
        type: 'Trig',
        fn,
        unit: explicitUnit ?? fnUnit ?? defaultAngleUnit,
        expr: inner,
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

    while (true) {
      if (match('FACTORIAL')) {
        expr = {
          type: 'Factorial',
          expr,
        }
      } else if (match('PERCENT')) {
        expr = {
          type: 'Percent',
          expr,
        }
      } else {
        break
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
