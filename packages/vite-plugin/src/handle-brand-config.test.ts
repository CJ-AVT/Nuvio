import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { DEFAULT_BRAND_CONFIG } from "@rte/shared";
import {
  brandConfigPath,
  readBrandConfigFile,
  writeBrandConfigFile,
} from "./handle-brand-config.js";

describe("handle-brand-config", () => {
  let tmpDir: string;

  afterEach(() => {
    if (tmpDir && fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("returns defaults when brand.json is missing", () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "rte-brand-"));
    expect(readBrandConfigFile(tmpDir, tmpDir)).toEqual(DEFAULT_BRAND_CONFIG);
  });

  it("reads and normalizes saved brand.json", () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "rte-brand-"));
    writeBrandConfigFile(tmpDir, tmpDir, {
      color: "purple",
      surface: "muted",
      buttonVariant: "outline",
      buttonHover: "none",
      cardShadow: "md",
      cardHover: "border",
      radius: "pill",
      density: "compact",
      typography: "bold",
    });
    const raw = JSON.parse(fs.readFileSync(brandConfigPath(tmpDir), "utf8")) as {
      version: number;
      tokens: { accent: string; cardShadow: string };
    };
    expect(raw.version).toBe(2);
    expect(raw.tokens.accent).toBe("purple");
    expect(raw.tokens.cardShadow).toBe("md");
    expect(readBrandConfigFile(tmpDir, tmpDir)).toEqual({
      color: "purple",
      surface: "muted",
      buttonVariant: "outline",
      buttonHover: "none",
      cardShadow: "md",
      cardHover: "border",
      radius: "pill",
      density: "compact",
      typography: "bold",
    });
  });

  it("still loads legacy v1 flat brand.json", () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "rte-brand-"));
    const filePath = brandConfigPath(tmpDir);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(
      filePath,
      `${JSON.stringify({ color: "rose", radius: "soft", density: "balanced", typography: "clean" }, null, 2)}\n`,
      "utf8",
    );
    expect(readBrandConfigFile(tmpDir, tmpDir)).toEqual({
      color: "rose",
      surface: "white",
      buttonVariant: "solid",
      buttonHover: "darken",
      cardShadow: "none",
      cardHover: "none",
      radius: "soft",
      density: "balanced",
      typography: "clean",
    });
  });

  it("falls back to defaults for invalid JSON on disk", () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "rte-brand-"));
    const filePath = brandConfigPath(tmpDir);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, "{ not json", "utf8");
    expect(readBrandConfigFile(tmpDir, tmpDir)).toEqual(DEFAULT_BRAND_CONFIG);
  });
});
