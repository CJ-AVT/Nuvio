import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { PreflightError } from "./detect-project.js";
import { scanProject } from "./project-scan.js";
import {
  DEFAULT_BRAND_CONFIG,
  evaluateBrandPageScan,
  getBrandColorLabel,
  getBrandDensityLabel,
  getBrandRadiusLabel,
  getBrandTypographyLabel,
  normalizeBrandConfig,
  pccCategoryLabel,
  type BrandPageScanResult,
} from "@rte/shared";
import {
  listPccManifestFiles,
  loadPccManifestFromFile,
  resolvePccManifestPath,
} from "@rte/shared/load-pcc-manifest";

export type BrandScanOptions = {
  cwd: string;
  page?: string;
  manifest?: string;
  all?: boolean;
  json?: boolean;
};

const BRAND_RELATIVE = "rte/brand.json";

function readProjectBrandConfig(cwd: string) {
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

function formatBrandSummary(brand: BrandPageScanResult["brand"]): string {
  return [
    getBrandColorLabel(brand.color),
    getBrandRadiusLabel(brand.radius),
    getBrandDensityLabel(brand.density),
    getBrandTypographyLabel(brand.typography),
  ].join(" · ");
}

function printHumanReport(result: BrandPageScanResult, manifestPath: string): void {
  console.log("Rte Brand Scan\n");
  console.log(`Page: ${result.page}`);
  console.log(`Route: ${result.route}`);
  console.log(`Manifest: ${manifestPath}`);
  console.log(`Saved brand: ${formatBrandSummary(result.brand)}\n`);

  console.log("Category summary:");
  for (const category of result.categories) {
    const label = pccCategoryLabel(category.category).padEnd(10);
    const status = category.pass ? "PASS" : "FAIL";
    console.log(
      `${label} ${status} on-brand ${category.onBrand}/${category.expected} · off-brand ${category.offBrand} · no-traits ${category.noTraits}`,
    );
  }

  console.log("\nTotals:");
  console.log(`On-brand    ${result.onBrandCount}`);
  console.log(`Off-brand   ${result.offBrandCount}`);
  console.log(`No traits   ${result.noTraitsCount}`);
  console.log(`Missing     ${result.missingCount}`);

  const offBrandHosts = result.hosts.filter((host) => host.status === "off_brand");
  if (offBrandHosts.length > 0) {
    console.log("\nOff-brand hosts:");
    for (const host of offBrandHosts.slice(0, 12)) {
      const headline = host.inspect?.headline ?? "Off-brand";
      console.log(`- ${host.hostId} (${host.category}) — ${headline}`);
    }
    if (offBrandHosts.length > 12) {
      console.log(`…and ${offBrandHosts.length - 12} more`);
    }
  }

  console.log(`\nResult: ${result.pass ? "PASS" : "FAIL"}`);
}

function printAllHumanReport(
  pages: Array<{ manifestPath: string; result: BrandPageScanResult }>,
): void {
  console.log("Rte Brand Scan (all pages)\n");
  for (const page of pages) {
    const status = page.result.pass ? "PASS" : "FAIL";
    const summary = `${page.result.onBrandCount} on-brand · ${page.result.offBrandCount} off-brand`;
    console.log(`${page.result.page.padEnd(16)} ${status}  ${summary}`);
  }
  const pass = pages.every((page) => page.result.pass);
  console.log(`\nResult: ${pass ? "PASS" : "FAIL"}`);
}

function scanLoadedManifest(
  manifestPath: string,
  entries: ReturnType<typeof scanProject>["index"]["entries"],
  brand: ReturnType<typeof readProjectBrandConfig>,
):
  | { ok: true; result: BrandPageScanResult }
  | { ok: false; code: number; message: string } {
  const loaded = loadPccManifestFromFile(manifestPath);
  if (!loaded.ok) {
    return {
      ok: false,
      code: 2,
      message: `Invalid PCC manifest (${manifestPath}): ${loaded.error.message}`,
    };
  }
  return {
    ok: true,
    result: evaluateBrandPageScan(loaded.manifest, entries, brand),
  };
}

export function runBrandScanAll(opts: BrandScanOptions): number {
  const manifestPaths = listPccManifestFiles(opts.cwd);
  if (manifestPaths.length === 0) {
    console.error(`No PCC manifests found under ${resolve(opts.cwd)}/rte/pages`);
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

  const pages: Array<{ manifestPath: string; result: BrandPageScanResult }> = [];
  for (const manifestPath of manifestPaths) {
    const scanned = scanLoadedManifest(manifestPath, scan.index.entries, brand);
    if (!scanned.ok) {
      console.error(scanned.message);
      return scanned.code;
    }
    pages.push({ manifestPath, result: scanned.result });
  }

  const pass = pages.every((page) => page.result.pass);

  if (opts.json) {
    console.log(JSON.stringify({ pass, brand, pages }, null, 2));
    return pass ? 0 : 1;
  }

  printAllHumanReport(pages);
  return pass ? 0 : 1;
}

export function runBrandScan(opts: BrandScanOptions): number {
  if (opts.all) {
    return runBrandScanAll(opts);
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

  const scanned = scanLoadedManifest(manifestPath, scan.index.entries, brand);
  if (!scanned.ok) {
    console.error(scanned.message);
    return scanned.code;
  }

  if (opts.json) {
    console.log(
      JSON.stringify(
        {
          manifestPath,
          ...scanned.result,
        },
        null,
        2,
      ),
    );
    return scanned.result.pass ? 0 : 1;
  }

  printHumanReport(scanned.result, manifestPath);
  return scanned.result.pass ? 0 : 1;
}
