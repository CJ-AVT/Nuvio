import { describe, expect, it } from "vitest";
import {
  formatPatchUserMessage,
  getIndexedSiblingMoveAvailability,
} from "./sibling-move.js";

describe("formatPatchUserMessage", () => {
  it("strips Error prefix", () => {
    expect(formatPatchUserMessage("Error: Already the first sibling")).toBe(
      "Already the first sibling",
    );
  });
});

describe("getIndexedSiblingMoveAvailability", () => {
  it("detects first and last among indexed siblings", () => {
    document.body.innerHTML = `
      <div id="row">
        <div data-nuvio-id="a">A</div>
        <div data-nuvio-id="b">B</div>
      </div>
    `;
    expect(getIndexedSiblingMoveAvailability("a")).toEqual({
      canMoveUp: false,
      canMoveDown: true,
      peerCount: 2,
    });
    expect(getIndexedSiblingMoveAvailability("b")).toEqual({
      canMoveUp: true,
      canMoveDown: false,
      peerCount: 2,
    });
  });
});
