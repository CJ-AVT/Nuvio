import { describe, expect, it } from "vitest";
import { parsePccManifest } from "./coverage-contract.js";
import { evaluatePageCoverage, isHostPatchable } from "./evaluate-coverage.js";
import type { IndexWireEntry } from "./protocol.js";

function entry(partial: Partial<IndexWireEntry> & { id: string }): IndexWireEntry {
  return {
    file: "src/App.tsx",
    line: 1,
    column: 1,
    hasLiteralClassName: true,
    classNameMode: "literal-only",
    ...partial,
  };
}

describe("isHostPatchable", () => {
  it("accepts literal-only hosts", () => {
    const result = isHostPatchable(entry({ id: "a.card" }), new Set());
    expect(result.patchable).toBe(true);
  });

  it("rejects unsupported className mode", () => {
    const result = isHostPatchable(
      entry({ id: "a.card", classNameMode: "unsupported", hasLiteralClassName: false }),
      new Set(),
    );
    expect(result.patchable).toBe(false);
  });
});

describe("evaluatePageCoverage", () => {
  const manifestResult = parsePccManifest({
    page: "dashboard",
    route: "/",
    categories: {
      card: {
        required: true,
        hosts: ["metric.customers.card", "metric.orders.card", "missing.card"],
      },
      button: {
        required: true,
        hosts: ["orders.filter"],
      },
      table: {
        required: false,
        hosts: ["orders.table"],
      },
    },
  });

  if (!manifestResult.ok) {
    throw new Error("fixture manifest invalid");
  }

  const manifest = manifestResult.manifest;

  it("passes when all hosts are indexed and patchable", () => {
    const passManifest = parsePccManifest({
      page: "dashboard",
      route: "/",
      categories: {
        card: {
          required: true,
          hosts: ["metric.customers.card", "metric.orders.card"],
        },
        button: {
          required: true,
          hosts: ["orders.filter"],
        },
        table: {
          required: false,
          hosts: ["orders.table"],
        },
      },
    });
    if (!passManifest.ok) {
      throw new Error("fixture manifest invalid");
    }

    const result = evaluatePageCoverage(
      passManifest.manifest,
      [
        entry({ id: "metric.customers.card" }),
        entry({ id: "metric.orders.card" }),
        entry({ id: "orders.filter", hierarchyRole: "button" }),
        entry({ id: "orders.table", hierarchyRole: "table" }),
      ],
      [],
    );
    expect(result.pass).toBe(true);
    expect(result.gates.expected).toBe(4);
    expect(result.gates.brandable).toBe(4);
    expect(result.editableOnlyCount).toBe(0);
  });

  it("fails when a host is missing from index", () => {
    const result = evaluatePageCoverage(
      manifest,
      [entry({ id: "metric.customers.card" }), entry({ id: "orders.filter" })],
      [],
    );
    expect(result.pass).toBe(false);
    expect(result.issues.some((i) => i.kind === "missing" && i.hostId === "missing.card")).toBe(
      true,
    );
  });

  it("fails when a host is unpatchable", () => {
    const result = evaluatePageCoverage(
      manifest,
      [
        entry({ id: "metric.customers.card" }),
        entry({ id: "metric.orders.card" }),
        entry({ id: "orders.filter", classNameMode: "unsupported", hasLiteralClassName: false }),
      ],
      [],
    );
    expect(result.pass).toBe(false);
    expect(result.issues.some((i) => i.kind === "unpatchable")).toBe(true);
  });

  it("derives expected count from hosts.length", () => {
    const result = evaluatePageCoverage(
      manifest,
      [
        entry({ id: "metric.customers.card" }),
        entry({ id: "metric.orders.card" }),
        entry({ id: "orders.filter" }),
        entry({ id: "orders.table" }),
      ],
      [],
    );
    const card = result.categories.find((c) => c.category === "card");
    expect(card?.expected).toBe(3);
  });
});
