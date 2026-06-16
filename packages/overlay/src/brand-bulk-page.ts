import {
  filterBrandBulkCandidates,
  pccHostsForBrandAction,
  type BrandApplyAction,
  type BrandBulkTarget,
  type DuplicateIdError,
  type IndexWireEntry,
  type PccManifest,
} from "@nuvio/shared";
import { formatFriendlyId } from "./human-naming.js";
import { escapeAttrSelector } from "./nuvio-dom.js";
import { isDuplicateIndexedId } from "./selection-summary.js";

function duplicateIdSet(errors: readonly DuplicateIdError[]): Set<string> {
  return new Set(errors.map((e) => e.id));
}

export function listVisibleBrandBulkTargets(
  entries: readonly IndexWireEntry[],
  action: BrandApplyAction,
  knownIds: ReadonlySet<string>,
  duplicateErrors: readonly DuplicateIdError[],
  pagePcc?: PccManifest | null,
): BrandBulkTarget[] {
  const duplicateIds = duplicateIdSet(duplicateErrors);
  const pccHosts = pccHostsForBrandAction(pagePcc, action);
  const candidates = filterBrandBulkCandidates(entries, action, knownIds, duplicateIds, {
    pccHosts,
  });

  return candidates
    .filter((target) => {
      if (isDuplicateIndexedId(target.hostId, duplicateErrors)) {
        return false;
      }
      const el = document.querySelector(`[data-nuvio-id="${escapeAttrSelector(target.hostId)}"]`);
      return el instanceof HTMLElement;
    })
    .map((target) => {
      const entry = entries.find((e) => e.id === target.entryId);
      return {
        ...target,
        label: entry ? formatFriendlyId(target.entryId, entry) : target.entryId,
      };
    });
}

export function countVisibleBrandBulkTargets(
  entries: readonly IndexWireEntry[],
  action: BrandApplyAction,
  knownIds: ReadonlySet<string>,
  duplicateErrors: readonly DuplicateIdError[],
  pagePcc?: PccManifest | null,
): number {
  return listVisibleBrandBulkTargets(entries, action, knownIds, duplicateErrors, pagePcc).length;
}
