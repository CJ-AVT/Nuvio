import { timingSafeEqual } from "node:crypto";
import type { IncomingMessage } from "node:http";
import {
  bearerTokenFromHeader,
  devTokenFromUpgradeUrl,
  isAllowedNuvioOrigin,
} from "@nuvio/shared/dev-auth";

export function timingSafeTokenEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export function validateNuvioUpgrade(
  request: IncomingMessage,
  expectedToken: string,
): boolean {
  if (!isAllowedNuvioOrigin(request.headers.origin)) {
    return false;
  }
  const provided = devTokenFromUpgradeUrl(request.url);
  if (!provided) {
    return false;
  }
  return timingSafeTokenEqual(provided, expectedToken);
}

export function validateNuvioBearer(
  request: IncomingMessage,
  expectedToken: string,
): boolean {
  const provided = bearerTokenFromHeader(request.headers.authorization);
  if (!provided) {
    return false;
  }
  return timingSafeTokenEqual(provided, expectedToken);
}

export function warnIfWideDevServerHost(
  host: boolean | string | undefined,
  warn: (msg: string) => void,
): void {
  if (host === true || host === "0.0.0.0") {
    warn(
      "[Nuvio] Dev server is bound to all network interfaces. " +
        "Write APIs require a dev token, but are still reachable on your LAN.",
    );
  }
}
