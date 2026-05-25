import { createRequire } from "node:module";
import path from "node:path";
import { parse } from "@babel/parser";
import type { NodePath, Visitor } from "@babel/traverse";
import * as t from "@babel/types";
import prettier from "prettier";
import { twMerge } from "tailwind-merge";
import type { PatchOp } from "@nuvio/shared";
import { validateTailwindFragment } from "./tailwind-whitelist.js";

const require = createRequire(import.meta.url);
const traverse = require("@babel/traverse").default as (ast: t.File, visitor: Visitor) => void;
const generate = require("@babel/generator").default as (
  ast: t.Node,
  opts?: Record<string, unknown>,
) => { code: string };

function findHostOpening(
  ast: t.File,
  hostId: string,
): NodePath<t.JSXOpeningElement> | null {
  let found: NodePath<t.JSXOpeningElement> | null = null;
  traverse(ast, {
    JSXOpeningElement(path: NodePath<t.JSXOpeningElement>) {
      for (const attr of path.node.attributes) {
        if (!t.isJSXAttribute(attr)) {
          continue;
        }
        if (!t.isJSXIdentifier(attr.name, { name: "data-nuvio-id" })) {
          continue;
        }
        if (t.isStringLiteral(attr.value) && attr.value.value === hostId) {
          found = path;
          path.stop();
          return;
        }
      }
    },
  });
  return found;
}

function applySetText(openingPath: NodePath<t.JSXOpeningElement>, text: string): void {
  const parent = openingPath.parentPath;
  if (!parent?.isJSXElement()) {
    throw new Error("Host is not a JSX element");
  }
  const jsx = parent as NodePath<t.JSXElement>;
  const { children } = jsx.node;

  if (children.length === 0) {
    jsx.node.children = [t.jsxText(text)];
    return;
  }

  if (children.length === 1 && t.isJSXText(children[0])) {
    children[0].value = text;
    return;
  }

  if (
    children.length === 1 &&
    t.isJSXExpressionContainer(children[0]) &&
    t.isStringLiteral(children[0].expression)
  ) {
    children[0].expression.value = text;
    return;
  }

  // Replace rich / mixed children with a single text node (drops inline markup).
  jsx.node.children = [t.jsxText(text)];
}

function readStringLiteralClassName(opening: t.JSXOpeningElement): string | null {
  for (const attr of opening.attributes) {
    if (t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name, { name: "className" })) {
      if (t.isStringLiteral(attr.value)) {
        return attr.value.value;
      }
      return null;
    }
  }
  return "";
}

function parentSupportsLayoutMoves(parentOpening: t.JSXOpeningElement): boolean {
  const cls = readStringLiteralClassName(parentOpening);
  if (cls === null) {
    return false;
  }
  return /\b(flex|inline-flex|grid|inline-grid)\b/.test(cls) || /\b(flex-|grid-)/.test(cls);
}

function collectJsxElementChildIndices(parent: t.JSXElement): number[] {
  const indices: number[] = [];
  parent.children.forEach((child, i) => {
    if (t.isJSXElement(child)) {
      indices.push(i);
    }
  });
  return indices;
}

function applyMoveSibling(
  openingPath: NodePath<t.JSXOpeningElement>,
  direction: "up" | "down",
): void {
  const hostPath = openingPath.parentPath;
  if (!hostPath?.isJSXElement()) {
    throw new Error("Host is not a JSX element");
  }
  const parentPath = hostPath.parentPath;
  if (!parentPath?.isJSXElement()) {
    throw new Error("Move requires a JSX element parent (same flex/grid container)");
  }
  const parentOpening = parentPath.node.openingElement;
  if (!parentSupportsLayoutMoves(parentOpening)) {
    throw new Error(
      "Parent must use flex or grid layout (string-literal className with flex/grid utilities)",
    );
  }

  const parent = parentPath.node;
  const jsxIndices = collectJsxElementChildIndices(parent);
  const hostIndex = parent.children.indexOf(hostPath.node);
  if (hostIndex < 0) {
    throw new Error("Host not found in parent children");
  }
  const pos = jsxIndices.indexOf(hostIndex);
  if (pos < 0) {
    throw new Error("Host must be a direct JSX element child of the layout parent");
  }
  if (direction === "up" && pos === 0) {
    throw new Error("Already the first sibling");
  }
  if (direction === "down" && pos === jsxIndices.length - 1) {
    throw new Error("Already the last sibling");
  }

  const swapIndex =
    direction === "up" ? jsxIndices[pos - 1]! : jsxIndices[pos + 1]!;
  const hostNode = parent.children[hostIndex]!;
  parent.children[hostIndex] = parent.children[swapIndex]!;
  parent.children[swapIndex] = hostNode;
}

function applySetHidden(openingPath: NodePath<t.JSXOpeningElement>, hidden: boolean): void {
  if (hidden) {
    applyMergeClassName(openingPath, "hidden");
    return;
  }
  const opening = openingPath.node;
  let clsAttr: t.JSXAttribute | undefined;
  for (const attr of opening.attributes) {
    if (t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name, { name: "className" })) {
      clsAttr = attr;
      break;
    }
  }
  if (!clsAttr || !t.isStringLiteral(clsAttr.value)) {
    return;
  }
  const tokens = clsAttr.value.value.split(/\s+/).filter((tok) => tok && tok !== "hidden");
  clsAttr.value = t.stringLiteral(twMerge(tokens.join(" ")));
}

