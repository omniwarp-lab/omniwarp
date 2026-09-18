type Token =
  | { type: 'NUMBER'; value: number }
  | {
      type:
        | 'PLUS'
        | 'MINUS'
        | 'MULTIPLY'
        | 'DIVIDE'
        | 'POWER'
        | 'PERCENT'
        | 'FACTORIAL'
        | 'MOD'
    }
  | { type: 'LPAREN' | 'RPAREN' | 'SQRT' }
  | { type: 'TRIG'; fn: TrigFunctionName; unit: AngleUnit | null }
  | { type: 'ANGLE_UNIT'; unit: AngleUnit }

type BinaryOperator = '+' | '-' | '*' | '/' | '^' | 'mod'

type TrigFunctionName = 'sin' | 'cos' | 'tan'
type AngleUnit = 'deg' | 'rad'

type ASTNode =
  | { type: 'Number'; value: number }
  | { type: 'BinaryOp'; op: BinaryOperator; left: ASTNode; right: ASTNode }
  | { type: 'Percent'; expr: ASTNode }
  | { type: 'PercentAddSub'; op: '+' | '-'; base: ASTNode; percent: ASTNode }
  | { type: 'Sqrt'; expr: ASTNode }
  | { type: 'Trig'; fn: TrigFunctionName; unit: AngleUnit; expr: ASTNode }
  | { type: 'Factorial'; expr: ASTNode }

interface Complex {
  re: number
  im: number
}

type EvaluationResult = number | Complex | 'Undefined' | 'Overflow'

type CalculatorResult =
  | { show: true; result: string; latex: string }
  | { show: false }

type CalculatorActivationMode = 'auto' | 'requireEquals'

export type {
  Token,
  BinaryOperator,
  TrigFunctionName,
  AngleUnit,
  ASTNode,
  Complex,
  EvaluationResult,
  CalculatorResult,
  CalculatorActivationMode,
}
