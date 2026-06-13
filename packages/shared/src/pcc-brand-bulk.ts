import type { BrandApplyAction } from "./brand-kit.js";
import { pccHostsForCategory, type PccManifest } from "./coverage-contract.js";

/** Normalize browser or manifest route paths for comparison. */
export function normalizeAppRoute(route: string): string {
  const pathOnly = route.split("?")[0]?.split("#")[0] ?? "/";
  const trimmed = pathOnly.trim() || "/";
  if (trimmed.length > 1 && trimmed.endsWith("/")) {
    return trimmed.slice(0, -1);
  }
  return trimmed;
}

/** PCC host list for a Brand Kit bulk action, or null when the manifest omits the category. */
export function pccHostsForBrandAction(
  manifest: PccManifest | null | undefined,
  action: BrandApplyAction,
): readonly string[] | null {
  if (!manifest) {
    return null;
  }
  const hosts = pccHostsForCategory(manifest, action);
  return hosts.length > 0 ? hosts : null;
}

export function pccManifestMatchesRoute(manifest: PccManifest, route: string): boolean {
  return normalizeAppRoute(manifest.route) === normalizeAppRoute(route);
}
