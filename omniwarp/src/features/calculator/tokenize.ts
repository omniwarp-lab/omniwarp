import type { Token } from './types'

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
