import { describe, expect, it } from "vitest";
import * as path from "node:path";
import { detectProjectLibraries } from "./detect-libraries.js";

describe("detectProjectLibraries", () => {
  it("detects tailadmin in dogfood app", () => {
    const root = path.resolve(import.meta.dirname, "../../../apps/tailadmin-dogfood");
    const libs = detectProjectLibraries(root);
    expect(libs).toContain("tailadmin");
  });
});
