#!/usr/bin/env node
/**
 * Verify PostHog ingestion from your machine.
 *
 *   pnpm posthog:verify
 *
 * Then in PostHog (https://us.posthog.com):
 *   Activity → Events → Last 24 hours → look for the printed event name.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const tokenPath = join(root, "packages/cli/src/nuvio-posthog-token.ts");
const tokenSource = readFileSync(tokenPath, "utf8");
const match = tokenSource.match(/export const NUVIO_POSTHOG_TOKEN = "([^"]+)"/);
const token = process.env.NUVIO_POSTHOG_TOKEN ?? match?.[1] ?? "";

if (!token.startsWith("phc_")) {
  console.error("No valid PostHog token found. Set NUVIO_POSTHOG_TOKEN or update nuvio-posthog-token.ts");
  process.exit(1);
}

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const eventName = `nuvio_verify_${stamp}`;
const host = "https://us.i.posthog.com";

console.log("PostHog verify");
console.log(`  host:  ${host}`);
console.log(`  token: ${token.slice(0, 12)}…${token.slice(-6)}`);
console.log(`  event: ${eventName}`);
console.log("");

const require = createRequire(join(root, "packages/cli/package.json"));
const { PostHog } = require("posthog-node");

const client = new PostHog(token, {
  host,
  flushAt: 1,
  flushInterval: 0,
});

client.capture({
  distinctId: "nuvio-verify-local",
  event: eventName,
  properties: {
    nuvio_version: "0.5.4",
    source: "posthog-verify-script",
  },
});

await client.flush();
await client.shutdown();

console.log("Sent. Wait 30–60s, then check:");
console.log("  1. Open https://us.posthog.com (US cloud — not app.posthog.com)");
console.log("  2. Default project → Activity → Events tab");
console.log("  3. Time range: Last 24 hours");
console.log(`  4. Filter event name: ${eventName}`);
console.log("");
console.log("If still empty:");
console.log("  • Settings → General → compare Project token with packages/cli/src/nuvio-posthog-token.ts");
console.log("  • Run: NUVIO_TELEMETRY_DEBUG=1 pnpm telemetry:smoke");
console.log("  • Confirm NUVIO_TELEMETRY is not 0 in your shell");
