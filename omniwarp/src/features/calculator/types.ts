type Token =
  | { type: 'NUMBER'; value: number }
  | { type: 'PLUS' | 'MINUS' | 'MULTIPLY' | 'DIVIDE' | 'POWER' }
  | { type: 'LPAREN' | 'RPAREN' }

type BinaryOperator = '+' | '-' | '*' | '/' | '^'

type ASTNode =
  | { type: 'Number'; value: number }
  | { type: 'BinaryOp'; op: BinaryOperator; left: ASTNode; right: ASTNode }

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
