const LOC_ATTR = "data-nuvio-loc";

export type UntaggedLocTarget = {
  file: string;
  line: number;
  column: number;
  tagName: string;
};

export function parseNuvioLocAttribute(value: string): {
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
  if (host.hasAttribute("data-nuvio-id")) {
    return null;
  }
  const raw = host.getAttribute(LOC_ATTR);
  if (!raw) {
    return null;
  }
  const parsed = parseNuvioLocAttribute(raw);
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
    const withId = node.closest("[data-nuvio-id]");
    if (withId instanceof HTMLElement) {
      const id = withId.getAttribute("data-nuvio-id")?.trim() ?? "";
      if (id && knownIds.has(id)) {
        return null;
      }
    }
    const withLoc = node.closest(`[${LOC_ATTR}]`);
    if (withLoc instanceof HTMLElement && !withLoc.hasAttribute("data-nuvio-id")) {
      return withLoc;
    }
  }
  return null;
}
