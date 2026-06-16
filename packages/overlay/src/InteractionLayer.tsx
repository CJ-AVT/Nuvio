import type { TextWireTarget } from "@rte/shared";
import type { RefObject } from "react";
import { useEffect, useState, type ReactElement } from "react";
import { isRteChromeComposedPath } from "./rte-chrome-hit.js";
import { hostIsInsideAppLink } from "./rte-dom.js";
import {
  classifyUnlocatableClick,
  pickClickTargetElement,
  pickUntaggedClickTarget,
  readUntaggedLocTarget,
  type UnlocatableClickTarget,
  type UntaggedLocTarget,
} from "./rte-loc-dom.js";
import { resolveTextTargetElement } from "./text-target-dom.js";
import {
  clearRteOutlines,
  paintRteOutline,
  paintRteOutlineElement,
} from "./rte-outlines.js";

export type InteractionLayerProps = {
  /** Master gate — listeners attach when edit or make-editable mode is on. */
  enabled: boolean;
  /** Tagged-element selection + property editing. */
  editEnabled: boolean;
  /** Untagged click-to-tag + unlocatable guidance. */
  makeEditableEnabled: boolean;
  chromeRootRefs: readonly RefObject<HTMLElement | null>[];
  knownIds: ReadonlySet<string>;
  selectedId: string | null;
  onSelectId: (id: string | null) => void;
  untaggedTarget: UntaggedLocTarget | null;
  onSelectUntagged: (target: UntaggedLocTarget | null) => void;
  unlocatableTarget: UnlocatableClickTarget | null;
  onSelectUnlocatable: (target: UnlocatableClickTarget | null) => void;
  /** Index v3: highlight alternate text targets under the selected host. */
  textTargetHostId?: string | null;
  textTargets?: readonly TextWireTarget[];
  activeTextTargetKey?: string | null;
  hoverTextTargetKey?: string | null;
  /** When true, only outline the selected id — no multi text-target hints. */
  suppressTextTargetHints?: boolean;
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
    const host = node.closest("[data-rte-id]");
    if (!(host instanceof HTMLElement)) {
      continue;
    }
    const id = host.getAttribute("data-rte-id")?.trim() ?? "";
    if (!id) {
      continue;
    }
    if (knownIds.size > 0 && !knownIds.has(id)) {
      continue;
    }
    return host;
  }
  return null;
}

