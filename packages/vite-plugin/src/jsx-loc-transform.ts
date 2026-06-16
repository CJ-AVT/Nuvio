import { createRequire } from "node:module";
import { parse } from "@babel/parser";
import traverseImport, { type NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import path from "node:path";

const require = createRequire(import.meta.url);
const generate = require("@babel/generator").default as (
  ast: t.File,
  opts?: Record<string, unknown>,
) => { code: string };

const LOC_ATTR = "data-nuvio-loc";

function getTraverseFn(): (ast: t.File, visitor: object) => void {
  if (typeof traverseImport === "function") {
    return traverseImport as (ast: t.File, visitor: object) => void;
  }
  const d = (traverseImport as { default?: unknown }).default;
  if (typeof d === "function") {
    return d as (ast: t.File, visitor: object) => void;
  }
  throw new Error("[Nuvio] @babel/traverse did not resolve to a callable export");
}

function hasNuvioId(opening: t.JSXOpeningElement): boolean {
  return opening.attributes.some(
    (attr) =>
      t.isJSXAttribute(attr) &&
      t.isJSXIdentifier(attr.name) &&
      (attr.name.name === "data-nuvio-id" || attr.name.name === LOC_ATTR),
  );
}

function hasLocAttr(opening: t.JSXOpeningElement): boolean {
  return opening.attributes.some(
    (attr) =>
      t.isJSXAttribute(attr) &&
      t.isJSXIdentifier(attr.name, { name: LOC_ATTR }),
  );
}

/**
 * Dev-only: stamp `data-nuvio-loc="relativePath:line:column"` on JSX hosts for click-to-tag.
 */
export function injectJsxLocAttributes(
  code: string,
  fileAbs: string,
  projectRoot: string,
): { code: string; changed: boolean } {
  if (!/\.(tsx|jsx)$/.test(fileAbs)) {
    return { code, changed: false };
  }
  let ast: t.File;
  try {
    ast = parse(code, {
      sourceType: "module",
      plugins: ["typescript", "jsx"],
      sourceFilename: fileAbs,
    });
  } catch {
    return { code, changed: false };
  }

  const rel = path.relative(projectRoot, fileAbs).split(path.sep).join("/");
  let changed = false;
  const traverseFn = getTraverseFn();
  traverseFn(ast, {
    JSXOpeningElement(p: NodePath<t.JSXOpeningElement>) {
      const opening = p.node;
      if (opening.name.type !== "JSXIdentifier") {
        return;
      }
      if (hasNuvioId(opening)) {
        return;
      }
      if (hasLocAttr(opening)) {
        return;
      }
      const loc = opening.loc?.start;
      if (!loc) {
        return;
      }
      const value = `${rel}:${loc.line}:${loc.column}`;
      opening.attributes.push(
        t.jsxAttribute(t.jsxIdentifier(LOC_ATTR), t.stringLiteral(value)),
      );
      changed = true;
    },
  });

  if (!changed) {
    return { code, changed: false };
  }
  return { code: generate(ast, { retainLines: true }).code, changed: true };
}

export function parseNuvioLocValue(
  value: string,
): { file: string; line: number; column: number } | null {
  const match = /^(.+):(\d+):(\d+)$/.exec(value.trim());
  if (!match) {
    return null;
  }
  return {
    file: match[1]!,
    line: Number(match[2]),
    column: Number(match[3]),
  };
}
