import { RTE_PCC_PATH, type PccManifest } from "@rte/shared";

type PagePccResponse =
  | { ok: true; manifest: PccManifest; path?: string }
  | { ok: false; error?: string };

export async function fetchPagePcc(route: string): Promise<PccManifest | null> {
  try {
    const res = await fetch(`${RTE_PCC_PATH}?route=${encodeURIComponent(route)}`);
    if (!res.ok) {
      return null;
    }
    const json = (await res.json()) as PagePccResponse;
    if (!json.ok || !("manifest" in json)) {
      return null;
    }
    return json.manifest;
  } catch {
    return null;
  }
}
