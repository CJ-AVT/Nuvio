/** Escape `data-rte-id` values for use inside `[data-rte-id="…"]` selectors. */
export function escapeAttrSelector(id: string): string {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(id);
  }
  return id.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

/** True when a host sits inside a real in-app navigation link (React Router `<Link>` → `<a href>`). */
export function hostIsInsideAppLink(host: HTMLElement): boolean {
  const anchor = host.closest("a[href]");
  if (!(anchor instanceof HTMLAnchorElement)) {
    return false;
  }
  const href = anchor.getAttribute("href")?.trim() ?? "";
  if (!href || href === "#" || href.startsWith("javascript:")) {
    return false;
  }
  return true;
}