export function InteractionLayer({
  enabled,
  editEnabled,
  makeEditableEnabled,
  chromeRootRefs,
  knownIds,
  selectedId,
  onSelectId,
  untaggedTarget,
  onSelectUntagged,
  unlocatableTarget,
  onSelectUnlocatable,
  textTargetHostId = null,
  textTargets = [],
  activeTextTargetKey = null,
  hoverTextTargetKey = null,
  suppressTextTargetHints = false,
}: InteractionLayerProps): ReactElement | null {
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [hoverUntagged, setHoverUntagged] = useState<HTMLElement | null>(null);
  const [unlocatableEl, setUnlocatableEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!unlocatableTarget) {
      setUnlocatableEl(null);
    }
  }, [unlocatableTarget]);

  useEffect(() => {
    if (!enabled) {
      setHoverId(null);
      setHoverUntagged(null);
      setUnlocatableEl(null);
      return;
    }

    const onMove = (e: MouseEvent) => {
      if (isRteChromeComposedPath(e)) {
        setHoverId(null);
        setHoverUntagged(null);
        return;
      }
      if (editEnabled) {
        const el = pickIndexedTarget(e.clientX, e.clientY, chromeRootRefs, knownIds);
        if (el) {
          setHoverId(el.getAttribute("data-rte-id"));
          setHoverUntagged(null);
          return;
        }
      }
      if (makeEditableEnabled) {
        const untagged = pickUntaggedClickTarget(
          e.clientX,
          e.clientY,
          chromeRootRefs,
          knownIds,
        );
        setHoverId(null);
        setHoverUntagged(untagged);
        return;
      }
      setHoverId(null);
      setHoverUntagged(null);
    };

    const onClick = (e: MouseEvent) => {
      if (isRteChromeComposedPath(e)) {
        return;
      }
      if (editEnabled) {
        const el = pickIndexedTarget(e.clientX, e.clientY, chromeRootRefs, knownIds);
        if (el) {
          if (hostIsInsideAppLink(el)) {
            return;
          }
          e.preventDefault();
          e.stopPropagation();
          const id = el.getAttribute("data-rte-id");
          if (id) {
            onSelectUntagged(null);
            onSelectUnlocatable(null);
            onSelectId(id);
          }
          return;
        }
      }
      if (makeEditableEnabled) {
        const untaggedEl = pickUntaggedClickTarget(
          e.clientX,
          e.clientY,
          chromeRootRefs,
          knownIds,
        );
        if (untaggedEl) {
          const target = readUntaggedLocTarget(untaggedEl);
          if (!target) {
            return;
          }
          e.preventDefault();
          e.stopPropagation();
          onSelectId(null);
          onSelectUnlocatable(null);
          onSelectUntagged(target);
          return;
        }
        const unlocatable = classifyUnlocatableClick(
          e.clientX,
          e.clientY,
          chromeRootRefs,
        );
        if (unlocatable) {
          e.preventDefault();
          e.stopPropagation();
          onSelectId(null);
          onSelectUntagged(null);
          setUnlocatableEl(pickClickTargetElement(e.clientX, e.clientY, chromeRootRefs));
          onSelectUnlocatable(unlocatable);
        }
      }
    };

    window.addEventListener("mousemove", onMove, true);
    window.addEventListener("click", onClick, true);

    return () => {
      window.removeEventListener("mousemove", onMove, true);
      window.removeEventListener("click", onClick, true);
      setHoverId(null);
      setHoverUntagged(null);
    };
  }, [
    chromeRootRefs,
    editEnabled,
    enabled,
    knownIds,
    makeEditableEnabled,
    onSelectId,
    onSelectUnlocatable,
    onSelectUntagged,
  ]);

  useEffect(() => {
    clearRteOutlines();
    if (!enabled) {
      return;
    }
    const hoverPaint = hoverId && hoverId !== selectedId ? hoverId : null;
    if (hoverPaint) {
      paintRteOutline(hoverPaint, "hover");
    } else if (hoverUntagged) {
      paintRteOutlineElement(
        hoverUntagged,
        makeEditableEnabled ? "taggable" : "hover",
      );
    }

    const showTargetHints =
      !suppressTextTargetHints &&
      textTargetHostId &&
      selectedId === textTargetHostId &&
      textTargets.length > 1;

    if (showTargetHints && textTargetHostId) {
      for (const target of textTargets) {
        const el = resolveTextTargetElement(textTargetHostId, target);
        if (!el) {
          continue;
        }
        if (target.key === activeTextTargetKey) {
          paintRteOutlineElement(el, "target-active");
        } else if (target.key === hoverTextTargetKey) {
          paintRteOutlineElement(el, "target-hover");
        }
      }
      paintRteOutline(textTargetHostId, "selected");
    } else if (selectedId) {
      paintRteOutline(selectedId, "selected");
    } else if (untaggedTarget) {
      const el = document.querySelector(
        `[data-rte-loc="${CSS.escape(`${untaggedTarget.file}:${untaggedTarget.line}:${untaggedTarget.column}`)}"]`,
      );
      if (el instanceof HTMLElement) {
        paintRteOutlineElement(el, "selected");
      }
    } else if (unlocatableTarget && unlocatableEl) {
      paintRteOutlineElement(unlocatableEl, "selected");
    }
  }, [
    enabled,
    hoverId,
    hoverUntagged,
    makeEditableEnabled,
    selectedId,
    untaggedTarget,
    unlocatableTarget,
    unlocatableEl,
    textTargetHostId,
    textTargets,
    activeTextTargetKey,
    suppressTextTargetHints,
  ]);

  return null;
}
