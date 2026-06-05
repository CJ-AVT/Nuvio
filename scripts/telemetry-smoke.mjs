#!/usr/bin/env node
/**
 * Live PostHog smoke test (CLI). Requires network.
 *
 *   pnpm telemetry:smoke
 *
 * Then open PostHog → Activity and look for:
 *   nuvio_init_started, nuvio_init_completed (distinct_id from ~/.nuvio/telemetry.json)
 */
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const result = spawnSync(
  "pnpm",
  ["--filter", "@nuvio/cli", "exec", "vitest", "run", "test/telemetry-live.test.ts"],
  {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, NUVIO_TELEMETRY_LIVE: "1" },
  },
);

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

console.log("\n✓ CLI smoke events flushed.");
console.log("  PostHog → Activity → filter: nuvio_init_started | nuvio_init_completed");
console.log("  Anonymous id: ~/.nuvio/telemetry.json");
