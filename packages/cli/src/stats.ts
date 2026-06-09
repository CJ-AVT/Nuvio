import { readRuntimeVersions } from "@nuvio/vite-plugin/scan";
import { detectPackageManager } from "./detect-pm.js";
import { PreflightError } from "./detect-project.js";
import {
  aggregateClassNameModes,
  isTableHost,
  relPath,
  scanProject,
} from "./project-scan.js";
import {
  buildCliTelemetryProps,
  captureCliEvent,
  type StatsRunTelemetry,
} from "./telemetry.js";

export type StatsOptions = {
  cwd: string;
  json?: boolean;
};

export type StatsResult = {
  projectName: string;
  editableHosts: number;
  taggedFiles: number;
  scannedFiles: number;
  duplicateIds: number;
  tableHosts: number;
  detectedLibraries: string[];
  tailwindVersion?: string;
  classNameModes: Record<string, number>;
};

export function runStats(opts: StatsOptions): number {
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
  const taggedFiles = new Set(
    index.entries.map((e) => relPath(ctx.root, e.file)),
  ).size;
  const classNameModes = aggregateClassNameModes(index.entries);
  const tableHosts = index.entries.filter(isTableHost).length;
  const versions = readRuntimeVersions(ctx.root);

  const result: StatsResult = {
    projectName,
    editableHosts: index.entries.length,
    taggedFiles,
    scannedFiles: index.scannedFileCount,
    duplicateIds: index.duplicateErrors.length,
    tableHosts,
    detectedLibraries,
    tailwindVersion: versions.tailwindVersion,
    classNameModes,
  };

  const pm = detectPackageManager(ctx.root);
  const telemetry: StatsRunTelemetry = {
    ...buildCliTelemetryProps(pm, ctx),
    editable_hosts: result.editableHosts,
    tagged_files: result.taggedFiles,
    duplicate_ids: result.duplicateIds,
    table_hosts: result.tableHosts,
    library_count: detectedLibraries.length,
  };
  captureCliEvent("stats_run", telemetry);

  if (opts.json) {
    console.log(JSON.stringify(result, null, 2));
    return 0;
  }

  console.log("nuvio stats\n");
  console.log(`  Editable hosts:     ${result.editableHosts}`);
  console.log(`  Tagged files:       ${result.taggedFiles}`);
  console.log(`  Files scanned:      ${result.scannedFiles}`);
  console.log(
    `  Libraries detected: ${
      result.detectedLibraries.length > 0
        ? result.detectedLibraries.join(", ")
        : "none"
    }`,
  );
  console.log(`  Table hosts:        ${result.tableHosts}`);
  console.log(`  Duplicate ids:      ${result.duplicateIds}`);
  if (result.tailwindVersion) {
    console.log(`  Tailwind version:   ${result.tailwindVersion}`);
  }
  const modeParts = Object.entries(result.classNameModes)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([mode, count]) => `${mode} ${count}`);
  if (modeParts.length > 0) {
    console.log(`  Class modes:        ${modeParts.join(", ")}`);
  }

  return 0;
}
