import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { resolvePccManifestByRoute } from "../src/handle-pcc-config.js";

describe("handle-pcc-config", () => {
  it("resolves dashboard manifest by route", () => {
    const dogfoodRoot = resolve(import.meta.dirname, "../../../apps/tailadmin-dogfood");
    const resolved = resolvePccManifestByRoute(dogfoodRoot, dogfoodRoot, "/");
    expect(resolved).not.toBeNull();
    expect(resolved?.manifest.page).toBe("dashboard");
    expect(resolved?.manifest.categories.card?.hosts).toHaveLength(7);
  });

  it("returns null for unknown routes", () => {
    const dogfoodRoot = resolve(import.meta.dirname, "../../../apps/tailadmin-dogfood");
    const resolved = resolvePccManifestByRoute(dogfoodRoot, dogfoodRoot, "/unknown-page");
    expect(resolved).toBeNull();
  });
});
