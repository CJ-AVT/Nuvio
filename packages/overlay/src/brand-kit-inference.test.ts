import { describe, expect, it } from "vitest";
import { DEFAULT_BRAND_CONFIG, inferBrandPresetsFromTokens } from "@nuvio/shared";
import { flattenTokensAtBreakpoint } from "./tailwind-token-read.js";
import { buildBrandPageBaselineDraft } from "./brand-preset-sync.js";

const ORDERS_CARD_CLASS =
  "bg-white border border-rose-300 rounded-md p-6 md:p-4 md:gap-2 xl:shadow-sm xl:border-gray-200 xl:bg-white xl:border-0 xl:rounded-md xl:p-6 dark:border-gray-800 dark:bg-white/[0.03] hover:border-rose-400 hover:border-rose-400 hover:border-blue-400";

describe("brand kit selection inference", () => {
  it("reads rose border from metric.orders.card at base breakpoint", () => {
    const tokens = flattenTokensAtBreakpoint(ORDERS_CARD_CLASS, "base");
    const inferred = inferBrandPresetsFromTokens(tokens, "card");
    expect(inferred.color).toBe("rose");
    expect(inferred.radius).toBe("soft");
    expect(inferred.density).toBe("balanced");
  });

  it("reads xl cascade for metric.orders.card at desktop breakpoint", () => {
    const tokens = flattenTokensAtBreakpoint(ORDERS_CARD_CLASS, "xl");
    const inferred = inferBrandPresetsFromTokens(tokens, "card");
    expect(inferred.color).toBe("none");
  });

  it("reads blue xl card border after brand apply on dogfood metric cards", () => {
    const branded =
      "bg-white border border-rose-300 rounded-md p-6 md:p-4 md:gap-2 xl:shadow-sm xl:bg-white xl:border xl:border-blue-300 xl:rounded-md xl:p-6";
    const tokens = flattenTokensAtBreakpoint(branded, "xl");
    const inferred = inferBrandPresetsFromTokens(tokens, "card");
    expect(inferred.color).toBe("blue");
  });

  it("does not keep saved purple when page baseline merges inferred card traits", () => {
    const tokens = flattenTokensAtBreakpoint(ORDERS_CARD_CLASS, "base");
    const inferred = inferBrandPresetsFromTokens(tokens, "card");
    const pageDraft = buildBrandPageBaselineDraft(
      { ...DEFAULT_BRAND_CONFIG, color: "purple" },
      inferred,
      ["surface", "color", "radius", "density", "cardShadow", "cardHover"],
    );
    expect(pageDraft.color).toBe("rose");
    expect(pageDraft.color).not.toBe("purple");
  });
});
