import { NUVO_ROOT } from "./overlay-chrome-classes.js";

export const NUVIO_SHADOW_HOST_ID = "nuvio-overlay-shadow-host";

/** True when the event path includes Nuvio overlay chrome (shadow host or chrome UI). */
export function isNuvioChromeComposedPath(event: Event): boolean {
  for (const node of event.composedPath()) {
    if (!(node instanceof Element)) {
      continue;
    }
    if (node.id === NUVIO_SHADOW_HOST_ID) {
      return true;
    }
    if (node instanceof HTMLElement && node.classList.contains(NUVO_ROOT)) {
      return true;
    }
  }
  return false;
}
