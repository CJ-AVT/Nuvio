import { BRAND_APPLY_ACTIONS, type BrandApplyAction } from "./brand-kit.js";
import { entryMatchesBrandBulkAction } from "./brand-bulk.js";
import type { IndexWireEntry } from "./protocol.js";

/** Host ids used for navigation only — no brand bulk recipe. */
export function isNonBrandableNavEntry(entry: Pick<IndexWireEntry, "id">): boolean {
  const id = entry.id.toLowerCase();
  return id.startsWith("nav.") || id.includes(".nav.");
}

/** Infer the brand category for a single indexed host (first matching recipe). */
export function resolveBrandCategoryForEntry(entry: IndexWireEntry): BrandApplyAction | null {
  if (isNonBrandableNavEntry(entry)) {
    return null;
  }
  for (const action of BRAND_APPLY_ACTIONS) {
    if (entryMatchesBrandBulkAction(entry, action)) {
      return action;
    }
  }
  return null;
}

export function isBrandableEntry(entry: IndexWireEntry): boolean {
  return resolveBrandCategoryForEntry(entry) !== null;
}
