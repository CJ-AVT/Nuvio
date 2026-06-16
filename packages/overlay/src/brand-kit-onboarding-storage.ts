export const BRAND_KIT_FIRST_RUN_STORAGE_KEY = "nuvio:brand-kit-first-run:v1";

export function isBrandKitFirstRunDismissed(): boolean {
  if (typeof localStorage === "undefined") {
    return false;
  }
  try {
    return localStorage.getItem(BRAND_KIT_FIRST_RUN_STORAGE_KEY) === "dismissed";
  } catch {
    return false;
  }
}

export function dismissBrandKitFirstRun(): void {
  if (typeof localStorage === "undefined") {
    return;
  }
  try {
    localStorage.setItem(BRAND_KIT_FIRST_RUN_STORAGE_KEY, "dismissed");
  } catch {
    /* quota / private mode */
  }
}

export function resetBrandKitFirstRunForTests(): void {
  if (typeof localStorage === "undefined") {
    return;
  }
  try {
    localStorage.removeItem(BRAND_KIT_FIRST_RUN_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
