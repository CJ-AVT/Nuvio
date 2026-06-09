import { resolve } from "node:path";
import { runDoctor } from "./doctor.js";
import { runInit, type InitOptions } from "./init.js";
import { runScan } from "./scan-cmd.js";
import { runStats } from "./stats.js";
import type { PackageManager } from "./detect-pm.js";
import {
  buildCliTelemetryProps,
  captureCliEvent,
  captureCliInvoked,
  registerTelemetrySignalHandlers,
  resolveCliInvokedCommand,
  shutdownTelemetry,
} from "./telemetry.js";
import { detectPackageManager } from "./detect-pm.js";

export type CommonCliOptions = {
  cwd: string;
  json?: boolean;
  verbose?: boolean;
};

export type DoctorCliOptions = CommonCliOptions & {
  skipDevServer?: boolean;
};

function printHelp(): void {
  console.log(`nuvio — CLI for React + Vite

Usage:
  nuvio init [options]
  nuvio doctor [options]
  nuvio scan [options]
  nuvio stats [options]

Common options:
  --cwd <path>          Project root (default: current directory)
  --json                Machine-readable output (doctor, scan, stats)
  --verbose             Show error stacks
  -h, --help            Show help

Init options:
  --yes                 Skip confirmation
  --no-install          Patch files only; do not run package manager install
  --dry-run             Show plan only (still prompts unless --yes / CI)
  --pm <pnpm|npm|yarn|bun>  Force package manager
  --strict              Fail if Tailwind is not detected
  --skip-tailwind-check Do not warn when Tailwind is missing
  --force-agent         Overwrite nuvio/AGENT.md

Doctor options:
  --skip-dev-server     Skip localhost dev-server health check

Examples:
  pnpm dlx @nuvio/cli init --yes
  pnpm dlx @nuvio/cli doctor
  pnpm dlx @nuvio/cli scan --json
  pnpm dlx @nuvio/cli stats
`);
}

function parseInitArgs(argv: string[]): {
  command: string | null;
  opts: InitOptions;
  help: boolean;
} {
  const args = argv.slice(2);
  let command: string | null = null;
  const opts: InitOptions = { cwd: process.cwd() };
  let help = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "-h" || arg === "--help") {
      help = true;
      continue;
    }
    if (!command && !arg.startsWith("-")) {
      command = arg;
      continue;
    }
    if (arg === "--yes") opts.yes = true;
    else if (arg === "--no-install") opts.noInstall = true;
    else if (arg === "--dry-run") opts.dryRun = true;
    else if (arg === "--strict") opts.strict = true;
    else if (arg === "--skip-tailwind-check") opts.skipTailwindCheck = true;
    else if (arg === "--force-agent") opts.forceAgent = true;
    else if (arg === "--verbose") opts.verbose = true;
    else if (arg === "--pm") {
      opts.pm = args[++i] as PackageManager;
    } else if (arg === "--cwd") {
      opts.cwd = resolve(args[++i] ?? ".");
    } else if (arg.startsWith("-")) {
      console.error(`Unknown option: ${arg}`);
      help = true;
    }
  }

  return { command, opts, help };
}

function parseProjectCommandArgs(
  argv: string[],
  command: string,
): {
  command: string;
  common: CommonCliOptions;
  doctor: DoctorCliOptions;
  help: boolean;
} {
  const args = argv.slice(2);
  const common: CommonCliOptions = { cwd: process.cwd() };
  const doctor: DoctorCliOptions = { ...common };
  let help = false;
  let i = args[0] === command ? 1 : 0;

  for (; i < args.length; i++) {
    const arg = args[i];
    if (arg === "-h" || arg === "--help") {
      help = true;
      continue;
    }
    if (arg === "--json") {
      common.json = true;
      doctor.json = true;
    } else if (arg === "--verbose") {
      common.verbose = true;
      doctor.verbose = true;
    } else if (arg === "--cwd") {
      const cwd = resolve(args[++i] ?? ".");
      common.cwd = cwd;
      doctor.cwd = cwd;
    } else if (arg === "--skip-dev-server") {
      doctor.skipDevServer = true;
    } else if (arg.startsWith("-")) {
      console.error(`Unknown option: ${arg}`);
      help = true;
    }
  }

  return { command, common, doctor, help };
}

export async function runCli(argv: string[]): Promise<number> {
  registerTelemetrySignalHandlers();
  const rawCommand = argv[2] ?? null;
  const isProjectCmd =
    rawCommand === "doctor" || rawCommand === "scan" || rawCommand === "stats";

  let help = false;
  let command: string | null = rawCommand;
  let initOpts: InitOptions = { cwd: process.cwd() };
  let commonOpts: CommonCliOptions = { cwd: process.cwd() };
  let doctorOpts: DoctorCliOptions = { cwd: process.cwd() };

  if (isProjectCmd) {
    const parsed = parseProjectCommandArgs(argv, rawCommand!);
    help = parsed.help;
    command = parsed.command;
    commonOpts = parsed.common;
    doctorOpts = parsed.doctor;
  } else {
    const parsed = parseInitArgs(argv);
    help = parsed.help;
    command = parsed.command;
    initOpts = parsed.opts;
  }

  const cwd =
    isProjectCmd ? commonOpts.cwd : initOpts.cwd;
  captureCliInvoked(
    resolveCliInvokedCommand(help, command),
    isProjectCmd ? undefined : initOpts.pm,
  );

  try {
    if (help) {
      printHelp();
      return 0;
    }
    if (!command) {
      printHelp();
      return 1;
    }

    switch (command) {
      case "init":
        return await runInit(initOpts);
      case "doctor":
        return await runDoctor({
          cwd: doctorOpts.cwd,
          json: doctorOpts.json,
          checkDevServer: !doctorOpts.skipDevServer,
        });
      case "scan":
        return runScan({ cwd: commonOpts.cwd, json: commonOpts.json });
      case "stats":
        return runStats({ cwd: commonOpts.cwd, json: commonOpts.json });
      default:
        console.error(`Unknown command: ${command}`);
        printHelp();
        return 1;
    }
  } catch (e) {
    const pm = detectPackageManager(cwd, initOpts.pm);
    captureCliEvent("nuvio_init_failed", {
      ...buildCliTelemetryProps(pm),
      error_code: "unexpected_error",
    });
    const verbose = isProjectCmd ? commonOpts.verbose : initOpts.verbose;
    if (verbose) console.error(e);
    else console.error("Something went wrong. Run with --verbose for details.");
    return 2;
  } finally {
    await shutdownTelemetry();
  }
}
