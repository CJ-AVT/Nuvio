import type { BrandApplyAction, BrandConfig, PatchOp } from "@rte/shared";
import { brandConfigsEqual } from "@rte/shared";

export type BrandBulkValidatedHost = {
  hostId: string;
  ops: PatchOp[];
  fingerprint: string;
  diffSummary: string;
};

export type BrandBulkSession = {
  sessionId: string;
  action: BrandApplyAction;
  brandConfig: BrandConfig;
  summaryLabel: string;
  targets: Array<{ hostId: string; ops: PatchOp[] }>;
  nextPreviewIndex: number;
  nextApplyIndex: number;
  validated: BrandBulkValidatedHost[];
  failures: Array<{ hostId: string; error: string }>;
  mode: "preview" | "apply";
};

export type BrandBulkProgress = {
  phase: "validating" | "ready" | "applying";
  current: number;
  total: number;
  readyCount: number;
  failureCount: number;
};

export function createBrandBulkSession(
  action: BrandApplyAction,
  brandConfig: BrandConfig,
  summaryLabel: string,
  targets: Array<{ hostId: string; ops: PatchOp[] }>,
  sessionId: string,
): BrandBulkSession {
  return {
    sessionId,
    action,
    brandConfig,
    summaryLabel,
    targets,
    nextPreviewIndex: 0,
    nextApplyIndex: 0,
    validated: [],
    failures: [],
    mode: "preview",
  };
}

export function bulkProgressFromSession(session: BrandBulkSession): BrandBulkProgress {
  if (session.mode === "apply") {
    return {
      phase: "applying",
      current: session.nextApplyIndex,
      total: session.validated.length,
      readyCount: session.validated.length,
      failureCount: session.failures.length,
    };
  }
  if (session.nextPreviewIndex >= session.targets.length) {
    return {
      phase: "ready",
      current: session.targets.length,
      total: session.targets.length,
      readyCount: session.validated.length,
      failureCount: session.failures.length,
    };
  }
  return {
    phase: "validating",
    current: session.nextPreviewIndex,
    total: session.targets.length,
    readyCount: session.validated.length,
    failureCount: session.failures.length,
  };
}

export function groupedBulkValidateSummary(validated: readonly BrandBulkValidatedHost[]): string {
  if (validated.length === 0) {
    return "No elements passed validation.";
  }
  const lines = validated
    .slice(0, 4)
    .map((item) => item.diffSummary.trim())
    .filter(Boolean);
  const remainder = validated.length - lines.length;
  const body = lines.join("\n");
  if (remainder > 0) {
    return `${body}\n…and ${remainder} more`;
  }
  return body;
}

/** @deprecated Use {@link groupedBulkValidateSummary}. Removed after one release. */
export function groupedBulkPreviewSummary(validated: readonly BrandBulkValidatedHost[]): string {
  return groupedBulkValidateSummary(validated);
}

export type BrandBulkAppliedByAction = Partial<Record<BrandApplyAction, BrandConfig>>;

/** True when this category was bulk-applied with the current draft — validate stays off until rebranding. */
export function isBrandBulkCategoryLocked(
  action: BrandApplyAction,
  draft: BrandConfig,
  appliedByAction: BrandBulkAppliedByAction,
): boolean {
  const applied = appliedByAction[action];
  if (!applied) {
    return false;
  }
  return brandConfigsEqual(draft, applied);
}

/** True when bulk validate finished for this category+draft — validate stays off until presets change. */
export function isBrandBulkCategoryValidationReady(
  action: BrandApplyAction,
  draft: BrandConfig,
  validatedAction: BrandApplyAction | null,
  validatedConfig: BrandConfig | null,
  applyReady: boolean,
): boolean {
  if (!applyReady || !validatedAction || !validatedConfig) {
    return false;
  }
  if (validatedAction !== action) {
    return false;
  }
  return brandConfigsEqual(draft, validatedConfig);
}

export function isBrandBulkValidateDisabled(
  action: BrandApplyAction,
  draft: BrandConfig,
  appliedByAction: BrandBulkAppliedByAction,
  validatedAction: BrandApplyAction | null,
  validatedConfig: BrandConfig | null,
  applyReady: boolean,
  validating: boolean,
): boolean {
  return (
    validating ||
    isBrandBulkCategoryLocked(action, draft, appliedByAction) ||
    isBrandBulkCategoryValidationReady(action, draft, validatedAction, validatedConfig, applyReady)
  );
}
