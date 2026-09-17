import type { ASTNode, EvaluationResult } from './types'

const UNDEFINED_RESULT: EvaluationResult = 'Undefined'

function evaluate(node: ASTNode): EvaluationResult {
  if (node.type === 'Number') {
    if (!Number.isFinite(node.value) || Number.isNaN(node.value)) {
      return UNDEFINED_RESULT
    }
    return node.value
  }

  if (node.type === 'BinaryOp') {
    const left = evaluate(node.left)
    if (typeof left !== 'number') return UNDEFINED_RESULT

    const right = evaluate(node.right)
    if (typeof right !== 'number') return UNDEFINED_RESULT

    let result: number
    switch (node.op) {
      case '+':
        result = left + right
        break
      case '-':
        result = left - right
        break
      case '*':
        result = left * right
        break
      case '/':
        if (right === 0) {
          return UNDEFINED_RESULT
        }
        result = left / right
        break
    }

    if (!Number.isFinite(result) || Number.isNaN(result)) {
      return UNDEFINED_RESULT
    }

    if (Object.is(result, -0)) {
      return 0
    }

    return result
  }

  return UNDEFINED_RESULT
}

export { UNDEFINED_RESULT, evaluate }
