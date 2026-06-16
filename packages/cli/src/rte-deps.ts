import { readFileSync } from "node:fs";

export type RtePackageName = "@rte/vite-plugin" | "@rte/overlay";

export function readPackageJson(
  packageJsonPath: string,
): Record<string, unknown> {
  return JSON.parse(readFileSync(packageJsonPath, "utf8")) as Record<
    string,
    unknown
  >;
}

export function getDependencyVersion(
  pkg: Record<string, unknown>,
  name: RtePackageName,
): string | undefined {
  const deps = pkg.dependencies as Record<string, string> | undefined;
  const devDeps = pkg.devDependencies as Record<string, string> | undefined;
  return deps?.[name] ?? devDeps?.[name];
}

export function hasRteDependency(
  pkg: Record<string, unknown>,
  name: RtePackageName,
): boolean {
  return Boolean(getDependencyVersion(pkg, name));
}

export function hasRtePackages(pkg: Record<string, unknown>): boolean {
  return (
    hasRteDependency(pkg, "@rte/vite-plugin") &&
    hasRteDependency(pkg, "@rte/overlay")
  );
}

export function isWorkspaceLinkedVersion(version: string | undefined): boolean {
  if (!version) return false;
  return (
    version.startsWith("workspace:") ||
    version.startsWith("link:") ||
    version.startsWith("file:")
  );
}

export function rteOverlayLinkKind(
  pkg: Record<string, unknown>,
): "npm" | "workspace" | "missing" {
  const raw = getDependencyVersion(pkg, "@rte/overlay");
  if (!raw) return "missing";
  return isWorkspaceLinkedVersion(raw) ? "workspace" : "npm";
}
