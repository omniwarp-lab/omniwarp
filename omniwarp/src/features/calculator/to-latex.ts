import type { ASTNode, BinaryOperator } from './types'

const PRECEDENCE: Record<BinaryOperator, number> = {
  '+': 1,
  '-': 1,
  '*': 2,
  '/': 2,
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

  const myPrecedence = PRECEDENCE[node.op]

  if (node.op === '^') {
    const leftStr = toLatex(node.left, myPrecedence + 0.1)
    const rightStr = toLatex(node.right, 0)
    const expr = `${leftStr}^{${rightStr}}`
    return myPrecedence < parentPrecedence ? `(${expr})` : expr
  }

  const leftStr = toLatex(node.left, myPrecedence)
  const rightPrecedence =
    node.op === '-' || node.op === '/' ? myPrecedence + 0.1 : myPrecedence
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
  }

  const expr = `${leftStr} ${opLatex} ${rightStr}`
  return myPrecedence < parentPrecedence ? `(${expr})` : expr
}

export { toLatex }
