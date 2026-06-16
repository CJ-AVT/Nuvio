import * as t from "@babel/types";
import type { ClassNameMode } from "./classname-mode.js";
import { classifyClassNameCall } from "./classname-mode.js";

export type ClassNameBinding = {
  read: () => string;
  write: (next: string) => void;
};

type CallArg = t.CallExpression["arguments"][number];

function isExpressionArg(arg: CallArg): arg is t.Expression {
  return t.isExpression(arg);
}

function isStaticObjectArg(arg: CallArg): arg is t.ObjectExpression {
  if (!t.isObjectExpression(arg)) {
    return false;
  }
  return arg.properties.every((prop) => {
    if (!t.isObjectProperty(prop) || prop.computed) {
      return false;
    }
    return (
      (t.isIdentifier(prop.key) || t.isStringLiteral(prop.key)) &&
      !t.isStringLiteral(prop.value)
    );
  });
}

function readCallFlattened(call: t.CallExpression): string {
  const parts: string[] = [];
  for (const arg of call.arguments.filter(isExpressionArg)) {
    if (t.isStringLiteral(arg)) {
      parts.push(arg.value);
    } else if (
      t.isLogicalExpression(arg) &&
      arg.operator === "&&" &&
      t.isStringLiteral(arg.right)
    ) {
      parts.push(arg.right.value);
    } else if (isStaticObjectArg(arg)) {
      for (const prop of arg.properties) {
        if (!t.isObjectProperty(prop)) {
          continue;
        }
        if (t.isIdentifier(prop.key)) {
          parts.push(prop.key.name);
        } else if (t.isStringLiteral(prop.key)) {
          parts.push(prop.key.value);
        }
      }
    }
  }
  return parts.join(" ");
}

function writeCnBasic(call: t.CallExpression, next: string): void {
  call.arguments = [t.stringLiteral(next)];
}

function writeCnConditional(call: t.CallExpression, next: string): void {
  const newTokenList = next.trim().split(/\s+/).filter(Boolean);
  const conditionalArgs: t.Expression[] = [];
  const used = new Set<string>();

  for (const arg of call.arguments.filter(isExpressionArg)) {
    if (
      t.isLogicalExpression(arg) &&
      arg.operator === "&&" &&
      t.isStringLiteral(arg.right)
    ) {
      const oldTokens = arg.right.value.split(/\s+/).filter(Boolean);
      const kept = newTokenList.filter((tok) => oldTokens.includes(tok));
      for (const tok of kept) {
        used.add(tok);
      }
      arg.right = t.stringLiteral(kept.join(" "));
      conditionalArgs.push(arg);
    }
  }

  const baseTokens = newTokenList.filter((tok) => !used.has(tok));
  const baseStr = baseTokens.join(" ");

  const literalArgs = call.arguments.filter(
    (a): a is t.StringLiteral => isExpressionArg(a) && t.isStringLiteral(a),
  );
  if (literalArgs.length > 0) {
    (literalArgs[0] as t.StringLiteral).value = baseStr;
    call.arguments = [literalArgs[0]!, ...conditionalArgs];
  } else {
    call.arguments = [t.stringLiteral(baseStr), ...conditionalArgs];
  }
}

function writeClassnamesStatic(call: t.CallExpression, next: string): void {
  const newTokenList = next.trim().split(/\s+/).filter(Boolean);
  const objectArgs = call.arguments.filter(
    (a): a is t.ObjectExpression => isExpressionArg(a) && isStaticObjectArg(a),
  );
  const objectKeys = new Set<string>();
  for (const obj of objectArgs) {
    if (!isStaticObjectArg(obj)) {
      continue;
    }
    for (const prop of obj.properties) {
      if (!t.isObjectProperty(prop)) {
        continue;
      }
      if (t.isIdentifier(prop.key)) {
        objectKeys.add(prop.key.name);
      } else if (t.isStringLiteral(prop.key)) {
        objectKeys.add(prop.key.value);
      }
    }
  }

  const baseTokens = newTokenList.filter((tok) => !objectKeys.has(tok));
  const baseStr = baseTokens.join(" ");

  const nonObjectArgs = call.arguments.filter(
    (a): a is t.StringLiteral =>
      isExpressionArg(a) && !isStaticObjectArg(a) && t.isStringLiteral(a),
  );
  if (nonObjectArgs.length > 0) {
    (nonObjectArgs[0] as t.StringLiteral).value = baseStr;
    call.arguments = [nonObjectArgs[0]!, ...objectArgs];
  } else if (baseStr.length > 0) {
    call.arguments = [t.stringLiteral(baseStr), ...objectArgs];
  } else {
    call.arguments = [...objectArgs];
  }
}

export function getClassNameBinding(
  opening: t.JSXOpeningElement,
  classNameMode: ClassNameMode,
): ClassNameBinding | null {
  for (const attr of opening.attributes) {
    if (!t.isJSXAttribute(attr) || !t.isJSXIdentifier(attr.name, { name: "className" })) {
      continue;
    }
    if (t.isStringLiteral(attr.value)) {
      const literal = attr.value;
      return {
        read: () => literal.value,
        write: (next) => {
          attr.value = t.stringLiteral(next);
        },
      };
    }
    if (
      !t.isJSXExpressionContainer(attr.value) ||
      !t.isCallExpression(attr.value.expression)
    ) {
      return null;
    }
    const call = attr.value.expression;
    const detected = classifyClassNameCall(call);

    if (classNameMode === "cn-basic" && detected === "cn-basic") {
      return {
        read: () => readCallFlattened(call),
        write: (next) => writeCnBasic(call, next),
      };
    }
    if (classNameMode === "cn-conditional" && detected === "cn-conditional") {
      return {
        read: () => readCallFlattened(call),
        write: (next) => writeCnConditional(call, next),
      };
    }
    if (classNameMode === "classnames-static" && detected === "classnames-static") {
      return {
        read: () => readCallFlattened(call),
        write: (next) => writeClassnamesStatic(call, next),
      };
    }
    if (
      classNameMode === "cn-basic" &&
      detected === "cn-conditional"
    ) {
      return null;
    }
    return null;
  }
  return {
    read: () => "",
    write: (next) => {
      opening.attributes.push(
        t.jsxAttribute(t.jsxIdentifier("className"), t.stringLiteral(next)),
      );
    },
  };
}
