import { describe, expect, it } from "vitest";
import { insertDataNuvioIdAtLocation } from "./insert-nuvio-id.js";
import { isValidNuvioId, suggestNuvioId } from "./nuvio-id.js";

describe("nuvio id helpers", () => {
  it("validates segmented ids", () => {
    expect(isValidNuvioId("page.title")).toBe(true);
    expect(isValidNuvioId("metric.orders.card")).toBe(true);
    expect(isValidNuvioId("Page.Title")).toBe(false);
    expect(isValidNuvioId("title")).toBe(false);
  });

  it("suggests unique ids from tag name", () => {
    const existing = new Set(["page.title"]);
    expect(suggestNuvioId({ tagName: "h1", existingIds: existing })).toBe("page.title2");
    expect(suggestNuvioId({ tagName: "button", existingIds: new Set() })).toBe("page.button");
    expect(
      suggestNuvioId({
        tagName: "span",
        existingIds: new Set(),
        parentPrefix: "metric.orders",
      }),
    ).toBe("metric.orders.label");
  });
});

describe("insertDataNuvioIdAtLocation", () => {
  it("inserts data-nuvio-id at matching line/column", async () => {
    const src = `export function App() {
  return <h1>Welcome</h1>;
}
`;
    const r = await insertDataNuvioIdAtLocation(src, "/proj/App.tsx", 2, 9, "page.title");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.source).toContain('data-nuvio-id="page.title"');
      expect(r.id).toBe("page.title");
    }
  });

  it("rejects invalid id", async () => {
    const src = `export const _ = () => <p>x</p>;`;
    const r = await insertDataNuvioIdAtLocation(src, "/proj/A.tsx", 1, 25, "BadId");
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.code).toBe("invalid_id");
    }
  });

  it("rejects when already tagged", async () => {
    const src = `export const _ = () => <p data-nuvio-id="page.text">x</p>;`;
    const r = await insertDataNuvioIdAtLocation(src, "/proj/A.tsx", 1, 25, "page.other");
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.code).toBe("already_tagged");
    }
  });
});
