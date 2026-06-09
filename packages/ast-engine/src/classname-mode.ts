import type { JSXOpeningElement } from "@babel/types";
import * as t from "@babel/types";

export type ClassNameMode =
  | "literal-only"
  | "cn-basic"
  | "cn-conditional"
  | "classnames-static"
  | "unsupported";

const CN_CALLEES = new Set(["cn", "clsx"]);
const CLASSNAMES_CALLEES = new Set(["classnames", "clsx", "cn"]);

function isCnCallee(call: t.CallExpression): boolean {
  return (
    t.isIdentifier(call.callee) &&
    CN_CALLEES.has(call.callee.name)
  );
}

function isClassnamesCallee(call: t.CallExpression): boolean {
  return (
    t.isIdentifier(call.callee) &&
    CLASSNAMES_CALLEES.has(call.callee.name)
  );
}

type CallArg = t.CallExpression["arguments"][number];

function isExpressionArg(arg: CallArg): arg is t.Expression {
  return t.isExpression(arg);
}

function isConditionalTailwindArg(arg: CallArg): arg is t.LogicalExpression {
  return (
    t.isLogicalExpression(arg) &&
    arg.operator === "&&" &&
    t.isStringLiteral(arg.right)
  );
}

function isStaticObjectArg(arg: CallArg): arg is t.ObjectExpression {
  if (!t.isObjectExpression(arg)) {
    return false;
  }
  return arg.properties.every((prop) => {
    if (!t.isObjectProperty(prop) || prop.computed) {
      return false;
    }
    const keyOk =
      t.isIdentifier(prop.key) ||
      t.isStringLiteral(prop.key);
    if (!keyOk) {
      return false;
    }
    return !t.isStringLiteral(prop.value);
  });
}

function objectArgClassKeys(obj: t.ObjectExpression): string[] {
  const keys: string[] = [];
  for (const prop of obj.properties) {
    if (!t.isObjectProperty(prop)) {
      continue;
    }
    if (t.isIdentifier(prop.key)) {
      keys.push(prop.key.name);
    } else if (t.isStringLiteral(prop.key)) {
      keys.push(prop.key.value);
    }
  }
  return keys;
}

export function classifyClassNameCall(call: t.CallExpression): ClassNameMode {
  const args = call.arguments.filter(isExpressionArg);
  if (args.length === 0) {
    return "unsupported";
  }

  const hasObject = args.some((a) => isStaticObjectArg(a));
  if (hasObject && isClassnamesCallee(call)) {
    if (args.every((a) => t.isStringLiteral(a) || isStaticObjectArg(a))) {
      return "classnames-static";
    }
    return "unsupported";
  }

  if (!isCnCallee(call)) {
    return "unsupported";
  }

  if (args.every((a) => t.isStringLiteral(a))) {
    return "cn-basic";
  }
  if (args.every((a) => t.isStringLiteral(a) || isConditionalTailwindArg(a))) {
    return "cn-conditional";
  }
  return "unsupported";
}

export function classifyHostClassNameMode(opening: JSXOpeningElement): ClassNameMode {
  for (const attr of opening.attributes) {
    if (!t.isJSXAttribute(attr) || !t.isJSXIdentifier(attr.name, { name: "className" })) {
      continue;
    }
    if (t.isStringLiteral(attr.value)) {
      return "literal-only";
    }
    if (
      t.isJSXExpressionContainer(attr.value) &&
      t.isCallExpression(attr.value.expression)
    ) {
      return classifyClassNameCall(attr.value.expression);
    }
    return "unsupported";
  }
  return "literal-only";
}

export function readFlattenedClassName(
  opening: JSXOpeningElement,
  mode: ClassNameMode,
): string | undefined {
  for (const attr of opening.attributes) {
    if (!t.isJSXAttribute(attr) || !t.isJSXIdentifier(attr.name, { name: "className" })) {
      continue;
    }
    if (t.isStringLiteral(attr.value)) {
      return attr.value.value;
    }
    if (!t.isJSXExpressionContainer(attr.value) || !t.isCallExpression(attr.value.expression)) {
      return undefined;
    }
    const call = attr.value.expression;
    const parts: string[] = [];
    for (const arg of call.arguments.filter(isExpressionArg)) {
      if (t.isStringLiteral(arg)) {
        parts.push(arg.value);
      } else if (isConditionalTailwindArg(arg) && t.isStringLiteral(arg.right)) {
        parts.push(arg.right.value);
      } else if (isStaticObjectArg(arg)) {
        parts.push(...objectArgClassKeys(arg));
      }
    }
    if (parts.length === 0) {
      return undefined;
    }
    if (
      mode === "literal-only" ||
      mode === "cn-basic" ||
      mode === "cn-conditional" ||
      mode === "classnames-static"
    ) {
      return parts.join(" ");
    }
    return undefined;
  }
  return undefined;
}
