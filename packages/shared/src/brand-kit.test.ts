import { describe, expect, it } from "vitest";
import {
  BRAND_APPLY_ACTIONS,
  BRAND_BUTTON_VARIANTS,
  BRAND_COLORS,
  BRAND_DENSITY,
  BRAND_RADIUS,
  BRAND_SURFACES,
  BRAND_TYPOGRAPHY,
  BRAND_PRESET_DIMENSIONS_BY_ACTION,
  brandColorsForAction,
  brandConfigsEqual,
  brandPresetDimensionsForAction,
  buildBrandClassFragment,
  buildBrandPatchOps,
  buildBrandPreviewSummary,
  DEFAULT_BRAND_CONFIG,
  normalizeBrandConfig,
  serializeBrandConfig,
} from "./brand-kit.js";

describe("brandPresetDimensionsForAction", () => {
  it("returns category-specific preset axes", () => {
    expect(brandPresetDimensionsForAction("card")).toEqual([
      "surface",
      "color",
      "radius",
      "density",
      "cardShadow",
      "cardHover",
    ]);
    expect(brandPresetDimensionsForAction("button")).toEqual([
      "color",
      "buttonVariant",
      "radius",
      "density",
      "buttonHover",
    ]);
    expect(brandPresetDimensionsForAction("heading")).toEqual(["color", "typography"]);
    expect(brandPresetDimensionsForAction("text")).toEqual(["color"]);
    expect(brandPresetDimensionsForAction("table")).toEqual(["color", "radius"]);
    expect(brandPresetDimensionsForAction("form")).toEqual([
      "color",
      "radius",
      "density",
      "surface",
    ]);
    expect(brandPresetDimensionsForAction("badge")).toEqual(["color"]);
  });

  it("matches BRAND_PRESET_DIMENSIONS_BY_ACTION for every action", () => {
    for (const action of BRAND_APPLY_ACTIONS) {
      expect(brandPresetDimensionsForAction(action)).toBe(BRAND_PRESET_DIMENSIONS_BY_ACTION[action]);
    }
  });
});

describe("normalizeBrandConfig", () => {
  it("returns defaults when input is missing", () => {
    expect(normalizeBrandConfig(undefined)).toEqual(DEFAULT_BRAND_CONFIG);
  });

  it("returns defaults for invalid JSON shape", () => {
    expect(normalizeBrandConfig({ color: "neon" })).toEqual(DEFAULT_BRAND_CONFIG);
  });

  it("merges partial v1 flat config with defaults", () => {
    expect(normalizeBrandConfig({ color: "purple" })).toEqual({
      ...DEFAULT_BRAND_CONFIG,
      color: "purple",
    });
  });

  it("accepts a valid full v1 flat config", () => {
    const cfg = {
      color: "rose",
      surface: "muted",
      buttonVariant: "outline",
      buttonHover: "none",
      cardShadow: "sm",
      cardHover: "border",
      radius: "pill",
      density: "spacious",
      typography: "bold",
    } as const;
    expect(normalizeBrandConfig(cfg)).toEqual(cfg);
  });

  it("reads v2 nested tokens", () => {
    expect(
      normalizeBrandConfig({
        version: 2,
        tokens: {
          accent: "green",
          surface: "muted",
          buttonVariant: "outline",
          radius: "rounded",
          density: "compact",
          typography: "soft",
        },
      }),
    ).toEqual({
      color: "green",
      surface: "muted",
      buttonVariant: "outline",
      buttonHover: "darken",
      cardShadow: "none",
      cardHover: "none",
      radius: "rounded",
      density: "compact",
      typography: "soft",
    });
  });

  it("maps legacy v1 color to accent with v1.7 defaults", () => {
    expect(
      normalizeBrandConfig({
        color: "purple",
        radius: "pill",
        density: "compact",
        typography: "bold",
      }),
    ).toEqual({
      color: "purple",
      surface: "white",
      buttonVariant: "solid",
      buttonHover: "darken",
      cardShadow: "none",
      cardHover: "none",
      radius: "pill",
      density: "compact",
      typography: "bold",
    });
  });
});

