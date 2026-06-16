import type { ReactElement } from "react";
import { NuvioDevShellInner } from "./NuvioDevShell.js";

function nuvioDevEnabled(): boolean {
  const env = (import.meta as ImportMeta & { env?: { DEV?: boolean } }).env;
  return env?.DEV === true;
}

/**
 * Dev-only overlay shell. Renders nothing in production builds (`import.meta.env.DEV` is false).
 * Pair with `@nuvio/vite-plugin` (serve-only) so patches never run on `vite build`.
 */
export function NuvioDevShell(): ReactElement | null {
  if (!nuvioDevEnabled()) {
    return null;
  }
  return <NuvioDevShellInner />;
}
