import { evaluateBrandPageScan, normalizeBrandConfig } from "@rte/shared";
import { loadPccManifestFromFile } from "@rte/shared/load-pcc-manifest";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { runBrandApply } from "../src/brand-apply.js";
import { runBrandScan } from "../src/brand-scan.js";
import { runCoverageVerify } from "../src/coverage-verify.js";
import { detectPackageManager } from "../src/detect-pm.js";
import { detectProject } from "../src/detect-project.js";
import { scanProject } from "../src/project-scan.js";
import { patchAppRootFile, resolveAppFile } from "../src/patch-app-root.js";
import { patchMainOverlayStyles, resolveMainEntry } from "../src/patch-main-styles.js";
import { patchViteConfigFile } from "../src/patch-vite-config.js";
import { patchStarterId } from "../src/patch-starter-id.js";
import { projectHasPageTitleId } from "../src/scan-ids.js";
import { runInit } from "../src/init.js";
import { cleanup, copyFixture } from "./helpers.js";

const dirs: string[] = [];

function fixture(name: string): string {
  const dir = copyFixture(name);
  dirs.push(dir);
  return dir;
}

afterEach(() => {
  while (dirs.length) cleanup(dirs.pop()!);
});

describe("detectPackageManager", () => {
  it("detects pnpm from lockfile", () => {
    const root = fixture("vite-react-ts-minimal");
    expect(detectPackageManager(root)).toBe("pnpm");
  });

  it("respects --pm override", () => {
    const root = fixture("vite-react-ts-minimal");
    expect(detectPackageManager(root, "npm")).toBe("npm");
  });
});

describe("patch vite config", () => {
  it("adds rte import and plugin", () => {
    const root = fixture("vite-react-ts-minimal");
    const vitePath = join(root, "vite.config.ts");
    const before = readFileSync(vitePath, "utf8");
    expect(before).not.toContain("rte");

    const result = patchViteConfigFile(vitePath);
    expect(result.ok).toBe(true);

    const after = readFileSync(vitePath, "utf8");
    expect(after).toContain('@rte/vite-plugin');
    expect(after).toContain("rte()");
    expect(after).toContain("@rte/overlay");
    expect(after).toContain("optimizeDeps");
  });

  it("is idempotent", () => {
    const root = fixture("vite-react-ts-minimal");
    const vitePath = join(root, "vite.config.ts");
    patchViteConfigFile(vitePath);
    const once = readFileSync(vitePath, "utf8");
    patchViteConfigFile(vitePath);
    const twice = readFileSync(vitePath, "utf8");
    expect(twice).toBe(once);
  });

  it("fails on spread-only plugins", () => {
    const root = fixture("vite-complex-plugins");
    const vitePath = join(root, "vite.config.ts");
    const result = patchViteConfigFile(vitePath);
    expect(result.ok).toBe(false);
  });
});

describe("patch main overlay styles", () => {
  it("adds overlay style.css import", () => {
    const root = fixture("vite-react-ts-minimal");
    const mainPath = resolveMainEntry(root)!;
    const result = patchMainOverlayStyles(mainPath);
    expect(result.ok).toBe(true);
    expect(readFileSync(mainPath, "utf8")).toContain(
      '@rte/overlay/style.css',
    );
  });

  it("is idempotent", () => {
    const root = fixture("vite-react-ts-minimal");
    const mainPath = resolveMainEntry(root)!;
    patchMainOverlayStyles(mainPath);
    const once = readFileSync(mainPath, "utf8");
    patchMainOverlayStyles(mainPath);
    expect(readFileSync(mainPath, "utf8")).toBe(once);
  });
});

describe("patch app root", () => {
  it("adds RteDevShell", () => {
    const root = fixture("vite-react-ts-minimal");
    const appPath = resolveAppFile(root)!;
    const result = patchAppRootFile(appPath);
    expect(result.ok).toBe(true);
    const text = readFileSync(appPath, "utf8");
    expect(text).toContain("RteDevShell");
    expect(text).toContain("@rte/overlay");
  });
});

describe("starter id", () => {
  it("adds page.title on h1", () => {
    const root = fixture("vite-react-ts-minimal");
    const { outcome, file } = patchStarterId(root);
    expect(outcome.ok).toBe(true);
    expect(file).toBeTruthy();
    expect(projectHasPageTitleId(root)).toBe(true);
  });

  it("skips when page.title exists", () => {
    const root = fixture("vite-already-rte");
    expect(projectHasPageTitleId(root)).toBe(true);
    const { outcome } = patchStarterId(root);
    expect(outcome.ok).toBe(false);
  });
});

