import { describe, expect, it } from "vitest";
import { DEFAULT_BRAND_CONFIG } from "./brand-kit.js";
import {
  inferBrandPresetsFromClassName,
  inspectBrandMatch,
  inspectBrandMatchForAction,
} from "./brand-inspector.js";

describe("inspectBrandMatch", () => {
  it("reports full match for a branded button", () => {
    const result = inspectBrandMatch(
      "bg-blue-600 text-white rounded-md px-4 py-2 text-base font-medium",
      DEFAULT_BRAND_CONFIG,
    );
    expect(result.matchCount).toBeGreaterThanOrEqual(3);
    expect(result.rows.find((row) => row.dimension === "color")?.status).toBe("match");
    expect(result.rows.find((row) => row.dimension === "radius")?.status).toBe("match");
    expect(result.headline).toBe("Matches your saved brand.");
  });

  it("flags color mismatch with human labels", () => {
    const result = inspectBrandMatch("bg-rose-600 text-white rounded-md px-4 py-2", DEFAULT_BRAND_CONFIG);
    const color = result.rows.find((row) => row.dimension === "color");
    expect(color?.status).toBe("mismatch");
    expect(color?.currentLabel).toBe("Rose");
    expect(color?.brandLabel).toBe("Blue");
    expect(color?.currentLabel).not.toMatch(/bg-/);
  });

  it("flags radius mismatch for non-brand rounded token", () => {
    const result = inspectBrandMatch("bg-blue-600 rounded-lg px-4 py-2", DEFAULT_BRAND_CONFIG);
    const radius = result.rows.find((row) => row.dimension === "radius");
    expect(radius?.status).toBe("mismatch");
    expect(radius?.currentLabel).toBe("Custom (lg)");
    expect(radius?.brandLabel).toBe("Soft");
  });

  it("detects card density from p-* tokens", () => {
    const result = inspectBrandMatch(
      "bg-white border border-blue-300 rounded-xl p-6",
      DEFAULT_BRAND_CONFIG,
    );
    const density = result.rows.find((row) => row.dimension === "density");
    expect(density?.status).toBe("match");
    expect(density?.currentLabel).toBe("Balanced");
  });

  it("reports not_set when no brand traits are present", () => {
    const result = inspectBrandMatch("flex items-center gap-2", DEFAULT_BRAND_CONFIG);
    expect(result.checkedCount).toBe(0);
    expect(result.headline).toBe("No brand styles detected on this element.");
    expect(result.rows.every((row) => row.status === "not_set")).toBe(true);
  });

  it("uses human labels in headline and rows only", () => {
    const result = inspectBrandMatch("text-lg font-semibold text-purple-600", {
      ...DEFAULT_BRAND_CONFIG,
      color: "purple",
      typography: "bold",
    });
    for (const row of result.rows) {
      expect(row.currentLabel).not.toMatch(/text-|font-|bg-|rounded-|px-|py-/);
      expect(row.brandLabel).not.toMatch(/text-|font-|bg-|rounded-|px-|py-/);
    }
    expect(result.headline).not.toMatch(/text-|font-|bg-|rounded-|px-|py-/);
  });
});

