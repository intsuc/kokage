import type { Expression, FunctionExpression, Statement } from "acorn";

type WgslType =
  | { type: "AbstractInt" }
  | { type: "AbstractFloat" }
  | { type: "bool" }
  | { type: "i32" }
  | { type: "u32" }
  | { type: "f32" }
  | { type: "f16" }
  | { type: "Union", variants: WgslType[] }
  ;

const WgslType = {
  AbstractInt: { type: "AbstractInt" } as WgslType,
  AbstractFloat: { type: "AbstractFloat" } as WgslType,
  bool: { type: "bool" } as WgslType,
  i32: { type: "i32" } as WgslType,
  u32: { type: "u32" } as WgslType,
  f32: { type: "f32" } as WgslType,
  f16: { type: "f16" } as WgslType,
  Union: (...variants: WgslType[]) => ({ type: "Union", variants } as WgslType),
} as const;

const ScalerType: WgslType = WgslType.Union(
  WgslType.bool,
  WgslType.i32,
  WgslType.u32,
  WgslType.f32,
  WgslType.f16,
);

type WgslCompoundAssignmentOperator =
  | "+="
  | "-="
  | "*="
  | "/="
  | "%="
  | "&="
  | "|="
  | "^="
  | ">>="
  | "<<="
  ;

type WgslStatement =
  | { type: "Assignment", lhs: WgslExpression | "_", operator: "=" | WgslCompoundAssignmentOperator, rhs: WgslExpression }
  | { type: "Increment", lhs: WgslExpression }
  | { type: "Decrement", lhs: WgslExpression }
  | { type: "Return", expression?: WgslExpression }
  ;

type WgslExpression =
  // https://www.w3.org/TR/WGSL/#literal-expressions
  | { type: "BoolLiteral", value: boolean }
  | { type: "I32Literal", value: number }
  | { type: "U32Literal", value: number }
  | { type: "F32Literal", value: number }
  | { type: "F16Literal", value: number }
  // https://www.w3.org/TR/WGSL/#vector-access-expr
  // TODO
  // https://www.w3.org/TR/WGSL/#matrix-access-expr
  // TODO
  // https://www.w3.org/TR/WGSL/#array-access-expr
  // TODO
  // https://www.w3.org/TR/WGSL/#struct-access-expr
  // TODO
  // https://www.w3.org/TR/WGSL/#logical-expr
  | { type: "LogicalNegation", expression: WgslExpression }
  | { type: "ShortCircuitingOr", lhs: WgslExpression, rhs: WgslExpression }
  | { type: "ShortCircuitingAnd", lhs: WgslExpression, rhs: WgslExpression }
  | { type: "LogicalOr", lhs: WgslExpression, rhs: WgslExpression }
  | { type: "LogicalAnd", lhs: WgslExpression, rhs: WgslExpression }
  // https://www.w3.org/TR/WGSL/#arithmetic-expr
  | { type: "Negation", expression: WgslExpression }
  | { type: "Addition", lhs: WgslExpression, rhs: WgslExpression }
  | { type: "Subtraction", lhs: WgslExpression, rhs: WgslExpression }
  | { type: "Multiplication", lhs: WgslExpression, rhs: WgslExpression }
  | { type: "Division", lhs: WgslExpression, rhs: WgslExpression }
  | { type: "Remainder", lhs: WgslExpression, rhs: WgslExpression }
  | { type: "Equality", lhs: WgslExpression, rhs: WgslExpression }
  | { type: "Inequality", lhs: WgslExpression, rhs: WgslExpression }
  | { type: "LessThan", lhs: WgslExpression, rhs: WgslExpression }
  | { type: "GreaterThan", lhs: WgslExpression, rhs: WgslExpression }
  | { type: "LessThanOrEqual", lhs: WgslExpression, rhs: WgslExpression }
  | { type: "GreaterThanOrEqual", lhs: WgslExpression, rhs: WgslExpression }
  // https://www.w3.org/TR/WGSL/#bit-expr
  | { type: "BitwiseComplement", expression: WgslExpression }
  | { type: "BitwiseOr", lhs: WgslExpression, rhs: WgslExpression }
  | { type: "BitwiseAnd", lhs: WgslExpression, rhs: WgslExpression }
  | { type: "ShiftLeft", lhs: WgslExpression, rhs: WgslExpression }
  | { type: "ShiftRight", lhs: WgslExpression, rhs: WgslExpression }
  // https://www.w3.org/TR/WGSL/#function-call-expr
  | { type: "FunctionCall", callee: string, arguments: WgslExpression[] }
  // https://www.w3.org/TR/WGSL/#var-identifier-expr
  | { type: "Identifier", name: string }
  // https://www.w3.org/TR/WGSL/#address-of-expr
  // TODO
  // https://www.w3.org/TR/WGSL/#indirection-expr
  // TODO
  ;

const builtinFunctions: Record<string, { params: WgslType[], result: WgslType }> = {
  "bool": { params: [ScalerType], result: WgslType.bool },
  "f16": { params: [ScalerType], result: WgslType.f16 },
  "f32": { params: [ScalerType], result: WgslType.f32 },
  "i32": { params: [ScalerType], result: WgslType.i32 },
  "u32": { params: [ScalerType], result: WgslType.u32 },
};

function subtype(type1: WgslType, type2: WgslType): boolean {
  // TODO
  if (type1.type === type2.type) {
    return true;
  }
  if (type2.type === "Union") {
    return type2.variants.some(variant => subtype(type1, variant));
  }
  return false;
}

