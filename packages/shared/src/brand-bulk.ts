import {
  buildBrandPatchOps,
  buildBrandPreviewSummary,
  brandFragmentHostHint,
  type BrandApplyAction,
  type BrandConfig,
  type BrandFragmentHostHint,
} from "./brand-kit.js";
import type { PatchOp } from "./protocol.js";
import type { IndexWireEntry } from "./protocol.js";

export type BrandBulkTarget = {
  hostId: string;
  entryId: string;
  label: string;
};

export function buildBrandValidateSummary(
  action: BrandApplyAction,
  config: BrandConfig,
  count: number,
): string {
  const base = buildBrandPreviewSummary(action, config);
  const noun = count === 1 ? "element" : "elements";
  return `${base} · ${count} ${noun}`;
}

/** @deprecated Use {@link buildBrandValidateSummary}. Removed after one release. */
export function buildBrandBulkPreviewSummary(
  action: BrandApplyAction,
  config: BrandConfig,
  count: number,
): string {
  return buildBrandValidateSummary(action, config, count);
}

export function buildBrandBulkPatchOps(
  action: BrandApplyAction,
  config: BrandConfig,
): PatchOp[] {
  return buildBrandPatchOps(action, config);
}

const PATCHABLE_CLASSNAME_MODES = new Set([
  "literal-only",
  "cn-basic",
  "cn-conditional",
  "classnames-static",
]);

function isDuplicateId(id: string, duplicateIds: ReadonlySet<string>): boolean {
  return duplicateIds.has(id);
}

function isStylePatchableEntry(entry: IndexWireEntry, duplicateIds: ReadonlySet<string>): boolean {
  if (isDuplicateId(entry.id, duplicateIds)) {
    return false;
  }
  if (entry.hasLiteralClassName === false) {
    return false;
  }
  const mode = entry.classNameMode ?? "literal-only";
  if (mode === "unsupported") {
    return false;
  }
  if (!PATCHABLE_CLASSNAME_MODES.has(mode)) {
    return false;
  }
  if (entry.riskLevel === "unsupported" && entry.hasLiteralClassName !== true) {
    return false;
  }
  return resolveBrandBulkPatchHostId(entry) !== null;
}

export type BrandBulkFilterOptions = {
  /** When set, PCC host ids win over heuristic matching (v1.4b). */
  pccHosts?: readonly string[] | null;
};

export function resolveBrandBulkPatchHostId(entry: IndexWireEntry): string | null {
  if (entry.patchHostId) {
    return entry.patchHostId;
  }
  if (entry.hasLiteralClassName === true) {
    return entry.id;
  }
  const styleTarget = entry.styleTargets?.find((t) => t.classNamePatchable);
  return styleTarget?.patchHostId ?? null;
}

