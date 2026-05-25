import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { buildSourceIndex, extractIdsFromSource, pickBestSourceIndex } from "./source-index.js";

const MONOREPO_SCAN_GLOBS = [
  "src/**/*.{tsx,jsx}",
  "apps/**/src/**/*.{tsx,jsx}",
  "packages/**/src/**/*.{tsx,jsx}",
] as const;

describe("pickBestSourceIndex", () => {
  it("prefers the tree that contains demo contract ids", () => {
    const repoRoot = path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      "../../../",
    );
    const overlayRoot = path.join(repoRoot, "packages/overlay");
    const demoRoot = path.join(repoRoot, "apps/demo-app");
    const r = pickBestSourceIndex([overlayRoot, demoRoot], [...MONOREPO_SCAN_GLOBS]);
    expect(r.entries.some((e) => e.id === "demo.hero.title")).toBe(true);
  });
});

describe("buildSourceIndex (monorepo root)", () => {
  it("still finds demo-app ids when root is the repo root", () => {
    const repoRoot = path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      "../../../",
    );
    const r = buildSourceIndex(repoRoot, [...MONOREPO_SCAN_GLOBS]);
    expect(r.scannedFileCount).toBeGreaterThan(0);
    expect(r.entries.some((e) => e.id === "demo.hero.title")).toBe(true);
  });
});

describe("buildSourceIndex (demo-app fixture)", () => {
  it("indexes App.tsx ids under apps/demo-app", () => {
    const repoRoot = path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      "../../../",
    );
    const demoRoot = path.join(repoRoot, "apps/demo-app");
    const r = buildSourceIndex(demoRoot, ["src/**/*.{tsx,jsx}"]);
    expect(r.scannedFileCount).toBeGreaterThan(0);
    expect(r.entries.some((e) => e.id === "demo.hero.title")).toBe(true);
  });
});

describe("extractIdsFromSource", () => {
  it("finds data-nuvio-id", () => {
    const code = `
      export function X() {
        return <div data-nuvio-id="hero.title">Hi</div>;
      }
    `;
    const hits = extractIdsFromSource("/proj/A.tsx", code);
    expect(hits).toHaveLength(1);
    expect(hits[0]?.id).toBe("hero.title");
    expect(hits[0]?.line).toBeGreaterThan(0);
  });

  it("finds EditableText id prop", () => {
    const code = `
      export function X() {
        return <EditableText id="cta.primary">Go</EditableText>;
      }
    `;
    const hits = extractIdsFromSource("/proj/B.tsx", code);
    expect(hits.map((h) => h.id)).toContain("cta.primary");
  });
});
