import { NUVIO_DEV_TOKEN_PATH, NUVIO_DEV_TOKEN_QUERY } from "@nuvio/shared";

export function readOverlayDevTokenFromEnv(): string {
  const env = import.meta as ImportMeta & {
    env?: { VITE_NUVIO_DEV_TOKEN?: string };
  };
  return env.env?.VITE_NUVIO_DEV_TOKEN ?? "";
}

export async function resolveOverlayDevToken(): Promise<string> {
  const fromEnv = readOverlayDevTokenFromEnv();
  if (fromEnv) {
    return fromEnv;
  }
  try {
    const res = await fetch(NUVIO_DEV_TOKEN_PATH);
    if (!res.ok) {
      return "";
    }
    const json = (await res.json()) as { token?: string };
    return typeof json.token === "string" ? json.token : "";
  } catch {
    return "";
  }
}

export function nuvioDevAuthHeaders(token: string): Record<string, string> {
  if (!token) {
    return {};
  }
  return { Authorization: `Bearer ${token}` };
}

export function nuvioWebSocketUrl(
  proto: "ws:" | "wss:",
  host: string,
  wsPath: string,
  token: string,
): string {
  const url = new URL(`${proto}//${host}${wsPath}`);
  if (token) {
    url.searchParams.set(NUVIO_DEV_TOKEN_QUERY, token);
  }
  return url.toString();
}
