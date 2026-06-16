import type { CSSProperties } from "react";

/** Root wrapper — scopes self-contained overlay.css */
export const RTE_ROOT = "rte-root";

/** Glass Pro shell (chip + editor). */
export const RTE_GLASS_SHELL = "rte-glass-shell";
export const RTE_GLASS_CONTENT = "rte-glass-content";
export const RTE_CARD = "rte-card";

/** @deprecated Use RTE_GLASS_SHELL */
export const RTE_CHROME_SURFACE = RTE_GLASS_SHELL;
/** @deprecated Use RTE_CARD */
export const RTE_CHROME_SECTION = RTE_CARD;
/** @deprecated Alias */
export const RTE_CHROME_HEADER = "rte-panel-header";
/** @deprecated Alias for RTE_GLASS_SHELL */
export const RTE_GLASS_FRAME = RTE_GLASS_SHELL;
/** @deprecated Alias for RTE_CARD */
export const RTE_GLASS_SECTION = RTE_CARD;
/** @deprecated Alias for RTE_CHROME_HEADER */
export const RTE_GLASS_HEADER = RTE_CHROME_HEADER;

/**
 * Inline backdrop (Safari / Shadow DOM need filter on the painted element).
 * Background/border come from `.rte-glass-shell` in overlay.css.
 */
export const RTE_GLASS_SHELL_INLINE: CSSProperties = {
  WebkitBackdropFilter: "blur(24px) saturate(160%)",
  backdropFilter: "blur(24px) saturate(160%)",
};

/** @deprecated Use RTE_GLASS_SHELL_INLINE */
export const RTE_LIQUID_GLASS_SURFACE = RTE_GLASS_SHELL_INLINE;

/** @deprecated Use RTE_GLASS_SHELL_INLINE */
export const RTE_GLASS_SURFACE_STYLE = RTE_GLASS_SHELL_INLINE;

/** @deprecated Use RTE_GLASS_SHELL */
export const RTE_GLASS_PANEL = RTE_GLASS_SHELL;

/** @deprecated Use RTE_GLASS_SHELL */
export const RTE_GLASS_CHIP = RTE_GLASS_SHELL;
