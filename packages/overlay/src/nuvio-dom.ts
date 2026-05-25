/** Escape `data-nuvio-id` values for use inside `[data-nuvio-id="…"]` selectors. */
export function escapeAttrSelector(id: string): string {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(id);
  }
  return id.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}
