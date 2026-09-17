import type { ASTNode, BinaryOperator } from './types'

const PRECEDENCE: Record<BinaryOperator, number> = {
  '+': 1,
  '-': 1,
  '*': 2,
  '/': 2,
  'mod': 2,
  '^': 3,
}

function toLatex(node: ASTNode, parentPrecedence = 0): string {
  if (node.type === 'Number') {
    return node.value < 0 ? `(${node.value})` : `${node.value}`
  }

  if (node.type === 'Percent') {
    const inner = toLatex(node.expr, 4)
    return `${inner}\\%`
  }

  if (node.type === 'PercentAddSub') {
    const baseStr = toLatex(node.base, 1)
    const percentStr = toLatex(node.percent, 4)
    const expr = `${baseStr} ${node.op} ${percentStr}\\%`
    return parentPrecedence > 1 ? `(${expr})` : expr
  }

  if (node.type === 'Sqrt') {
    const inner = toLatex(node.expr, 0)
    return `\\sqrt{${inner}}`
  }

  if (node.type === 'Trig') {
    const inner = toLatex(node.expr, 0)
    if (node.unit === 'deg') {
      // Keep `90°` style for plain numbers, but put the degree mark outside
      // the parens for compound expressions so `sin(30+60deg)` doesn't render
      // as `sin(30 + 60°)` (which reads as degrees applying to 60 only).
      if (node.expr.type === 'Number') {
        return `\\${node.fn}\\left(${inner}^{\\circ}\\right)`
      }
      return `\\${node.fn}\\left(${inner}\\right)^{\\circ}`
    }
    return `\\${node.fn}\\left(${inner}\\right)`
  }

  if (node.type === 'Factorial') {
    const inner = toLatex(node.expr, 4)
    return `${inner}!`
  }

  const myPrecedence = PRECEDENCE[node.op]

  if (node.op === '^') {
    const leftStr = toLatex(node.left, myPrecedence + 0.1)
    const rightStr = toLatex(node.right, 0)
    const expr = `${leftStr}^{${rightStr}}`
    return myPrecedence < parentPrecedence ? `(${expr})` : expr
  }

  const leftStr = toLatex(node.left, myPrecedence)
  const rightPrecedence =
    node.op === '-' || node.op === '/' || node.op === 'mod'
      ? myPrecedence + 0.1
      : myPrecedence
  const rightStr = toLatex(node.right, rightPrecedence)

  let opLatex: string
  switch (node.op) {
    case '+':
      opLatex = '+'
      break
    case '-':
      opLatex = '-'
      break
    case '*':
      opLatex = '\\times'
      break
    case '/':
      opLatex = '\\div'
      break
    case 'mod':
      opLatex = '\\bmod'
      break
  }

  const expr = `${leftStr} ${opLatex} ${rightStr}`
  return myPrecedence < parentPrecedence ? `(${expr})` : expr
}

export { toLatex }
