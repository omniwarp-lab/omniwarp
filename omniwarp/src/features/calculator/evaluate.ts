import type {
  ASTNode,
  Complex,
  EvaluationResult,
  TrigFunctionName,
} from './types'

const UNDEFINED_RESULT = 'Undefined' as const

const TRIG_FUNCTIONS: Record<TrigFunctionName, (x: number) => number> = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
}

function makeComplex(re: number, im: number): Complex | 'Undefined' {
  if (
    !Number.isFinite(re) ||
    Number.isNaN(re) ||
    !Number.isFinite(im) ||
    Number.isNaN(im)
  ) {
    return UNDEFINED_RESULT
  }
  const cleanRe = Math.abs(re) < 1e-12 || Object.is(re, -0) ? 0 : re
  const cleanIm = Math.abs(im) < 1e-12 || Object.is(im, -0) ? 0 : im
  return { re: cleanRe, im: cleanIm }
}

function evaluate(node: ASTNode): EvaluationResult {
  if (node.type === 'Number') {
    return makeComplex(node.value, 0)
  }

  if (node.type === 'Percent') {
    const val = evaluate(node.expr)
    if (val === 'Undefined') return UNDEFINED_RESULT
    const complex = typeof val === 'number' ? { re: val, im: 0 } : val
    return makeComplex(complex.re / 100, complex.im / 100)
  }

  if (node.type === 'PercentAddSub') {
    const baseVal = evaluate(node.base)
    if (baseVal === 'Undefined') return UNDEFINED_RESULT
    const base = typeof baseVal === 'number' ? { re: baseVal, im: 0 } : baseVal

    const percentVal = evaluate(node.percent)
    if (percentVal === 'Undefined') return UNDEFINED_RESULT
    const percent =
      typeof percentVal === 'number' ? { re: percentVal, im: 0 } : percentVal

    const pctRe = percent.re / 100
    const pctIm = percent.im / 100
    const deltaRe = base.re * pctRe - base.im * pctIm
    const deltaIm = base.re * pctIm + base.im * pctRe

    return node.op === '+'
      ? makeComplex(base.re + deltaRe, base.im + deltaIm)
      : makeComplex(base.re - deltaRe, base.im - deltaIm)
  }

  if (node.type === 'Sqrt') {
    const val = evaluate(node.expr)
    if (val === 'Undefined') return UNDEFINED_RESULT
    const complex = typeof val === 'number' ? { re: val, im: 0 } : val

    if (complex.im === 0) {
      if (complex.re >= 0) {
        return makeComplex(Math.sqrt(complex.re), 0)
      }
      return makeComplex(0, Math.sqrt(-complex.re))
    }

    const r = Math.hypot(complex.re, complex.im)
    const re = Math.sqrt((r + complex.re) / 2)
    const sgn = complex.im >= 0 ? 1 : -1
    const im = sgn * Math.sqrt((r - complex.re) / 2)
    return makeComplex(re, im)
  }

  if (node.type === 'Trig') {
    const val = evaluate(node.expr)
    if (val === 'Undefined') return UNDEFINED_RESULT
    const complex = typeof val === 'number' ? { re: val, im: 0 } : val
    if (complex.im !== 0) return UNDEFINED_RESULT

    const radians =
      node.unit === 'deg' ? complex.re * (Math.PI / 180) : complex.re
    if (!Number.isFinite(radians) || Number.isNaN(radians)) {
      return UNDEFINED_RESULT
    }
    if (node.fn === 'tan' && Math.abs(Math.cos(radians)) < 1e-12) {
      return UNDEFINED_RESULT
    }
    const result = TRIG_FUNCTIONS[node.fn](radians)
    return makeComplex(result, 0)
  }

  if (node.type === 'Factorial') {
    const val = evaluate(node.expr)
    if (val === 'Undefined') return UNDEFINED_RESULT
    const complex = typeof val === 'number' ? { re: val, im: 0 } : val
    if (complex.im !== 0) return UNDEFINED_RESULT

    const realVal = complex.re
    const rounded = Math.round(realVal)
    const intVal = Math.abs(realVal - rounded) < 1e-10 ? rounded : realVal
    if (intVal < 0 || !Number.isInteger(intVal) || intVal > 170) {
      return UNDEFINED_RESULT
    }
    let result = 1
    for (let i = 2; i <= intVal; i++) {
      result *= i
    }
    return makeComplex(result, 0)
  }

  if (node.type === 'BinaryOp') {
    const leftVal = evaluate(node.left)
    if (leftVal === 'Undefined') return UNDEFINED_RESULT
    const left = typeof leftVal === 'number' ? { re: leftVal, im: 0 } : leftVal

    const rightVal = evaluate(node.right)
    if (rightVal === 'Undefined') return UNDEFINED_RESULT
    const right =
      typeof rightVal === 'number' ? { re: rightVal, im: 0 } : rightVal

    switch (node.op) {
      case '+':
        return makeComplex(left.re + right.re, left.im + right.im)
      case '-':
        return makeComplex(left.re - right.re, left.im - right.im)
      case '*': {
        const re = left.re * right.re - left.im * right.im
        const im = left.re * right.im + left.im * right.re
        return makeComplex(re, im)
      }
      case '/': {
        const denom = right.re * right.re + right.im * right.im
        if (denom === 0) {
          return UNDEFINED_RESULT
        }
        const re = (left.re * right.re + left.im * right.im) / denom
        const im = (left.im * right.re - left.re * right.im) / denom
        return makeComplex(re, im)
      }
      case '^': {
        if (right.im === 0) {
          if (left.im === 0) {
            if (left.re >= 0) {
              return makeComplex(Math.pow(left.re, right.re), 0)
            }
            if (Number.isInteger(right.re)) {
              return makeComplex(Math.pow(left.re, right.re), 0)
            }
            const r = -left.re
            const p = right.re
            const mag = Math.pow(r, p)
            const theta = Math.PI * p
            return makeComplex(mag * Math.cos(theta), mag * Math.sin(theta))
          }
        }
        if (left.re === 0 && left.im === 0) {
          if (right.re > 0 && right.im === 0) {
            return makeComplex(0, 0)
          }
          return UNDEFINED_RESULT
        }
        const r = Math.hypot(left.re, left.im)
        const theta = Math.atan2(left.im, left.re)
        const logR = Math.log(r)
        const newR = right.re * logR - right.im * theta
        const newTheta = right.im * logR + right.re * theta
        const mag = Math.exp(newR)
        return makeComplex(mag * Math.cos(newTheta), mag * Math.sin(newTheta))
      }
      case 'mod': {
        if (left.im !== 0 || right.im !== 0 || right.re === 0) {
          return UNDEFINED_RESULT
        }
        const rem = left.re % right.re
        const result =
          rem !== 0 && rem < 0 !== right.re < 0 ? rem + right.re : rem
        return makeComplex(result, 0)
      }
    }
  }

  return UNDEFINED_RESULT
}

export { UNDEFINED_RESULT, TRIG_FUNCTIONS, evaluate }
