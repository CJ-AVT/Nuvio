import { escapeAttrSelector } from "./rte-dom.js";

export type SiblingMoveAvailability = {
  canMoveUp: boolean;
  canMoveDown: boolean;
  /** Indexed `data-rte-id` peers under the same parent (DOM order). */
  peerCount: number;
};

/** Uses live DOM order (matches source after HMR for static JSX). */
export function getIndexedSiblingMoveAvailability(selectedId: string): SiblingMoveAvailability {
  const el = document.querySelector(
    `[data-rte-id="${escapeAttrSelector(selectedId)}"]`,
  );
  if (!(el instanceof HTMLElement)) {
    return { canMoveUp: false, canMoveDown: false, peerCount: 0 };
  }
  const parent = el.parentElement;
  if (!parent) {
    return { canMoveUp: false, canMoveDown: false, peerCount: 0 };
  }
  const peers = [...parent.children].filter(
    (c): c is HTMLElement => c instanceof HTMLElement && c.hasAttribute("data-rte-id"),
  );
  const idx = peers.indexOf(el);
  if (idx < 0) {
    return { canMoveUp: false, canMoveDown: false, peerCount: peers.length };
  }
  return {
    canMoveUp: idx > 0,
    canMoveDown: idx < peers.length - 1,
    peerCount: peers.length,
  };
}

export function formatPatchUserMessage(message: string | null | undefined): string | null {
  if (!message) {
    return null;
  }
  return message.replace(/^Error:\s*/i, "").trim();
}
