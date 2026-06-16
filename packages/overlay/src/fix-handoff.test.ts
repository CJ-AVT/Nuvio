import { describe, expect, it } from "vitest";
import { buildEditorUrl, buildFixHandoffClipboard } from "./fix-handoff.js";

describe("buildFixHandoffClipboard", () => {
  it("uses editor-agnostic prompt copy", () => {
    const text = buildFixHandoffClipboard({
      hostId: "metric.orders.card",
      file: "ecommerce/EcommerceMetrics.tsx",
      line: 45,
      componentName: "EcommerceMetrics",
      userIntent: "edit selection in rte",
      reason: "Validation failed",
      suggestedNextStep: "Simplify responsive classes on this element.",
    });
    expect(text).toContain("Optional prompt (paste into your editor or AI assistant):");
    expect(text).not.toMatch(/cursor/i);
  });
});

describe("buildEditorUrl", () => {
  it("defaults to vscode file links", () => {
    expect(buildEditorUrl("src/App.tsx", 12)).toBe("vscode://file/src/App.tsx:12");
  });

  it("ignores non-string env values", () => {
    const prev = (import.meta as ImportMeta & { env?: Record<string, unknown> }).env
      ?.VITE_RTE_EDITOR_URL;
    (import.meta as ImportMeta & { env?: Record<string, unknown> }).env = {
      ...(import.meta as ImportMeta & { env?: Record<string, unknown> }).env,
      VITE_RTE_EDITOR_URL: true,
    };
    expect(buildEditorUrl("src/App.tsx", 12)).toBe("vscode://file/src/App.tsx:12");
    if (prev === undefined) {
      delete (import.meta as ImportMeta & { env?: Record<string, unknown> }).env
        ?.VITE_RTE_EDITOR_URL;
    } else {
      (import.meta as ImportMeta & { env?: Record<string, unknown> }).env!.VITE_RTE_EDITOR_URL =
        prev;
    }
  });
});