describe("runInit", () => {
  it("dry run makes no file changes", async () => {
    const root = fixture("vite-react-ts-minimal");
    const viteBefore = readFileSync(join(root, "vite.config.ts"), "utf8");
    const code = await runInit({
      cwd: root,
      yes: true,
      dryRun: true,
      noInstall: true,
    });
    expect(code).toBe(0);
    expect(readFileSync(join(root, "vite.config.ts"), "utf8")).toBe(viteBefore);
    expect(existsSync(join(root, "rte"))).toBe(false);
  });

  it("wires minimal fixture with --no-install", async () => {
    const root = fixture("vite-react-ts-minimal");
    const code = await runInit({
      cwd: root,
      yes: true,
      noInstall: true,
    });
    expect(code).toBe(0);
    expect(readFileSync(join(root, "vite.config.ts"), "utf8")).toContain("rte()");
    expect(readFileSync(join(root, "src/App.tsx"), "utf8")).toContain(
      "RteDevShell",
    );
    expect(projectHasPageTitleId(root)).toBe(true);
    expect(existsSync(join(root, "rte/START_HERE.md"))).toBe(true);
    expect(existsSync(join(root, "rte/AGENT.md"))).toBe(true);
    expect(existsSync(join(root, "rte/brand.json"))).toBe(true);
    expect(readFileSync(join(root, "rte/brand.json"), "utf8")).toContain('"accent": "blue"');
    const main = readFileSync(join(root, "src/main.tsx"), "utf8");
    const vite = readFileSync(join(root, "vite.config.ts"), "utf8");
    expect(main).toContain("@rte/overlay/style.css");
    expect(vite).toContain("optimizeDeps");
    expect(vite).toContain("@rte/overlay");
  });

  it("second init is idempotent", async () => {
    const root = fixture("vite-react-ts-minimal");
    await runInit({ cwd: root, yes: true, noInstall: true });
    const vite = readFileSync(join(root, "vite.config.ts"), "utf8");
    const app = readFileSync(join(root, "src/App.tsx"), "utf8");
    const main = readFileSync(join(root, "src/main.tsx"), "utf8");
    await runInit({ cwd: root, yes: true, noInstall: true });
    expect(readFileSync(join(root, "vite.config.ts"), "utf8")).toBe(vite);
    expect(readFileSync(join(root, "src/App.tsx"), "utf8")).toBe(app);
    expect(readFileSync(join(root, "src/main.tsx"), "utf8")).toBe(main);
  });

  it("partial when no heading", async () => {
    const root = fixture("vite-no-heading");
    const code = await runInit({
      cwd: root,
      yes: true,
      noInstall: true,
      skipTailwindCheck: true,
    });
    expect(code).toBe(0);
    expect(existsSync(join(root, "rte/SETUP_TODO.md"))).toBe(false);
    expect(readFileSync(join(root, "src/App.tsx"), "utf8")).toContain(
      "RteDevShell",
    );
  });
});

describe("detectProject", () => {
  it("accepts minimal vite react app", () => {
    const root = fixture("vite-react-ts-minimal");
    const ctx = detectProject(root);
    expect(ctx.viteConfigName).toBe("vite.config.ts");
    expect(ctx.tailwindOk).toBe(true);
  });
});

describe("coverage verify", () => {
  it("passes tailadmin dashboard PCC manifest", () => {
    const dogfoodRoot = resolve(import.meta.dirname, "../../../apps/tailadmin-dogfood");
    const code = runCoverageVerify({
      cwd: dogfoodRoot,
      page: "dashboard",
    });
    expect(code).toBe(0);
  });

  it("passes all tailadmin PCC manifests", () => {
    const dogfoodRoot = resolve(import.meta.dirname, "../../../apps/tailadmin-dogfood");
    const code = runCoverageVerify({
      cwd: dogfoodRoot,
      all: true,
    });
    expect(code).toBe(0);
  });
});

describe("brand scan", () => {
  const dogfoodRoot = resolve(import.meta.dirname, "../../../apps/tailadmin-dogfood");

  function readDogfoodBrand() {
    const brandPath = join(dogfoodRoot, "rte/brand.json");
    return normalizeBrandConfig(JSON.parse(readFileSync(brandPath, "utf8")) as unknown);
  }

  it("reports on-brand dashboard hosts after brand apply", async () => {
    await runBrandApply({ cwd: dogfoodRoot, page: "dashboard" });
    const scan = scanProject(dogfoodRoot);
    const loaded = loadPccManifestFromFile(
      join(dogfoodRoot, "rte/pages/dashboard.pcc.yaml"),
    );
    expect(loaded.ok).toBe(true);
    if (!loaded.ok) {
      return;
    }
    const result = evaluateBrandPageScan(loaded.manifest, scan.index.entries, readDogfoodBrand());
    expect(result.missingCount).toBe(0);
    expect(result.onBrandCount).toBeGreaterThan(0);
    expect(runBrandScan({ cwd: dogfoodRoot, page: "dashboard" })).toBeLessThanOrEqual(1);
  });

  it("reports on-brand hosts across tailadmin PCC manifests after brand apply", async () => {
    await runBrandApply({ cwd: dogfoodRoot, all: true });
    const scan = scanProject(dogfoodRoot);
    const manifestDir = join(dogfoodRoot, "rte/pages");
    let totalOnBrand = 0;
    for (const file of ["dashboard.pcc.yaml", "form-elements.pcc.yaml", "basic-tables.pcc.yaml", "badges.pcc.yaml"]) {
      const loaded = loadPccManifestFromFile(join(manifestDir, file));
      expect(loaded.ok).toBe(true);
      if (!loaded.ok) {
        continue;
      }
      const result = evaluateBrandPageScan(loaded.manifest, scan.index.entries, readDogfoodBrand());
      expect(result.missingCount).toBe(0);
      totalOnBrand += result.onBrandCount;
    }
    expect(totalOnBrand).toBeGreaterThan(10);
    expect(runBrandScan({ cwd: dogfoodRoot, all: true })).toBeLessThanOrEqual(1);
  });
});

describe("brand apply", () => {
  it("dry-run applies all tailadmin PCC brandable hosts", async () => {
    const dogfoodRoot = resolve(import.meta.dirname, "../../../apps/tailadmin-dogfood");
    const code = await runBrandApply({
      cwd: dogfoodRoot,
      all: true,
      dryRun: true,
    });
    expect(code).toBe(0);
  });
});
