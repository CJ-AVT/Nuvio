import { describe, expect, it } from "vitest";
import {
  buildDuplicateOp,
  buildHideOp,
  buildMoveSiblingOp,
  isStructuralOnlyOps,
} from "./structural-patch-ops.js";

describe("structural-patch-ops", () => {
  it("builds move ops", () => {
    expect(buildMoveSiblingOp("up")).toEqual([{ kind: "moveSibling", direction: "up" }]);
  });

  it("detects structural-only batches", () => {
    expect(isStructuralOnlyOps(buildHideOp())).toBe(true);
    expect(isStructuralOnlyOps(buildDuplicateOp())).toBe(true);
    expect(
      isStructuralOnlyOps([
        { kind: "setText", text: "x" },
        { kind: "moveSibling", direction: "down" },
      ]),
    ).toBe(false);
  });
});
