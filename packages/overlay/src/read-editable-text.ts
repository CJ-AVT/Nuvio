export type EditableTextRead = {
  text: string;
  /** When false, setText patches are unsafe (container with element children). */
  textEditable: boolean;
  reason?: string;
};

/**
 * Read text suitable for the style panel / setText patch.
 * Avoids using full `textContent` on containers (would include nested buttons, etc.).
 */
export function readEditableTextFromElement(el: HTMLElement): EditableTextRead {
  const elementChildren = Array.from(el.children);
  if (elementChildren.length === 0) {
    return { text: (el.textContent ?? "").trim(), textEditable: true };
  }

  const directText = Array.from(el.childNodes)
    .filter((n) => n.nodeType === Node.TEXT_NODE)
    .map((n) => n.textContent ?? "")
    .join("")
    .trim();

  if (directText) {
    return { text: directText, textEditable: true };
  }

  return {
    text: "",
    textEditable: false,
    reason:
      "Text editing applies to leaf elements (h1, p, button). This container has nested elements — use style controls or select a child text node.",
  };
}
