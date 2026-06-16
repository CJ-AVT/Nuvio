import { hasNuvioPackages, nuvioOverlayLinkKind, readPackageJson } from "./nuvio-deps.js";
import { projectHasDevShell } from "./patch-app-root.js";
import {
  mainHasOverlayStyles,
  overlayInstalledFromNpm,
  resolveMainEntry,
} from "./patch-main-styles.js";
import {
  viteConfigHasNuvio,
  viteConfigHasOverlayOptimizeExclude,
} from "./patch-vite-config.js";
import { projectHasPageTitleId } from "./scan-ids.js";

export type Verification = {
  deps: "OK" | "MISSING";
  vite: "OK" | "TODO";
  overlayCss: "OK" | "TODO";
  optimizeDeps: "OK" | "TODO";
  shell: "OK" | "TODO";
  starterId: "OK" | "MISSING";
};

function optimizeDepsSatisfied(
  viteConfigPath: string,
  packageJsonPath: string,
): boolean {
  if (viteConfigHasOverlayOptimizeExclude(viteConfigPath)) return true;
  const pkg = readPackageJson(packageJsonPath);
  return nuvioOverlayLinkKind(pkg) === "workspace";
}

export function verifyProject(
  root: string,
  packageJsonPath: string,
  viteConfigPath: string,
): Verification {
  const pkg = readPackageJson(packageJsonPath);
  const depsOk = hasNuvioPackages(pkg);
  const mainEntry = resolveMainEntry(root);

  return {
    deps: depsOk ? "OK" : "MISSING",
    vite: viteConfigHasNuvio(viteConfigPath) ? "OK" : "TODO",
    overlayCss:
      mainEntry &&
      (mainHasOverlayStyles(mainEntry) ||
        !overlayInstalledFromNpm(packageJsonPath))
        ? "OK"
        : "TODO",
    optimizeDeps: optimizeDepsSatisfied(viteConfigPath, packageJsonPath)
      ? "OK"
      : "TODO",
    shell: projectHasDevShell(root) ? "OK" : "TODO",
    starterId: projectHasPageTitleId(root) ? "OK" : "MISSING",
  };
}

export function printVerification(v: Verification): void {
  console.log("Verification:");
  console.log(
    `  dependencies: @nuvio/vite-plugin, @nuvio/overlay — ${v.deps}`,
  );
  console.log(`  vite.config: nuvio() — ${v.vite}`);
  console.log(`  main.tsx: @nuvio/overlay/style.css — ${v.overlayCss}`);
  console.log(`  vite.config: optimizeDeps exclude overlay — ${v.optimizeDeps}`);
  console.log(`  App shell: NuvioDevShell — ${v.shell}`);
  console.log(`  Starter id page.title — ${v.starterId}`);
}
