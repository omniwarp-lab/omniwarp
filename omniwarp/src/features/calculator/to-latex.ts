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
