import { normalize } from './normalize'
import { tokenize } from './tokenize'
import { parse } from './parse'
import { evaluate } from './evaluate'
import { render } from './render'
import { toLatex } from './to-latex'
import { toPlainText } from './to-plain-text'
import type {
  AngleUnit,
  ASTNode,
  CalculatorActivationMode,
  CalculatorResult,
  Token,
} from './types'

function hasOperator(node: ASTNode): boolean {
  if (
    node.type === 'BinaryOp' ||
    node.type === 'Percent' ||
    node.type === 'PercentAddSub' ||
    node.type === 'Sqrt' ||
    node.type === 'Trig' ||
    node.type === 'Factorial'
  ) {
    return true
  }
  return false
}

function parseAndEvaluate(
  input: string,
  locale = 'en-US',
  angleUnit: AngleUnit = 'rad',
  thousandSeparator = true,
) {
  if (!input || !input.trim()) {
    return null
  }

  // Stage 1: Normalize
  const normalized = normalize(input)
  if (!normalized.trim()) {
    return null
  }

  // Stage 2: Tokenize
  let tokens: Token[]
  try {
    tokens = tokenize(normalized)
  } catch {
    return null
  }

  if (tokens.length === 0) {
    return null
  }

  // Stage 3: Parse into an AST
  const ast = parse(tokens, angleUnit)
  if (!ast) {
    return null
  }

  // Expression must contain at least one operator
  if (!hasOperator(ast)) {
    return null
  }

  // Stage 4: Evaluate the AST
  const evalResult = evaluate(ast)
  if (evalResult === 'Overflow') {
    return null
  }

  // Stage 5: Render
  const rendered = render(evalResult, locale, thousandSeparator)

  return { ast, rendered }
}

function calculate(
  input: string,
  locale = 'en-US',
  activationMode: CalculatorActivationMode = 'auto',
  angleUnit: AngleUnit = 'rad',
  thousandSeparator = true,
): CalculatorResult {
  const trimmed = input.trimStart()
  const hasEqualsPrefix = trimmed.startsWith('=')

  if (activationMode === 'requireEquals' && !hasEqualsPrefix) {
    return { show: false }
  }

  const cleanInput = hasEqualsPrefix ? trimmed.slice(1) : input
  const evaluated = parseAndEvaluate(
    cleanInput,
    locale,
    angleUnit,
    thousandSeparator,
  )
  if (!evaluated) {
    return { show: false }
  }

  return {
    show: true,
    result: evaluated.rendered,
    latex: `${toLatex(evaluated.ast)} =`,
  }
}

function calculateFullExpression(
  input: string,
  locale = 'en-US',
  angleUnit: AngleUnit = 'rad',
  thousandSeparator = true,
): string | null {
  const trimmed = input.trimStart()
  const cleanInput = trimmed.startsWith('=') ? trimmed.slice(1) : input
  const evaluated = parseAndEvaluate(
    cleanInput,
    locale,
    angleUnit,
    thousandSeparator,
  )
  if (!evaluated) {
    return null
  }

  return `${toPlainText(evaluated.ast)} = ${evaluated.rendered}`
}

export { hasOperator, calculate, calculateFullExpression }
