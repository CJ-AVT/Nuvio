import { afterEach, describe, expect, it } from "vitest";
import { runInit } from "../src/init.js";
import { runStats } from "../src/stats.js";
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

describe("runStats", () => {
  it("reports zero hosts before init", () => {
    const root = fixture("vite-react-ts-minimal");
    const logs: string[] = [];
    const orig = console.log;
    console.log = (...args: unknown[]) => {
      logs.push(args.map(String).join(" "));
    };
    try {
      expect(runStats({ cwd: root, json: true })).toBe(0);
    } finally {
      console.log = orig;
    }
    const parsed = JSON.parse(logs.join("\n")) as { editableHosts: number };
    expect(parsed.editableHosts).toBe(0);
  });

  it("reports one host after init", async () => {
    const root = fixture("vite-react-ts-minimal");
    await runInit({ cwd: root, yes: true, noInstall: true });
    const logs: string[] = [];
    const orig = console.log;
    console.log = (...args: unknown[]) => {
      logs.push(args.map(String).join(" "));
    };
    try {
      expect(runStats({ cwd: root, json: true })).toBe(0);
    } finally {
      console.log = orig;
    }
    const parsed = JSON.parse(logs.join("\n")) as {
      editableHosts: number;
      taggedFiles: number;
    };
    expect(parsed.editableHosts).toBe(1);
    expect(parsed.taggedFiles).toBe(1);
  });
});
