import path from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";
import {
  normalizeAppRoute,
  pccManifestMatchesRoute,
  type PccManifest,
} from "@nuvio/shared";
import {
  listPccManifestFiles,
  loadPccManifestFromFile,
  PCC_PAGES_DIR,
} from "@nuvio/shared/load-pcc-manifest";
import { assertPathWithinRoot } from "@nuvio/shared/secure-path";

export { PCC_PAGES_DIR as PCC_PAGES_RELATIVE };

export function pccPagesDir(projectRoot: string): string {
  return path.join(projectRoot, PCC_PAGES_DIR);
}

export { listPccManifestFiles };

export function resolvePccManifestByRoute(
  projectRoot: string,
  writeGuardRoot: string,
  route: string,
): { manifest: PccManifest; path: string } | null {
  const normalized = normalizeAppRoute(route);
  for (const filePath of listPccManifestFiles(projectRoot)) {
    try {
      assertPathWithinRoot(writeGuardRoot, filePath);
    } catch {
      continue;
    }
    const loaded = loadPccManifestFromFile(filePath);
    if (!loaded.ok) {
      continue;
    }
    if (pccManifestMatchesRoute(loaded.manifest, normalized)) {
      return { manifest: loaded.manifest, path: loaded.path };
    }
  }
  return null;
}

function readQueryParam(url: string, key: string): string | null {
  const query = url.split("?")[1];
  if (!query) {
    return null;
  }
  for (const part of query.split("&")) {
    const [rawKey, rawValue = ""] = part.split("=");
    if (decodeURIComponent(rawKey ?? "") === key) {
      return decodeURIComponent(rawValue);
    }
  }
  return null;
}

export type PccConfigHttpContext = {
  projectRoot: string;
  writeGuardRoot: string;
};

export async function handlePccConfigHttp(
  req: IncomingMessage,
  res: ServerResponse,
  ctx: PccConfigHttpContext,
): Promise<void> {
  try {
    if (req.method !== "GET") {
      res.statusCode = 405;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ ok: false, error: "method_not_allowed" }));
      return;
    }

    const route = readQueryParam(req.url ?? "", "route");
    if (!route) {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ ok: false, error: "route_required" }));
      return;
    }

    const resolved = resolvePccManifestByRoute(ctx.projectRoot, ctx.writeGuardRoot, route);
    if (!resolved) {
      res.statusCode = 404;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ ok: false, error: "not_found" }));
      return;
    }

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        ok: true,
        manifest: resolved.manifest,
        path: resolved.path,
      }),
    );
  } catch (e) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ ok: false, error: "pcc_config_error", message: String(e) }));
  }
}
