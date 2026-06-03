import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { PatchOutcome } from "./patch-vite-config.js";

const MAIN_CANDIDATES = ["src/main.tsx", "src/main.jsx", "main.tsx", "main.jsx"] as const;
const STYLE_IMPORT = 'import "@nuvio/overlay/style.css";';

/** `import "@nuvio/overlay/style.css"` only resolves for npm installs, not workspace/file/link. */
export function overlayInstalledFromNpm(packageJsonPath: string): boolean {
  const pkg = JSON.parse(readFileSync(packageJsonPath, "utf8")) as Record<
    string,
    unknown
  >;
  const dev = pkg.devDependencies as Record<string, string> | undefined;
  const raw = dev?.["@nuvio/overlay"];
  if (!raw) return false;
  return (
    !raw.startsWith("workspace:") &&
    !raw.startsWith("link:") &&
    !raw.startsWith("file:")
  );
}

export function resolveMainEntry(root: string): string | null {
  for (const rel of MAIN_CANDIDATES) {
    const p = join(root, rel);
    if (existsSync(p)) return p;
  }
  return null;
}

/** Vite prebundles @nuvio/overlay; dynamic style.css injection then 404s. Import in main fixes it. */
export function mainHasOverlayStyles(mainPath: string): boolean {
  const text = readFileSync(mainPath, "utf8");
  return (
    text.includes("@nuvio/overlay/style.css") ||
    text.includes("@nuvio/overlay/dist/style.css")
  );
}

export function patchMainOverlayStyles(mainPath: string): PatchOutcome {
  const text = readFileSync(mainPath, "utf8");
  if (
    text.includes("@nuvio/overlay/style.css") ||
    text.includes("@nuvio/overlay/dist/style.css")
  ) {
    return { ok: true, skipped: true };
  }

  const lines = text.split("\n");
  let lastImport = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*import\s/.test(lines[i]!)) lastImport = i;
  }
  if (lastImport >= 0) {
    lines.splice(lastImport + 1, 0, STYLE_IMPORT);
  } else {
    lines.unshift(STYLE_IMPORT, "");
  }

  writeFileSync(mainPath, lines.join("\n"));
  return { ok: true };
}
