import { hasRtePackages, rteOverlayLinkKind, readPackageJson } from "./rte-deps.js";
import { projectHasDevShell } from "./patch-app-root.js";
import {
  mainHasOverlayStyles,
  overlayInstalledFromNpm,
  resolveMainEntry,
} from "./patch-main-styles.js";
import {
  viteConfigHasRte,
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
  return rteOverlayLinkKind(pkg) === "workspace";
}

export function verifyProject(
  root: string,
  packageJsonPath: string,
  viteConfigPath: string,
): Verification {
  const pkg = readPackageJson(packageJsonPath);
  const depsOk = hasRtePackages(pkg);
  const mainEntry = resolveMainEntry(root);

  return {
    deps: depsOk ? "OK" : "MISSING",
    vite: viteConfigHasRte(viteConfigPath) ? "OK" : "TODO",
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
    `  dependencies: @rte/vite-plugin, @rte/overlay — ${v.deps}`,
  );
  console.log(`  vite.config: rte() — ${v.vite}`);
  console.log(`  main.tsx: @rte/overlay/style.css — ${v.overlayCss}`);
  console.log(`  vite.config: optimizeDeps exclude overlay — ${v.optimizeDeps}`);
  console.log(`  App shell: RteDevShell — ${v.shell}`);
  console.log(`  Starter id page.title — ${v.starterId}`);
}
