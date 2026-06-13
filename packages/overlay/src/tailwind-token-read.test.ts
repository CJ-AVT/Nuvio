import { describe, expect, it } from "vitest";
import {
  classNameHasResponsiveUtilities,
  flattenTokensAtBreakpoint,
  isBgColorUtility,
  isTextColorUtility,
  lastMatchingToken,
  readBreakpointForCardInference,
  viewportBreakpoint,
} from "./tailwind-token-read.js";

describe("readBreakpointForCardInference", () => {
  it("uses viewport breakpoint for responsive card class stacks", () => {
    const cardClass =
      "bg-white border border-rose-300 rounded-md p-6 xl:border-0 xl:rounded-md xl:p-6";
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: (query: string) => ({
        matches: query === "(min-width: 1280px)",
        media: query,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
      }),
    });
    expect(viewportBreakpoint()).toBe("xl");
    expect(readBreakpointForCardInference(cardClass, "base")).toBe("xl");
  });

  it("keeps active breakpoint for non-responsive cards", () => {
    expect(readBreakpointForCardInference("bg-white border border-rose-300 p-6", "md")).toBe("md");
  });
});

describe("classNameHasResponsiveUtilities", () => {
  it("returns false for base-only utilities", () => {
    expect(classNameHasResponsiveUtilities("text-lg font-semibold text-gray-800")).toBe(false);
  });

  it("returns true when sm–xl prefixed utilities exist", () => {
    expect(classNameHasResponsiveUtilities("text-gray-700 xl:text-orange-500")).toBe(true);
  });
});

describe("flattenTokensAtBreakpoint", () => {
  it("includes xl bucket utilities when active breakpoint is xl", () => {
    const tokens = flattenTokensAtBreakpoint(
      "rounded-2xl bg-white xl:bg-red-100 dark:bg-white/[0.03]",
      "xl",
    );
    expect(tokens).toContain("bg-white");
    expect(tokens).toContain("bg-red-100");
    expect(tokens).not.toContain("bg-white/[0.03]");
  });

  it("omits xl utilities when active breakpoint is base", () => {
    const tokens = flattenTokensAtBreakpoint("bg-white xl:bg-red-100", "base");
    expect(tokens).toContain("bg-white");
    expect(tokens).not.toContain("bg-red-100");
  });
});

describe("color utility detection", () => {
  it("detects text and bg colors with opacity", () => {
    expect(isTextColorUtility("text-red-600")).toBe(true);
    expect(isTextColorUtility("text-white/90")).toBe(true);
    expect(isTextColorUtility("text-sm")).toBe(false);
    expect(isBgColorUtility("bg-white/[0.03]")).toBe(true);
  });

  it("lastMatchingToken returns last color in cascade list", () => {
    const tokens = flattenTokensAtBreakpoint(
      "text-gray-800 xl:text-red-600 dark:text-white/90",
      "xl",
    );
    expect(lastMatchingToken(tokens, isTextColorUtility)).toBe("text-red-600");
  });

  it("ignores hover text colors so xl responsive color matches the canvas", () => {
    const tokens = flattenTokensAtBreakpoint(
      "text-gray-700 xl:text-orange-500 hover:text-gray-800",
      "xl",
    );
    expect(lastMatchingToken(tokens, isTextColorUtility)).toBe("text-orange-500");
  });
});
