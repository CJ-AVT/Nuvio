import { createRequire } from "node:module";
import { parse } from "@babel/parser";
import type { NodePath, Visitor } from "@babel/traverse";
import * as t from "@babel/types";
import prettier from "prettier";

const require = createRequire(import.meta.url);
const traverse = require("@babel/traverse").default as (ast: t.File, visitor: Visitor) => void;
const generate = require("@babel/generator").default as (
  ast: t.Node,
  opts?: Record<string, unknown>,
) => { code: string };

export type RemoveRteIdResult =
  | { ok: true; source: string; id: string }
  | { ok: false; code: string; message: string };

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
        if (!t.isJSXIdentifier(attr.name, { name: "data-rte-id" })) {
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

/** Remove literal `data-rte-id` from the JSX host matching `hostId`. */
export async function removeDataRteIdFromSource(
  source: string,
  filePath: string,
  hostId: string,
): Promise<RemoveRteIdResult> {
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
    return {
      ok: false,
      code: "host_not_found",
      message: `No JSX host with data-rte-id="${hostId}"`,
    };
  }

  const opening = openingPath.node;
  const nextAttributes = opening.attributes.filter((attr) => {
    if (!t.isJSXAttribute(attr)) {
      return true;
    }
    return !t.isJSXIdentifier(attr.name, { name: "data-rte-id" });
  });

  if (nextAttributes.length === opening.attributes.length) {
    return {
      ok: false,
      code: "not_tagged",
      message: "Element does not have a removable data-rte-id",
    };
  }

  opening.attributes = nextAttributes;
  const generated = generate(ast, { retainLines: true }).code;
  const formatted = await formatSource(generated, filePath);
  return { ok: true, source: formatted, id: hostId };
}
