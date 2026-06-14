#!/usr/bin/env node
/**
 * v1.0 acceptance — CLI init, package versions, doctor/scan on examples.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const cliEntry = join(root, "packages/cli/dist/cli-entry.js");

const PUBLISH_PACKAGES = [
  "packages/shared/package.json",
  "packages/ast-engine/package.json",
  "packages/vite-plugin/package.json",
  "packages/overlay/package.json",
  "packages/cli/package.json",
];

const DOCTOR_TARGETS = [
  { label: "vite-basic", path: "examples/vite-basic" },
  { label: "shadcn-dashboard", path: "examples/shadcn-dashboard" },
  { label: "tailadmin-dogfood", path: "apps/tailadmin-dogfood" },
];

function fail(msg) {
  console.error(`v10:acceptance FAIL — ${msg}`);
  process.exit(1);
}

const MAX_BUFFER = 16 * 1024 * 1024;

function runNode(args, cwd = root) {
  return spawnSync(process.execPath, args, {
    cwd,
    stdio: "pipe",
    encoding: "utf8",
    maxBuffer: MAX_BUFFER,
    env: { ...process.env, CI: "true", NUVIO_TELEMETRY: "0" },
  });
}

const build = spawnSync("pnpm", ["--filter", "@nuvio/cli", "build"], {
  cwd: root,
  stdio: "inherit",
});
if (build.status !== 0) fail("cli build failed");
if (!existsSync(cliEntry)) fail("missing packages/cli/dist/cli-entry.js");

for (const rel of PUBLISH_PACKAGES) {
  const pkg = JSON.parse(readFileSync(join(root, rel), "utf8"));
  if (pkg.version !== "1.1.0") {
    fail(`${rel} version is ${pkg.version}, expected 1.1.0`);
  }
}
console.log("v10:acceptance — all publish packages at 1.1.0");

const v051 = spawnSync("node", ["scripts/v051-cli-acceptance.mjs"], {
  cwd: root,
  stdio: "inherit",
});
if (v051.status !== 0) fail("v051-cli-acceptance failed");

for (const target of DOCTOR_TARGETS) {
  const abs = join(root, target.path);
  if (!existsSync(join(abs, "package.json"))) {
    fail(`missing ${target.path}/package.json`);
  }
  const doctor = runNode(
    [cliEntry, "doctor", "--skip-dev-server", "--cwd", abs],
    root,
  );
  if (doctor.status !== 0) {
    console.error(doctor.stdout);
    console.error(doctor.stderr);
    fail(`nuvio doctor failed for ${target.label}`);
  }
  const stats = runNode([cliEntry, "stats", "--json", "--cwd", abs], root);
  if (stats.status !== 0) {
    console.error(stats.stdout);
    fail(`nuvio stats failed for ${target.label}`);
  }
  let parsed;
  try {
    parsed = JSON.parse(stats.stdout.trim());
  } catch {
    fail(`nuvio stats --json invalid for ${target.label}`);
  }
  const hosts = parsed.editableHosts ?? 0;
  if (hosts < 1) {
    fail(`nuvio stats found 0 editable hosts for ${target.label}`);
  }
  console.log(
    `v10:acceptance — ${target.label}: doctor OK, ${hosts} host(s)`,
  );
}

console.log("v10:acceptance PASS");
