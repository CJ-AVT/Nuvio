import { describe, expect, it } from "vitest";
import { pathnameFromUpgradeUrl } from "./upgrade-url.js";

describe("pathnameFromUpgradeUrl", () => {
  it("parses bare path", () => {
    expect(pathnameFromUpgradeUrl("/__nuvio/ws")).toBe("/__nuvio/ws");
  });

  it("strips query string", () => {
    expect(pathnameFromUpgradeUrl("/__nuvio/ws?x=1")).toBe("/__nuvio/ws");
  });

  it("handles missing url", () => {
    expect(pathnameFromUpgradeUrl(undefined)).toBe("");
  });
});
