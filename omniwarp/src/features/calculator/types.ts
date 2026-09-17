type Token =
  | { type: 'NUMBER'; value: number }
  | { type: 'PLUS' | 'MINUS' | 'MULTIPLY' | 'DIVIDE' | 'POWER' | 'PERCENT' }
  | { type: 'LPAREN' | 'RPAREN' | 'SQRT' }

type BinaryOperator = '+' | '-' | '*' | '/' | '^'

type ASTNode =
  | { type: 'Number'; value: number }
  | { type: 'BinaryOp'; op: BinaryOperator; left: ASTNode; right: ASTNode }
  | { type: 'Percent'; expr: ASTNode }
  | { type: 'PercentAddSub'; op: '+' | '-'; base: ASTNode; percent: ASTNode }
  | { type: 'Sqrt'; expr: ASTNode }

type EvaluationResult = number | 'Undefined'

type CalculatorResult =
  | { show: true; result: string; latex: string }
  | { show: false }

export type {
  Token,
  BinaryOperator,
  ASTNode,
  EvaluationResult,
  CalculatorResult,
}
