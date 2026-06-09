import { relative } from "node:path";
import type { IndexWireEntry, LibraryId } from "@nuvio/shared";
import {
  buildSourceIndex,
  detectProjectLibraries,
  NUVIO_DEFAULT_SCAN_GLOBS,
  type BuildSourceIndexResult,
} from "@nuvio/vite-plugin/scan";
import { detectProject, type ProjectContext } from "./detect-project.js";

const SCAN_GLOBS = [...NUVIO_DEFAULT_SCAN_GLOBS, "app/**/*.{tsx,jsx}"];

export type ProjectScanResult = {
  ctx: ProjectContext;
  detectedLibraries: LibraryId[];
  index: BuildSourceIndexResult;
};

export function scanProject(root: string): ProjectScanResult {
  const ctx = detectProject(root);
  const detectedLibraries = detectProjectLibraries(root, ctx.packageJson);
  const index = buildSourceIndex(root, SCAN_GLOBS, { detectedLibraries });
  return { ctx, detectedLibraries, index };
}

export function relPath(root: string, fileAbs: string): string {
  return relative(root, fileAbs).replace(/\\/g, "/");
}

export function isTableHost(entry: IndexWireEntry): boolean {
  return (
    entry.hierarchyRole === "table" ||
    entry.id.endsWith(".table") ||
    entry.id.includes(".header.") ||
    /\.row\./.test(entry.id)
  );
}

export function aggregateClassNameModes(
  entries: readonly IndexWireEntry[],
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const entry of entries) {
    const mode = entry.classNameMode ?? "literal-only";
    counts[mode] = (counts[mode] ?? 0) + 1;
  }
  return counts;
}
