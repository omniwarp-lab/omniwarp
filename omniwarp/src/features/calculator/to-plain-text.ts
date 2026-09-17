import type { ASTNode, BinaryOperator } from './types'

const PRECEDENCE: Record<BinaryOperator, number> = {
  '+': 1,
  '-': 1,
  '*': 2,
  '/': 2,
  'mod': 2,
  '^': 3,
}

function toPlainText(node: ASTNode, parentPrecedence = 0): string {
  if (node.type === 'Number') {
    return node.value < 0 ? `(${node.value})` : `${node.value}`
  }

  if (node.type === 'Percent') {
    const inner = toPlainText(node.expr, 4)
    return `${inner}%`
  }

  if (node.type === 'PercentAddSub') {
    const baseStr = toPlainText(node.base, 1)
    const percentStr = toPlainText(node.percent, 4)
    const expr = `${baseStr} ${node.op} ${percentStr}%`
    return parentPrecedence > 1 ? `(${expr})` : expr
  }

  if (node.type === 'Sqrt') {
    const inner = toPlainText(node.expr, 0)
    return `sqrt(${inner})`
  }

  if (node.type === 'Trig') {
    const inner = toPlainText(node.expr, 0)
    const unitSuffix = node.unit === 'deg' ? '°' : ''
    return `${node.fn}(${inner}${unitSuffix})`
  }

  if (node.type === 'Factorial') {
    const inner = toPlainText(node.expr, 4)
    return `${inner}!`
  }

  const myPrecedence = PRECEDENCE[node.op]

  if (node.op === '^') {
    const leftStr = toPlainText(node.left, myPrecedence + 0.1)
    const rightStr = toPlainText(node.right, 0)
    const expr = `${leftStr} ^ ${rightStr}`
    return myPrecedence < parentPrecedence ? `(${expr})` : expr
  }

  const leftStr = toPlainText(node.left, myPrecedence)
  const rightPrecedence =
    node.op === '-' || node.op === '/' || node.op === 'mod'
      ? myPrecedence + 0.1
      : myPrecedence
  const rightStr = toPlainText(node.right, rightPrecedence)

  const expr = `${leftStr} ${node.op} ${rightStr}`
  return myPrecedence < parentPrecedence ? `(${expr})` : expr
}

export { toPlainText }
