import { describe, expect, it } from "vitest";
import { DEFAULT_BRAND_CONFIG } from "@nuvio/shared";
import {
  brandPresetContextKey,
  buildBrandPageBaselineDraft,
  resolveBrandPresetCategory,
  shouldMirrorSelectionIntoDraft,
  shouldSyncDraftFromPageInference,
} from "./brand-preset-sync.js";

describe("brandPresetContextKey", () => {
  it("does not include saved brand so save does not change the context key", () => {
    const base = brandPresetContextKey("btn-1", "button", "xl", 0);
    const afterSave = brandPresetContextKey("btn-1", "button", "xl", 0);
    expect(base).toBe(afterSave);
  });
});

describe("resolveBrandPresetCategory", () => {
  it("prefers aligned selection + active category over manual category", () => {
    expect(resolveBrandPresetCategory("card", "card", "heading")).toBe("card");
  });

  it("uses manual category when selection category differs from active tab", () => {
    expect(resolveBrandPresetCategory("card", "heading", "heading")).toBe("heading");
  });
});

describe("buildBrandPageBaselineDraft", () => {
  it("layers inferred category presets on saved defaults", () => {
    expect(
      buildBrandPageBaselineDraft(DEFAULT_BRAND_CONFIG, { color: "green" }, ["color", "radius"]),
    ).toEqual({ ...DEFAULT_BRAND_CONFIG, color: "green" });
  });
});

describe("shouldSyncDraftFromPageInference", () => {
  it("skips draft sync when the selection context is unchanged", () => {
    const contextKey = brandPresetContextKey("btn-1", "button", "xl", 0);
    expect(shouldSyncDraftFromPageInference(contextKey, contextKey)).toBe(false);
  });

  it("syncs draft on new selection context", () => {
    const contextKey = brandPresetContextKey("btn-2", "button", "xl", 0);
    expect(
      shouldSyncDraftFromPageInference(
        contextKey,
        brandPresetContextKey("btn-1", "button", "xl", 0),
      ),
    ).toBe(true);
  });
});

describe("shouldMirrorSelectionIntoDraft", () => {
  it("mirrors selection while the user has not edited presets", () => {
    expect(shouldMirrorSelectionIntoDraft(true, false, false)).toBe(true);
  });

  it("does not mirror after the user edits presets on the same host", () => {
    expect(shouldMirrorSelectionIntoDraft(true, true, false)).toBe(false);
  });

  it("mirrors on context change even if the user edited earlier", () => {
    expect(shouldMirrorSelectionIntoDraft(true, true, true)).toBe(true);
  });
});
