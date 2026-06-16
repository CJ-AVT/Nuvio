import { describe, expect, it } from "vitest";
import {
  clampToViewport,
  cornerAnchorPosition,
  parseOverlayChromePersist,
  snapToNearestCorner,
} from "./overlay-chrome-storage.js";

describe("parseOverlayChromePersist", () => {
  it("returns defaults for null", () => {
    const s = parseOverlayChromePersist(null);
    expect(s.panel.collapsed).toBe(false);
    expect(s.panel.position).toBeNull();
    expect(s.chip.corner).toBe("bottom-right");
  });

  it("parses valid payload", () => {
    const s = parseOverlayChromePersist(
      JSON.stringify({
        panel: { collapsed: true, position: { x: 10, y: 20 } },
        chip: { collapsed: false, corner: "top-left", position: { x: 40, y: 50 } },
      }),
    );
    expect(s.panel.collapsed).toBe(true);
    expect(s.panel.position).toEqual({ x: 10, y: 20 });
    expect(s.chip.corner).toBe("top-left");
    expect(s.chip.position).toEqual({ x: 40, y: 50 });
  });

  it("rejects invalid corner and position", () => {
    const s = parseOverlayChromePersist(
      JSON.stringify({
        panel: { position: { x: "nope" } },
        chip: { corner: "middle" },
      }),
    );
    expect(s.panel.position).toBeNull();
    expect(s.chip.corner).toBe("bottom-right");
  });
});

describe("clampToViewport", () => {
  it("keeps box inside viewport with margin", () => {
    const p = clampToViewport(0, 0, 100, 50, 16);
    expect(p.x).toBe(16);
    expect(p.y).toBe(16);
  });
});

describe("snapToNearestCorner", () => {
  it("maps quadrants", () => {
    const vw = 800;
    const vh = 600;
    const orig = { innerWidth: vw, innerHeight: vh };
    Object.defineProperty(globalThis, "window", {
      value: { innerWidth: vw, innerHeight: vh },
      writable: true,
      configurable: true,
    });
    expect(snapToNearestCorner(700, 500)).toBe("bottom-right");
    expect(snapToNearestCorner(100, 500)).toBe("bottom-left");
    expect(snapToNearestCorner(700, 100)).toBe("top-right");
    expect(snapToNearestCorner(100, 100)).toBe("top-left");
    Object.defineProperty(globalThis, "window", { value: orig, configurable: true });
  });
});

describe("cornerAnchorPosition", () => {
  it("anchors bottom-right", () => {
    Object.defineProperty(globalThis, "window", {
      value: { innerWidth: 400, innerHeight: 300 },
      writable: true,
      configurable: true,
    });
    const p = cornerAnchorPosition("bottom-right", 80, 40, 16);
    expect(p.x).toBe(400 - 80 - 16);
    expect(p.y).toBe(300 - 40 - 16);
  });
});