describe("serializeBrandConfig", () => {
  it("writes v2 tokens with accent alias", () => {
    expect(serializeBrandConfig(DEFAULT_BRAND_CONFIG)).toEqual({
      version: 2,
      tokens: {
        accent: "blue",
        surface: "white",
        buttonVariant: "solid",
        buttonHover: "darken",
        cardShadow: "none",
        cardHover: "none",
        radius: "soft",
        density: "balanced",
        typography: "clean",
      },
    });
  });
});

describe("brandConfigsEqual", () => {
  it("detects dirty draft vs saved", () => {
    expect(brandConfigsEqual(DEFAULT_BRAND_CONFIG, { ...DEFAULT_BRAND_CONFIG, color: "green" })).toBe(
      false,
    );
    expect(brandConfigsEqual(DEFAULT_BRAND_CONFIG, DEFAULT_BRAND_CONFIG)).toBe(true);
  });
});

describe("brandColorsForAction", () => {
  it("includes none and neutral for border-slot categories", () => {
    expect(brandColorsForAction("card")).toContain("none");
    expect(brandColorsForAction("card")).toContain("neutral");
    expect(brandColorsForAction("button")).not.toContain("none");
  });
});

describe("buildBrandClassFragment", () => {
  it("builds a blue solid button fragment", () => {
    expect(buildBrandClassFragment("button", DEFAULT_BRAND_CONFIG)).toBe(
      "bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700",
    );
  });

  it("builds a solid button without hover when buttonHover is none", () => {
    expect(
      buildBrandClassFragment("button", { ...DEFAULT_BRAND_CONFIG, buttonHover: "none" }),
    ).toBe("bg-blue-600 text-white rounded-md px-4 py-2");
  });

  it("builds an outline button fragment with hover tint", () => {
    expect(
      buildBrandClassFragment("button", {
        ...DEFAULT_BRAND_CONFIG,
        color: "purple",
        buttonVariant: "outline",
      }),
    ).toBe(
      "border border-purple-600 text-purple-600 bg-transparent rounded-md px-4 py-2 hover:bg-purple-50",
    );
  });

  it("uses slate-700 for slate button background", () => {
    expect(
      buildBrandClassFragment("button", { ...DEFAULT_BRAND_CONFIG, color: "slate" }),
    ).toBe("bg-slate-700 text-white rounded-md px-4 py-2 hover:bg-slate-800");
  });

  it("builds card without border when color is none", () => {
    expect(
      buildBrandClassFragment("card", { ...DEFAULT_BRAND_CONFIG, color: "none" }),
    ).toBe("bg-white border-0 rounded-md p-6");
  });

  it("builds table without border when color is none", () => {
    expect(
      buildBrandClassFragment("table", { ...DEFAULT_BRAND_CONFIG, color: "none" }),
    ).toBe("max-w-full border-0 rounded-md");
  });

  it("builds card with neutral gray border", () => {
    expect(
      buildBrandClassFragment("card", { ...DEFAULT_BRAND_CONFIG, color: "neutral" }),
    ).toBe("bg-white border border-gray-200 rounded-md p-6");
  });

  it("builds muted card surface from token", () => {
    expect(
      buildBrandClassFragment("card", { ...DEFAULT_BRAND_CONFIG, surface: "muted", color: "rose" }),
    ).toBe("bg-slate-50 border border-rose-300 rounded-md p-6");
  });

  it("builds card shadow and hover border from tokens", () => {
    expect(
      buildBrandClassFragment("card", {
        ...DEFAULT_BRAND_CONFIG,
        color: "rose",
        cardShadow: "sm",
        cardHover: "border",
      }),
    ).toBe(
      "bg-white border border-rose-300 rounded-md p-6 shadow-sm hover:border-rose-400",
    );
  });

  it("builds card padding from density", () => {
    expect(
      buildBrandClassFragment("card", { ...DEFAULT_BRAND_CONFIG, density: "spacious" }),
    ).toContain("p-8");
  });

  it("builds heading from typography preset", () => {
    expect(
      buildBrandClassFragment("heading", { ...DEFAULT_BRAND_CONFIG, typography: "bold" }),
    ).toBe("text-lg font-semibold text-blue-600");
  });

  it("builds body text from project text color at fixed size", () => {
    expect(buildBrandClassFragment("text", DEFAULT_BRAND_CONFIG)).toBe(
      "text-sm font-normal text-blue-600",
    );
    expect(
      buildBrandClassFragment("text", { ...DEFAULT_BRAND_CONFIG, color: "neutral" }),
    ).toBe("text-sm font-normal text-gray-700");
  });

  it("builds table chrome from color and radius", () => {
    expect(buildBrandClassFragment("table", { ...DEFAULT_BRAND_CONFIG, color: "purple", radius: "rounded" })).toBe(
      "max-w-full border border-purple-300 rounded-xl",
    );
  });

  it("builds form label and input fragments", () => {
    expect(
      buildBrandClassFragment("form", DEFAULT_BRAND_CONFIG, { tagName: "label", hostId: "form.email.label" }),
    ).toBe("text-sm font-medium text-gray-700");
    expect(
      buildBrandClassFragment("form", DEFAULT_BRAND_CONFIG, { tagName: "input", hostId: "form.email.input" }),
    ).toBe("bg-white border border-blue-300 rounded-md px-4 py-2");
    expect(
      buildBrandClassFragment(
        "form",
        { ...DEFAULT_BRAND_CONFIG, surface: "muted" },
        { tagName: "input", hostId: "form.email.input" },
      ),
    ).toBe("bg-slate-50 border border-blue-300 rounded-md px-4 py-2");
  });

  it("builds badge chip fragment", () => {
    expect(buildBrandClassFragment("badge", { ...DEFAULT_BRAND_CONFIG, color: "purple" })).toBe(
      "inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-700",
    );
  });
});