function collectNuvioIds(ast: t.File): Set<string> {
  const ids = new Set<string>();
  traverse(ast, {
    JSXOpeningElement(path: NodePath<t.JSXOpeningElement>) {
      for (const attr of path.node.attributes) {
        if (!t.isJSXAttribute(attr) || !t.isJSXIdentifier(attr.name, { name: "data-nuvio-id" })) {
          continue;
        }
        if (t.isStringLiteral(attr.value)) {
          ids.add(attr.value.value);
        }
      }
    },
  });
  return ids;
}

function setNuvioIdOnOpening(opening: t.JSXOpeningElement, id: string): void {
  for (const attr of opening.attributes) {
    if (t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name, { name: "data-nuvio-id" })) {
      if (t.isStringLiteral(attr.value)) {
        attr.value.value = id;
        return;
      }
    }
  }
  opening.attributes.push(
    t.jsxAttribute(t.jsxIdentifier("data-nuvio-id"), t.stringLiteral(id)),
  );
}

function uniqueDuplicateId(baseId: string, taken: Set<string>): string {
  const candidate = `${baseId}.copy`;
  if (!taken.has(candidate)) {
    return candidate;
  }
  let n = 2;
  while (taken.has(`${baseId}.copy${n}`)) {
    n += 1;
  }
  return `${baseId}.copy${n}`;
}

function applyDuplicateHost(
  ast: t.File,
  openingPath: NodePath<t.JSXOpeningElement>,
  hostId: string,
): string {
  const hostPath = openingPath.parentPath;
  if (!hostPath?.isJSXElement()) {
    throw new Error("Host is not a JSX element");
  }
  const parentPath = hostPath.parentPath;
  if (!parentPath?.isJSXElement()) {
    throw new Error("Duplicate requires a JSX element parent");
  }
  const taken = collectNuvioIds(ast);
  const newId = uniqueDuplicateId(hostId, taken);
  const clone = t.cloneNode(hostPath.node, true);
  if (!t.isJSXElement(clone)) {
    throw new Error("Failed to clone host element");
  }
  setNuvioIdOnOpening(clone.openingElement, newId);
  const parent = parentPath.node;
  const hostIndex = parent.children.indexOf(hostPath.node);
  if (hostIndex < 0) {
    throw new Error("Host not found in parent children");
  }
  parent.children.splice(hostIndex + 1, 0, clone);
  return newId;
}

function applyMergeClassName(openingPath: NodePath<t.JSXOpeningElement>, fragment: string): void {
  validateTailwindFragment(fragment);
  const opening = openingPath.node;
  let clsAttr: t.JSXAttribute | undefined;
  for (const attr of opening.attributes) {
    if (t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name, { name: "className" })) {
      clsAttr = attr;
      break;
    }
  }
  if (!clsAttr) {
    opening.attributes.push(
      t.jsxAttribute(t.jsxIdentifier("className"), t.stringLiteral(fragment.trim())),
    );
    return;
  }
  if (!t.isStringLiteral(clsAttr.value)) {
    throw new Error("className must be a string literal for Phase 2 patches");
  }
  const current = clsAttr.value.value;
  clsAttr.value = t.stringLiteral(twMerge(current, fragment.trim()));
}

export type ApplyPatchToSourceResult =
  | { ok: true; source: string; diffSummary: string }
  | { ok: false; code: string; message: string };

/**
 * Apply Phase 2 patch operations to TSX/JSX source for a single `data-nuvio-id` host.
 */
export async function applyPatchToSource(
  source: string,
  filePath: string,
  hostId: string,
  ops: readonly PatchOp[],
): Promise<ApplyPatchToSourceResult> {
  let ast: t.File;
  try {
    ast = parse(source, {
      sourceType: "module",
      plugins: ["typescript", "jsx"],
      sourceFilename: filePath,
    });
  } catch (e) {
    return { ok: false, code: "parse_error", message: String(e) };
  }

  const openingPath = findHostOpening(ast, hostId);
  if (!openingPath) {
    return { ok: false, code: "host_not_found", message: `No JSX host with data-nuvio-id="${hostId}"` };
  }

  let duplicateNewId: string | undefined;

  try {
    for (const op of ops) {
      if (op.kind === "setText") {
        applySetText(openingPath, op.text);
      } else if (op.kind === "mergeTailwindClassName") {
        applyMergeClassName(openingPath, op.classNameFragment);
      } else if (op.kind === "moveSibling") {
        applyMoveSibling(openingPath, op.direction);
      } else if (op.kind === "setHidden") {
        applySetHidden(openingPath, op.hidden);
      } else if (op.kind === "duplicateHost") {
        duplicateNewId = applyDuplicateHost(ast, openingPath, hostId);
      }
    }
  } catch (e) {
    return { ok: false, code: "patch_rejected", message: String(e) };
  }

  let raw: string;
  try {
    raw = generate(ast, { retainLines: false, comments: true }).code;
  } catch (e) {
    return { ok: false, code: "generate_error", message: String(e) };
  }

  let formatted: string;
  try {
    formatted = await prettier.format(raw, {
      parser: "typescript",
      filepath: filePath,
    });
  } catch (e) {
    return { ok: false, code: "format_error", message: String(e) };
  }

  const base = path.basename(filePath);
  const opBits = ops.map((op) => {
    switch (op.kind) {
      case "setText":
        return `set text (${op.text.length} char${op.text.length === 1 ? "" : "s"})`;
      case "mergeTailwindClassName":
        return `merge className (${op.classNameFragment.trim()})`;
      case "moveSibling":
        return `move sibling ${op.direction}`;
      case "setHidden":
        return op.hidden ? "hide element" : "show element";
      case "duplicateHost":
        return duplicateNewId ? `duplicate host → ${duplicateNewId}` : "duplicate host";
    }
  });
  const diffSummary = `${base}: ${opBits.join("; ")}`;

  return { ok: true, source: formatted, diffSummary };
}
