import type { ReactElement } from "react";
import { RteDevShellInner } from "./RteDevShell.js";

function rteDevEnabled(): boolean {
  const env = (import.meta as ImportMeta & { env?: { DEV?: boolean } }).env;
  return env?.DEV === true;
}

/**
 * Dev-only overlay shell. Renders nothing in production builds (`import.meta.env.DEV` is false).
 * Pair with `@rte/vite-plugin` (serve-only) so patches never run on `vite build`.
 */
export function RteDevShell(): ReactElement | null {
  if (!rteDevEnabled()) {
    return null;
  }
  return <RteDevShellInner />;
}
