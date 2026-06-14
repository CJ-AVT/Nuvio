import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { applyPatchToSource } from "@nuvio/ast-engine";
import {
  buildBrandPatchOps,
  brandFragmentHostHint,
  DEFAULT_BRAND_CONFIG,
  isHostPatchable,
  isPccBrandableCategory,
  normalizeBrandConfig,
  type BrandApplyAction,
  type BrandConfig,
  type DuplicateIdError,
  type IndexWireEntry,
  type PccCategory,
  type PccManifest,
} from "@nuvio/shared";
import {
  listPccManifestFiles,
  loadPccManifestFromFile,
  resolvePccManifestPath,
} from "@nuvio/shared/load-pcc-manifest";
import { PreflightError } from "./detect-project.js";
import { scanProject } from "./project-scan.js";

export type BrandApplyOptions = {
  cwd: string;
  page?: string;
  manifest?: string;
  all?: boolean;
  dryRun?: boolean;
  json?: boolean;
};

const BRAND_RELATIVE = "nuvio/brand.json";

type ApplyTarget = {
  hostId: string;
  category: PccCategory;
  action: BrandApplyAction;
  entry: IndexWireEntry;
};

type ApplyPageResult = {
  page: string;
  route: string;
  manifestPath: string;
  applied: number;
  skipped: number;
  failed: Array<{ hostId: string; reason: string }>;
};

function readProjectBrandConfig(cwd: string): BrandConfig {
  const filePath = join(resolve(cwd), BRAND_RELATIVE);
  if (!existsSync(filePath)) {
    return { ...DEFAULT_BRAND_CONFIG };
  }
  try {
    const raw = readFileSync(filePath, "utf8");
    return normalizeBrandConfig(JSON.parse(raw) as unknown);
  } catch {
    return { ...DEFAULT_BRAND_CONFIG };
  }
}

function duplicateIdSet(errors: readonly DuplicateIdError[]): Set<string> {
  return new Set(errors.map((error) => error.id));
}

function collectApplyTargets(
  manifest: PccManifest,
  entries: readonly IndexWireEntry[],
  duplicateIds: ReadonlySet<string>,
): { targets: ApplyTarget[]; skipped: number } {
  const byId = new Map(entries.map((entry) => [entry.id, entry]));
  const targets: ApplyTarget[] = [];
  let skipped = 0;

  for (const category of Object.keys(manifest.categories) as PccCategory[]) {
    if (!isPccBrandableCategory(category)) {
      continue;
    }
    const config = manifest.categories[category];
    if (!config) {
      continue;
    }

    for (const hostId of config.hosts) {
      const entry = byId.get(hostId);
      if (!entry) {
        skipped += 1;
        continue;
      }
      const patch = isHostPatchable(entry, duplicateIds);
      if (!patch.patchable) {
        skipped += 1;
        continue;
      }
      targets.push({
        hostId,
        category,
        action: category as BrandApplyAction,
        entry,
      });
    }
  }

  return { targets, skipped };
}

async function applyTargetsToProject(
  projectRoot: string,
  targets: readonly ApplyTarget[],
  brand: BrandConfig,
  dryRun: boolean,
): Promise<{ applied: number; failed: Array<{ hostId: string; reason: string }> }> {
  const root = resolve(projectRoot);
  const byFile = new Map<string, ApplyTarget[]>();
  for (const target of targets) {
    const filePath = resolve(root, target.entry.file);
    const list = byFile.get(filePath) ?? [];
    list.push(target);
    byFile.set(filePath, list);
  }

  let applied = 0;
  const failed: Array<{ hostId: string; reason: string }> = [];

  for (const [filePath, fileTargets] of byFile) {
    if (!existsSync(filePath)) {
      for (const target of fileTargets) {
        failed.push({ hostId: target.hostId, reason: "file_missing" });
      }
      continue;
    }

    if (dryRun) {
      applied += fileTargets.length;
      continue;
    }

    let source = readFileSync(filePath, "utf8");
    for (const target of fileTargets) {
      const ops = buildBrandPatchOps(
        target.action,
        brand,
        brandFragmentHostHint(target.entry),
      );
      const result = await applyPatchToSource(source, filePath, target.hostId, ops, {
        classNameMode: target.entry.classNameMode,
      });
      if (!result.ok) {
        failed.push({ hostId: target.hostId, reason: result.message ?? result.code });
        continue;
      }
      source = result.source;
      applied += 1;
    }
    writeFileSync(filePath, source, "utf8");
  }

  return { applied, failed };
}

