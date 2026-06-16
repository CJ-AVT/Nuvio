import { describe, expect, it } from "vitest";
import {
  parsePccManifest,
  PCC_SUPPORTED_CATEGORIES,
  pccHostsForCategory,
} from "./coverage-contract.js";

describe("parsePccManifest", () => {
  const valid = {
    page: "dashboard",
    route: "/",
    categories: {
      card: {
        required: true,
        hosts: ["metric.customers.card", "metric.orders.card"],
      },
      button: {
        hosts: ["orders.filter"],
      },
    },
  };

  it("accepts a valid manifest", () => {
    const result = parsePccManifest(valid);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.manifest.page).toBe("dashboard");
      expect(pccHostsForCategory(result.manifest, "card")).toHaveLength(2);
      expect(result.manifest.categories.button?.required).toBe(true);
    }
  });

  it("rejects missing page", () => {
    const result = parsePccManifest({ route: "/", categories: { card: { hosts: ["a.card"] } } });
    expect(result.ok).toBe(false);
  });

  it("rejects unknown category", () => {
    const result = parsePccManifest({
      page: "x",
      route: "/",
      categories: { accordion: { hosts: ["x"] } },
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toMatch(/Unknown PCC category/);
    }
  });

  it("rejects media/layout categories", () => {
    for (const cat of ["media", "layout"] as const) {
      const result = parsePccManifest({
        page: "x",
        route: "/",
        categories: { [cat]: { hosts: ["hero.img"] } },
      });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toMatch(/excluded from PCC/);
      }
    }
  });

  it("rejects duplicate hosts across categories", () => {
    const result = parsePccManifest({
      page: "x",
      route: "/",
      categories: {
        card: { hosts: ["shared.host"] },
        button: { hosts: ["shared.host"] },
      },
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toMatch(/Duplicate host/);
    }
  });

  it("rejects empty hosts array", () => {
    const result = parsePccManifest({
      page: "x",
      route: "/",
      categories: { card: { hosts: [] } },
    });
    expect(result.ok).toBe(false);
  });

  it("lists MVP categories", () => {
    expect(PCC_SUPPORTED_CATEGORIES).toContain("card");
    expect(PCC_SUPPORTED_CATEGORIES).toContain("table");
    expect(PCC_SUPPORTED_CATEGORIES).toHaveLength(8);
  });
});