describe("inferBrandPresetsFromClassName", () => {
  it("detects card border color, radius, and padding", () => {
    const inferred = inferBrandPresetsFromClassName(
      "bg-white border border-rose-300 rounded-xl p-8 shadow-sm",
      "card",
    );
    expect(inferred).toEqual({
      color: "rose",
      surface: "white",
      radius: "rounded",
      density: "spacious",
    });
  });

  it("detects button fill color, radius, and padding", () => {
    const inferred = inferBrandPresetsFromClassName(
      "bg-purple-600 text-white rounded-md px-4 py-2",
      "button",
    );
    expect(inferred).toEqual({
      color: "purple",
      buttonVariant: "solid",
      radius: "soft",
      density: "balanced",
    });
  });

  it("scopes heading inference to color and typography", () => {
    const inferred = inferBrandPresetsFromClassName(
      "text-lg font-semibold text-green-600 rounded-md px-4 py-2",
      "heading",
    );
    expect(inferred).toEqual({
      color: "green",
      typography: "bold",
    });
  });

  it("prefers later responsive tokens when inferring presets", () => {
    const inferred = inferBrandPresetsFromClassName(
      "bg-purple-600 rounded-md px-4 py-2 xl:bg-rose-600 xl:rounded-xl",
      "button",
    );
    expect(inferred).toEqual({
      color: "rose",
      buttonVariant: "solid",
      radius: "rounded",
      density: "balanced",
    });
  });

  it("infers border hue for cards even when fill tokens differ", () => {
    const inferred = inferBrandPresetsFromClassName(
      "bg-purple-600 border border-rose-300 rounded-xl p-8",
      "card",
    );
    expect(inferred).toEqual({
      color: "rose",
      radius: "rounded",
      density: "spacious",
    });
  });

  it("infers fill hue for buttons even when border tokens differ", () => {
    const inferred = inferBrandPresetsFromClassName(
      "border border-rose-300 bg-purple-600 rounded-md px-4 py-2",
      "button",
    );
    expect(inferred).toEqual({
      color: "purple",
      buttonVariant: "solid",
      radius: "soft",
      density: "balanced",
    });
  });

  it("infers tint hue for badges from bg/text tokens", () => {
    const inferred = inferBrandPresetsFromClassName(
      "inline-flex rounded-full bg-green-100 text-green-700",
      "badge",
    );
    expect(inferred).toEqual({ color: "green" });
  });

  it("infers muted card surface from bg-slate-50", () => {
    const inferred = inferBrandPresetsFromClassName(
      "bg-slate-50 border border-rose-300 rounded-xl p-6",
      "card",
    );
    expect(inferred.surface).toBe("muted");
  });

  it("infers outline button variant from bg-transparent", () => {
    const inferred = inferBrandPresetsFromClassName(
      "border border-purple-600 text-purple-600 bg-transparent rounded-md px-4 py-2",
      "button",
    );
    expect(inferred).toMatchObject({
      color: "purple",
      buttonVariant: "outline",
      radius: "soft",
      density: "balanced",
    });
  });

  it("infers neutral border color from border-gray-200", () => {
    const inferred = inferBrandPresetsFromClassName(
      "bg-white border border-gray-200 rounded-md p-6",
      "card",
    );
    expect(inferred.color).toBe("neutral");
  });

  it("prefers accent border color over later border-0 reset tokens on tables", () => {
    const inferred = inferBrandPresetsFromClassName(
      "max-w-full border border-blue-300 rounded-md xl:border-0 xl:border-gray-200",
      "table",
    );
    expect(inferred.color).toBe("blue");
  });

  it("uses responsive cascade for card borders at xl (not stale base accent)", () => {
    const inferred = inferBrandPresetsFromClassName(
      "bg-white border border-rose-300 rounded-md p-6 xl:border-gray-200 xl:border-0 xl:rounded-md xl:p-6",
      "card",
    );
    expect(inferred.color).toBe("none");
  });

  it("reads xl card brand border after responsive overrides", () => {
    const inferred = inferBrandPresetsFromClassName(
      "bg-white border border-rose-300 rounded-md p-6 xl:border xl:border-blue-300 xl:rounded-md xl:p-6",
      "card",
    );
    expect(inferred.color).toBe("blue");
  });

  it("does not infer hover presets from class strings", () => {
    const inferred = inferBrandPresetsFromClassName(
      "bg-purple-600 text-white rounded-md px-4 py-2 hover:bg-purple-700",
      "button",
    );
    expect(inferred).toEqual({
      color: "purple",
      buttonVariant: "solid",
      radius: "soft",
      density: "balanced",
    });
    expect(inferred.buttonHover).toBeUndefined();
    expect(inferred.cardShadow).toBeUndefined();
    expect(inferred.cardHover).toBeUndefined();
  });

  it("infers text color from body text hosts", () => {
    const inferred = inferBrandPresetsFromClassName(
      "text-sm font-normal text-blue-600 xl:text-sm xl:font-normal xl:text-blue-600",
      "text",
    );
    expect(inferred).toEqual({ color: "blue" });
  });
});

describe("inspectBrandMatchForAction", () => {
  it("ignores typography on buttons", () => {
    const result = inspectBrandMatchForAction(
      "button",
      "bg-blue-600 text-white rounded-md px-4 py-2 text-base font-medium",
      DEFAULT_BRAND_CONFIG,
    );
    expect(result.headline).toBe("Matches your saved brand.");
  });

  it("matches text hosts against the text recipe fragment", () => {
    const result = inspectBrandMatchForAction(
      "text",
      "text-sm font-normal text-blue-600",
      DEFAULT_BRAND_CONFIG,
    );
    expect(result.headline).toBe("Matches your saved brand.");
  });

  it("prefers larger card padding when responsive variants coexist", () => {
    const result = inspectBrandMatchForAction(
      "card",
      "bg-white border border-purple-300 rounded-xl p-6 md:p-4",
      { ...DEFAULT_BRAND_CONFIG, color: "purple", radius: "rounded" },
    );
    const density = result.rows.find((row) => row.dimension === "density");
    expect(density?.status).toBe("match");
    expect(density?.currentLabel).toBe("Balanced");
  });

  it("matches table hosts on border and radius only", () => {
    const result = inspectBrandMatchForAction(
      "table",
      "max-w-full border border-purple-300 rounded-xl overflow-x-auto",
      { ...DEFAULT_BRAND_CONFIG, color: "purple", radius: "rounded" },
    );
    expect(result.headline).toBe("Matches your saved brand.");
  });

  it("matches badge recipe tokens", () => {
    const result = inspectBrandMatchForAction(
      "badge",
      "inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-700",
      { ...DEFAULT_BRAND_CONFIG, color: "purple" },
    );
    expect(result.headline).toBe("Matches your saved brand.");
  });
});
