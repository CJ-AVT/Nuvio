import { describe, expect, it } from "vitest";
import { buildBrandPageDiscoveryLine } from "./brand-page-discovery.js";

describe("buildBrandPageDiscoveryLine", () => {
  it("formats counts in canonical category order", () => {
    expect(
      buildBrandPageDiscoveryLine({
        card: 7,
        button: 2,
        table: 1,
        heading: 6,
      }),
    ).toBe("On this page: 2 buttons · 7 cards · 6 headings · 1 table");
  });

  it("returns null when no brandable hosts are on the page", () => {
    expect(buildBrandPageDiscoveryLine({})).toBeNull();
    expect(buildBrandPageDiscoveryLine({ card: 0, button: 0 })).toBeNull();
  });

  it("uses singular labels for a count of one", () => {
    expect(buildBrandPageDiscoveryLine({ table: 1 })).toBe("On this page: 1 table");
  });
});
