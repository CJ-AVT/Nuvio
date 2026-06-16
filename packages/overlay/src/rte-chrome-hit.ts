import { RTE_ROOT } from "./overlay-chrome-classes.js";

export const RTE_SHADOW_HOST_ID = "rte-overlay-shadow-host";

/** True when the event path includes Rte overlay chrome (shadow host or chrome UI). */
export function isRteChromeComposedPath(event: Event): boolean {
  for (const node of event.composedPath()) {
    if (!(node instanceof Element)) {
      continue;
    }
    if (node.id === RTE_SHADOW_HOST_ID) {
      return true;
    }
    if (node instanceof HTMLElement && node.classList.contains(RTE_ROOT)) {
      return true;
    }
  }
  return false;
}
