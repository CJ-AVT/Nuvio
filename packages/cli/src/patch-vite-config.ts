import traverse from "./babel-traverse.js";
import type { NodePath } from "./babel-traverse.js";
import * as t from "@babel/types";
import { readFileSync, writeFileSync } from "node:fs";
import { parseTs, printTs } from "./parse-ts.js";

export type PatchOutcome = {
  ok: boolean;
  skipped?: boolean;
  error?: string;
};

function hasNuvioImport(ast: t.File): boolean {
  let found = false;
  traverse(ast, {
    ImportDeclaration(path: NodePath<t.ImportDeclaration>) {
      if (path.node.source.value === "@nuvio/vite-plugin") found = true;
    },
  });
  return found;
}

function hasNuvioPluginCall(ast: t.File): boolean {
  let found = false;
  traverse(ast, {
    CallExpression(path: NodePath<t.CallExpression>) {
      if (t.isIdentifier(path.node.callee, { name: "nuvio" })) found = true;
    },
  });
  return found;
}

const OVERLAY_DEP = "@nuvio/overlay";

function excludeListsOverlay(expr: t.Expression | null | undefined): boolean {
  if (!expr || !t.isArrayExpression(expr)) return false;
  return expr.elements.some(
    (el) => t.isStringLiteral(el) && el.value === OVERLAY_DEP,
  );
}

/** Prebundled overlay breaks dynamic style.css (404 on styles/overlay.css). */
function ensureOptimizeDepsExclude(ast: t.File): boolean {
  let patched = false;
  traverse(ast, {
    CallExpression(path: NodePath<t.CallExpression>) {
      const callee = path.node.callee;
      if (!t.isIdentifier(callee, { name: "defineConfig" })) return;
      const arg = path.node.arguments[0];
      if (!t.isObjectExpression(arg)) return;

      let optimizeDeps: t.ObjectProperty | undefined;
      for (const prop of arg.properties) {
        if (
          t.isObjectProperty(prop) &&
          t.isIdentifier(prop.key, { name: "optimizeDeps" })
        ) {
          optimizeDeps = prop;
          break;
        }
      }

      if (!optimizeDeps) {
        arg.properties.push(
          t.objectProperty(
            t.identifier("optimizeDeps"),
            t.objectExpression([
              t.objectProperty(
                t.identifier("exclude"),
                t.arrayExpression([t.stringLiteral(OVERLAY_DEP)]),
              ),
            ]),
          ),
        );
        patched = true;
        return;
      }

      if (!t.isObjectExpression(optimizeDeps.value)) return;
      let excludeProp: t.ObjectProperty | undefined;
      for (const p of optimizeDeps.value.properties) {
        if (t.isObjectProperty(p) && t.isIdentifier(p.key, { name: "exclude" })) {
          excludeProp = p;
          break;
        }
      }
      if (!excludeProp) {
        optimizeDeps.value.properties.push(
          t.objectProperty(
            t.identifier("exclude"),
            t.arrayExpression([t.stringLiteral(OVERLAY_DEP)]),
          ),
        );
        patched = true;
        return;
      }
      if (
        t.isArrayExpression(excludeProp.value) &&
        !excludeListsOverlay(excludeProp.value)
      ) {
        excludeProp.value.elements.push(t.stringLiteral(OVERLAY_DEP));
        patched = true;
      }
    },
  });
  return patched;
}

export function viteConfigHasOverlayOptimizeExclude(filePath: string): boolean {
  const source = readFileSync(filePath, "utf8");
  return (
    /optimizeDeps\s*:\s*\{[^}]*exclude\s*:\s*\[[^\]]*@nuvio\/overlay/.test(
      source,
    ) || /exclude\s*:\s*\[[^\]]*["']@nuvio\/overlay["']/.test(source)
  );
}

function appendNuvioPlugin(ast: t.File): boolean {
  let patched = false;
  traverse(ast, {
    ObjectProperty(path: NodePath<t.ObjectProperty>) {
      if (!t.isIdentifier(path.node.key, { name: "plugins" })) return;
      if (!t.isArrayExpression(path.node.value)) return;
      path.node.value.elements.push(t.callExpression(t.identifier("nuvio"), []));
      patched = true;
    },
  });
  return patched;
}

export function patchViteConfigFile(filePath: string): PatchOutcome {
  const source = readFileSync(filePath, "utf8");
  let ast: t.File;
  try {
    ast = parseTs(source, filePath);
  } catch {
    return { ok: false, error: "parse failed" };
  }

  const depsPatched = ensureOptimizeDepsExclude(ast);
  const alreadyPlugin = hasNuvioImport(ast) && hasNuvioPluginCall(ast);

  if (alreadyPlugin && !depsPatched) {
    return { ok: true, skipped: true };
  }

  if (!hasNuvioImport(ast)) {
    ast.program.body.unshift(
      t.importDeclaration(
        [t.importSpecifier(t.identifier("nuvio"), t.identifier("nuvio"))],
        t.stringLiteral("@nuvio/vite-plugin"),
      ),
    );
  }

  if (!hasNuvioPluginCall(ast)) {
    if (!appendNuvioPlugin(ast)) {
      return { ok: false, error: "no static plugins array" };
    }
  }

  writeFileSync(filePath, printTs(ast, source), "utf8");
  return { ok: true, skipped: alreadyPlugin && depsPatched };
}

export function viteConfigHasNuvio(filePath: string): boolean {
  const source = readFileSync(filePath, "utf8");
  try {
    const ast = parseTs(source, filePath);
    return hasNuvioImport(ast) && hasNuvioPluginCall(ast);
  } catch {
    return /nuvio\s*\(/.test(source);
  }
}
