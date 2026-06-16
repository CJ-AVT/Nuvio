import { createRequire } from "node:module";
import { parse } from "@babel/parser";
import type { NodePath, Visitor } from "@babel/traverse";
import * as t from "@babel/types";
import prettier from "prettier";
import { isValidRteId } from "./rte-id.js";

const require = createRequire(import.meta.url);
const traverse = require("@babel/traverse").default as (ast: t.File, visitor: Visitor) => void;
const generate = require("@babel/generator").default as (
  ast: t.Node,
  opts?: Record<string, unknown>,
) => { code: string };

export type InsertRteIdResult =
  | { ok: true; source: string; id: string }
  | { ok: false; code: string; message: string };

function hasRteIdAttr(opening: t.JSXOpeningElement): boolean {
  return opening.attributes.some(
    (attr) =>
      t.isJSXAttribute(attr) &&
      t.isJSXIdentifier(attr.name, { name: "data-rte-id" }),
  );
}

function findOpeningAtLocation(
  ast: t.File,
  line: number,
  column: number,
): NodePath<t.JSXOpeningElement> | null {
  const onLine: Array<{ path: NodePath<t.JSXOpeningElement>; column: number }> = [];
  traverse(ast, {
    JSXOpeningElement(path: NodePath<t.JSXOpeningElement>) {
      const loc = path.node.loc?.start;
      if (!loc || loc.line !== line) {
        return;
      }
      onLine.push({ path, column: loc.column });
    },
  });
  if (onLine.length === 0) {
    return null;
  }
  const exact = onLine.find((entry) => entry.column === column);
  if (exact) {
    return exact.path;
  }
  if (onLine.length === 1) {
    return onLine[0]!.path;
  }
  onLine.sort(
    (a, b) => Math.abs(a.column - column) - Math.abs(b.column - column),
  );
  return onLine[0]!.path;
}

async function formatSource(source: string, filePath: string): Promise<string> {
  try {
    return await prettier.format(source, {
      filepath: filePath,
      parser: "typescript",
    });
  } catch {
    return source;
  }
}

/**
 * Insert `data-rte-id` on the JSX opening element at the given 1-based line / 0-based column.
 */
export async function insertDataRteIdAtLocation(
  source: string,
  filePath: string,
  line: number,
  column: number,
  id: string,
): Promise<InsertRteIdResult> {
  if (!isValidRteId(id)) {
    return {
      ok: false,
      code: "invalid_id",
      message: "Id must be segmented lowercase (e.g. page.title)",
    };
  }

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

  const openingPath = findOpeningAtLocation(ast, line, column);
  if (!openingPath) {
    return {
      ok: false,
      code: "node_not_found",
      message: "No JSX element at that source location",
    };
  }

  const opening = openingPath.node;
  if (hasRteIdAttr(opening)) {
    return {
      ok: false,
      code: "already_tagged",
      message: "Element already has data-rte-id",
    };
  }

  if (opening.name.type !== "JSXIdentifier") {
    return {
      ok: false,
      code: "unsupported_tag",
      message: "Cannot tag dynamic JSX member expressions",
    };
  }

  opening.attributes.push(
    t.jsxAttribute(t.jsxIdentifier("data-rte-id"), t.stringLiteral(id)),
  );

  const generated = generate(ast, { retainLines: true }).code;
  const formatted = await formatSource(generated, filePath);
  return { ok: true, source: formatted, id };
}
