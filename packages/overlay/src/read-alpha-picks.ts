import type { AlphaStylePicks } from "./alpha-patch-ops.js";
import { EMPTY_ALPHA_PICKS } from "./alpha-patch-ops.js";
import { BACKGROUND_COLOR_VALUES, TEXT_COLOR_VALUES } from "./tailwind-color-options.js";

const FONT_SIZE = ["text-sm", "text-base", "text-lg", "text-xl", "text-2xl"] as const;
const FONT_WEIGHT = ["font-medium", "font-semibold", "font-bold"] as const;
const TEXT_COLOR = TEXT_COLOR_VALUES;
const BG_COLOR = BACKGROUND_COLOR_VALUES;
const ROUNDED = ["rounded-md", "rounded-lg", "rounded-xl", "rounded-full"] as const;
const PADDING = ["p-2", "p-4", "p-6", "px-4 py-2"] as const;
const MARGIN = ["m-2", "m-4", "mx-auto", "mt-4", "mb-4"] as const;
const TEXT_ALIGN = ["text-left", "text-center", "text-right", "text-justify"] as const;
const GAP = ["gap-1", "gap-2", "gap-4", "gap-6", "gap-8"] as const;
const WIDTH = ["w-auto", "w-full", "w-1/2", "w-1/3", "w-2/3", "w-1/4", "w-3/4"] as const;
const MAX_WIDTH = [
  "max-w-sm",
  "max-w-md",
  "max-w-lg",
  "max-w-xl",
  "max-w-2xl",
  "max-w-4xl",
  "max-w-prose",
  "max-w-full",
] as const;
const HEIGHT = ["h-auto", "h-full", "h-8", "h-12", "h-16", "h-24", "h-screen"] as const;
const MIN_HEIGHT = ["min-h-0", "min-h-full", "min-h-screen", "min-h-16", "min-h-24"] as const;
const OPACITY = [
  "opacity-0",
  "opacity-25",
  "opacity-50",
  "opacity-75",
  "opacity-100",
] as const;
const SHADOW = ["shadow-none", "shadow-sm", "shadow", "shadow-md", "shadow-lg", "shadow-xl"] as const;

function tokenizeClassName(className: string): string[] {
  return className.trim().split(/\s+/).filter(Boolean);
}

/** Last token in document order wins (Tailwind source order). */
function lastLiteralMatch(tokens: readonly string[], candidates: readonly string[]): string {
  let hit = "";
  for (const t of tokens) {
    if (candidates.includes(t)) {
      hit = t;
    }
  }
  return hit;
}

/** Match panel composite utilities like `px-4 py-2`. */
function lastCompositeMatch(tokens: readonly string[], composites: readonly string[]): string {
  let hit = "";
  for (const composite of composites) {
    const parts = composite.split(/\s+/).filter(Boolean);
    if (parts.length > 0 && parts.every((p) => tokens.includes(p))) {
      hit = composite;
    }
  }
  return hit;
}

/**
 * Map a host element's `class` attribute to staged pick values (panel dropdowns).
 * Only recognizes utilities present in the Editor panel allowlists.
 */
export function readAlphaPicksFromClassName(className: string): AlphaStylePicks {
  const tokens = tokenizeClassName(className);
  if (tokens.length === 0) {
    return { ...EMPTY_ALPHA_PICKS };
  }
  return {
    fontSize: lastLiteralMatch(tokens, FONT_SIZE),
    fontWeight: lastLiteralMatch(tokens, FONT_WEIGHT),
    textColor: lastLiteralMatch(tokens, TEXT_COLOR),
    bgColor: lastLiteralMatch(tokens, BG_COLOR),
    rounded: lastLiteralMatch(tokens, ROUNDED),
    padding: lastCompositeMatch(tokens, PADDING) || lastLiteralMatch(tokens, PADDING),
    margin: lastLiteralMatch(tokens, MARGIN),
    textAlign: lastLiteralMatch(tokens, TEXT_ALIGN),
    gap: lastLiteralMatch(tokens, GAP),
    width: lastLiteralMatch(tokens, WIDTH),
    maxWidth: lastLiteralMatch(tokens, MAX_WIDTH),
    height: lastLiteralMatch(tokens, HEIGHT),
    minHeight: lastLiteralMatch(tokens, MIN_HEIGHT),
    opacity: lastLiteralMatch(tokens, OPACITY),
    shadow: lastLiteralMatch(tokens, SHADOW),
  };
}

export function readAlphaPicksFromElement(el: HTMLElement): AlphaStylePicks {
  return readAlphaPicksFromClassName(el.className);
}

export function alphaPicksDiffer(a: AlphaStylePicks, b: AlphaStylePicks): boolean {
  return (Object.keys(EMPTY_ALPHA_PICKS) as (keyof AlphaStylePicks)[]).some((k) => a[k] !== b[k]);
}
