import { escapeAttrSelector } from "./rte-dom.js";

export function clearRteOutlines(): void {
  document.querySelectorAll("[data-rte-outline]").forEach((n) => {
    const el = n as HTMLElement;
    el.removeAttribute("data-rte-outline");
    el.style.outline = "";
    el.style.outlineOffset = "";
    el.style.boxShadow = "";
  });
}

export function paintRteOutline(id: string, mode: "hover" | "selected"): void {
  const el = document.querySelector(
    `[data-rte-id="${escapeAttrSelector(id)}"]`,
  ) as HTMLElement | null;
  if (!el) {
    return;
  }
  paintRteOutlineElement(el, mode);
}

export function paintRteOutlineElement(
  el: HTMLElement,
  mode: "hover" | "selected" | "target-hover" | "target-active" | "taggable",
): void {
  el.setAttribute("data-rte-outline", mode);
  el.style.outline = "none";
  el.style.outlineOffset = "0";

  if (mode === "selected") {
    el.style.boxShadow =
      "0 0 0 2px rgb(14 165 233), 0 0 0 5px rgba(14, 165, 233, 0.12)";
  } else if (mode === "target-active") {
    el.style.boxShadow =
      "0 0 0 2px rgb(34 211 238), 0 0 0 4px rgba(34, 211, 238, 0.1)";
  } else if (mode === "target-hover") {
    el.style.boxShadow = "0 0 0 1px rgba(56, 189, 248, 0.9)";
  } else if (mode === "taggable") {
    el.style.boxShadow = "0 0 0 1px rgba(56, 189, 248, 0.45)";
    el.style.outline = "2px dashed rgba(56, 189, 248, 0.85)";
    el.style.outlineOffset = "2px";
  } else {
    el.style.boxShadow = "0 0 0 1px rgba(56, 189, 248, 0.65)";
  }
}
