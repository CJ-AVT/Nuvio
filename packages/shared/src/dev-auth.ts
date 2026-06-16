/** Query param on WebSocket upgrade URL carrying the per-dev-server secret. */
export const RTE_DEV_TOKEN_QUERY = "token" as const;

/** Dev-only HTTP path that returns `{ token }` for overlay bootstrap (localhost only). */
export const RTE_DEV_TOKEN_PATH = "/__rte/dev-token" as const;

/** Returns false when Origin is missing — browsers always send Origin on WS upgrades. */
export function isAllowedRteOrigin(origin: string | undefined): boolean {
  if (!origin) {
    return false;
  }
  try {
    const u = new URL(origin);
    return (
      (u.hostname === "localhost" || u.hostname === "127.0.0.1") &&
      (u.protocol === "http:" || u.protocol === "https:")
    );
  } catch {
    return false;
  }
}

export function devTokenFromUpgradeUrl(url: string | undefined): string | null {
  if (!url) {
    return null;
  }
  try {
    const u = new URL(url, "http://localhost");
    return u.searchParams.get(RTE_DEV_TOKEN_QUERY);
  } catch {
    return null;
  }
}

export function bearerTokenFromHeader(
  header: string | string[] | undefined,
): string | null {
  const raw = Array.isArray(header) ? header[0] : header;
  if (!raw) {
    return null;
  }
  const match = /^Bearer\s+(\S+)$/i.exec(raw.trim());
  return match?.[1] ?? null;
}

export function isValidDevToken(
  provided: string | null | undefined,
  expected: string,
): boolean {
  if (!provided || !expected) {
    return false;
  }
  return provided === expected;
}
