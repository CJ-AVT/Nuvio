import { describe, expect, it } from "vitest";
import { pickDefaultTextTargetKey, resolveTextTargetElement } from "./text-target-dom.js";

describe("pickDefaultTextTargetKey", () => {
  it("returns null when no targets", () => {
    expect(pickDefaultTextTargetKey(undefined)).toBeNull();
    expect(pickDefaultTextTargetKey({ textTargets: [] })).toBeNull();
  });

  it("prefers primaryTextTargetKey when present", () => {
    expect(
      pickDefaultTextTargetKey({
        primaryTextTargetKey: "value",
        textTargets: [
          {
            key: "label",
            label: "Label",
            file: "a.tsx",
            line: 1,
            column: 0,
            tagName: "span",
            textEditable: true,
            patchHostId: "card",
          },
          {
            key: "value",
            label: "Value",
            file: "a.tsx",
            line: 2,
            column: 0,
            tagName: "span",
            textEditable: true,
            patchHostId: "card",
          },
        ],
      }),
    ).toBe("value");
  });

  it("falls back to first target", () => {
    expect(
      pickDefaultTextTargetKey({
        textTargets: [
          {
            key: "a",
            label: "A",
            file: "a.tsx",
            line: 1,
            column: 0,
            tagName: "p",
            textEditable: true,
            patchHostId: "card",
          },
        ],
      }),
    ).toBe("a");
  });
});

describe("resolveTextTargetElement", () => {
  it("prefers descendant under host when the same id appears on multiple hosts", () => {
    document.body.innerHTML = `
      <div data-nuvio-id="card.copy">
        <span data-nuvio-id="shared.value">A</span>
      </div>
      <div data-nuvio-id="card">
        <span data-nuvio-id="shared.value">B</span>
      </div>
    `;
    const el = resolveTextTargetElement("card.copy", {
      key: "value",
      label: "Value",
      file: "x.tsx",
      line: 1,
      column: 0,
      tagName: "span",
      textEditable: true,
      nuvioId: "shared.value",
      patchHostId: "card.copy",
    });
    expect(el?.textContent?.trim()).toBe("A");
    document.body.innerHTML = "";
  });

  it("resolves by data-nuvio-id when set", () => {
    document.body.innerHTML = `
      <div data-nuvio-id="card">
        <span data-nuvio-id="card.label">Orders</span>
      </div>
    `;
    const el = resolveTextTargetElement("card", {
      key: "label",
      label: "Label",
      file: "x.tsx",
      line: 1,
      column: 0,
      tagName: "span",
      textEditable: true,
      nuvioId: "card.label",
      patchHostId: "card",
    });
    expect(el?.getAttribute("data-nuvio-id")).toBe("card.label");
    document.body.innerHTML = "";
  });

  it("matches by textPreview under host when no nuvioId", () => {
    document.body.innerHTML = `
      <div data-nuvio-id="card">
        <span>5,359</span>
      </div>
    `;
    const el = resolveTextTargetElement("card", {
      key: "value",
      label: "Value",
      file: "x.tsx",
      line: 2,
      column: 0,
      tagName: "span",
      textEditable: true,
      textPreview: "5,359",
      patchHostId: "card",
    });
    expect(el?.textContent?.trim()).toBe("5,359");
    document.body.innerHTML = "";
  });
});
