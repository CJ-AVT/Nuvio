import { describe, expect, it } from "vitest";
import { assertAllBrandRecipesAllowlisted } from "./brand-kit-validate.js";
import {
  brandPresetDimensionsForAction,
  buildBrandPreviewSummary,
  DEFAULT_BRAND_CONFIG,
} from "@rte/shared";
import { isBrandBulkCategoryLocked, isBrandBulkCategoryValidationReady } from "./brand-bulk-session.js";

describe("brandPresetDimensionsForAction", () => {
  it("exposes heading typography without radius", () => {
    expect(brandPresetDimensionsForAction("heading")).toEqual(["color", "typography"]);
    expect(brandPresetDimensionsForAction("heading")).not.toContain("radius");
  });
});

describe("brand-kit allowlist", () => {
  it("passes validateTailwindFragment for every preset × action", () => {
    expect(() => assertAllBrandRecipesAllowlisted()).not.toThrow();
  });
});

describe("buildBrandPreviewSummary", () => {
  it("returns human-readable action summary", () => {
    expect(
      buildBrandPreviewSummary("button", {
        color: "green",
        surface: "white",
        buttonVariant: "solid",
        buttonHover: "darken",
        cardShadow: "none",
        cardHover: "none",
        radius: "soft",
        density: "compact",
        typography: "clean",
      }),
    ).toBe("Button · Green fill · Solid · Soft · Compact · Darken hover");
  });
});

describe("isBrandBulkCategoryLocked", () => {
  it("locks a category when draft matches last bulk-applied brand", () => {
    const applied = { button: DEFAULT_BRAND_CONFIG };
    expect(isBrandBulkCategoryLocked("button", DEFAULT_BRAND_CONFIG, applied)).toBe(true);
    expect(
      isBrandBulkCategoryLocked("button", { ...DEFAULT_BRAND_CONFIG, color: "green" }, applied),
    ).toBe(false);
    expect(isBrandBulkCategoryLocked("card", DEFAULT_BRAND_CONFIG, applied)).toBe(false);
  });
});

describe("isBrandBulkCategoryValidationReady", () => {
  it("locks validate after bulk validate completes for the same draft", () => {
    expect(
      isBrandBulkCategoryValidationReady(
        "card",
        DEFAULT_BRAND_CONFIG,
        "card",
        DEFAULT_BRAND_CONFIG,
        true,
      ),
    ).toBe(true);
    expect(
      isBrandBulkCategoryValidationReady(
        "card",
        { ...DEFAULT_BRAND_CONFIG, color: "green" },
        "card",
        DEFAULT_BRAND_CONFIG,
        true,
      ),
    ).toBe(false);
  });
});
