import { describe, expect, it } from "vitest";
import { removeDataRteIdFromSource } from "./remove-rte-id.js";

describe("removeDataRteIdFromSource", () => {
  it("removes literal data-rte-id from the matching host", async () => {
    const source = `<div data-rte-id="page.title" className="x">Hi</div>`;
    const result = await removeDataRteIdFromSource(source, "App.tsx", "page.title");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.source).not.toContain("data-rte-id");
      expect(result.source).toContain('className="x"');
    }
  });

  it("fails when host id is missing", async () => {
    const result = await removeDataRteIdFromSource(
      "<div>Hi</div>",
      "App.tsx",
      "page.title",
    );
    expect(result.ok).toBe(false);
  });
});
