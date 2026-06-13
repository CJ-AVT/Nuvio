import { describe, expect, it } from "vitest";
import { parsePccManifest } from "./coverage-contract.js";
import { evaluateBrandPageScan } from "./evaluate-brand-scan.js";
import type { IndexWireEntry } from "./protocol.js";

function entry(partial: Partial<IndexWireEntry> & { id: string }): IndexWireEntry {
  return {
    file: "src/App.tsx",
    line: 1,
    column: 1,
    hasLiteralClassName: true,
    ...partial,
  };
}

describe("evaluateBrandPageScan", () => {
  const manifestResult = parsePccManifest({
    page: "dashboard",
    route: "/",
    categories: {
      card: { hosts: ["metric.orders.card", "missing.card"] },
      button: { hosts: ["orders.filter"] },
      table: { hosts: ["orders.table"] },
    },
  });
  if (!manifestResult.ok) {
    throw new Error("fixture invalid");
  }

  const brand = {
    color: "blue" as const,
    radius: "soft" as const,
    density: "balanced" as const,
    typography: "clean" as const,
  };

  it("counts on-brand and off-brand hosts in brandable categories only", () => {
    const result = evaluateBrandPageScan(
      manifestResult.manifest,
      [
        entry({
          id: "metric.orders.card",
          classNameValue: "bg-white border border-blue-300 rounded-md p-6",
        }),
        entry({
          id: "orders.filter",
          classNameValue: "bg-rose-600 text-white rounded-md px-4 py-2",
        }),
        entry({
          id: "orders.table",
          classNameValue: "overflow-x-auto",
        }),
      ],
      brand,
    );

    expect(result.categories).toHaveLength(3);
    expect(result.onBrandCount).toBe(1);
    expect(result.offBrandCount).toBe(1);
    expect(result.missingCount).toBe(1);
    expect(result.noTraitsCount).toBe(1);
    expect(result.pass).toBe(false);
    expect(result.categories.find((c) => c.category === "table")?.noTraits).toBe(1);
  });
});
