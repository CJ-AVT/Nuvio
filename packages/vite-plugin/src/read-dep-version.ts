import * as fs from "node:fs";
import * as path from "node:path";

function readPackageVersion(rootAbs: string, pkgName: string): string | undefined {
  const pkgPath = path.join(rootAbs, "node_modules", pkgName, "package.json");
  try {
    const raw = fs.readFileSync(pkgPath, "utf8");
    const json = JSON.parse(raw) as { version?: string };
    return typeof json.version === "string" ? json.version : undefined;
  } catch {
    return undefined;
  }
}

export type RuntimeVersions = {
  viteVersion?: string;
  reactVersion?: string;
  tailwindVersion?: string;
};

/** Best-effort versions from the consuming app's node_modules. */
export function readRuntimeVersions(projectRootAbs: string): RuntimeVersions {
  const root = path.resolve(projectRootAbs);
  return {
    viteVersion: readPackageVersion(root, "vite"),
    reactVersion: readPackageVersion(root, "react"),
    tailwindVersion: readPackageVersion(root, "tailwindcss"),
  };
}
