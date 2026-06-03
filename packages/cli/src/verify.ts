import { readFileSync } from "node:fs";
import { appHasDevShell, resolveAppFile } from "./patch-app-root.js";
import {
  mainHasOverlayStyles,
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

export function verifyProject(
  root: string,
  packageJsonPath: string,
  viteConfigPath: string,
): Verification {
  const pkg = JSON.parse(readFileSync(packageJsonPath, "utf8")) as Record<
    string,
    unknown
  >;
  const dev = pkg.devDependencies as Record<string, string> | undefined;
  const depsOk =
    Boolean(dev?.["@nuvio/vite-plugin"]) &&
    Boolean(dev?.["@nuvio/overlay"]);

  const appFile = resolveAppFile(root);
  const mainEntry = resolveMainEntry(root);

  return {
    deps: depsOk ? "OK" : "MISSING",
    vite: viteConfigHasNuvio(viteConfigPath) ? "OK" : "TODO",
    overlayCss: mainEntry && mainHasOverlayStyles(mainEntry) ? "OK" : "TODO",
    optimizeDeps: viteConfigHasOverlayOptimizeExclude(viteConfigPath)
      ? "OK"
      : "TODO",
    shell: appFile && appHasDevShell(appFile) ? "OK" : "TODO",
    starterId: projectHasPageTitleId(root) ? "OK" : "MISSING",
  };
}

export function printVerification(v: Verification): void {
  console.log("Verification:");
  console.log(
    `  devDependencies: @nuvio/vite-plugin, @nuvio/overlay — ${v.deps}`,
  );
  console.log(`  vite.config: nuvio() — ${v.vite}`);
  console.log(`  main.tsx: @nuvio/overlay/style.css — ${v.overlayCss}`);
  console.log(`  vite.config: optimizeDeps exclude overlay — ${v.optimizeDeps}`);
  console.log(`  App shell: NuvioDevShell — ${v.shell}`);
  console.log(`  Starter id page.title — ${v.starterId}`);
}
