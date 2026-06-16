/** Parse pathname from an HTTP upgrade URL (may be path-only, e.g. `/__rte/ws`). */
export function pathnameFromUpgradeUrl(url: string | undefined): string {
  if (!url) {
    return "";
  }
  try {
    return new URL(url, "http://localhost").pathname;
  } catch {
    return "";
  }
}
