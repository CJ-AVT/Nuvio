import fs from "node:fs";
import path from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";
import { DEFAULT_BRAND_CONFIG, normalizeBrandConfig, serializeBrandConfig, type BrandConfig } from "@rte/shared";
import { assertPathWithinRoot } from "@rte/shared/secure-path";
import { validateRteBearer } from "./dev-auth-guard.js";

export const BRAND_CONFIG_RELATIVE = "rte/brand.json" as const;

export function brandConfigPath(projectRoot: string): string {
  return path.join(projectRoot, BRAND_CONFIG_RELATIVE);
}

export function readBrandConfigFile(projectRoot: string, writeGuardRoot: string): BrandConfig {
  const filePath = brandConfigPath(projectRoot);
  try {
    assertPathWithinRoot(writeGuardRoot, filePath);
  } catch {
    return { ...DEFAULT_BRAND_CONFIG };
  }
  if (!fs.existsSync(filePath)) {
    return { ...DEFAULT_BRAND_CONFIG };
  }
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return normalizeBrandConfig(JSON.parse(raw) as unknown);
  } catch {
    return { ...DEFAULT_BRAND_CONFIG };
  }
}

export function writeBrandConfigFile(
  projectRoot: string,
  writeGuardRoot: string,
  config: BrandConfig,
): void {
  const filePath = brandConfigPath(projectRoot);
  assertPathWithinRoot(writeGuardRoot, filePath);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(serializeBrandConfig(config), null, 2)}\n`, "utf8");
}

function readJsonBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => {
      try {
        const text = Buffer.concat(chunks).toString("utf8").trim();
        resolve(text ? (JSON.parse(text) as unknown) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

export type BrandConfigHttpContext = {
  projectRoot: string;
  writeGuardRoot: string;
  devAuthToken: string;
};

function unauthorized(res: ServerResponse): void {
  res.statusCode = 401;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ error: "unauthorized" }));
}

export async function handleBrandConfigHttp(
  req: IncomingMessage,
  res: ServerResponse,
  ctx: BrandConfigHttpContext,
): Promise<void> {
  try {
    if (req.method === "GET") {
      const config = readBrandConfigFile(ctx.projectRoot, ctx.writeGuardRoot);
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(config));
      return;
    }
    if (req.method === "PUT" || req.method === "POST") {
      if (!validateRteBearer(req, ctx.devAuthToken)) {
        unauthorized(res);
        return;
      }
      const body = await readJsonBody(req);
      const config = normalizeBrandConfig(body);
      writeBrandConfigFile(ctx.projectRoot, ctx.writeGuardRoot, config);
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(config));
      return;
    }
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "method_not_allowed" }));
  } catch (e) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "brand_config_error", message: String(e) }));
  }
}
