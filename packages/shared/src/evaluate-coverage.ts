import { resolveBrandBulkPatchHostId } from "./brand-bulk.js";
import {
  isPccBrandableCategory,
  type PccCategory,
  type PccManifest,
} from "./coverage-contract.js";
import type { DuplicateIdError, IndexWireEntry } from "./protocol.js";

export type CoverageHostIssueKind = "missing" | "unpatchable" | "duplicate_id";

export type CoverageHostIssue = {
  kind: CoverageHostIssueKind;
  hostId: string;
  category: PccCategory;
  reason?: string;
};

export type CategoryCoverageSummary = {
  category: PccCategory;
  required: boolean;
  expected: number;
  indexed: number;
  patchable: number;
  categorized: number;
  editable: number;
  brandable: number;
  pass: boolean;
};

export type CoverageGateTotals = {
  indexed: number;
  patchable: number;
  categorized: number;
  editable: number;
  brandable: number;
  expected: number;
};

export type CoverageEvaluationResult = {
  page: string;
  route: string;
  categories: CategoryCoverageSummary[];
  gates: CoverageGateTotals;
  issues: CoverageHostIssue[];
  brandableCount: number;
  editableOnlyCount: number;
  pass: boolean;
};

const PATCHABLE_CLASSNAME_MODES = new Set([
  "literal-only",
  "cn-basic",
  "cn-conditional",
  "classnames-static",
]);

function duplicateIdSet(errors: readonly DuplicateIdError[]): Set<string> {
  return new Set(errors.map((e) => e.id));
}

export function isHostPatchable(
  entry: IndexWireEntry,
  duplicateIds: ReadonlySet<string>,
): { patchable: boolean; reason?: string } {
  if (duplicateIds.has(entry.id)) {
    return { patchable: false, reason: "duplicate_id" };
  }
  if (entry.hasLiteralClassName === false) {
    return { patchable: false, reason: "no_literal_classname" };
  }
  const mode = entry.classNameMode ?? "literal-only";
  if (mode === "unsupported") {
    return { patchable: false, reason: `classNameMode:${mode}` };
  }
  if (!PATCHABLE_CLASSNAME_MODES.has(mode)) {
    return { patchable: false, reason: `classNameMode:${mode}` };
  }
  if (entry.riskLevel === "unsupported" && entry.hasLiteralClassName !== true) {
    return { patchable: false, reason: "risk_unsupported" };
  }
  const patchHostId = resolveBrandBulkPatchHostId(entry);
  if (!patchHostId) {
    return { patchable: false, reason: "no_patch_host" };
  }
  return { patchable: true };
}

export function evaluatePageCoverage(
  manifest: PccManifest,
  entries: readonly IndexWireEntry[],
  duplicateErrors: readonly DuplicateIdError[] = [],
): CoverageEvaluationResult {
  const byId = new Map(entries.map((e) => [e.id, e]));
  const duplicateIds = duplicateIdSet(duplicateErrors);
  const issues: CoverageHostIssue[] = [];
  const categories: CategoryCoverageSummary[] = [];

  let gateIndexed = 0;
  let gatePatchable = 0;
  let gateCategorized = 0;
  let gateEditable = 0;
  let gateBrandable = 0;
  let gateExpected = 0;
  let brandableCount = 0;
  let editableOnlyCount = 0;

  const categoryKeys = Object.keys(manifest.categories) as PccCategory[];

  for (const category of categoryKeys) {
    const config = manifest.categories[category];
    if (!config) {
      continue;
    }

    let indexed = 0;
    let patchable = 0;
    let categorized = 0;
    let editable = 0;
    let brandable = 0;

    for (const hostId of config.hosts) {
      gateExpected += 1;
      const entry = byId.get(hostId);

      if (!entry) {
        issues.push({ kind: "missing", hostId, category });
        continue;
      }

      if (duplicateIds.has(hostId)) {
        issues.push({ kind: "duplicate_id", hostId, category, reason: "duplicate_id" });
        continue;
      }

      indexed += 1;
      gateIndexed += 1;
      categorized += 1;
      gateCategorized += 1;

      const patch = isHostPatchable(entry, duplicateIds);
      if (!patch.patchable) {
        issues.push({
          kind: "unpatchable",
          hostId,
          category,
          reason: patch.reason,
        });
        continue;
      }

      patchable += 1;
      gatePatchable += 1;
      editable += 1;
      gateEditable += 1;

      if (isPccBrandableCategory(category)) {
        brandable += 1;
        gateBrandable += 1;
        brandableCount += 1;
      } else {
        editableOnlyCount += 1;
      }
    }

    const expected = config.hosts.length;
    const pass =
      (!config.required || expected > 0) &&
      issues.filter((i) => i.category === category).length === 0 &&
      indexed === expected &&
      patchable === expected &&
      editable === expected;

    categories.push({
      category,
      required: config.required,
      expected,
      indexed,
      patchable,
      categorized,
      editable,
      brandable,
      pass,
    });
  }

  const pass = categories.every((c) => c.pass) && issues.length === 0;

  return {
    page: manifest.page,
    route: manifest.route,
    categories,
    gates: {
      expected: gateExpected,
      indexed: gateIndexed,
      patchable: gatePatchable,
      categorized: gateCategorized,
      editable: gateEditable,
      brandable: gateBrandable,
    },
    issues,
    brandableCount,
    editableOnlyCount,
    pass,
  };
}
