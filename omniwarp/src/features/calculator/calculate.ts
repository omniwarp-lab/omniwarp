import { normalize } from './normalize'
import { tokenize } from './tokenize'
import { parse } from './parse'
import { evaluate } from './evaluate'
import { render } from './render'
import { toLatex } from './to-latex'
import type { ASTNode, CalculatorResult, Token } from './types'

function hasOperator(node: ASTNode): boolean {
  if (node.type === 'BinaryOp') {
    return true
  }
  return false
}

function calculate(input: string, locale = 'en-US'): CalculatorResult {
  if (!input || !input.trim()) {
    return { show: false }
  }

  // Stage 1: Normalize
  const normalized = normalize(input)
  if (!normalized.trim()) {
    return { show: false }
  }

  // Stage 2: Tokenize
  let tokens: Token[]
  try {
    tokens = tokenize(normalized)
  } catch {
    return { show: false }
  }

  if (tokens.length === 0) {
    return { show: false }
  }

  // Stage 3: Parse into an AST
  const ast = parse(tokens)
  if (!ast) {
    return { show: false }
  }

  // Expression must contain at least one operator
  if (!hasOperator(ast)) {
    return { show: false }
  }

  // Stage 4: Evaluate the AST
  const evalResult = evaluate(ast)

  // Stage 5: Render
  const rendered = render(evalResult, locale)
  const latex = `${toLatex(ast)} =`

  return {
    show: true,
    result: rendered,
    latex,
  }
}

export { hasOperator, calculate }
