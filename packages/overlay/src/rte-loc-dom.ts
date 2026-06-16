import { hostIsInsideAppLink } from "./rte-dom.js";

const LOC_ATTR = "data-rte-loc";

export type UnlocatableClickReason =
  | "no_vite_plugin"
  | "wrapper_not_forwarding"
  | "inside_app_link";

export type UnlocatableClickTarget = {
  reason: UnlocatableClickReason;
  tagName: string;
};

export type UntaggedLocTarget = {
  file: string;
  line: number;
  column: number;
  tagName: string;
};

export function parseRteLocAttribute(value: string): {
  file: string;
  line: number;
  column: number;
} | null {
  const match = /^(.+):(\d+):(\d+)$/.exec(value.trim());
  if (!match) {
    return null;
  }
  return {
    file: match[1]!,
    line: Number(match[2]),
    column: Number(match[3]),
  };
}

export function readUntaggedLocTarget(el: HTMLElement): UntaggedLocTarget | null {
  const host = el.closest(`[${LOC_ATTR}]`);
  if (!(host instanceof HTMLElement)) {
    return null;
  }
  if (host.hasAttribute("data-rte-id")) {
    return null;
  }
  const raw = host.getAttribute(LOC_ATTR);
  if (!raw) {
    return null;
  }
  const parsed = parseRteLocAttribute(raw);
  if (!parsed) {
    return null;
  }
  return {
    ...parsed,
    tagName: host.tagName.toLowerCase(),
  };
}

export function pickUntaggedClickTarget(
  clientX: number,
  clientY: number,
  chromeRootRefs: readonly { current: HTMLElement | null }[],
  knownIds: ReadonlySet<string>,
): HTMLElement | null {
  const stack = document.elementsFromPoint(clientX, clientY);
  for (const node of stack) {
    if (!(node instanceof HTMLElement)) {
      continue;
    }
    let underChrome = false;
    for (const ref of chromeRootRefs) {
      if (ref.current?.contains(node)) {
        underChrome = true;
        break;
      }
    }
    if (underChrome) {
      continue;
    }
    const withId = node.closest("[data-rte-id]");
    if (withId instanceof HTMLElement) {
      const id = withId.getAttribute("data-rte-id")?.trim() ?? "";
      if (id && knownIds.has(id)) {
        return null;
      }
    }
    const withLoc = node.closest(`[${LOC_ATTR}]`);
    if (withLoc instanceof HTMLElement && !withLoc.hasAttribute("data-rte-id")) {
      return withLoc;
    }
  }
  return null;
}

function isUnderOverlayChrome(
  node: HTMLElement,
  chromeRootRefs: readonly { current: HTMLElement | null }[],
): boolean {
  for (const ref of chromeRootRefs) {
    if (ref.current?.contains(node)) {
      return true;
    }
  }
  return false;
}

export function hasAnyRteLocInDocument(): boolean {
  return document.querySelector(`[${LOC_ATTR}]`) !== null;
}

export function pickClickTargetElement(
  clientX: number,
  clientY: number,
  chromeRootRefs: readonly { current: HTMLElement | null }[],
): HTMLElement | null {
  const stack = document.elementsFromPoint(clientX, clientY);
  for (const node of stack) {
    if (!(node instanceof HTMLElement)) {
      continue;
    }
    if (isUnderOverlayChrome(node, chromeRootRefs)) {
      continue;
    }
    return node;
  }
  return null;
}

/**
 * When click hits app DOM but is not taggable, classify why (for guidance panel).
 */
export function classifyUnlocatableClick(
  clientX: number,
  clientY: number,
  chromeRootRefs: readonly { current: HTMLElement | null }[],
): UnlocatableClickTarget | null {
  const el = pickClickTargetElement(clientX, clientY, chromeRootRefs);
  if (!el) {
    return null;
  }
  const tagName = el.tagName.toLowerCase();

  if (hostIsInsideAppLink(el)) {
    return { reason: "inside_app_link", tagName };
  }

  if (!hasAnyRteLocInDocument()) {
    return { reason: "no_vite_plugin", tagName };
  }

  const withLoc = el.closest(`[${LOC_ATTR}]`);
  const withId = el.closest("[data-rte-id]");
  if (!withLoc && !withId) {
    return { reason: "wrapper_not_forwarding", tagName };
  }

  return null;
}
