import { describe, expect, it } from "vitest";
import { insertDataRteIdAtLocation } from "./insert-rte-id.js";
import { isValidRteId, suggestRteId } from "./rte-id.js";

describe("rte id helpers", () => {
  it("validates segmented ids", () => {
    expect(isValidRteId("page.title")).toBe(true);
    expect(isValidRteId("metric.orders.card")).toBe(true);
    expect(isValidRteId("Page.Title")).toBe(false);
    expect(isValidRteId("title")).toBe(false);
  });

  it("suggests unique ids from tag name", () => {
    const existing = new Set(["page.title"]);
    expect(suggestRteId({ tagName: "h1", existingIds: existing })).toBe("page.title2");
    expect(suggestRteId({ tagName: "button", existingIds: new Set() })).toBe("page.button");
    expect(
      suggestRteId({
        tagName: "span",
        existingIds: new Set(),
        parentPrefix: "metric.orders",
      }),
    ).toBe("metric.orders.label");
  });
});

describe("insertDataRteIdAtLocation", () => {
  it("inserts data-rte-id at matching line/column", async () => {
    const src = `export function App() {
  return <h1>Welcome</h1>;
}
`;
    const r = await insertDataRteIdAtLocation(src, "/proj/App.tsx", 2, 9, "page.title");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.source).toContain('data-rte-id="page.title"');
      expect(r.id).toBe("page.title");
    }
  });

  it("rejects invalid id", async () => {
    const src = `export const _ = () => <p>x</p>;`;
    const r = await insertDataRteIdAtLocation(src, "/proj/A.tsx", 1, 25, "BadId");
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.code).toBe("invalid_id");
    }
  });

  it("rejects when already tagged", async () => {
    const src = `export const _ = () => <p data-rte-id="page.text">x</p>;`;
    const r = await insertDataRteIdAtLocation(src, "/proj/A.tsx", 1, 25, "page.other");
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.code).toBe("already_tagged");
    }
  });
});
