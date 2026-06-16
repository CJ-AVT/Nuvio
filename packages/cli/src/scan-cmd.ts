import { PreflightError } from "./detect-project.js";
import { relPath, scanProject } from "./project-scan.js";

export type ScanOptions = {
  cwd: string;
  json?: boolean;
};

export type ScanHostRow = {
  id: string;
  file: string;
  line: number;
  column: number;
  libraryHint?: string;
  classNameMode?: string;
};

export type ScanResult = {
  projectName: string;
  hosts: ScanHostRow[];
  hostCount: number;
  duplicateErrors: Array<{ id: string; occurrences: Array<{ file: string; line: number }> }>;
  detectedLibraries: string[];
  scannedFileCount: number;
};

export function runScan(opts: ScanOptions): number {
  let scan: ReturnType<typeof scanProject>;
  try {
    scan = scanProject(opts.cwd);
  } catch (e) {
    if (e instanceof PreflightError) {
      console.error(e.message);
      return 1;
    }
    throw e;
  }

  const { ctx, detectedLibraries, index } = scan;
  const projectName = String(ctx.packageJson.name ?? "project");

  const hosts: ScanHostRow[] = index.entries.map((entry) => ({
    id: entry.id,
    file: relPath(ctx.root, entry.file),
    line: entry.line,
    column: entry.column,
    libraryHint: entry.libraryHint,
    classNameMode: entry.classNameMode,
  }));

  const result: ScanResult = {
    projectName,
    hosts,
    hostCount: hosts.length,
    duplicateErrors: index.duplicateErrors.map((dup) => ({
      id: dup.id,
      occurrences: dup.occurrences.map((o) => ({
        file: relPath(ctx.root, o.file),
        line: o.line,
      })),
    })),
    detectedLibraries,
    scannedFileCount: index.scannedFileCount,
  };

  if (opts.json) {
    console.log(JSON.stringify(result, null, 2));
    return result.duplicateErrors.length > 0 ? 1 : 0;
  }

  console.log(`nuvio scan — ${result.hostCount} editable host(s)\n`);
  for (const host of hosts) {
    console.log(
      `  ${host.id.padEnd(28)} ${host.file}:${host.line}`,
    );
  }

  if (result.duplicateErrors.length > 0) {
    console.log("");
    for (const dup of result.duplicateErrors) {
      const places = dup.occurrences
        .map((o) => `${o.file}:${o.line}`)
        .join(", ");
      console.log(`  ❌ duplicate id: ${dup.id} (${places}) — fix before apply`);
    }
  }

  if (detectedLibraries.length > 0) {
    console.log(`\n  Libraries: ${detectedLibraries.join(", ")}`);
  }

  if (result.hostCount === 0) {
    console.log(
      "\n  No hosts found — use Make Editable in the browser or add data-nuvio-id manually.",
    );
  }

  return result.duplicateErrors.length > 0 ? 1 : 0;
}
