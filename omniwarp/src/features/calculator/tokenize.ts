import type { AngleUnit, Token, TrigFunctionName } from './types'

const TRIG_NAMES: readonly TrigFunctionName[] = ['sin', 'cos', 'tan']

function parseAngleUnit(word: string): AngleUnit | null {
  if (word.length === 0) return null
  if ('degrees'.startsWith(word)) return 'deg'
  if ('radians'.startsWith(word)) return 'rad'
  return null
}

function parseTrigWord(word: string): Token | null {
  for (const fn of TRIG_NAMES) {
    if (word === fn) {
      return { type: 'TRIG', fn, unit: null }
    }
    if (word.startsWith(fn)) {
      const rest = word.slice(fn.length)
      const unit = parseAngleUnit(rest)
      if (unit !== null) {
        return { type: 'TRIG', fn, unit }
      }
    }
  }
  return null
}

class Scanner {
  private pos = 0
  private readonly input: string

  constructor(input: string) {
    this.input = input
  }

  private isAtEnd(): boolean {
    return this.pos >= this.input.length
  }

  private peek(): string | null {
    return this.isAtEnd() ? null : this.input[this.pos]
  }

  private peekNext(): string | null {
    return this.pos + 1 >= this.input.length ? null : this.input[this.pos + 1]
  }

  private advance(): string {
    return this.input[this.pos++]
  }

  private isDigit(ch: string | null): boolean {
    return ch !== null && ch >= '0' && ch <= '9'
  }

  private isAlpha(ch: string | null): boolean {
    return (
      ch !== null &&
      ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z'))
    )
  }

  scanTokens(): Token[] {
    const tokens: Token[] = []

    while (!this.isAtEnd()) {
      const ch = this.peek()!

      if (ch === ' ' || ch === '\t' || ch === '\r' || ch === '\n') {
        this.advance()
        continue
      }

      if (ch === '+') {
        this.advance()
        tokens.push({ type: 'PLUS' })
        continue
      }

      if (ch === '-') {
        this.advance()
        tokens.push({ type: 'MINUS' })
        continue
      }

      if (ch === '*') {
        this.advance()
        tokens.push({ type: 'MULTIPLY' })
        continue
      }

      if (ch === '/') {
        this.advance()
        tokens.push({ type: 'DIVIDE' })
        continue
      }

      if (ch === '^') {
        this.advance()
        tokens.push({ type: 'POWER' })
        continue
      }

      if (ch === '%') {
        this.advance()
        tokens.push({ type: 'PERCENT' })
        continue
      }

      if (ch === '!') {
        this.advance()
        tokens.push({ type: 'FACTORIAL' })
        continue
      }

      if (ch === '(') {
        this.advance()
        tokens.push({ type: 'LPAREN' })
        continue
      }

      if (ch === ')') {
        this.advance()
        tokens.push({ type: 'RPAREN' })
        continue
      }

      if (this.isAlpha(ch)) {
        let word = ''
        while (!this.isAtEnd() && this.isAlpha(this.peek())) {
          word += this.advance().toLowerCase()
        }
        if (word === 'sqrt') {
          tokens.push({ type: 'SQRT' })
          continue
        }
        if (word === 'mod') {
          tokens.push({ type: 'MOD' })
          continue
        }
        const trig = parseTrigWord(word)
        if (trig !== null) {
          tokens.push(trig)
          continue
        }
        const unit = parseAngleUnit(word)
        if (unit !== null) {
          tokens.push({ type: 'ANGLE_UNIT', unit })
          continue
        }
        throw new Error(`Unexpected character: ${ch}`)
      }

      if (this.isDigit(ch) || (ch === '.' && this.isDigit(this.peekNext()))) {
        tokens.push(this.scanNumber())
        continue
      }

      throw new Error(`Unexpected character: ${ch}`)
    }

    return tokens
  }

  private scanNumber(): Token {
    let numStr = ''
    let hasDot = false

    while (!this.isAtEnd()) {
      const ch = this.peek()!
      if (this.isDigit(ch)) {
        numStr += this.advance()
      } else if (ch === '.' && !hasDot) {
        hasDot = true
        numStr += this.advance()
      } else {
        break
      }
    }

    const value = Number.parseFloat(numStr)
    if (Number.isNaN(value)) {
      throw new Error(`Invalid number: ${numStr}`)
    }

    return { type: 'NUMBER', value }
  }
}

function tokenize(input: string): Token[] {
  const scanner = new Scanner(input)
  return scanner.scanTokens()
}

export { Scanner, tokenize }
