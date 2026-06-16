import type { IncomingMessage, ServerResponse } from "node:http";
import { isAllowedNuvioOrigin } from "@nuvio/shared/dev-auth";

/** Same-origin `fetch` to the dev token endpoint often omits `Origin`; allow loopback Host. */
export function isLocalDevHttpRequest(req: IncomingMessage): boolean {
  if (isAllowedNuvioOrigin(req.headers.origin)) {
    return true;
  }
  const host = (req.headers.host ?? "").split(":")[0]?.toLowerCase() ?? "";
  return host === "localhost" || host === "127.0.0.1" || host === "[::1]";
}

export function handleDevTokenHttp(
  req: IncomingMessage,
  res: ServerResponse,
  devAuthToken: string,
): void {
  if (req.method !== "GET") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "method_not_allowed" }));
    return;
  }
  if (!isLocalDevHttpRequest(req)) {
    res.statusCode = 403;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "forbidden" }));
    return;
  }
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ token: devAuthToken }));
}
