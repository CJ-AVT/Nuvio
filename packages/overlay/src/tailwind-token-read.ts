import type { Breakpoint } from "@nuvio/shared";

const BREAKPOINT_ORDER: Breakpoint[] = ["base", "sm", "md", "lg", "xl"];

type BreakpointBuckets = Record<Breakpoint, string[]> & { passthrough: string[] };

function emptyBuckets(): BreakpointBuckets {
  return { base: [], sm: [], md: [], lg: [], xl: [], passthrough: [] };
}

function classifyTokenByBreakpoint(token: string): { bp: Breakpoint | "passthrough"; value: string } {
  if (!token.includes(":")) {
    return { bp: "base", value: token };
  }
  const m = token.match(/^(sm|md|lg|xl):(.*)$/);
  if (!m || !m[2] || m[2].includes(":")) {
    return { bp: "passthrough", value: token };
  }
  return { bp: m[1] as Breakpoint, value: m[2] };
}

export function parseClassNameByBreakpoint(className: string): BreakpointBuckets {
  const buckets = emptyBuckets();
  for (const tok of className.trim().split(/\s+/).filter(Boolean)) {
    const parsed = classifyTokenByBreakpoint(tok);
    if (parsed.bp === "passthrough") {
      buckets.passthrough.push(parsed.value);
      continue;
    }
    buckets[parsed.bp].push(parsed.value);
  }
  return buckets;
}

/** True when `className` includes at least one `sm:`–`xl:` utility (not only base). */
export function classNameHasResponsiveUtilities(className: string): boolean {
  const buckets = parseClassNameByBreakpoint(className);
  return BREAKPOINT_ORDER.some((bp) => bp !== "base" && buckets[bp].length > 0);
}

/** Breakpoint implied by the live viewport (Tailwind default min-width scale). */
export function viewportBreakpoint(): Breakpoint {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return "base";
  }
  if (window.matchMedia("(min-width: 1280px)").matches) {
    return "xl";
  }
  if (window.matchMedia("(min-width: 1024px)").matches) {
    return "lg";
  }
  if (window.matchMedia("(min-width: 768px)").matches) {
    return "md";
  }
  if (window.matchMedia("(min-width: 640px)").matches) {
    return "sm";
  }
  return "base";
}

/**
 * Cards often ship responsive border stacks (e.g. base accent + `xl:border-0`).
 * Read at the viewport breakpoint so Brand Kit chips match what Tailwind paints.
 */
export function readBreakpointForCardInference(
  className: string,
  activeBreakpoint: Breakpoint,
): Breakpoint {
  if (!classNameHasResponsiveUtilities(className)) {
    return activeBreakpoint;
  }
  return viewportBreakpoint();
}

/** Pseudo/state prefixes ignored when reading the visible style at rest (not hover/focus). */
const INTERACTIVE_VARIANT_RE =
  /^(?:hover|focus|focus-within|active|disabled|group-hover|peer-hover|first|last|odd|even):/;

function isInteractiveVariantToken(token: string): boolean {
  return INTERACTIVE_VARIANT_RE.test(token);
}

function isDarkVariantToken(token: string): boolean {
  return /^dark:/.test(token);
}

function includeDarkVariantsInRead(): boolean {
  if (typeof document === "undefined") {
    return false;
  }
  return document.documentElement.classList.contains("dark");
}

/** Strip state/variant prefixes (dark:, hover:, …) for utility matching. */
export function stripVariantPrefixes(token: string): string {
  let t = token;
  for (;;) {
    const m = t.match(
      /^(?:dark|light|hover|focus|focus-within|active|disabled|group-hover|peer-hover|first|last|odd|even):(.*)$/,
    );
    if (!m?.[1]) {
      return t;
    }
    t = m[1];
  }
}

/**
 * Tokens that apply at `activeBreakpoint` (responsive cascade + passthrough variants stripped).
 * Later entries win for the same utility family (source order preserved).
 */
export function flattenTokensAtBreakpoint(className: string, activeBreakpoint: Breakpoint): string[] {
  const buckets = parseClassNameByBreakpoint(className);
  const idx = BREAKPOINT_ORDER.indexOf(activeBreakpoint);
  const out: string[] = [];
  const includeDark = includeDarkVariantsInRead();
  for (const tok of buckets.passthrough) {
    if (isInteractiveVariantToken(tok)) {
      continue;
    }
    if (isDarkVariantToken(tok)) {
      if (includeDark) {
        out.push(stripVariantPrefixes(tok));
      }
      continue;
    }
  }
  for (let i = 0; i <= idx; i++) {
    out.push(...buckets[BREAKPOINT_ORDER[i]]);
  }
  for (const tok of buckets.passthrough) {
    if (isInteractiveVariantToken(tok) || isDarkVariantToken(tok)) {
      continue;
    }
    out.push(stripVariantPrefixes(tok));
  }
  return out;
}

const TEXT_COLOR_RE =
  /^text-(?:white|black|transparent|inherit|current)(?:\/\d+)?$|^text-(?:[a-z]+)-\d{2,3}(?:\/\d+)?$|^text-(?:[a-z]+)-\d{2,3}\/\[[\d.]+\]$/;

export function isTextColorUtility(token: string): boolean {
  return TEXT_COLOR_RE.test(token);
}

const BG_COLOR_RE =
  /^bg-(?:white|black|transparent|inherit|current)(?:\/\d+)?$|^bg-(?:white|black)\/\[[\d.]+\]$|^bg-(?:[a-z]+)-\d{2,3}(?:\/\d+|\[\d+(?:\.\d+)?\])?$/;

export function isBgColorUtility(token: string): boolean {
  return BG_COLOR_RE.test(token);
}

const FONT_SIZE_RE =
  /^text-(?:xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl|[a-z]+(?:-[a-z]+)*)$/;

export function isFontSizeUtility(token: string): boolean {
  return FONT_SIZE_RE.test(token) && !isTextColorUtility(token);
}

export function isRoundedUtility(token: string): boolean {
  return /^rounded(?:-[a-z0-9]+)?$/.test(token);
}

export function isBorderColorUtility(token: string): boolean {
  return /^border-(?:white|black|(?:[a-z]+)-\d{2,3})$/.test(token);
}

export function lastMatchingToken(
  tokens: readonly string[],
  matches: (token: string) => boolean,
): string {
  let hit = "";
  for (const t of tokens) {
    if (matches(t)) {
      hit = t;
    }
  }
  return hit;
}
