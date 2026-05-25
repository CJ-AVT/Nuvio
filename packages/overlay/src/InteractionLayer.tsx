import type { RefObject } from "react";
import { useEffect, useState, type ReactElement } from "react";
import { clearNuvioOutlines, paintNuvioOutline } from "./nuvio-outlines.js";

export type InteractionLayerProps = {
  enabled: boolean;
  chromeRootRefs: readonly RefObject<HTMLElement | null>[];
  knownIds: ReadonlySet<string>;
  selectedId: string | null;
  onSelectId: (id: string | null) => void;
};

function isUnderOverlayChrome(
  node: HTMLElement,
  chromeRootRefs: readonly RefObject<HTMLElement | null>[],
): boolean {
  for (const ref of chromeRootRefs) {
    const root = ref.current;
    if (root?.contains(node)) {
      return true;
    }
  }
  return false;
}

function pickIndexedTarget(
  clientX: number,
  clientY: number,
  chromeRootRefs: readonly RefObject<HTMLElement | null>[],
  knownIds: ReadonlySet<string>,
): HTMLElement | null {
  const stack = document.elementsFromPoint(clientX, clientY);
  for (const node of stack) {
    if (!(node instanceof HTMLElement)) {
      continue;
    }
    if (isUnderOverlayChrome(node, chromeRootRefs)) {
      continue;
    }
    const host = node.closest("[data-nuvio-id]");
    if (!(host instanceof HTMLElement)) {
      continue;
    }
    const id = host.getAttribute("data-nuvio-id")?.trim() ?? "";
    if (!id) {
      continue;
    }
    // When the dev index is empty or still loading, still allow outlines so Phase 1 UX works.
    if (knownIds.size > 0 && !knownIds.has(id)) {
      continue;
    }
    return host;
  }
  return null;
}

export function InteractionLayer({
  enabled,
  chromeRootRefs,
  knownIds,
  selectedId,
  onSelectId,
}: InteractionLayerProps): ReactElement | null {
  const [hoverId, setHoverId] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setHoverId(null);
      return;
    }

    const onMove = (e: MouseEvent) => {
      const el = pickIndexedTarget(e.clientX, e.clientY, chromeRootRefs, knownIds);
      const id = el?.getAttribute("data-nuvio-id") ?? null;
      setHoverId(id);
    };

    const onClick = (e: MouseEvent) => {
      const el = pickIndexedTarget(e.clientX, e.clientY, chromeRootRefs, knownIds);
      if (!el) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      const id = el.getAttribute("data-nuvio-id");
      if (id) {
        onSelectId(id);
      }
    };

    window.addEventListener("mousemove", onMove, true);
    window.addEventListener("click", onClick, true);

    return () => {
      window.removeEventListener("mousemove", onMove, true);
      window.removeEventListener("click", onClick, true);
      setHoverId(null);
    };
  }, [chromeRootRefs, enabled, knownIds, onSelectId]);

  useEffect(() => {
    clearNuvioOutlines();
    if (!enabled) {
      return;
    }
    const hoverPaint =
      hoverId && hoverId !== selectedId ? hoverId : null;
    if (hoverPaint) {
      paintNuvioOutline(hoverPaint, "hover");
    }
    if (selectedId) {
      paintNuvioOutline(selectedId, "selected");
    }
  }, [enabled, hoverId, selectedId]);

  return null;
}
