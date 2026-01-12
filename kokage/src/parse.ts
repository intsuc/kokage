import { type FunctionExpression, parse, type Options } from "acorn";

const options: Options = {
  ecmaVersion: "latest",
  sourceType: "module",
};

export function parseFunction(f: Function): FunctionExpression {
  const input = `(${f.toString()})`;
  console.debug(input);
  const program = parse(input, options);
  const expressionStatement = program.body[0]!
  if (expressionStatement.type !== "ExpressionStatement") {
    throw new Error("Expected an expression statement");
  }
  const expression = expressionStatement.expression;
  if (expression.type !== "FunctionExpression") {
    throw new Error("Expected a function expression");
  }
  return expression;
}
