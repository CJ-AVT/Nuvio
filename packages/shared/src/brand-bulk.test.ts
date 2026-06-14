import { describe, expect, it } from "vitest";
import {
  buildBrandBulkPreviewSummary,
  buildBrandValidateSummary,
  entryMatchesBrandBulkAction,
  filterBrandBulkCandidates,
  resolveBrandBulkPatchHostId,
} from "./brand-bulk.js";
import { DEFAULT_BRAND_CONFIG } from "./brand-kit.js";
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

describe("entryMatchesBrandBulkAction", () => {
  it("matches button hosts", () => {
    expect(entryMatchesBrandBulkAction(entry({ id: "cta.primary", hierarchyRole: "button" }), "button")).toBe(
      true,
    );
    expect(entryMatchesBrandBulkAction(entry({ id: "x", tagName: "button" }), "button")).toBe(true);
  });

  it("matches card hosts", () => {
    expect(entryMatchesBrandBulkAction(entry({ id: "metric.orders.card", hierarchyRole: "card" }), "card")).toBe(
      true,
    );
  });

  it("matches heading hosts", () => {
    expect(entryMatchesBrandBulkAction(entry({ id: "hero.title", tagName: "h2" }), "heading")).toBe(true);
  });

  it("matches table hosts", () => {
    expect(entryMatchesBrandBulkAction(entry({ id: "orders.table", hierarchyRole: "table" }), "table")).toBe(
      true,
    );
  });

  it("matches form hosts", () => {
    expect(entryMatchesBrandBulkAction(entry({ id: "form.email.input", tagName: "input" }), "form")).toBe(true);
    expect(entryMatchesBrandBulkAction(entry({ id: "form.email.label", tagName: "label" }), "form")).toBe(true);
  });

  it("matches badge hosts", () => {
    expect(entryMatchesBrandBulkAction(entry({ id: "badges.demo.primary", tagName: "span" }), "badge")).toBe(true);
  });
});

describe("filterBrandBulkCandidates", () => {
  const known = new Set(["metric.orders.card", "cta.primary", "hero.title"]);
  const duplicates = new Set<string>();

  it("returns patchable card and button hosts", () => {
    const targets = filterBrandBulkCandidates(
      [
        entry({ id: "metric.orders.card", hierarchyRole: "card" }),
        entry({ id: "cta.primary", hierarchyRole: "button" }),
        entry({ id: "hero.title", tagName: "h2" }),
      ],
      "card",
      known,
      duplicates,
    );
    expect(targets).toHaveLength(1);
    expect(targets[0]?.entryId).toBe("metric.orders.card");
  });

  it("skips unsupported classname entries", () => {
    const targets = filterBrandBulkCandidates(
      [entry({ id: "cta.primary", hierarchyRole: "button", hasLiteralClassName: false })],
      "button",
      new Set(["cta.primary"]),
      duplicates,
    );
    expect(targets).toHaveLength(0);
  });

  it("prefers PCC host lists over heuristics", () => {
    const targets = filterBrandBulkCandidates(
      [
        entry({ id: "metric.orders.card", hierarchyRole: "card" }),
        entry({ id: "chart.sales", hierarchyRole: "card" }),
        entry({ id: "orders.table", hierarchyRole: "table" }),
      ],
      "card",
      new Set(["metric.orders.card", "chart.sales", "orders.table"]),
      duplicates,
      {
        pccHosts: ["metric.orders.card", "chart.sales"],
      },
    );
    expect(targets).toHaveLength(2);
    expect(targets.map((t) => t.hostId)).toEqual(["metric.orders.card", "chart.sales"]);
  });
});

describe("resolveBrandBulkPatchHostId", () => {
  it("prefers patchHostId when present", () => {
    expect(
      resolveBrandBulkPatchHostId(entry({ id: "metric.orders.card", patchHostId: "metric.orders.card" })),
    ).toBe("metric.orders.card");
  });
});

describe("buildBrandValidateSummary", () => {
  it("uses human labels and element count", () => {
    const summary = buildBrandValidateSummary(
      "button",
      {
        ...DEFAULT_BRAND_CONFIG,
        color: "green",
        surface: "white",
        buttonVariant: "solid",
        radius: "rounded",
        density: "spacious",
        typography: "clean",
      },
      5,
    );
    expect(summary).toBe("Button · Green fill · Solid · Rounded · Spacious · Darken hover · 5 elements");
    expect(summary).not.toMatch(/bg-|text-/);
  });
});

describe("buildBrandBulkPreviewSummary (deprecated)", () => {
  it("delegates to buildBrandValidateSummary", () => {
    const summary = buildBrandBulkPreviewSummary(
      "button",
      {
        ...DEFAULT_BRAND_CONFIG,
        color: "green",
        surface: "white",
        buttonVariant: "solid",
        radius: "rounded",
        density: "spacious",
        typography: "clean",
      },
      5,
    );
    expect(summary).toBe("Button · Green fill · Solid · Rounded · Spacious · Darken hover · 5 elements");
  });
});