describe("buildBrandPatchOps", () => {
  it("emits mergeTailwindClassName", () => {
    expect(buildBrandPatchOps("button", DEFAULT_BRAND_CONFIG)).toEqual([
      {
        kind: "mergeTailwindClassName",
        classNameFragment: "bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700",
      },
    ]);
  });
});

describe("buildBrandPreviewSummary", () => {
  it("uses human labels only", () => {
    const summary = buildBrandPreviewSummary("button", {
      color: "purple",
      surface: "white",
      buttonVariant: "solid",
      buttonHover: "darken",
      cardShadow: "none",
      cardHover: "none",
      radius: "rounded",
      density: "balanced",
      typography: "clean",
    });
    expect(summary).toBe("Button · Purple fill · Solid · Rounded · Balanced · Darken hover");
    expect(summary).not.toMatch(/bg-|text-|rounded-|px-/);
  });
});

describe("brand preset matrix", () => {
  it("produces non-empty fragments for every preset combination", () => {
    for (const surface of BRAND_SURFACES) {
      for (const buttonVariant of BRAND_BUTTON_VARIANTS) {
        for (const buttonHover of ["none", "darken"] as const) {
          for (const cardShadow of ["none", "sm", "md"] as const) {
            for (const cardHover of ["none", "border"] as const) {
              for (const radius of BRAND_RADIUS) {
                for (const density of BRAND_DENSITY) {
                  for (const typography of BRAND_TYPOGRAPHY) {
                    for (const action of BRAND_APPLY_ACTIONS) {
                      for (const color of brandColorsForAction(action)) {
                        const config = {
                          ...DEFAULT_BRAND_CONFIG,
                          color,
                          surface,
                          buttonVariant,
                          buttonHover,
                          cardShadow,
                          cardHover,
                          radius,
                          density,
                          typography,
                        };
                        const fragment = buildBrandClassFragment(action, config);
                        expect(fragment.length).toBeGreaterThan(0);
                        expect(fragment).not.toMatch(/dark:/);
                        if (action === "form") {
                          expect(
                            buildBrandClassFragment(action, config, { tagName: "label" }).length,
                          ).toBeGreaterThan(0);
                          expect(
                            buildBrandClassFragment(action, config, { tagName: "input" }).length,
                          ).toBeGreaterThan(0);
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  });
});
