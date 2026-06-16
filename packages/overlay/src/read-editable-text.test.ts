import { describe, expect, it } from "vitest";
import { readEditableTextFromElement } from "./read-editable-text.js";

describe("readEditableTextFromElement", () => {
  it("reads leaf text nodes", () => {
    const el = document.createElement("h1");
    el.textContent = "Hello";
    const r = readEditableTextFromElement(el);
    expect(r.textEditable).toBe(true);
    expect(r.text).toBe("Hello");
  });

  it("rejects containers with element children", () => {
    const el = document.createElement("div");
    el.innerHTML = "<h3>Team</h3><p>Body</p><button>Go</button>";
    const r = readEditableTextFromElement(el);
    expect(r.textEditable).toBe(false);
    expect(r.text).toBe("");
    expect(r.reason).toMatch(/leaf elements/i);
  });
});
