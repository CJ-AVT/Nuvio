import { inspectBrandMatchForAction, type BrandInspectResult } from "./brand-inspector.js";
import {
  brandFragmentHostHint,
  DEFAULT_BRAND_CONFIG,
  normalizeBrandConfig,
  type BrandApplyAction,
  type BrandConfig,
} from "./brand-kit.js";
import {
  isPccBrandableCategory,
  type PccCategory,
  type PccManifest,
} from "./coverage-contract.js";
import type { IndexWireEntry } from "./protocol.js";

export type BrandHostScanStatus = "on_brand" | "off_brand" | "no_traits" | "missing";

export type BrandHostScanResult = {
  hostId: string;
  category: PccCategory;
  status: BrandHostScanStatus;
  inspect: BrandInspectResult | null;
};

export type BrandCategoryScanSummary = {
  category: PccCategory;
  expected: number;
  onBrand: number;
  offBrand: number;
  noTraits: number;
  missing: number;
  pass: boolean;
};

export type BrandPageScanResult = {
  page: string;
  route: string;
  brand: BrandConfig;
  categories: BrandCategoryScanSummary[];
  hosts: BrandHostScanResult[];
  onBrandCount: number;
  offBrandCount: number;
  noTraitsCount: number;
  missingCount: number;
  pass: boolean;
};

function classifyHostBrandStatus(
  entry: IndexWireEntry | undefined,
  brand: BrandConfig,
  action: BrandApplyAction,
): { status: BrandHostScanStatus; inspect: BrandInspectResult | null } {
  if (!entry) {
    return { status: "missing", inspect: null };
  }
  const className = entry.classNameValue ?? "";
  const hint = brandFragmentHostHint(entry);
  const inspect = inspectBrandMatchForAction(action, className, brand, hint);
  if (inspect.checkedCount === 0) {
    return { status: "no_traits", inspect };
  }
  if (inspect.matchCount === inspect.checkedCount) {
    return { status: "on_brand", inspect };
  }
  return { status: "off_brand", inspect };
}

export function evaluateBrandPageScan(
  manifest: PccManifest,
  entries: readonly IndexWireEntry[],
  brandInput: BrandConfig | unknown,
): BrandPageScanResult {
  const brand = normalizeBrandConfig(brandInput ?? DEFAULT_BRAND_CONFIG);
  const byId = new Map(entries.map((entry) => [entry.id, entry]));
  const hosts: BrandHostScanResult[] = [];
  const categories: BrandCategoryScanSummary[] = [];

  let onBrandCount = 0;
  let offBrandCount = 0;
  let noTraitsCount = 0;
  let missingCount = 0;

  const categoryKeys = Object.keys(manifest.categories) as PccCategory[];

  for (const category of categoryKeys) {
    if (!isPccBrandableCategory(category)) {
      continue;
    }
    const config = manifest.categories[category];
    if (!config) {
      continue;
    }

    let onBrand = 0;
    let offBrand = 0;
    let noTraits = 0;
    let missing = 0;

    for (const hostId of config.hosts) {
      const { status, inspect } = classifyHostBrandStatus(
        byId.get(hostId),
        brand,
        category as BrandApplyAction,
      );
      hosts.push({ hostId, category, status, inspect });

      if (status === "on_brand") {
        onBrand += 1;
        onBrandCount += 1;
      } else if (status === "off_brand") {
        offBrand += 1;
        offBrandCount += 1;
      } else if (status === "no_traits") {
        noTraits += 1;
        noTraitsCount += 1;
      } else {
        missing += 1;
        missingCount += 1;
      }
    }

    categories.push({
      category,
      expected: config.hosts.length,
      onBrand,
      offBrand,
      noTraits,
      missing,
      pass: offBrand === 0 && missing === 0,
    });
  }

  return {
    page: manifest.page,
    route: manifest.route,
    brand,
    categories,
    hosts,
    onBrandCount,
    offBrandCount,
    noTraitsCount,
    missingCount,
    pass: offBrandCount === 0 && missingCount === 0,
  };
}

export function pccBrandableHostIds(manifest: PccManifest): string[] {
  const hosts: string[] = [];
  for (const category of Object.keys(manifest.categories) as PccCategory[]) {
    if (!isPccBrandableCategory(category)) {
      continue;
    }
    const config = manifest.categories[category];
    if (config) {
      hosts.push(...config.hosts);
    }
  }
  return hosts;
}
