import { describe, expect, it } from "vitest";
import { pathnameFromUpgradeUrl } from "./upgrade-url.js";

describe("pathnameFromUpgradeUrl", () => {
  it("parses bare path", () => {
    expect(pathnameFromUpgradeUrl("/__rte/ws")).toBe("/__rte/ws");
  });

  it("strips query string", () => {
    expect(pathnameFromUpgradeUrl("/__rte/ws?x=1")).toBe("/__rte/ws");
  });

  it("handles missing url", () => {
    expect(pathnameFromUpgradeUrl(undefined)).toBe("");
  });
});
