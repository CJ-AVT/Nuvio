import { randomUUID } from "node:crypto";

let sessionToken: string | null = null;

export function getOrCreateDevSessionToken(): string {
  if (!sessionToken) {
    sessionToken = randomUUID();
  }
  return sessionToken;
}

/** Test-only reset. */
export function resetDevSessionTokenForTests(): void {
  sessionToken = null;
}
