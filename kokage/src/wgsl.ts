import type { FunctionExpression } from "acorn";

export function emitWgslFunction(expression: FunctionExpression): string {
  let output = "";
  output += "fn ";
  output += expression.id!.name;
  output += "(";
  for (let i = 0; i < expression.params.length; i++) {
    if (i > 0) output += ", ";
    const param = expression.params[i]!;
    switch (param.type) {
      case "Identifier": {
        output += param.name;
        output += ": ";
        output += "u32"; // TODO: parameter type
        break;
      }
      default: {
        throw new Error(`Unsupported parameter type: ${param.type}`);
      }
    }
  }
  output += ") -> ";
  output += "u32"; // TODO: return type
  output += " {\n";
  output += "  return x + 1;\n"; // TODO: function body
  output += "}\n";
  return output;
}
