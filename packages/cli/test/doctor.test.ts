import { existsSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { runDoctor } from "../src/doctor.js";
import { runInit } from "../src/init.js";
import { cleanup, copyFixture } from "./helpers.js";

const REPO_ROOT = join(import.meta.dirname, "../../..");
const TAILADMIN = join(REPO_ROOT, "apps/tailadmin-dogfood");

const dirs: string[] = [];

function fixture(name: string): string {
  const dir = copyFixture(name);
  dirs.push(dir);
  return dir;
}

afterEach(() => {
  while (dirs.length) cleanup(dirs.pop()!);
});

describe("runDoctor", () => {
  it("fails critical checks on unwired minimal fixture", async () => {
    const root = fixture("vite-react-ts-minimal");
    const code = await runDoctor({ cwd: root, checkDevServer: false });
    expect(code).toBe(1);
  });

  it("passes after init wiring", async () => {
    const root = fixture("vite-react-ts-minimal");
    await runInit({ cwd: root, yes: true, noInstall: true });
    const code = await runDoctor({ cwd: root, checkDevServer: false });
    expect(code).toBe(0);
  });

  it("passes on monorepo tailadmin dogfood (workspace deps + layout shell)", async () => {
    if (!existsSync(join(TAILADMIN, "package.json"))) return;
    const code = await runDoctor({ cwd: TAILADMIN, checkDevServer: false });
    expect(code).toBe(0);
  });

  it("emits JSON with check statuses", async () => {
    const root = fixture("vite-already-rte");
    const logs: string[] = [];
    const orig = console.log;
    console.log = (...args: unknown[]) => {
      logs.push(args.map(String).join(" "));
    };
    try {
      await runDoctor({ cwd: root, json: true, checkDevServer: false });
    } finally {
      console.log = orig;
    }
    const parsed = JSON.parse(logs.join("\n")) as {
      checks: Array<{ status: string }>;
      failCount: number;
    };
    expect(parsed.checks.length).toBeGreaterThan(0);
    expect(parsed.failCount).toBeGreaterThanOrEqual(0);
  });
});
