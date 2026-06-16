import type { CSSProperties } from "react";

/** Root wrapper — scopes self-contained overlay.css */
export const NUVO_ROOT = "nuvio-root";

/** Glass Pro shell (chip + editor). */
export const NUVO_GLASS_SHELL = "nuvio-glass-shell";
export const NUVO_GLASS_CONTENT = "nuvio-glass-content";
export const NUVO_CARD = "nuvio-card";

/** @deprecated Use NUVO_GLASS_SHELL */
export const NUVO_CHROME_SURFACE = NUVO_GLASS_SHELL;
/** @deprecated Use NUVO_CARD */
export const NUVO_CHROME_SECTION = NUVO_CARD;
/** @deprecated Alias */
export const NUVO_CHROME_HEADER = "nuvio-panel-header";
/** @deprecated Alias for NUVO_GLASS_SHELL */
export const NUVO_GLASS_FRAME = NUVO_GLASS_SHELL;
/** @deprecated Alias for NUVO_CARD */
export const NUVO_GLASS_SECTION = NUVO_CARD;
/** @deprecated Alias for NUVO_CHROME_HEADER */
export const NUVO_GLASS_HEADER = NUVO_CHROME_HEADER;

/**
 * Inline backdrop (Safari / Shadow DOM need filter on the painted element).
 * Background/border come from `.nuvio-glass-shell` in overlay.css.
 */
export const NUVO_GLASS_SHELL_INLINE: CSSProperties = {
  WebkitBackdropFilter: "blur(24px) saturate(160%)",
  backdropFilter: "blur(24px) saturate(160%)",
};

/** @deprecated Use NUVO_GLASS_SHELL_INLINE */
export const NUVO_LIQUID_GLASS_SURFACE = NUVO_GLASS_SHELL_INLINE;

/** @deprecated Use NUVO_GLASS_SHELL_INLINE */
export const NUVO_GLASS_SURFACE_STYLE = NUVO_GLASS_SHELL_INLINE;

/** @deprecated Use NUVO_GLASS_SHELL */
export const NUVO_GLASS_PANEL = NUVO_GLASS_SHELL;

/** @deprecated Use NUVO_GLASS_SHELL */
export const NUVO_GLASS_CHIP = NUVO_GLASS_SHELL;
