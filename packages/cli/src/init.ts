import { createInterface } from "node:readline";
import { detectProject, PreflightError } from "./detect-project.js";
import {
  detectPackageManager,
  installCommand,
  type PackageManager,
} from "./detect-pm.js";
import { packagesNeedInstall, runInstall } from "./install-packages.js";
import { patchViteConfigFile } from "./patch-vite-config.js";
import { patchAppRootFile, resolveAppFile } from "./patch-app-root.js";
import {
  overlayInstalledFromNpm,
  patchMainOverlayStyles,
  resolveMainEntry,
} from "./patch-main-styles.js";
import { patchStarterId } from "./patch-starter-id.js";
import { projectHasPageTitleId } from "./scan-ids.js";
import { createPlan, type InitPlan, type ResultTier } from "./plan.js";
import { MSG } from "./messages.js";
import { RTE_VERSION } from "./version.js";
import { writeRteFolder } from "./write-rte-folder.js";
import { printVerification, verifyProject } from "./verify.js";

export type InitOptions = {
  cwd: string;
  yes?: boolean;
  noInstall?: boolean;
  dryRun?: boolean;
  pm?: PackageManager;
  strict?: boolean;
  skipTailwindCheck?: boolean;
  forceAgent?: boolean;
  verbose?: boolean;
};

function isAutoYes(opts: InitOptions): boolean {
  if (opts.yes) return true;
  if (process.env.CI === "true") return true;
  return !process.stdin.isTTY;
}

async function confirm(plan: InitPlan): Promise<boolean> {
  console.log("\nPlanned changes:");
  for (const f of plan.modify) console.log(`  modify: ${f}`);
  for (const f of plan.create) console.log(`  create: ${f}`);
  if (plan.warnings.length) {
    console.log("\nWarnings:");
    for (const w of plan.warnings) console.log(`  ⚠ ${w}`);
  }
  console.log(`\nInstall: ${plan.installCommand || "(skip)"}`);
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question("\nProceed? [y/N] ", (answer) => {
      rl.close();
      resolve(/^y(es)?$/i.test(answer.trim()));
    });
  });
}

function computeTier(
  installOk: boolean,
  viteOk: boolean,
  appOk: boolean,
  starterOk: boolean,
): ResultTier {
  if (!installOk) return "failed";
  if (!appOk) return "failed";
  if (!viteOk || !starterOk) return "partial";
  return "full";
}

function printSuccess(
  plan: InitPlan,
  checks: {
    install: boolean;
    vite: boolean;
    app: boolean;
    starter: boolean;
    starterFile?: string;
  },
): void {
  if (checks.install) {
    console.log(
      `✅ rte packages targeted (@rte/vite-plugin@${RTE_VERSION}, @rte/overlay@${RTE_VERSION})`,
    );
  }
  if (checks.vite) console.log("✅ Vite plugin added");
  else if (plan.failedSteps.some((s) => s.includes("vite"))) {
    console.log("⚠ Vite plugin — see rte/SETUP_TODO.md");
  }
  if (checks.app) console.log("✅ rte editor mounted");
  else console.log("⚠ App shell — see rte/SETUP_TODO.md");
  if (checks.starter) {
    console.log(
      `✅ Starter editable area: page.title${checks.starterFile ? ` (${checks.starterFile})` : ""}`,
    );
  } else {
    console.log(`⚠ ${MSG.noHeading}`);
  }
  console.log("✅ Start here: rte/START_HERE.md");
  console.log("✅ Agent guide: rte/AGENT.md");
  console.log(`\nNext:\n  ${plan.pmRun}\n`);
  console.log("Open localhost → Edit on → click the starter element.");
  if (plan.tier === "partial" && plan.failedSteps.length > 0) {
    console.log(`\n${MSG.partialHelp}`);
  } else if (plan.tier === "partial") {
    console.log(
      "\nrte helped you as far as it safely could. See warnings above.",
    );
  }
}

