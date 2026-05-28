import { describe, expect, it } from "vitest";
import type { IndexWireEntry } from "@nuvio/shared";
import {
  formatFriendlyId,
  getSimpleSelectionStatus,
  getSimpleDuplicateWarning,
  isDuplicateIndexedId,
  mapUnsupportedReasonToSimple,
} from "./selection-summary.js";

describe("formatFriendlyId", () => {
  it("title-cases last segments", () => {
    expect(formatFriendlyId("metric.orders.card")).toBe("Orders Card");
    expect(formatFriendlyId("metric.orders.card.copy")).toBe("Card Copy");
  });
});

describe("getSimpleSelectionStatus", () => {
  const base: IndexWireEntry = {
    id: "x",
    file: "a.tsx",
    line: 1,
    column: 1,
  };

  it("reports full edit when text and class are ok", () => {
    const s = getSimpleSelectionStatus({
      ...base,
      textEditable: true,
      hasLiteralClassName: true,
      riskLevel: "safe",
    });
    expect(s.message).toContain("text and styles");
    expect(s.tone).toBe("success");
  });

  it("guides container text edits", () => {
    const s = getSimpleSelectionStatus({
      ...base,
      textEditable: false,
      hasLiteralClassName: true,
    });
    expect(s.message).toContain("headline");
  });
});

describe("getSimpleDuplicateWarning", () => {
  it("detects duplicate ids for patch guard", () => {
    expect(
      isDuplicateIndexedId("metric.orders.value", [
        { id: "metric.orders.value", occurrences: [{ file: "a.tsx", line: 1, column: 1 }] },
      ]),
    ).toBe(true);
    expect(isDuplicateIndexedId("metric.orders.card", [])).toBe(false);
  });

  it("returns null when no duplicates", () => {
    expect(getSimpleDuplicateWarning([])).toBeNull();
  });

  it("mentions friendly names", () => {
    const msg = getSimpleDuplicateWarning([
      { id: "metric.orders.value", occurrences: [{ file: "a.tsx", line: 1, column: 1 }] },
    ]);
    expect(msg).toContain("Orders Value");
  });
});

describe("mapUnsupportedReasonToSimple", () => {
  it("maps className literal errors to plain copy", () => {
    const msg = mapUnsupportedReasonToSimple(
      "className is not a string literal — only literal className strings are patchable in this version.",
    );
    expect(msg).toContain("dynamic className");
  });

  it("maps map() risk to plain copy", () => {
    const msg = mapUnsupportedReasonToSimple(
      "Element is inside a .map() — text/class changes may affect every rendered item.",
    );
    expect(msg).toContain("repeated list");
  });
});
