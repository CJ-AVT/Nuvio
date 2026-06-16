import { afterEach, describe, expect, it, vi } from "vitest";
import {
  classifyUnlocatableClick,
  hasAnyRteLocInDocument,
  pickClickTargetElement,
} from "./rte-loc-dom.js";

const chromeRefs = [{ current: null as HTMLElement | null }];

function mockElementsFromPoint(stack: Element[]): void {
  document.elementsFromPoint = vi.fn().mockReturnValue(stack) as typeof document.elementsFromPoint;
}

afterEach(() => {
  document.body.innerHTML = "";
  vi.restoreAllMocks();
});

describe("hasAnyRteLocInDocument", () => {
  it("returns false when no loc attributes exist", () => {
    document.body.innerHTML = "<div><p>Hello</p></div>";
    expect(hasAnyRteLocInDocument()).toBe(false);
  });

  it("returns true when a loc attribute exists", () => {
    document.body.innerHTML = '<div data-rte-loc="src/App.tsx:1:0">Hi</div>';
    expect(hasAnyRteLocInDocument()).toBe(true);
  });
});

describe("pickClickTargetElement", () => {
  it("skips overlay chrome nodes", () => {
    document.body.innerHTML = '<div id="app"><p id="target">Hi</p></div>';
    const chrome = document.createElement("div");
    chrome.id = "chrome";
    document.body.appendChild(chrome);
    chromeRefs[0]!.current = chrome;

    const target = document.getElementById("target")!;
    mockElementsFromPoint([target]);

    expect(pickClickTargetElement(10, 10, chromeRefs)?.id).toBe("target");
  });
});

describe("classifyUnlocatableClick", () => {
  it("returns no_vite_plugin when document has no loc stamps", () => {
    document.body.innerHTML = "<p id='plain'>Plain</p>";
    const el = document.getElementById("plain")!;
    mockElementsFromPoint([el]);

    expect(classifyUnlocatableClick(1, 1, chromeRefs)).toEqual({
      reason: "no_vite_plugin",
      tagName: "p",
    });
  });

  it("returns inside_app_link for navigation anchors", () => {
    document.body.innerHTML =
      '<a href="/dashboard"><span data-rte-loc="src/App.tsx:2:0" id="inner">Go</span></a>';
    const el = document.getElementById("inner")!;
    mockElementsFromPoint([el]);

    expect(classifyUnlocatableClick(1, 1, chromeRefs)).toEqual({
      reason: "inside_app_link",
      tagName: "span",
    });
  });

  it("returns wrapper_not_forwarding when loc exists elsewhere but not on ancestors", () => {
    document.body.innerHTML =
      '<div data-rte-loc="src/App.tsx:1:0"><div id="inner"><p id="leaf">Text</p></div></div>';
    const leaf = document.getElementById("leaf")!;
    mockElementsFromPoint([leaf]);

    expect(classifyUnlocatableClick(1, 1, chromeRefs)).toBeNull();
  });

  it("returns wrapper_not_forwarding for orphan native nodes when loc exists on page", () => {
    document.body.innerHTML =
      '<div data-rte-loc="src/Other.tsx:1:0" style="display:none"></div><p id="orphan">Hi</p>';
    const orphan = document.getElementById("orphan")!;
    mockElementsFromPoint([orphan]);

    expect(classifyUnlocatableClick(1, 1, chromeRefs)).toEqual({
      reason: "wrapper_not_forwarding",
      tagName: "p",
    });
  });

  it("returns null when click stack is empty", () => {
    mockElementsFromPoint([]);
    expect(classifyUnlocatableClick(1, 1, chromeRefs)).toBeNull();
  });
});
