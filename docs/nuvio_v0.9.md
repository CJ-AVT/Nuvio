# nuvio v0.9 — Doctor, Scan, Stats (internal milestone)

**Status:** Implemented in repo — **not** a separate npm release  
**Ships in:** `@nuvio/*` **1.0.0**  
**Roadmap:** [v1.0.md](v1.0.md) § v0.9

---

## Goal

Improve setup validation and project visibility — reduce “nuvio doesn’t work” support burden.

## Commands

```bash
nuvio doctor    # Is this project wired correctly?
nuvio scan      # What's editable? Any duplicate ids?
nuvio stats     # Project-level summary (human or --json)
```

Shared flags: `--cwd <path>`, `--json`, `--verbose`, `-h`.

Doctor also accepts `--skip-dev-server` to skip the optional localhost health check.

## What shipped

| Area | Change |
| ---- | ------ |
| **Offline scanner** | `@nuvio/vite-plugin/scan` — same `buildSourceIndex` path as dev server |
| **`nuvio doctor`** | Pass/warn/fail checklist: deps, vite config, overlay CSS, shell, Tailwind, indexed hosts, duplicates, optional dev server |
| **`nuvio scan`** | Lists indexed `data-nuvio-id` hosts with file:line; reports duplicate ids |
| **`nuvio stats`** | Aggregate counts: hosts, files, libraries, table hosts, className modes |
| **Telemetry** | `doctor_run`, `scan_run`, `stats_run` — aggregate counts only (no paths) |
| **Monorepo-aware doctor** | `workspace:*` deps, layout-mounted `NuvioDevShell`, optional overlay CSS / optimizeDeps |

## Verify

```bash
pnpm install
pnpm build && pnpm test

# In a wired app (e.g. after nuvio init):
pnpm dlx @nuvio/cli doctor
pnpm dlx @nuvio/cli scan
pnpm dlx @nuvio/cli stats --json
```

## Key files

| Package | Files |
| ------- | ----- |
| cli | `doctor.ts`, `scan-cmd.ts`, `stats.ts`, `project-scan.ts`, `cli.ts`, `telemetry.ts` |
| vite-plugin | `scan.ts` (export `./scan`) |

## Still deferred

- Live dev-session `getIndexStats` HTTP shortcut (offline scan is canonical for CLI)
- Untagged click-target candidate hints in `nuvio scan` (needs overlay/dev-session data)