function printHumanReport(result: ApplyPageResult): void {
  console.log(`Page: ${result.page}`);
  console.log(`Route: ${result.route}`);
  console.log(`Manifest: ${result.manifestPath}`);
  console.log(`Applied: ${result.applied}`);
  console.log(`Skipped: ${result.skipped}`);
  if (result.failed.length > 0) {
    console.log("Failed:");
    for (const failure of result.failed) {
      console.log(`- ${failure.hostId}: ${failure.reason}`);
    }
  }
}

async function applyLoadedManifest(
  manifestPath: string,
  manifest: PccManifest,
  entries: readonly IndexWireEntry[],
  duplicateIds: ReadonlySet<string>,
  brand: BrandConfig,
  projectRoot: string,
  opts: BrandApplyOptions,
): Promise<ApplyPageResult> {
  const { targets, skipped } = collectApplyTargets(manifest, entries, duplicateIds);
  const { applied, failed } = await applyTargetsToProject(
    projectRoot,
    targets,
    brand,
    opts.dryRun === true,
  );

  return {
    page: manifest.page,
    route: manifest.route,
    manifestPath,
    applied,
    skipped,
    failed,
  };
}

export async function runBrandApplyAll(opts: BrandApplyOptions): Promise<number> {
  const manifestPaths = listPccManifestFiles(opts.cwd);
  if (manifestPaths.length === 0) {
    console.error(`No PCC manifests found under ${resolve(opts.cwd)}/nuvio/pages`);
    return 2;
  }

  const brand = readProjectBrandConfig(opts.cwd);

  let scan;
  try {
    scan = scanProject(opts.cwd);
  } catch (e) {
    if (e instanceof PreflightError) {
      console.error(e.message);
      return 3;
    }
    throw e;
  }

  const duplicateIds = duplicateIdSet(scan.index.duplicateErrors);
  const pages: ApplyPageResult[] = [];

  for (const manifestPath of manifestPaths) {
    const loaded = loadPccManifestFromFile(manifestPath);
    if (!loaded.ok) {
      console.error(`Invalid PCC manifest (${manifestPath}): ${loaded.error.message}`);
      return 2;
    }
    pages.push(
      await applyLoadedManifest(
        manifestPath,
        loaded.manifest,
        scan.index.entries,
        duplicateIds,
        brand,
        scan.ctx.root,
        opts,
      ),
    );
  }

  const pass = pages.every((page) => page.failed.length === 0);

  if (opts.json) {
    console.log(JSON.stringify({ pass, dryRun: opts.dryRun === true, pages }, null, 2));
    return pass ? 0 : 1;
  }

  console.log(`Nuvio Brand Apply${opts.dryRun ? " (dry run)" : ""}\n`);
  for (const page of pages) {
    printHumanReport(page);
    console.log("");
  }
  console.log(`Result: ${pass ? "PASS" : "FAIL"}`);
  return pass ? 0 : 1;
}

export async function runBrandApply(opts: BrandApplyOptions): Promise<number> {
  if (opts.all) {
    return runBrandApplyAll(opts);
  }

  let manifestPath: string;
  try {
    manifestPath = resolve(
      resolvePccManifestPath(opts.cwd, { page: opts.page, manifest: opts.manifest }),
    );
  } catch (e) {
    console.error(e instanceof Error ? e.message : String(e));
    return 2;
  }

  const loaded = loadPccManifestFromFile(manifestPath);
  if (!loaded.ok) {
    console.error(`Invalid PCC manifest (${manifestPath}): ${loaded.error.message}`);
    return 2;
  }

  const brand = readProjectBrandConfig(opts.cwd);

  let scan;
  try {
    scan = scanProject(opts.cwd);
  } catch (e) {
    if (e instanceof PreflightError) {
      console.error(e.message);
      return 3;
    }
    throw e;
  }

  const duplicateIds = duplicateIdSet(scan.index.duplicateErrors);
  const result = await applyLoadedManifest(
    manifestPath,
    loaded.manifest,
    scan.index.entries,
    duplicateIds,
    brand,
    scan.ctx.root,
    opts,
  );

  const pass = result.failed.length === 0;

  if (opts.json) {
    console.log(JSON.stringify({ pass, dryRun: opts.dryRun === true, ...result }, null, 2));
    return pass ? 0 : 1;
  }

  console.log(`Nuvio Brand Apply${opts.dryRun ? " (dry run)" : ""}\n`);
  printHumanReport(result);
  console.log(`\nResult: ${pass ? "PASS" : "FAIL"}`);
  return pass ? 0 : 1;
}
