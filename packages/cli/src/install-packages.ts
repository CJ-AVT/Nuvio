import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import type { PackageManager } from "./detect-pm.js";

function parseInstalledVersion(
  pkg: Record<string, unknown>,
  name: string,
): string | null {
  const dev = pkg.devDependencies as Record<string, string> | undefined;
  const deps = pkg.dependencies as Record<string, string> | undefined;
  const raw = dev?.[name] ?? deps?.[name];
  if (!raw) return null;
  return raw.replace(/^[\^~]/, "");
}

export function packagesNeedInstall(
  packageJsonPath: string,
  targetVersion: string,
): boolean {
  const pkg = JSON.parse(readFileSync(packageJsonPath, "utf8")) as Record<
    string,
    unknown
  >;
  for (const name of ["@rte/vite-plugin", "@rte/overlay"]) {
    const v = parseInstalledVersion(pkg, name);
    if (v !== targetVersion) return true;
  }
  return false;
}

function installArgv(
  pm: PackageManager,
  version: string,
): { command: string; args: string[]; display: string } {
  const pkgs = [`@rte/vite-plugin@${version}`, `@rte/overlay@${version}`];
  switch (pm) {
    case "pnpm":
      return {
        command: "pnpm",
        args: ["add", "-D", ...pkgs],
        display: `pnpm add -D ${pkgs.join(" ")}`,
      };
    case "yarn":
      return {
        command: "yarn",
        args: ["add", "-D", ...pkgs],
        display: `yarn add -D ${pkgs.join(" ")}`,
      };
    case "bun":
      return {
        command: "bun",
        args: ["add", "-d", ...pkgs],
        display: `bun add -d ${pkgs.join(" ")}`,
      };
    default:
      return {
        command: "npm",
        args: ["install", "-D", ...pkgs],
        display: `npm install -D ${pkgs.join(" ")}`,
      };
  }
}

export function runInstall(
  root: string,
  pm: PackageManager,
  version: string,
): { ok: boolean; message?: string } {
  const { command, args, display } = installArgv(pm, version);
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: "inherit",
    env: process.env,
  });
  if (result.status !== 0) {
    return {
      ok: false,
      message: `Install failed. Try manually:\n  ${display}`,
    };
  }
  return { ok: true };
}