function elaborateStatement(statement: Statement): WgslStatement {
  switch (statement.type) {
    // case "BlockStatement": {
    //   for (const child of statement.body) {
    //     elaborateStatement(child);
    //   }
    //   break;
    // }
    case "ReturnStatement": {
      console.debug("ReturnStatement", statement);
      if (statement.argument) {
        const argument = synthExpression(statement.argument);
        return { type: "Return", expression: argument.expression };
      } else {
        return { type: "Return" };
      }
    }
    default: {
      throw new Error(`Unsupported statement type: ${statement.type}`);
    }
  }
}

function synthExpression(expression: Expression): { expression: WgslExpression, type: WgslType } {
  switch (expression.type) {
    case "BinaryExpression": {
      console.debug("Synth BinaryExpression", expression);
      switch (expression.operator) {
        case "+": {
          if (expression.left.type === "PrivateIdentifier") throw new Error("Private identifiers are not supported");
          const lhs = synthExpression(expression.left);
          const rhs = checkExpression(expression.right, lhs.type);
          return {
            expression: { type: "Addition", lhs: lhs.expression, rhs },
            type: lhs.type,
          };
        }
        default: {
          throw new Error(`Unsupported binary operator: ${expression.operator}`);
        }
      }
    }
    case "CallExpression": {
      console.debug("Synth CallExpression", expression);
      if (expression.callee.type === "Super") throw new Error("Super calls are not supported");
      const callee = synthExpression(expression.callee);
      console.log("CALLEE", callee);
      if (callee.expression.type !== "Identifier") throw new Error("Only identifier callees are supported");
      const func = builtinFunctions[callee.expression.name];
      if (!func) throw new Error(`Unknown function: ${callee.expression.name}`);
      if (func.params.length !== expression.arguments.length) throw new Error(`Function ${callee.expression.name} expects ${func.params.length} arguments, got ${expression.arguments.length}`);
      const args: WgslExpression[] = [];
      for (let i = 0; i < expression.arguments.length; i++) {
        const argument = expression.arguments[i]!;
        if (argument.type === "SpreadElement") throw new Error("Spread elements are not supported");
        const arg = checkExpression(argument, func.params[i]!);
        args.push(arg);
      }
      return {
        expression: { type: "FunctionCall", callee: callee.expression.name, arguments: args },
        type: func.result,
      };
    };
    case "Identifier": {
      console.debug("Synth Identifier", expression);
      return {
        expression: { type: "Identifier", name: expression.name },
        type: { type: "u32" }, // TODO: lookup identifier type
      }
    }
    case "Literal": {
      console.debug("Synth Literal", expression);
      return {
        expression: { type: "U32Literal", value: expression.value as number },
        type: { type: "u32" },
      }
    }
    default: {
      throw new Error(`Unsupported expression type: ${expression.type}`);
    }
  }
}

function checkExpression(expression: Expression, expectedType: WgslType): WgslExpression {
  switch (expression.type) {
    // case "CallExpression": {
    // }
    // case "Identifier": {
    //   console.debug("Check Identifier", expression);
    //   return { type: "Identifier", name: expression.name };
    // }
    // case "Literal": {
    //   console.debug("Check Literal", expression);
    //   switch (expectedType.type) {
    //     case "bool": return { type: "BoolLiteral", value: expression.value as boolean };
    //     case "i32": return { type: "I32Literal", value: expression.value as number };
    //     case "u32": return { type: "U32Literal", value: expression.value as number };
    //     case "f32": return { type: "F32Literal", value: expression.value as number };
    //     case "f16": return { type: "F16Literal", value: expression.value as number };
    //     default: throw new Error(`Unsupported expected type for literal: ${expectedType.type}`);
    //   }
    // }
    default: {
      const synth = synthExpression(expression);
      if (!subtype(synth.type, expectedType)) {
        throw new Error(`Type mismatch: expected ${expectedType}, got ${synth.type}`);
      }
      return synth.expression;
    }
  }
}

function emitWgslStatement(statement: WgslStatement): string {
  switch (statement.type) {
    case "Return": {
      if (statement.expression) {
        return `return ${emitWgslExpression(statement.expression)};`;
      } else {
        return "return;";
      }
    }
    default: {
      throw new Error(`Unsupported statement type: ${statement.type}`);
    }
  }
}

function emitWgslExpression(expression: WgslExpression): string {
  switch (expression.type) {
    case "U32Literal": {
      return expression.value.toString();
    }
    case "Addition": {
      return `(${emitWgslExpression(expression.lhs)} + ${emitWgslExpression(expression.rhs)})`;
    }
    case "FunctionCall": {
      const args = expression.arguments.map(arg => emitWgslExpression(arg)).join(", ");
      return `${expression.callee}(${args})`;
    }
    case "Identifier": {
      return expression.name;
    }
    default: {
      throw new Error(`Unsupported expression type: ${expression.type}`);
    }
  }
}

export function emitWgslFunction(expression: FunctionExpression): string {
  console.debug(expression);
  const statements: WgslStatement[] = [];
  for (const statement of expression.body.body) {
    statements.push(elaborateStatement(statement));
  }

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
  for (const statement of statements) {
    output += "  ";
    output += emitWgslStatement(statement);
    output += "\n";
  }
  output += "}\n";
  return output;
}
