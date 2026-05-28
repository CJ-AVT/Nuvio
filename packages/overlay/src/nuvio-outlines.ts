import { escapeAttrSelector } from "./nuvio-dom.js";

export function clearNuvioOutlines(): void {
  document.querySelectorAll("[data-nuvio-outline]").forEach((n) => {
    const el = n as HTMLElement;
    el.style.outline = "";
    el.removeAttribute("data-nuvio-outline");
  });
}

export function paintNuvioOutline(id: string, mode: "hover" | "selected"): void {
  const el = document.querySelector(
    `[data-nuvio-id="${escapeAttrSelector(id)}"]`,
  ) as HTMLElement | null;
  if (!el) {
    return;
  }
  paintNuvioOutlineElement(el, mode);
}

export function paintNuvioOutlineElement(
  el: HTMLElement,
  mode: "hover" | "selected" | "target-hover" | "target-active",
): void {
  el.setAttribute("data-nuvio-outline", mode);
  if (mode === "selected") {
    el.style.outline = "2px solid rgb(14 165 233)";
  } else if (mode === "target-active") {
    el.style.outline = "2px solid rgb(34 211 238)";
  } else if (mode === "target-hover") {
    el.style.outline = "2px dashed rgb(103 232 249)";
  } else {
    el.style.outline = "2px dashed rgb(56 189 248)";
  }
}
