import { describe, expect, it } from "vitest";
import {
  BACKGROUND_COLOR_OPTIONS,
  TEXT_COLOR_OPTIONS,
} from "./tailwind-color-options.js";

describe("tailwind color options", () => {
  it("exposes full Tailwind text scale plus clears", () => {
    expect(TEXT_COLOR_OPTIONS.length).toBeGreaterThan(240);
    expect(TEXT_COLOR_OPTIONS.some((o) => o.value === "text-rose-500")).toBe(true);
    expect(TEXT_COLOR_OPTIONS.find((o) => o.value === "text-rose-500")?.hex).toMatch(/^#/);
  });

  it("exposes full Tailwind background scale plus opacity variants", () => {
    expect(BACKGROUND_COLOR_OPTIONS.length).toBeGreaterThan(250);
    expect(BACKGROUND_COLOR_OPTIONS.some((o) => o.value === "bg-slate-900/50")).toBe(true);
    expect(BACKGROUND_COLOR_OPTIONS.some((o) => o.value === "bg-violet-600")).toBe(true);
  });
});