export async function runInit(opts: InitOptions): Promise<number> {
  const root = opts.cwd;
  const pm = detectPackageManager(root, opts.pm);

  let project;
  try {
    project = detectProject(root);
  } catch (e) {
    if (e instanceof PreflightError) {
      console.error(e.message);
      return 1;
    }
    if (opts.verbose) console.error(e);
    console.error("Something went wrong. Run with --verbose for details.");
    return 2;
  }

  const plan = createPlan(root, pm);
  plan.installCommand = opts.noInstall
    ? "(skipped — --no-install)"
    : installCommand(pm, RTE_VERSION);

  if (project.tailwindWarn && !opts.skipTailwindCheck) {
    const msg =
      "Tailwind CSS not detected. Class/style edits may not work until Tailwind is installed.";
    if (opts.strict) {
      console.error(MSG.strictTailwind);
      return 1;
    }
    plan.warnings.push(msg);
  }

  const appFile = resolveAppFile(root);
  const mainEntry = resolveMainEntry(root);
  if (appFile) plan.modify.push(appFile.replace(`${root}/`, ""));
  if (mainEntry && overlayInstalledFromNpm(project.packageJsonPath)) {
    plan.modify.push(mainEntry.replace(`${root}/`, ""));
  }
  plan.modify.push(project.viteConfigName);
  plan.create.push(
    "rte/START_HERE.md",
    "rte/README.md",
    "rte/AGENT.md",
  );

  if (opts.dryRun) {
    console.log("Dry run — no files changed.\n");
    for (const f of plan.modify) console.log(`  would modify: ${f}`);
    for (const f of plan.create) console.log(`  would create: ${f}`);
    if (plan.warnings.length) {
      for (const w of plan.warnings) console.log(`  would warn: ${w}`);
    }
    console.log(`  would run: ${plan.installCommand}`);
    return 0;
  }

  if (!isAutoYes(opts)) {
    const ok = await confirm(plan);
    if (!ok) {
      console.log("Cancelled.");
      return 1;
    }
  }

  let installOk = true;
  if (!opts.noInstall) {
    if (packagesNeedInstall(project.packageJsonPath, RTE_VERSION)) {
      const result = runInstall(root, pm, RTE_VERSION);
      if (!result.ok) {
        console.error(result.message ?? "Install failed.");
        return 1;
      }
    } else {
      console.log("✅ rte packages already installed");
    }
  } else {
    console.log("(skipped install — --no-install)");
    installOk = true;
  }

  let viteOk = false;
  const viteResult = patchViteConfigFile(project.viteConfigPath);
  if (viteResult.ok) {
    viteOk = true;
  } else {
    plan.failedSteps.push(`vite (${viteResult.error ?? "unknown"})`);
    plan.warnings.push(`Could not patch ${project.viteConfigName}`);
  }

  let appOk = false;
  if (appFile) {
    const appResult = patchAppRootFile(appFile);
    if (appResult.ok) {
      appOk = true;
    } else {
      plan.failedSteps.push(`app (${appResult.error ?? "unknown"})`);
      plan.warnings.push(`Could not patch ${appFile}`);
    }
  } else {
    plan.failedSteps.push("app (no App.tsx/main.tsx)");
  }

  if (mainEntry && overlayInstalledFromNpm(project.packageJsonPath)) {
    const mainStyles = patchMainOverlayStyles(mainEntry);
    if (mainStyles.ok && !mainStyles.skipped) {
      plan.modify.push(mainEntry.replace(`${root}/`, ""));
    }
  }

  let starterOk = false;
  let starterFile: string | undefined;
  if (!projectHasPageTitleId(root)) {
    const { outcome, file } = patchStarterId(root);
    if (outcome.ok) {
      starterOk = true;
      starterFile = file?.replace(`${root}/`, "");
      if (file) plan.modify.push(starterFile!);
    } else {
      plan.warnings.push(MSG.noHeading);
    }
  } else {
    starterOk = true;
    console.log("✅ Starter id page.title already present");
  }

  writeRteFolder({
    root,
    version: RTE_VERSION,
    pmRun: plan.pmRun,
    failedSteps: plan.failedSteps,
    forceAgent: opts.forceAgent,
  });

  plan.tier = computeTier(installOk, viteOk, appOk, starterOk);

  console.log("");
  printSuccess(plan, {
    install: installOk,
    vite: viteOk,
    app: appOk,
    starter: starterOk,
    starterFile,
  });

  const verification = verifyProject(
    root,
    project.packageJsonPath,
    project.viteConfigPath,
  );
  printVerification(verification);

  if (plan.tier === "failed") {
    return 1;
  }
  return plan.tier === "partial" || plan.tier === "full" ? 0 : 1;
}
