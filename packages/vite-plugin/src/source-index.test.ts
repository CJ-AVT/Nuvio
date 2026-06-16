import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { buildSourceIndex, extractIdsFromSource, pickBestSourceIndex } from "./source-index.js";

const MONOREPO_SCAN_GLOBS = [
  "src/**/*.{tsx,jsx}",
  "apps/**/src/**/*.{tsx,jsx}",
  "packages/**/src/**/*.{tsx,jsx}",
] as const;

const TAILADMIN_FIXTURE_ID = "dashboard.title";

describe("pickBestSourceIndex", () => {
  it("prefers the tree that contains dogfood contract ids", () => {
    const repoRoot = path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      "../../../",
    );
    const overlayRoot = path.join(repoRoot, "packages/overlay");
    const dogfoodRoot = path.join(repoRoot, "apps/tailadmin-dogfood");
    const r = pickBestSourceIndex([overlayRoot, dogfoodRoot], [...MONOREPO_SCAN_GLOBS]);
    expect(r.entries.some((e) => e.id === TAILADMIN_FIXTURE_ID)).toBe(true);
  });
});

describe("buildSourceIndex (monorepo root)", () => {
  it("still finds tailadmin-dogfood ids when root is the repo root", () => {
    const repoRoot = path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      "../../../",
    );
    const r = buildSourceIndex(repoRoot, [...MONOREPO_SCAN_GLOBS]);
    expect(r.scannedFileCount).toBeGreaterThan(0);
    expect(r.entries.some((e) => e.id === TAILADMIN_FIXTURE_ID)).toBe(true);
  });
});

describe("buildSourceIndex (tailadmin-dogfood fixture)", () => {
  it("indexes dashboard ids under apps/tailadmin-dogfood", () => {
    const repoRoot = path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      "../../../",
    );
    const dogfoodRoot = path.join(repoRoot, "apps/tailadmin-dogfood");
    const r = buildSourceIndex(dogfoodRoot, ["src/**/*.{tsx,jsx}"]);
    expect(r.scannedFileCount).toBeGreaterThan(0);
    expect(r.entries.some((e) => e.id === TAILADMIN_FIXTURE_ID)).toBe(true);
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