export function entryMatchesBrandBulkAction(
  entry: IndexWireEntry,
  action: BrandApplyAction,
): boolean {
  const id = entry.id.toLowerCase();
  const tag = entry.tagName?.toLowerCase() ?? "";
  const role = entry.hierarchyRole;

  switch (action) {
    case "button":
      return (
        role === "button" ||
        tag === "button" ||
        id.endsWith(".button") ||
        id.includes(".cta") ||
        id.includes(".filter") ||
        id.includes(".seeall")
      );
    case "card":
      return (
        role === "card" ||
        id.endsWith(".card") ||
        tag === "card" ||
        tag.startsWith("card")
      );
    case "heading":
      if (id.endsWith(".value")) {
        return false;
      }
      return (
        /^h[1-6]$/.test(tag) ||
        id.endsWith(".title") ||
        id.endsWith(".heading") ||
        id.endsWith(".header") ||
        id.includes(".title")
      );
    case "text":
      if (role === "button" || role === "card") {
        return false;
      }
      if (/^h[1-6]$/.test(tag)) {
        return id.endsWith(".value");
      }
      return (
        role === "text" ||
        tag === "p" ||
        (tag === "span" &&
          (id.endsWith(".label") || id.endsWith(".subtitle") || id.includes(".nametext"))) ||
        (tag === "label" && !id.startsWith("form.")) ||
        id.endsWith(".subtitle") ||
        id.includes(".nametext") ||
        (entry.textEditable === true && (tag === "span" || tag === "label" || tag === "div"))
      );
    case "table":
      return (
        role === "table" ||
        id.endsWith(".table") ||
        id.includes(".header.") ||
        /\.row\./.test(id)
      );
    case "form":
      return (
        role === "form" ||
        role === "input" ||
        tag === "input" ||
        tag === "textarea" ||
        tag === "select" ||
        tag === "label" ||
        id.endsWith(".input") ||
        id.endsWith(".label")
      );
    case "badge":
      return (
        id.endsWith(".badge") ||
        id.includes(".badge.") ||
        (tag === "span" && (id.includes("badge") || id.includes("status") || id.includes("chip")))
      );
    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}

export function filterBrandBulkCandidates(
  entries: readonly IndexWireEntry[],
  action: BrandApplyAction,
  knownIds: ReadonlySet<string>,
  duplicateIds: ReadonlySet<string>,
  options?: BrandBulkFilterOptions,
): BrandBulkTarget[] {
  const pccHosts = options?.pccHosts;
  if (pccHosts && pccHosts.length > 0) {
    return filterBrandBulkCandidatesFromPccHosts(
      entries,
      pccHosts,
      knownIds,
      duplicateIds,
    );
  }

  const seenHostIds = new Set<string>();
  const targets: BrandBulkTarget[] = [];

  for (const entry of entries) {
    if (!knownIds.has(entry.id)) {
      continue;
    }
    if (!isStylePatchableEntry(entry, duplicateIds)) {
      continue;
    }
    if (!entryMatchesBrandBulkAction(entry, action)) {
      continue;
    }
    const hostId = resolveBrandBulkPatchHostId(entry);
    if (!hostId || !knownIds.has(hostId)) {
      continue;
    }
    if (seenHostIds.has(hostId)) {
      continue;
    }
    seenHostIds.add(hostId);
    targets.push({
      hostId,
      entryId: entry.id,
      label: entry.id,
    });
  }

  return targets;
}

function filterBrandBulkCandidatesFromPccHosts(
  entries: readonly IndexWireEntry[],
  pccHosts: readonly string[],
  knownIds: ReadonlySet<string>,
  duplicateIds: ReadonlySet<string>,
): BrandBulkTarget[] {
  const byId = new Map(entries.map((entry) => [entry.id, entry]));
  const seenHostIds = new Set<string>();
  const targets: BrandBulkTarget[] = [];

  for (const hostId of pccHosts) {
    const entry = byId.get(hostId);
    if (!entry || !knownIds.has(hostId)) {
      continue;
    }
    if (!isStylePatchableEntry(entry, duplicateIds)) {
      continue;
    }
    const patchHostId = resolveBrandBulkPatchHostId(entry);
    if (!patchHostId || !knownIds.has(patchHostId)) {
      continue;
    }
    if (seenHostIds.has(patchHostId)) {
      continue;
    }
    seenHostIds.add(patchHostId);
    targets.push({
      hostId: patchHostId,
      entryId: entry.id,
      label: entry.id,
    });
  }

  return targets;
}

export function buildBrandBulkTargetOps(
  action: BrandApplyAction,
  config: BrandConfig,
  targets: readonly BrandBulkTarget[],
  entries?: readonly IndexWireEntry[],
): Array<{ hostId: string; ops: PatchOp[] }> {
  const byId = entries ? new Map(entries.map((entry) => [entry.id, entry])) : null;
  return targets.map((target) => {
    const entry = byId?.get(target.entryId);
    const hint: BrandFragmentHostHint | undefined = entry
      ? brandFragmentHostHint(entry)
      : undefined;
    return {
      hostId: target.hostId,
      ops: buildBrandPatchOps(action, config, hint),
    };
  });
}
