import { describe, expect, it } from "vitest";
import type { IndexWireEntry } from "./protocol.js";
import {
  isBrandableEntry,
  isNonBrandableNavEntry,
  resolveBrandCategoryForEntry,
} from "./brand-selection.js";

const base: IndexWireEntry = {
  id: "x",
  file: "a.tsx",
  line: 1,
  column: 1,
  hasLiteralClassName: true,
};

describe("resolveBrandCategoryForEntry", () => {
  it("resolves card, button, and heading hosts", () => {
    expect(
      resolveBrandCategoryForEntry({ ...base, id: "orders.card", hierarchyRole: "card" }),
    ).toBe("card");
    expect(
      resolveBrandCategoryForEntry({ ...base, id: "orders.filter", tagName: "button" }),
    ).toBe("button");
    expect(resolveBrandCategoryForEntry({ ...base, id: "orders.title", tagName: "h3" })).toBe(
      "heading",
    );
  });

  it("resolves form label and input", () => {
    expect(
      resolveBrandCategoryForEntry({ ...base, id: "form.email.label", tagName: "label" }),
    ).toBe("form");
    expect(
      resolveBrandCategoryForEntry({ ...base, id: "form.email.input", tagName: "input" }),
    ).toBe("form");
  });

  it("returns null for nav hosts", () => {
    expect(resolveBrandCategoryForEntry({ ...base, id: "nav.dashboard" })).toBeNull();
    expect(isBrandableEntry({ ...base, id: "nav.form-elements" })).toBe(false);
  });

  it("resolves body text hosts including labels, subtitles, and value lines", () => {
    expect(
      resolveBrandCategoryForEntry({ ...base, id: "demo.subtitle", tagName: "p" }),
    ).toBe("text");
    expect(
      resolveBrandCategoryForEntry({ ...base, id: "metric.customers.label", tagName: "span" }),
    ).toBe("text");
    expect(
      resolveBrandCategoryForEntry({ ...base, id: "metric.customers.value", tagName: "h4" }),
    ).toBe("text");
    expect(
      resolveBrandCategoryForEntry({ ...base, id: "orders.row.1.nameText", tagName: "p" }),
    ).toBe("text");
    expect(resolveBrandCategoryForEntry({ ...base, id: "orders.title", tagName: "h3" })).toBe(
      "heading",
    );
  });
});
