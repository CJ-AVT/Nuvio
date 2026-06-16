import type { PatchOp } from "@rte/shared";
import { twMerge } from "tailwind-merge";
import { escapeAttrSelector } from "./rte-dom.js";

export type BrandDomStagedHost = {
  hostId: string;
  originalClassName: string;
};

let stagedHosts: BrandDomStagedHost[] = [];

function mergeFragmentsFromOps(ops: readonly PatchOp[]): string {
  return ops
    .filter((op): op is Extract<PatchOp, { kind: "mergeTailwindClassName" }> => {
      return op.kind === "mergeTailwindClassName";
    })
    .map((op) => op.classNameFragment.trim())
    .filter(Boolean)
    .join(" ");
}

/** Apply brand patch ops to a class string the same way AST merge would (base utilities only). */
export function applyBrandPatchOpsToClassName(
  className: string,
  ops: readonly PatchOp[],
): string {
  const fragment = mergeFragmentsFromOps(ops);
  if (!fragment) {
    return className;
  }
  return twMerge(className, fragment).trim();
}

function resolveHostElement(hostId: string): HTMLElement | null {
  const el = document.querySelector(`[data-rte-id="${escapeAttrSelector(hostId)}"]`);
  return el instanceof HTMLElement ? el : null;
}

export function listBrandDomStagedHosts(): readonly BrandDomStagedHost[] {
  return stagedHosts;
}

export function isBrandDomStagingActive(): boolean {
  return stagedHosts.length > 0;
}

/** Temporarily merge validated brand classes onto live page hosts. Returns hosts painted. */
export function stageBrandHostsOnPage(
  validated: ReadonlyArray<{ hostId: string; ops: PatchOp[] }>,
): number {
  revertBrandDomStaging();
  let painted = 0;

  for (const item of validated) {
    const el = resolveHostElement(item.hostId);
    if (!el) {
      continue;
    }
    const originalClassName = el.getAttribute("class") ?? "";
    stagedHosts.push({ hostId: item.hostId, originalClassName });
    const merged = applyBrandPatchOpsToClassName(originalClassName, item.ops);
    if (merged !== originalClassName) {
      if (merged) {
        el.setAttribute("class", merged);
      } else {
        el.removeAttribute("class");
      }
      painted += 1;
    }
  }

  return painted;
}

/** Restore original classes for every host staged by {@link stageBrandHostsOnPage}. */
export function revertBrandDomStaging(): void {
  for (const item of stagedHosts) {
    const el = resolveHostElement(item.hostId);
    if (!el) {
      continue;
    }
    if (item.originalClassName) {
      el.setAttribute("class", item.originalClassName);
    } else {
      el.removeAttribute("class");
    }
  }
  stagedHosts = [];
}
