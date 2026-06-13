import { z } from "zod";
import type { BrandApplyAction } from "./brand-kit.js";

/** MVP semantic categories supported in PCC manifests. */
export const PCC_SUPPORTED_CATEGORIES = [
  "card",
  "button",
  "heading",
  "text",
  "table",
  "form",
  "badge",
  "nav",
] as const;

export type PccCategory = (typeof PCC_SUPPORTED_CATEGORIES)[number];

/** Categories that must not appear in PCC manifests (v1.4). */
export const PCC_REJECTED_CATEGORIES = ["media", "layout"] as const;

export type PccRejectedCategory = (typeof PCC_REJECTED_CATEGORIES)[number];

/** Categories with Brand Kit bulk recipes (v1.3 + v1.5 table/form/badge). */
export const PCC_BRANDABLE_CATEGORIES: readonly BrandApplyAction[] = [
  "card",
  "button",
  "heading",
  "text",
  "table",
  "form",
  "badge",
];

export type PccCategoryConfig = {
  required: boolean;
  hosts: string[];
};

export type PccManifest = {
  page: string;
  route: string;
  description?: string;
  categories: Partial<Record<PccCategory, PccCategoryConfig>>;
};

const pccCategoryConfigSchema = z.object({
  required: z.boolean().optional().default(true),
  hosts: z.array(z.string().min(1)).min(1, "category hosts must not be empty"),
});

const pccManifestSchema = z.object({
  page: z.string().min(1),
  route: z.string().min(1),
  description: z.string().optional(),
  categories: z.record(pccCategoryConfigSchema),
});

export type PccManifestParseError = {
  code: "invalid_manifest";
  message: string;
};

export function isPccSupportedCategory(key: string): key is PccCategory {
  return (PCC_SUPPORTED_CATEGORIES as readonly string[]).includes(key);
}

export function isPccRejectedCategory(key: string): key is PccRejectedCategory {
  return (PCC_REJECTED_CATEGORIES as readonly string[]).includes(key);
}

export function isPccBrandableCategory(category: PccCategory): boolean {
  return (PCC_BRANDABLE_CATEGORIES as readonly string[]).includes(category);
}

/** Parse and validate a PCC manifest object (from YAML/JSON). */
export function parsePccManifest(input: unknown):
  | { ok: true; manifest: PccManifest }
  | { ok: false; error: PccManifestParseError } {
  const parsed = pccManifestSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: {
        code: "invalid_manifest",
        message: parsed.error.issues.map((i) => i.message).join("; "),
      },
    };
  }

  const categories: Partial<Record<PccCategory, PccCategoryConfig>> = {};
  const seenHosts = new Map<string, PccCategory>();

  for (const [rawKey, rawConfig] of Object.entries(parsed.data.categories)) {
    if (isPccRejectedCategory(rawKey)) {
      return {
        ok: false,
        error: {
          code: "invalid_manifest",
          message: `Category "${rawKey}" is excluded from PCC (media/layout are not supported)`,
        },
      };
    }
    if (!isPccSupportedCategory(rawKey)) {
      return {
        ok: false,
        error: {
          code: "invalid_manifest",
          message: `Unknown PCC category "${rawKey}"`,
        },
      };
    }

    const config: PccCategoryConfig = {
      required: rawConfig.required ?? true,
      hosts: [...rawConfig.hosts],
    };

    if (config.required && config.hosts.length === 0) {
      return {
        ok: false,
        error: {
          code: "invalid_manifest",
          message: `Required category "${rawKey}" has no hosts`,
        },
      };
    }

    for (const hostId of config.hosts) {
      const prev = seenHosts.get(hostId);
      if (prev) {
        return {
          ok: false,
          error: {
            code: "invalid_manifest",
            message: `Duplicate host "${hostId}" in categories "${prev}" and "${rawKey}"`,
          },
        };
      }
      seenHosts.set(hostId, rawKey);
    }

    categories[rawKey] = config;
  }

  return {
    ok: true,
    manifest: {
      page: parsed.data.page,
      route: parsed.data.route,
      description: parsed.data.description,
      categories,
    },
  };
}

export function defaultPccManifestPath(projectRoot: string, page: string): string {
  return `${projectRoot.replace(/\/$/, "")}/nuvio/pages/${page}.pcc.yaml`;
}

export function pccHostsForCategory(
  manifest: PccManifest,
  category: PccCategory,
): readonly string[] {
  return manifest.categories[category]?.hosts ?? [];
}

export function pccCategoryLabel(category: PccCategory): string {
  return category.charAt(0).toUpperCase() + category.slice(1) + "s";
}
