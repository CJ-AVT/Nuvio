import { PreflightError } from "./detect-project.js";
import { rteOverlayLinkKind } from "./rte-deps.js";
import { scanProject } from "./project-scan.js";
import { verifyProject } from "./verify.js";

export type DoctorCheckStatus = "pass" | "warn" | "fail";

export type DoctorCheck = {
  id: string;
  label: string;
  status: DoctorCheckStatus;
  detail?: string;
};

export type DoctorResult = {
  projectName: string;
  checks: DoctorCheck[];
  passCount: number;
  warnCount: number;
  failCount: number;
};

export type DoctorOptions = {
  cwd: string;
  json?: boolean;
  checkDevServer?: boolean;
  devServerPort?: number;
};

async function checkDevServerReachable(port: number): Promise<DoctorCheck> {
  const url = `http://127.0.0.1:${port}/`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(1_500) });
    if (res.ok) {
      return {
        id: "dev_server",
        label: `Dev server reachable (${url})`,
        status: "pass",
      };
    }
    return {
      id: "dev_server",
      label: "Dev server reachable",
      status: "warn",
      detail: `HTTP ${res.status} from ${url}`,
    };
  } catch {
    return {
      id: "dev_server",
      label: "Dev server reachable",
      status: "warn",
      detail: `Start bun dev — could not reach ${url}`,
    };
  }
}

function summarize(result: DoctorResult): void {
  const total = result.checks.length;
  const passed = result.passCount;
  const label =
    result.failCount > 0
      ? "rte not ready"
      : result.warnCount > 0
        ? "rte partially ready"
        : "rte ready";
  console.log(`\nResult: ${passed}/${total} passed — ${label}`);
}

export async function runDoctor(opts: DoctorOptions): Promise<number> {
  let scan: ReturnType<typeof scanProject>;
  try {
    scan = scanProject(opts.cwd);
  } catch (e) {
    if (e instanceof PreflightError) {
      console.error(e.message);
      return 1;
    }
    throw e;
  }

  const { ctx, detectedLibraries, index } = scan;
  const pkg = ctx.packageJson;
  const projectName = String(pkg.name ?? "project");
  const verification = verifyProject(
    ctx.root,
    ctx.packageJsonPath,
    ctx.viteConfigPath,
  );

  const checks: DoctorCheck[] = [
    {
      id: "deps_plugin",
      label: "@rte/vite-plugin installed",
      status: verification.deps === "OK" ? "pass" : "fail",
    },
    {
      id: "deps_overlay",
      label: "@rte/overlay installed",
      status: verification.deps === "OK" ? "pass" : "fail",
    },
    {
      id: "vite_plugin",
      label: "vite.config contains rte()",
      status: verification.vite === "OK" ? "pass" : "fail",
    },
    {
      id: "optimize_deps",
      label: "optimizeDeps.exclude includes @rte/overlay",
      status: verification.optimizeDeps === "OK" ? "pass" : "fail",
      detail:
        verification.optimizeDeps === "OK" &&
        rteOverlayLinkKind(pkg) === "workspace"
          ? "workspace install — optional"
          : undefined,
    },
    {
      id: "overlay_css",
      label: "main entry imports @rte/overlay/style.css",
      status: verification.overlayCss === "OK" ? "pass" : "fail",
      detail:
        verification.overlayCss === "OK" &&
        rteOverlayLinkKind(pkg) === "workspace"
          ? "workspace install — optional"
          : undefined,
    },
    {
      id: "dev_shell",
      label: "RteDevShell mounted in app",
      status: verification.shell === "OK" ? "pass" : "fail",
    },
    {
      id: "tailwind",
      label: "Tailwind detected",
      status: ctx.tailwindOk ? "pass" : "warn",
      detail: ctx.tailwindOk
        ? undefined
        : "Style edits may not apply visually without Tailwind",
    },
    {
      id: "editable_hosts",
      label: "At least one data-rte-id indexed",
      status: index.entries.length > 0 ? "pass" : "fail",
      detail:
        index.entries.length > 0
          ? `${index.entries.length} host(s)`
          : "Run dev → Make Editable, or add ids manually",
    },
  ];

  if (detectedLibraries.length > 0) {
    checks.push({
      id: "libraries",
      label: "Component libraries detected",
      status: "pass",
      detail: detectedLibraries.join(", "),
    });
  }

  if (index.duplicateErrors.length > 0) {
    checks.push({
      id: "duplicate_ids",
      label: "No duplicate data-rte-id values",
      status: "fail",
      detail: `${index.duplicateErrors.length} duplicate id(s) — run rte scan`,
    });
  } else {
    checks.push({
      id: "duplicate_ids",
      label: "No duplicate data-rte-id values",
      status: "pass",
    });
  }

  if (opts.checkDevServer !== false) {
    checks.push(await checkDevServerReachable(opts.devServerPort ?? 5173));
  }

  const passCount = checks.filter((c) => c.status === "pass").length;
  const warnCount = checks.filter((c) => c.status === "warn").length;
  const failCount = checks.filter((c) => c.status === "fail").length;

  const result: DoctorResult = {
    projectName,
    checks,
    passCount,
    warnCount,
    failCount,
  };

  if (opts.json) {
    console.log(JSON.stringify(result, null, 2));
    return failCount > 0 ? 1 : 0;
  }

  console.log(`rte doctor — ${projectName}\n`);
  for (const check of checks) {
    const icon =
      check.status === "pass" ? "✅" : check.status === "warn" ? "⚠" : "❌";
    const suffix = check.detail ? ` — ${check.detail}` : "";
    console.log(`  ${icon} ${check.label}${suffix}`);
  }
  summarize(result);
  return failCount > 0 ? 1 : 0;
}
