import { describe, expect, it } from "vitest";
import { applyPatchToSource } from "./apply-patch.js";
import { validateTailwindFragment } from "./tailwind-whitelist.js";

describe("validateTailwindFragment", () => {
  it("allows rounded utilities", () => {
    expect(() => validateTailwindFragment("rounded-md rounded-lg")).not.toThrow();
  });

  it("allows spacing and text utilities", () => {
    expect(() => validateTailwindFragment("p-4 text-sm")).not.toThrow();
  });

  it("allows text-white / text-black (no scale suffix)", () => {
    expect(() => validateTailwindFragment("text-white")).not.toThrow();
    expect(() => validateTailwindFragment("text-black bg-white")).not.toThrow();
  });

  it("allows text-white after stripping zero-width / unicode hyphen noise", () => {
    expect(() => validateTailwindFragment("text\u200B-white")).not.toThrow();
    expect(() => validateTailwindFragment("text\u2011white")).not.toThrow();
  });

  it("rejects unknown utilities", () => {
    expect(() => validateTailwindFragment("wobble-99")).toThrow(/Unknown/);
  });

  it("allows Phase 4 layout and effect utilities", () => {
    expect(() =>
      validateTailwindFragment(
        "text-center gap-4 w-full max-w-md h-12 min-h-0 opacity-75 shadow-lg",
      ),
    ).not.toThrow();
  });

  it("allows width fractions", () => {
    expect(() => validateTailwindFragment("w-1/2 w-2/3")).not.toThrow();
  });
});

