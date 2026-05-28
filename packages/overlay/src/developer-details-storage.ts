export const DEVELOPER_DETAILS_STORAGE_KEY = "nuvio:developer-details:v2";

export function loadDeveloperDetails(): boolean {
  if (typeof localStorage === "undefined") {
    return false;
  }
  try {
    return localStorage.getItem(DEVELOPER_DETAILS_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function saveDeveloperDetails(enabled: boolean): void {
  if (typeof localStorage === "undefined") {
    return;
  }
  try {
    localStorage.setItem(DEVELOPER_DETAILS_STORAGE_KEY, enabled ? "1" : "0");
  } catch {
    /* quota / private mode */
  }
}
