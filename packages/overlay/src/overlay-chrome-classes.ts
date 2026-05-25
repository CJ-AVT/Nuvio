import type { CSSProperties } from "react";

/** Tailwind chrome frame (borders/shadow). Frosting uses inline styles for Safari `-webkit-backdrop-filter`. */
export const NUVO_GLASS_FRAME =
  "border border-white/20 shadow-2xl shadow-black/50 ring-1 ring-white/10";

export const NUVO_GLASS_HEADER = "border-b border-white/10";

export const NUVO_GLASS_SECTION =
  "rounded-lg border border-white/10 bg-slate-950/30 backdrop-blur-md";

/**
 * True glass: translucent fill + backdrop blur (incl. WebKit).
 * Apply on chip and Editor shells via `style={NUVO_GLASS_SURFACE_STYLE}`.
 */
export const NUVO_GLASS_SURFACE_STYLE: CSSProperties = {
  backgroundColor: "rgba(2, 6, 23, 0.45)",
  WebkitBackdropFilter: "blur(24px) saturate(180%)",
  backdropFilter: "blur(24px) saturate(180%)",
};

/** @deprecated Use NUVO_GLASS_FRAME + NUVO_GLASS_SURFACE_STYLE */
export const NUVO_GLASS_PANEL = NUVO_GLASS_FRAME;

export const NUVO_GLASS_CHIP = NUVO_GLASS_FRAME;
