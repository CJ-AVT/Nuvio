import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { detectPackageManager } from "../src/detect-pm.js";
import { detectProject } from "../src/detect-project.js";
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
  it("adds nuvio import and plugin", () => {
    const root = fixture("vite-react-ts-minimal");
    const vitePath = join(root, "vite.config.ts");
    const before = readFileSync(vitePath, "utf8");
    expect(before).not.toContain("nuvio");

    const result = patchViteConfigFile(vitePath);
    expect(result.ok).toBe(true);

    const after = readFileSync(vitePath, "utf8");
    expect(after).toContain('@nuvio/vite-plugin');
    expect(after).toContain("nuvio()");
    expect(after).toContain("@nuvio/overlay");
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
      '@nuvio/overlay/style.css',
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
  it("adds NuvioDevShell", () => {
    const root = fixture("vite-react-ts-minimal");
    const appPath = resolveAppFile(root)!;
    const result = patchAppRootFile(appPath);
    expect(result.ok).toBe(true);
    const text = readFileSync(appPath, "utf8");
    expect(text).toContain("NuvioDevShell");
    expect(text).toContain("@nuvio/overlay");
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
    const root = fixture("vite-already-nuvio");
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
    expect(existsSync(join(root, "nuvio"))).toBe(false);
  });

  it("wires minimal fixture with --no-install", async () => {
    const root = fixture("vite-react-ts-minimal");
    const code = await runInit({
      cwd: root,
      yes: true,
      noInstall: true,
    });
    expect(code).toBe(0);
    expect(readFileSync(join(root, "vite.config.ts"), "utf8")).toContain("nuvio()");
    expect(readFileSync(join(root, "src/App.tsx"), "utf8")).toContain(
      "NuvioDevShell",
    );
    expect(projectHasPageTitleId(root)).toBe(true);
    expect(existsSync(join(root, "nuvio/START_HERE.md"))).toBe(true);
    expect(existsSync(join(root, "nuvio/AGENT.md"))).toBe(true);
    const main = readFileSync(join(root, "src/main.tsx"), "utf8");
    const vite = readFileSync(join(root, "vite.config.ts"), "utf8");
    expect(main).toContain("@nuvio/overlay/style.css");
    expect(vite).toContain("optimizeDeps");
    expect(vite).toContain("@nuvio/overlay");
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
    expect(existsSync(join(root, "nuvio/SETUP_TODO.md"))).toBe(false);
    expect(readFileSync(join(root, "src/App.tsx"), "utf8")).toContain(
      "NuvioDevShell",
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
