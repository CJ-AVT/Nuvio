import { describe, expect, it } from "vitest";
import { readAlphaPicksFromClassName } from "./read-alpha-picks.js";

describe("readAlphaPicksFromClassName", () => {
  it("reads typography and spacing from a typical card class string", () => {
    const picks = readAlphaPicksFromClassName(
      "flex-1 rounded-lg border border-slate-800 bg-slate-900/50 p-4 text-sm text-slate-400",
    );
    expect(picks.rounded).toBe("rounded-lg");
    expect(picks.padding).toBe("p-4");
    expect(picks.fontSize).toBe("text-sm");
    expect(picks.textColor).toBe("text-slate-400");
    expect(picks.bgColor).toBe("bg-slate-900/50");
  });

  it("does not confuse text-sm with text color", () => {
    const picks = readAlphaPicksFromClassName("text-sm text-white");
    expect(picks.fontSize).toBe("text-sm");
    expect(picks.textColor).toBe("text-white");
  });

  it("reads composite padding option", () => {
    const picks = readAlphaPicksFromClassName("px-4 py-2 rounded-md");
    expect(picks.padding).toBe("px-4 py-2");
    expect(picks.rounded).toBe("rounded-md");
  });

  it("returns empty picks for empty class", () => {
    expect(readAlphaPicksFromClassName("").fontSize).toBe("");
  });
});
