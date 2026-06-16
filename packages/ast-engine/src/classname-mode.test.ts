import { describe, expect, it } from "vitest";
import { parse } from "@babel/parser";
import type { NodePath, Visitor } from "@babel/traverse";
import type { JSXOpeningElement } from "@babel/types";
import type * as t from "@babel/types";

const traverse = require("@babel/traverse").default as (
  ast: t.File,
  visitor: Visitor,
) => void;
import {
  classifyHostClassNameMode,
  readFlattenedClassName,
} from "./classname-mode.js";
import { applyPatchToSource } from "./apply-patch.js";

function openingFromSnippet(snippet: string): JSXOpeningElement {
  const ast = parse(snippet, { sourceType: "module", plugins: ["typescript", "jsx"] });
  let opening: JSXOpeningElement | null = null;
  traverse(ast, {
    JSXOpeningElement(path: NodePath<JSXOpeningElement>) {
      opening = path.node;
      path.stop();
    },
  });
  if (!opening) {
    throw new Error("no opening element");
  }
  return opening;
}

describe("classifyHostClassNameMode", () => {
  it("literal-only for string className", () => {
    const opening = openingFromSnippet(`<div data-rte-id="x" className="p-4" />`);
    expect(classifyHostClassNameMode(opening)).toBe("literal-only");
  });

  it("cn-basic for cn string list", () => {
    const opening = openingFromSnippet(
      `<div data-rte-id="x" className={cn("p-4", "rounded")} />`,
    );
    expect(classifyHostClassNameMode(opening)).toBe("cn-basic");
  });

  it("cn-conditional for cn with && branch", () => {
    const opening = openingFromSnippet(
      `<div data-rte-id="x" className={cn("p-4", active && "bg-blue-500")} />`,
    );
    expect(classifyHostClassNameMode(opening)).toBe("cn-conditional");
  });

  it("classnames-static for classnames object map", () => {
    const opening = openingFromSnippet(
      `<div data-rte-id="x" className={classnames("p-4", { active: isActive })} />`,
    );
    expect(classifyHostClassNameMode(opening)).toBe("classnames-static");
    expect(readFlattenedClassName(opening, "classnames-static")).toContain("active");
  });
});

describe("cn-conditional patches", () => {
  it("merges padding into base literal and keeps conditional branch", async () => {
    const src = `import { cn } from "./u";
export const Card = ({ active }: { active: boolean }) => (
  <div data-rte-id="card" className={cn("p-4", active && "bg-blue-500")}>x</div>
);`;
    const r = await applyPatchToSource(
      src,
      "/proj/Card.tsx",
      "card",
      [{ kind: "mergeTailwindClassName", classNameFragment: "p-6" }],
      { classNameMode: "cn-conditional" },
    );
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.source).toMatch(/cn\("p-6"/);
      expect(r.source).toMatch(/active && "bg-blue-500"/);
    }
  });

  it("rejects cn-conditional when mode is cn-basic", async () => {
    const src = `import { cn } from "./u";
export const Card = ({ active }: { active: boolean }) => (
  <div data-rte-id="card" className={cn("p-4", active && "bg-blue-500")}>x</div>
);`;
    const r = await applyPatchToSource(
      src,
      "/proj/Card.tsx",
      "card",
      [{ kind: "mergeTailwindClassName", classNameFragment: "p-6" }],
      { classNameMode: "cn-basic" },
    );
    expect(r.ok).toBe(false);
  });
});

describe("classnames-static patches", () => {
  it("merges utilities into string literal and preserves object map", async () => {
    const src = `import classnames from "classnames";
export const Card = ({ active }: { active: boolean }) => (
  <div data-rte-id="card" className={classnames("p-4", { active })}>x</div>
);`;
    const r = await applyPatchToSource(
      src,
      "/proj/Card.tsx",
      "card",
      [{ kind: "mergeTailwindClassName", classNameFragment: "rounded-md" }],
      { classNameMode: "classnames-static" },
    );
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.source).toMatch(/classnames\("p-4 rounded-md"/);
      expect(r.source).toMatch(/\{\s*active\s*\}/);
    }
  });
});