describe("applyPatchToSource", () => {
  it("golden: simple setText on a single JSXText child", async () => {
    const src = `
export function X() {
  return <div data-nuvio-id="hero.title">Hi</div>;
}
`;
    const r = await applyPatchToSource(src, "/proj/X.tsx", "hero.title", [
      { kind: "setText", text: "Hello" },
    ]);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.source).toContain("Hello");
      expect(r.source).not.toContain(">Hi<");
    }
  });

  it("golden: mergeTailwindClassName uses tailwind-merge (p-4 + p-6 → p-6)", async () => {
    const src = `export const _ = () => <div data-nuvio-id="c" className="p-4 text-sm">x</div>;`;
    const r = await applyPatchToSource(src, "/proj/C.tsx", "c", [
      { kind: "mergeTailwindClassName", classNameFragment: "p-6" },
    ]);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.source).toMatch(/p-6/);
      expect(r.source).not.toMatch(/p-4/);
    }
  });

  it("golden: mergeTailwindClassName text color + margin", async () => {
    const src = `export const _ = () => <div data-nuvio-id="x" className="text-slate-300 m-2">y</div>;`;
    const r = await applyPatchToSource(src, "/proj/X.tsx", "x", [
      { kind: "mergeTailwindClassName", classNameFragment: "text-sky-400" },
      { kind: "mergeTailwindClassName", classNameFragment: "mt-4" },
    ]);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.source).toMatch(/text-sky-400/);
      expect(r.source).not.toMatch(/text-slate-300/);
      expect(r.source).toMatch(/mt-4/);
    }
  });

  it("golden: setText plus mergeTailwind in one patch", async () => {
    const src = `export const _ = () => <div data-nuvio-id="btn" className="rounded-md">Go</div>;`;
    const r = await applyPatchToSource(src, "/proj/B.tsx", "btn", [
      { kind: "setText", text: "Ship" },
      { kind: "mergeTailwindClassName", classNameFragment: "rounded-lg" },
    ]);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.source).toContain("Ship");
      expect(r.source).toMatch(/rounded-lg/);
      expect(r.source).not.toMatch(/rounded-md/);
    }
  });

  it("golden: Phase 4 merge text-align max-width shadow", async () => {
    const src = `export const _ = () => <p data-nuvio-id="f" className="text-xs text-slate-500">Note</p>;`;
    const r = await applyPatchToSource(src, "/proj/F.tsx", "f", [
      { kind: "mergeTailwindClassName", classNameFragment: "text-center" },
      { kind: "mergeTailwindClassName", classNameFragment: "max-w-prose" },
      { kind: "mergeTailwindClassName", classNameFragment: "shadow-md" },
    ]);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.source).toMatch(/text-center/);
      expect(r.source).toMatch(/max-w-prose/);
      expect(r.source).toMatch(/shadow-md/);
    }
  });

  it("rejects unknown id", async () => {
    const src = `export const _ = () => <div data-nuvio-id="a">x</div>;`;
    const r = await applyPatchToSource(src, "/proj/A.tsx", "missing", [
      { kind: "setText", text: "y" },
    ]);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.code).toBe("host_not_found");
    }
  });

  it("rejects disallowed utilities before merge", async () => {
    const src = `export const _ = () => <div data-nuvio-id="c" className="p-4">x</div>;`;
    const r = await applyPatchToSource(src, "/proj/C.tsx", "c", [
      { kind: "mergeTailwindClassName", classNameFragment: "wobble-99" },
    ]);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.code).toBe("patch_rejected");
    }
  });

  it("golden: setText replaces rich JSX children with one text node", async () => {
    const src = `export const _ = () => (
  <p data-nuvio-id="lead">
    <strong>A</strong> and <span className="x">B</span>.
  </p>
);`;
    const r = await applyPatchToSource(src, "/proj/L.tsx", "lead", [
      { kind: "setText", text: "Plain copy." },
    ]);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.source).toContain("Plain copy.");
      expect(r.source).not.toContain("<strong>");
    }
  });

  it("golden: moveSibling down swaps JSX siblings under flex parent", async () => {
    const src = `export const _ = () => (
  <div className="flex gap-2" data-nuvio-id="row">
    <div data-nuvio-id="a">A</div>
    <div data-nuvio-id="b">B</div>
  </div>
);`;
    const r = await applyPatchToSource(src, "/proj/R.tsx", "a", [
      { kind: "moveSibling", direction: "down" },
    ]);
    expect(r.ok).toBe(true);
    if (r.ok) {
      const aPos = r.source.indexOf('data-nuvio-id="a"');
      const bPos = r.source.indexOf('data-nuvio-id="b"');
      expect(aPos).toBeGreaterThan(bPos);
    }
  });

  it("rejects moveSibling when parent is not flex/grid", async () => {
    const src = `export const _ = () => (
  <div>
    <span data-nuvio-id="a">A</span>
    <span data-nuvio-id="b">B</span>
  </div>
);`;
    const r = await applyPatchToSource(src, "/proj/R.tsx", "a", [
      { kind: "moveSibling", direction: "down" },
    ]);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.message).toMatch(/flex or grid/i);
    }
  });

  it("golden: setHidden adds hidden utility", async () => {
    const src = `export const _ = () => <div data-nuvio-id="x" className="p-4">x</div>;`;
    const r = await applyPatchToSource(src, "/proj/X.tsx", "x", [
      { kind: "setHidden", hidden: true },
    ]);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.source).toMatch(/\bhidden\b/);
    }
  });

  it("golden: setHidden false removes hidden", async () => {
    const src = `export const _ = () => <div data-nuvio-id="x" className="hidden p-4">x</div>;`;
    const r = await applyPatchToSource(src, "/proj/X.tsx", "x", [
      { kind: "setHidden", hidden: false },
    ]);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.source).not.toMatch(/\bhidden\b/);
      expect(r.source).toMatch(/p-4/);
    }
  });

  it("golden: duplicateHost clones element with new id", async () => {
    const src = `export const _ = () => (
  <div className="flex">
    <button data-nuvio-id="cta">Go</button>
  </div>
);`;
    const r = await applyPatchToSource(src, "/proj/B.tsx", "cta", [{ kind: "duplicateHost" }]);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.source).toContain('data-nuvio-id="cta"');
      expect(r.source).toContain('data-nuvio-id="cta.copy"');
      expect(r.diffSummary).toMatch(/cta\.copy/);
    }
  });

  it("rejects non-literal className", async () => {
    const src = `import { cn } from "./u";
export const _ = () => <div data-nuvio-id="c" className={cn("p-4")}>x</div>;`;
    const r = await applyPatchToSource(src, "/proj/C.tsx", "c", [
      { kind: "mergeTailwindClassName", classNameFragment: "p-6" },
    ]);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.message).toMatch(/string literal/i);
    }
  });
});
