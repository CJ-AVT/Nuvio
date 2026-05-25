import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { assertPathWithinRoot, PathEscapeError } from "./secure-path.js";

describe("assertPathWithinRoot", () => {
  let root: string;

  it("allows root itself", () => {
    root = mkdtempSync(path.join(os.tmpdir(), "nuvio-root-"));
    expect(() => assertPathWithinRoot(root, root)).not.toThrow();
    rmSync(root, { recursive: true, force: true });
  });

  it("allows nested file", () => {
    root = mkdtempSync(path.join(os.tmpdir(), "nuvio-root-"));
    const file = path.join(root, "src", "App.tsx");
    expect(() => assertPathWithinRoot(root, file)).not.toThrow();
    rmSync(root, { recursive: true, force: true });
  });

  it("rejects parent escape", () => {
    root = mkdtempSync(path.join(os.tmpdir(), "nuvio-root-"));
    const evil = path.join(root, "..", "outside", "x.ts");
    expect(() => assertPathWithinRoot(root, evil)).toThrow(PathEscapeError);
    rmSync(root, { recursive: true, force: true });
  });
});
