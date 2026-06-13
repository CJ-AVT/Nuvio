import {
  DEFAULT_BRAND_CONFIG,
  NUVIO_BRAND_PATH,
  normalizeBrandConfig,
  type BrandConfig,
} from "@nuvio/shared";

export async function fetchBrandConfig(): Promise<BrandConfig> {
  try {
    const res = await fetch(NUVIO_BRAND_PATH);
    if (!res.ok) {
      return { ...DEFAULT_BRAND_CONFIG };
    }
    const json = (await res.json()) as unknown;
    return normalizeBrandConfig(json);
  } catch {
    return { ...DEFAULT_BRAND_CONFIG };
  }
}

export async function saveBrandConfig(config: BrandConfig): Promise<BrandConfig> {
  const res = await fetch(NUVIO_BRAND_PATH, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config),
  });
  if (!res.ok) {
    throw new Error("brand_save_failed");
  }
  const json = (await res.json()) as unknown;
  return normalizeBrandConfig(json);
}
