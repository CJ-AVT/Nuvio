import type { TextWireTarget } from "@nuvio/shared";
import { escapeAttrSelector } from "./nuvio-dom.js";

/**
 * Resolve a live DOM node for an index v3 text target under the instrumented host.
 */
export function resolveTextTargetElement(
  hostId: string,
  target: TextWireTarget,
): HTMLElement | null {
  const host = document.querySelector(`[data-nuvio-id="${escapeAttrSelector(hostId)}"]`);

  if (target.nuvioId) {
    if (host instanceof HTMLElement) {
      const scoped = host.querySelector(
        `[data-nuvio-id="${escapeAttrSelector(target.nuvioId)}"]`,
      );
      if (scoped instanceof HTMLElement) {
        return scoped;
      }
    }
    const byId = document.querySelector(
      `[data-nuvio-id="${escapeAttrSelector(target.nuvioId)}"]`,
    );
    return byId instanceof HTMLElement ? byId : null;
  }

  if (!(host instanceof HTMLElement)) {
    return null;
  }

  if (target.textPreview) {
    const tag = target.tagName.toLowerCase();
    const nodes = host.querySelectorAll(tag);
    for (const node of nodes) {
      if (!(node instanceof HTMLElement)) {
        continue;
      }
      if (node.textContent?.replace(/\s+/g, " ").trim() === target.textPreview) {
        return node;
      }
    }
  }

  return null;
}

export function pickDefaultTextTargetKey(
  entry: { primaryTextTargetKey?: string; textTargets?: readonly TextWireTarget[] } | undefined,
): string | null {
  if (!entry?.textTargets?.length) {
    return null;
  }
  if (
    entry.primaryTextTargetKey &&
    entry.textTargets.some((t) => t.key === entry.primaryTextTargetKey)
  ) {
    return entry.primaryTextTargetKey;
  }
  return entry.textTargets[0]?.key ?? null;
}
