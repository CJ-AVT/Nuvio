/**
 * Full Tailwind v3 color scale for Editor pickers (matches `COLOR_SCALE` in ast-engine whitelist).
 */

import {
  TAILWIND_COLOR_FAMILIES,
  TAILWIND_COLOR_SHADES,
  TAILWIND_PALETTE_HEX,
} from "./tailwind-palette-hex.js";

export type ColorOption = {
  value: string;
  label: string;
  hex: string;
};

function hexFor(family: string, shade: number): string {
  return TAILWIND_PALETTE_HEX[family]?.[String(shade)] ?? "#888";
}

function buildScaleOptions(prefix: "text" | "bg"): ColorOption[] {
  const opts: ColorOption[] = [];
  for (const family of TAILWIND_COLOR_FAMILIES) {
    for (const shade of TAILWIND_COLOR_SHADES) {
      const value = `${prefix}-${family}-${shade}`;
      opts.push({ value, label: value, hex: hexFor(family, shade) });
    }
  }
  return opts;
}

export const TEXT_COLOR_OPTIONS: ColorOption[] = [
  { value: "", label: "—", hex: "transparent" },
  { value: "text-white", label: "text-white", hex: "#ffffff" },
  { value: "text-black", label: "text-black", hex: "#000000" },
  ...buildScaleOptions("text"),
];

/** Backgrounds with opacity (whitelist `BG_COLOR_OPACITY` in ast-engine). */
function buildBgOpacityOptions(): ColorOption[] {
  const families = ["slate", "sky", "neutral"] as const;
  const shades = [800, 900, 950] as const;
  const ops = [50, 75, 80] as const;
  const out: ColorOption[] = [];
  for (const family of families) {
    for (const shade of shades) {
      for (const op of ops) {
        const value = `bg-${family}-${shade}/${op}`;
        out.push({ value, label: value, hex: hexFor(family, shade) });
      }
    }
  }
  return out;
}

export const BACKGROUND_COLOR_OPTIONS: ColorOption[] = [
  { value: "", label: "—", hex: "transparent" },
  { value: "bg-transparent", label: "bg-transparent", hex: "transparent" },
  { value: "bg-white", label: "bg-white", hex: "#ffffff" },
  { value: "bg-black", label: "bg-black", hex: "#000000" },
  ...buildScaleOptions("bg"),
  ...buildBgOpacityOptions(),
];

/** Flat utility strings for `readAlphaPicksFromClassName` matching. */
export const TEXT_COLOR_VALUES = TEXT_COLOR_OPTIONS.map((o) => o.value).filter(Boolean);

export const BACKGROUND_COLOR_VALUES = BACKGROUND_COLOR_OPTIONS.map((o) => o.value).filter(
  Boolean,
);
