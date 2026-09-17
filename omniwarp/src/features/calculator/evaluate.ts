import type { ASTNode, EvaluationResult, TrigFunctionName } from './types'

const UNDEFINED_RESULT: EvaluationResult = 'Undefined'

const TRIG_FUNCTIONS: Record<TrigFunctionName, (x: number) => number> = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
}

function evaluate(node: ASTNode): EvaluationResult {
  if (node.type === 'Number') {
    if (!Number.isFinite(node.value) || Number.isNaN(node.value)) {
      return UNDEFINED_RESULT
    }
    return node.value
  }

  if (node.type === 'Percent') {
    const val = evaluate(node.expr)
    if (typeof val !== 'number') return UNDEFINED_RESULT
    const result = val / 100
    if (!Number.isFinite(result) || Number.isNaN(result)) {
      return UNDEFINED_RESULT
    }
    if (Object.is(result, -0)) {
      return 0
    }
    return result
  }

  if (node.type === 'PercentAddSub') {
    const baseVal = evaluate(node.base)
    if (typeof baseVal !== 'number') return UNDEFINED_RESULT

    const percentVal = evaluate(node.percent)
    if (typeof percentVal !== 'number') return UNDEFINED_RESULT

    const delta = baseVal * (percentVal / 100)
    const result = node.op === '+' ? baseVal + delta : baseVal - delta
    if (!Number.isFinite(result) || Number.isNaN(result)) {
      return UNDEFINED_RESULT
    }
    if (Object.is(result, -0)) {
      return 0
    }
    return result
  }

  if (node.type === 'Sqrt') {
    const val = evaluate(node.expr)
    if (typeof val !== 'number') return UNDEFINED_RESULT
    if (val < 0) return UNDEFINED_RESULT
    const result = Math.sqrt(val)
    if (!Number.isFinite(result) || Number.isNaN(result)) {
      return UNDEFINED_RESULT
    }
    if (Object.is(result, -0)) {
      return 0
    }
    return result
  }

  if (node.type === 'Trig') {
    const val = evaluate(node.expr)
    if (typeof val !== 'number') return UNDEFINED_RESULT
    const radians = node.unit === 'deg' ? val * (Math.PI / 180) : val
    if (!Number.isFinite(radians) || Number.isNaN(radians)) {
      return UNDEFINED_RESULT
    }
    if (node.fn === 'tan' && Math.abs(Math.cos(radians)) < 1e-12) {
      return UNDEFINED_RESULT
    }
    const result = TRIG_FUNCTIONS[node.fn](radians)
    if (!Number.isFinite(result) || Number.isNaN(result)) {
      return UNDEFINED_RESULT
    }
    if (Object.is(result, -0)) {
      return 0
    }
    return result
  }

  if (node.type === 'Factorial') {
    const val = evaluate(node.expr)
    if (typeof val !== 'number') return UNDEFINED_RESULT
    const rounded = Math.round(val)
    const intVal = Math.abs(val - rounded) < 1e-10 ? rounded : val
    if (intVal < 0 || !Number.isInteger(intVal) || intVal > 170) {
      return UNDEFINED_RESULT
    }
    let result = 1
    for (let i = 2; i <= intVal; i++) {
      result *= i
    }
    if (!Number.isFinite(result) || Number.isNaN(result)) {
      return UNDEFINED_RESULT
    }
    if (Object.is(result, -0)) {
      return 0
    }
    return result
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
      case '^':
        result = Math.pow(left, right)
        break
      case 'mod': {
        if (right === 0) {
          return UNDEFINED_RESULT
        }
        const rem = left % right
        result = rem !== 0 && rem < 0 !== right < 0 ? rem + right : rem
        break
      }
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

export { UNDEFINED_RESULT, TRIG_FUNCTIONS, evaluate }
