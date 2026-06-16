import {
  type BrandApplyAction,
  type BrandConfig,
  type BrandPresetDimension,
  type Breakpoint,
} from "@nuvio/shared";
export function brandPresetContextKey(
  hostId: string,
  inferenceCategory: BrandApplyAction,
  activeBreakpoint: Breakpoint,
  styleResyncVersion: number,
): string {
  return `${hostId}|${inferenceCategory}|${activeBreakpoint}|${styleResyncVersion}`;
}

export function buildBrandPageBaselineDraft(
  saved: BrandConfig,
  inferred: Partial<BrandConfig>,
  inferrableDimensions: readonly BrandPresetDimension[],
): BrandConfig {
  if (Object.keys(inferred).length > 0 || inferrableDimensions.length > 0) {
    return { ...saved, ...inferred };
  }
  return saved;
}

export function resolveBrandPresetCategory(
  selectionCategory: BrandApplyAction | null,
  activeCategory: BrandApplyAction,
  manualCategory: BrandApplyAction | null,
): BrandApplyAction {
  if (selectionCategory && selectionCategory === activeCategory) {
    return selectionCategory;
  }
  return manualCategory ?? selectionCategory ?? activeCategory;
}

export function shouldSyncDraftFromPageInference(
  contextKey: string,
  lastContextKey: string | null,
): boolean {
  return lastContextKey !== contextKey;
}

export function shouldMirrorSelectionIntoDraft(
  selectionHostActive: boolean,
  userEditedPresets: boolean,
  contextChanged: boolean,
): boolean {
  return contextChanged || (selectionHostActive && !userEditedPresets);
}
