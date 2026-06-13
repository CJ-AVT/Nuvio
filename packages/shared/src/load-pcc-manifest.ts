import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import {
  defaultPccManifestPath,
  parsePccManifest,
  type PccManifest,
  type PccManifestParseError,
} from "./coverage-contract.js";

export const PCC_PAGES_DIR = "nuvio/pages" as const;

export function listPccManifestFiles(projectRoot: string): string[] {
  const dir = join(projectRoot.replace(/\/$/, ""), PCC_PAGES_DIR);
  if (!existsSync(dir)) {
    return [];
  }
  return readdirSync(dir)
    .filter((name) => name.endsWith(".pcc.yaml") || name.endsWith(".pcc.yml"))
    .map((name) => join(dir, name))
    .sort();
}

export function loadPccManifestFromFile(filePath: string):
  | { ok: true; manifest: PccManifest; path: string }
  | { ok: false; error: PccManifestParseError; path: string } {
  let raw: string;
  try {
    raw = readFileSync(filePath, "utf8");
  } catch {
    return {
      ok: false,
      path: filePath,
      error: { code: "invalid_manifest", message: `Could not read manifest: ${filePath}` },
    };
  }

  let parsed: unknown;
  try {
    parsed = parseYaml(raw);
  } catch (e) {
    return {
      ok: false,
      path: filePath,
      error: {
        code: "invalid_manifest",
        message: `Invalid YAML: ${e instanceof Error ? e.message : String(e)}`,
      },
    };
  }

  const result = parsePccManifest(parsed);
  if (!result.ok) {
    return { ok: false, path: filePath, error: result.error };
  }
  return { ok: true, path: filePath, manifest: result.manifest };
}

export function resolvePccManifestPath(
  projectRoot: string,
  opts: { page?: string; manifest?: string },
): string {
  if (opts.manifest) {
    return opts.manifest;
  }
  if (!opts.page) {
    throw new Error("Either --page or --manifest is required");
  }
  return defaultPccManifestPath(projectRoot, opts.page);
}
