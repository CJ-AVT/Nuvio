import type { PatchOp } from "@nuvio/shared";

const STRUCTURAL_KINDS = new Set<PatchOp["kind"]>([
  "moveSibling",
  "setHidden",
  "duplicateHost",
]);

export function isStructuralOnlyOps(ops: readonly PatchOp[]): boolean {
  return ops.length > 0 && ops.every((op) => STRUCTURAL_KINDS.has(op.kind));
}

export function buildMoveSiblingOp(direction: "up" | "down"): PatchOp[] {
  return [{ kind: "moveSibling", direction }];
}

export function buildHideOp(): PatchOp[] {
  return [{ kind: "setHidden", hidden: true }];
}

export function buildShowOp(): PatchOp[] {
  return [{ kind: "setHidden", hidden: false }];
}

export function buildDuplicateOp(): PatchOp[] {
  return [{ kind: "duplicateHost" }];
}
