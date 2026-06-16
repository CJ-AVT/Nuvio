import { describe, expect, it } from "vitest";
import { buildAlphaPatchOps, EMPTY_ALPHA_PICKS } from "./alpha-patch-ops.js";

describe("buildAlphaPatchOps", () => {
  it("emits removeTailwindClassName when a style pick is reset to Default", () => {
    const baselinePicks = { ...EMPTY_ALPHA_PICKS, padding: "p-4" };
    const draftPicks = { ...EMPTY_ALPHA_PICKS, padding: "" };

    expect(buildAlphaPatchOps("", "", baselinePicks, draftPicks)).toEqual([
      { kind: "removeTailwindClassName", classNameFragment: "p-4" },
    ]);
  });

  it("removes staged value when reset to Default after changing from unrecognized baseline", () => {
    const baselinePicks = { ...EMPTY_ALPHA_PICKS, padding: "p-5" };
    const priorDraftPicks = { ...EMPTY_ALPHA_PICKS, padding: "p-6" };
    const draftPicks = { ...EMPTY_ALPHA_PICKS, padding: "" };

    expect(
      buildAlphaPatchOps("", "", baselinePicks, draftPicks, { priorDraftPicks }),
    ).toEqual([{ kind: "removeTailwindClassName", classNameFragment: "p-6" }]);
  });

  it("emits mergeTailwindClassName when a style pick changes to a new value", () => {
    const baselinePicks = { ...EMPTY_ALPHA_PICKS, padding: "p-4" };
    const draftPicks = { ...EMPTY_ALPHA_PICKS, padding: "p-6" };

    expect(buildAlphaPatchOps("", "", baselinePicks, draftPicks)).toEqual([
      { kind: "mergeTailwindClassName", classNameFragment: "p-6" },
    ]);
  });

  it("removes composite padding utilities when reset to Default", () => {
    const baselinePicks = { ...EMPTY_ALPHA_PICKS, padding: "px-4 py-2" };
    const draftPicks = { ...EMPTY_ALPHA_PICKS, padding: "" };

    expect(buildAlphaPatchOps("", "", baselinePicks, draftPicks)).toEqual([
      { kind: "removeTailwindClassName", classNameFragment: "px-4 py-2" },
    ]);
  });
});
