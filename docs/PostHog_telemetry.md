# PostHog telemetry — implementation plan

**Document status:** **Implemented in repo** — publishes with **`@nuvio/*` 1.0.0** (no intermediate npm releases)  
**Milestones:** v0.5.4 (initial) · v0.5.5 (`nuvio_cli_invoked`) · v0.6 (`tag_element_*`) · v0.9 (`doctor_run` / `scan_run` / `stats_run`)  
**Audience:** Implementers preparing anonymous, opt-out PostHog telemetry for `@nuvio/cli` and `@nuvio/overlay`  
**Supersedes:** [`TELEMETRY.md`](TELEMETRY.md) v0.3 spec (opt-in, disabled by default). v0.5.4 uses **opt-out** and ships collection **on by default**.

---

## Table of contents

1. [Goal & scope](#1-goal--scope)
2. [Privacy & data policy](#2-privacy--data-policy)
3. [PostHog configuration](#3-posthog-configuration)
4. [Dependencies](#4-dependencies)
5. [CLI telemetry (`@nuvio/cli`)](#5-cli-telemetry-nuviocli)
6. [Overlay telemetry (`@nuvio/overlay`)](#6-overlay-telemetry-nuviooverlay)
7. [Event emission map](#7-event-emission-map)
8. [User-facing privacy text](#8-user-facing-privacy-text)
9. [Tests](#9-tests)
10. [Version & publish](#10-version--publish)
11. [Implementation checklist](#11-implementation-checklist)
12. [Confirmation: no personal/source data](#12-confirmation-no-personalsource-data)

---

## 1. Goal & scope

Nuvio is an npm-published local dev tool (Vite + React + Tailwind). npm download counts do not show whether users complete the core value flow:

```text
nuvio init → pnpm dev → Edit on → select element → Preview Changes → Apply to Code
```

**Goal:** Add lightweight, **anonymous**, **opt-out** telemetry via PostHog to measure funnel completion — especially **`apply_to_code`** (the core value moment).

**v0.5.5 addition:** Measure real CLI runs with **`nuvio_cli_invoked`** (top-of-funnel). npm download counts are **not** the same as CLI executions.

### In scope (v0.5.4 + v0.5.5)

| Area | Change |
| ---- | ------ |
| `@nuvio/cli` | `telemetry.ts`; `nuvio_cli_invoked` on every CLI start + init funnel events |
| `@nuvio/overlay` | New `telemetry.ts`; events on connect / select / preview / apply |
| Tests | CLI + overlay unit tests for opt-out, ID reuse, error swallowing, property safety |
| Docs | Privacy notice in init output, README, `nuvioUser.md`, CHANGELOG |

### Out of scope (explicit)

- No editor behavior changes
- No patch engine / protocol changes
- No workflow changes beyond a short telemetry notice
- No changes to `@nuvio/vite-plugin`, `@nuvio/ast-engine`, or `@nuvio/shared` (unless version bump only)

### Implementation lock

`packages/overlay/**` is locked (`overlay-v0.3`). Implementers must include an unlock phrase in the task message, e.g. `unlock: overlay-v0.3` or `unlock implementation lock`.  
`packages/cli/**` is **not** locked.

---

## 2. Privacy & data policy

### Anonymous only

- No emails, usernames, or account identifiers
- No source code, file contents, file paths, or project names
- No `package.json` `name` field
- No raw error stack traces
- No `data-nuvio-id` values, class names, or element text
- No PostHog autocapture, session recording, or pageviews

### Opt-out

Telemetry is **enabled by default** but users can disable it anytime.

| Surface | Disable |
| ------- | ------- |
| CLI | `NUVIO_TELEMETRY=0` or `NUVIO_TELEMETRY=false` |
| Overlay (browser) | `localStorage.setItem("nuvio.telemetry", "0")` |
| Overlay (build-time, optional) | `VITE_NUVIO_TELEMETRY=0` in the host app's env |

Treat these as case-sensitive string checks on the raw env/localStorage value (`"0"` and `"false"` for CLI).

### Failure isolation

Telemetry must **never** break Nuvio. All PostHog calls are wrapped; errors are swallowed. CLI must `flush`/`shutdown` on **all** exit paths (success, failure, help, unknown command) and on **SIGINT/SIGTERM**, with a bounded timeout so the CLI does not hang.

---

## 3. PostHog configuration

| Setting | Value |
| ------- | ----- |
| Host | `https://us.i.posthog.com` |
| Project token | `NUVIO_POSTHOG_TOKEN` (constant or env placeholder at build/publish time) |
| API keys | **Project ingest token only** — no private/admin API keys |

### Token wiring

```ts
// packages/cli/src/telemetry.ts & packages/overlay/src/telemetry.ts
const POSTHOG_TOKEN =
  process.env.NUVIO_POSTHOG_TOKEN ?? "NUVIO_POSTHOG_TOKEN"; // CLI: read at runtime if env set
```

For overlay (browser), the token must be **inlined at build time** via `tsup` `define` or equivalent so published `dist/` works without host-app env. Maintain a single source constant; CI/maintainer sets the real token before `publish:stable`. Empty/placeholder token → no-op client (same as opt-out).

---

## 4. Dependencies

```bash
pnpm add posthog-node --filter @nuvio/cli
pnpm add posthog-js --filter @nuvio/overlay
```

No new deps on other packages.

---

## 5. CLI telemetry (`@nuvio/cli`)

### New file: `packages/cli/src/telemetry.ts`

Responsibilities:

1. **`isTelemetryEnabled()`** — return `false` when `NUVIO_TELEMETRY` is `"0"` or `"false"` (case-sensitive for `"0"`; treat `"false"` case-insensitively if desired, but spec requires both `0` and `false`).
2. **Anonymous ID** — read/write `~/.nuvio/telemetry.json`:

   ```json
   { "anonymousId": "<uuid-v4>" }
   ```

   - Create directory `~/.nuvio` if missing (`mkdir` recursive, mode `0700`)
   - On read/write failure → generate ephemeral in-memory UUID for the session (do not throw)
   - Reuse the same ID across CLI invocations when file I/O succeeds
3. **`captureCliEvent(event, properties?)`** — lazy-init `PostHog` from `posthog-node`; `distinctId: anonymousId`
4. **`shutdownTelemetry()`** — `await client.shutdown()`; swallow errors
5. **Allowed properties only** (see §5.3)

Export a small public surface; keep PostHog client module-private.

### Allowed CLI event properties

```ts
type CliTelemetryProps = {
  nuvio_version: string;
  os: NodeJS.Platform;       // process.platform
  arch: string;              // os.arch()
  node: string;              // process.version
  package_manager?: "pnpm" | "npm" | "yarn" | "bun";
  has_react?: boolean;
  has_vite?: boolean;
  has_tailwind?: boolean;
  // init failure only:
  error_code?: string;       // safe enum — see §5.4
  result_tier?: "full" | "partial" | "failed";
};
```

**Never send:** `cwd`, `root`, file paths, `package.json` name, vite config path, error messages, stacks.

### CLI events

| Event | Role | When |
| ----- | ---- | ---- |
| `nuvio_cli_invoked` | **Top-of-funnel** | First line of `runCli()`, **before** init validation, prompts, project checks, or file writes |
| `nuvio_init_started` | Init funnel | Start of `runInit()` (not on `--dry-run`) |
| `nuvio_init_completed` | Init funnel | Init exits `0` with `plan.tier` `full` or `partial` |
| `nuvio_init_failed` | Init funnel | Any non-zero exit from `runInit`, or uncaught failure in `runCli` catch |
| `doctor_run` | Diagnostics (v0.9) | End of `runDoctor()` — pass/warn/fail counts only |
| `scan_run` | Diagnostics (v0.9) | End of `runScan()` — host count, duplicate count, library count |
| `stats_run` | Diagnostics (v0.9) | End of `runStats()` — aggregate counts only |

#### `nuvio_cli_invoked` (v0.5.5)

Fires for every CLI invocation:

- `nuvio init` / `nuvio init --yes`
- `nuvio --help` / `nuvio init --help`
- bare `nuvio` (no command)
- unknown commands (`nuvio deploy`, etc.)

**Allowed properties only:**

```ts
type CliInvokedProps = {
  nuvio_version: string;
  os: NodeJS.Platform;
  arch: string;
  node: string;
  command: "init" | "help" | "unknown" | "none";
  package_manager?: "pnpm" | "npm" | "yarn" | "bun"; // only when --pm is passed
};
```

Do **not** read lockfiles or project paths for this event. Do **not** send argv, cwd, or project metadata.

Do **not** emit `nuvio_init_started` / `nuvio_init_completed` on `--dry-run`.

### Safe `error_code` values for `nuvio_init_failed`

Map internal failures to short codes — never forward `Error.message`:

| Code | Trigger |
| ---- | ------- |
| `preflight_no_package_json` | `PreflightError` — no `package.json` |
| `preflight_no_vite` | No vite config |
| `preflight_no_react` | Missing react dep |
| `preflight_no_vite_dep` | Missing vite dep |
| `preflight_monorepo` | Nuvio monorepo / `@nuvio/cli` package guard |
| `strict_tailwind` | `--strict` without Tailwind |
| `install_failed` | `runInstall` returned `!ok` |
| `init_tier_failed` | `plan.tier === "failed"` after patches |
| `unexpected_error` | `runCli` catch block (exit `2`) |
| `user_cancelled` | User declined confirm prompt (exit `1`) |

### Integration points

| File | Change |
| ---- | ------ |
| [`packages/cli/src/init.ts`](../packages/cli/src/init.ts) | Call telemetry at start, success, and each early `return` failure path |
| [`packages/cli/src/cli.ts`](../packages/cli/src/cli.ts) | `nuvio_cli_invoked` at start; on `runInit` catch: `nuvio_init_failed` + `unexpected_error`; `finally`: `shutdownTelemetry()` on all paths; `registerTelemetrySignalHandlers()` for SIGINT/SIGTERM |
| [`packages/cli/src/messages.ts`](../packages/cli/src/messages.ts) | Add `telemetryNotice` constant for privacy text |
| [`packages/cli/src/init.ts`](../packages/cli/src/init.ts) `printSuccess` | Print telemetry notice after success lines |

Property sourcing in `runInit`:

- `has_react` / `has_vite` / `has_tailwind` — from `detectProject` / `ProjectContext` (add booleans to context or derive from existing `hasDep` / `tailwindOk`)
- `package_manager` — from `detectPackageManager`
- `nuvio_version` — from [`NUVIO_VERSION`](../packages/cli/src/version.ts)

### CLI build

Add `posthog-node` to `tsup` externals if needed (prefer bundling for simpler consumer installs — evaluate bundle size; `posthog-node` is acceptable bundled for CLI).

---

## 6. Overlay telemetry (`@nuvio/overlay`)

### New file: `packages/overlay/src/telemetry.ts`

Responsibilities:

1. **`isOverlayTelemetryEnabled()`** — `false` when:
   - `localStorage.getItem("nuvio.telemetry") === "0"`, or
   - `import.meta.env.VITE_NUVIO_TELEMETRY === "0"` (when defined)
2. **`initOverlayTelemetry()`** — call once on module load or first event; `posthog.init(POSTHOG_TOKEN, { api_host, autocapture: false, capture_pageview: false, disable_session_recording: true, persistence: "localStorage" })`
3. **`captureOverlayEvent(event)`** — no custom properties in v0.5.4 (keeps surface minimal and safe). Optional later: `nuvio_version` from build define.
4. **Session flag for `first_selection`** — module-level `let firstSelectionSent = false`
5. All exports try/catch; never throw

Use the same anonymous ID strategy as CLI where possible: PostHog's `localStorage` persistence is acceptable for overlay (still anonymous UUID, not tied to project).

### Overlay events

| Event | When | Once? |
| ----- | ---- | ----- |
| `overlay_connected` | WebSocket `open` handler sets channel `"ready"` in [`NuvioDevShell.tsx`](../packages/overlay/src/NuvioDevShell.tsx) (~line 603) | Once per successful connect (guard with ref to avoid reconnect spam, or once per page session) |
| `first_selection` | [`onSelectId`](../packages/overlay/src/NuvioDevShell.tsx) when `id` is truthy and user selects an indexed editable target | **Once per browser session** |
| `preview_changes` | `patchAck` handler: `pending.kind === "preview"` && `msg.ok` (~line 701) | Every successful preview |
| `apply_to_code` | `patchAck` handler: `pending.kind === "apply"` && `msg.ok` (~line 728) | Every successful apply (KPI) |
| `apply_failed` | `patchAck` handler: `pending.kind === "apply"` && `!msg.ok` (~line 739) | Every failed apply |
| `tag_element_started` | Make Editable confirm in [`NuvioDevShell.tsx`](../packages/overlay/src/NuvioDevShell.tsx) (v0.6) | Every tag attempt |
| `tag_element_completed` | `tagElementAck` with `ok: true` (v0.6) | Every successful tag |
| `tag_element_failed` | `tagElementAck` with `!ok` (v0.6) | Every failed tag |

### Safe `reason` for `apply_failed`

Map server `errorCode` / failure context to a fixed enum — **never** send `errorMessage`:

| Telemetry `reason` | Source `errorCode` / condition |
| ------------------ | ------------------------------ |
| `duplicate_id` | Selection/index blocked by duplicate id (e.g. user applies while id is duplicated — map from `unknown_id` when duplicateErrors present, or dedicated future code) |
| `no_patch_target` | `unknown_id`, `host_not_found` |
| `unsupported_classname` | `patch_rejected` when message class indicates dynamic/computed className (map in telemetry layer only from `errorCode`, not message) |
| `apply_error` | `write_error`, `read_error`, `parse_error`, `generate_error`, `format_error`, `path_escape`, or unknown |

Implementation: `mapApplyFailureReason(errorCode: string | undefined): ApplyFailureReason` in `telemetry.ts`.

**Do not emit** `apply_failed` for preview failures (preview has its own UX; no `preview_failed` event in v0.5.4).

### Safe `reason` for `tag_element_failed` (v0.6)

Map server `errorCode` to a fixed enum — **never** send `errorMessage`, file paths, or suggested id values:

| Telemetry `reason` | Source condition |
| ------------------ | ---------------- |
| `duplicate_id` | Id already exists in index |
| `invalid_id` | User or suggested id fails validation |
| `no_loc` | Click target has no `data-nuvio-loc` (transform missing / stale dev server) |
| `parse_error` | AST parse failed |
| `write_error` | File write failed |
| `tag_error` | Other tag failure |

### Integration points

| File | Change |
| ---- | ------ |
| [`packages/overlay/src/NuvioDevShell.tsx`](../packages/overlay/src/NuvioDevShell.tsx) | Import `captureOverlayEvent` / helpers; calls at overlay + tag hook points |
| [`packages/overlay/tsup.config.ts`](../packages/overlay/tsup.config.ts) | `define: { "import.meta.env.VITE_NUVIO_TELEMETRY": ... }` if needed; inline `NUVIO_POSTHOG_TOKEN` for publish builds |

**Critical:** Do not pass `id`, `msg.file`, `shortDisplayPath(hit.file)`, ops, classNames, or `errorMessage` into telemetry.

### Overlay build notes

- `posthog-js` ships to browser — include in bundle (not external)
- Ensure telemetry module is tree-shaken-safe when token is placeholder (no-op stubs)

---

## 7. Event emission map

### CLI (all invocations)

```
runCli(argv)
  ├─ [FIRST] nuvio_cli_invoked { command: init|help|unknown|none }
  ├─ help / no command / unknown → return (still shutdownTelemetry in finally)
  └─ init → runInit(opts)
       ├─ nuvio_init_started (skip on --dry-run)
       ├─ detectProject throws → nuvio_init_failed (preflight_*)
       ├─ strict tailwind fail → nuvio_init_failed (strict_tailwind)
       ├─ user cancel confirm → nuvio_init_failed (user_cancelled)
       ├─ install fail → nuvio_init_failed (install_failed)
       ├─ tier failed → nuvio_init_failed (init_tier_failed)
       ├─ exit 0 full/partial → nuvio_init_completed
       └─ finally → shutdownTelemetry() (+ SIGINT/SIGTERM handlers)

runCli catch → nuvio_init_failed (unexpected_error)
```

### Recommended PostHog funnels (v0.5.5)

CLI and overlay use **different anonymous IDs** — do **not** combine into one funnel until identity linking is implemented.

| Funnel | Steps | Purpose |
| ------ | ----- | ------- |
| **CLI** | `nuvio_cli_invoked` → `nuvio_init_started` → `nuvio_init_completed` | Real CLI runs and init completion |
| **Overlay activation** | `overlay_connected` → `first_selection` → `preview_changes` → `apply_to_code` | Product value moment |

**Main activation KPI:** `apply_to_code`  
**Top-of-funnel KPI:** `nuvio_cli_invoked`

**Note:** npm download counts measure package resolution/installs, not CLI executions. Use `nuvio_cli_invoked` for top-of-funnel CLI activity.

### Overlay (browser session)

```
NuvioDevShellInner mount
  └─ WebSocket connect effect
       └─ ws "open" → overlay_connected

onSelectId(id)
  └─ first time in session → first_selection

patchAck (preview, ok) → preview_changes

patchAck (apply, ok)  → apply_to_code   ← KPI

patchAck (apply, !ok) → apply_failed { reason: <safe enum> }

Make Editable confirm → tag_element_started
tagElementAck (ok)    → tag_element_completed
tagElementAck (!ok)   → tag_element_failed { reason: <safe enum> }
```

---

## 8. User-facing privacy text

Add verbatim (or equivalent) to:

| Location | Action |
| -------- | ------ |
| `nuvio init` success output | Append after `printSuccess` in [`init.ts`](../packages/cli/src/init.ts) |
| [`packages/cli/README.md`](../packages/cli/README.md) | Short "Telemetry" subsection |
| [`README.md`](../README.md) | Link to this doc + opt-out one-liner |
| [`docs/nuvioUser.md`](nuvioUser.md) | One paragraph in Quick Start footer |
| [`CHANGELOG.md`](../CHANGELOG.md) | 0.5.4 entry |

**Copy:**

```text
Nuvio collects anonymous usage metrics to improve onboarding and reliability.
No source code, file contents, file paths, project names, emails, or personal data are sent.

Disable anytime with:
NUVIO_TELEMETRY=0
```

For overlay-only opt-out, document `localStorage.setItem("nuvio.telemetry", "0")` in this file and README (browser devtools / one-time snippet).

Update [`TELEMETRY.md`](TELEMETRY.md) header to point here: "Implemented in v0.5.4 — see PostHog_telemetry.md."

---

## 9. Tests

### CLI: `packages/cli/test/telemetry.test.ts`

Use vitest; mock `posthog-node` or inject a test double.

| Test | Assertion |
| ---- | --------- |
| Disabled when `NUVIO_TELEMETRY=0` | `captureCliEvent` / `captureCliInvoked` no-ops; no PostHog client created |
| `nuvio_cli_invoked` fires for help | `runCli(["--help"])` captures with `command: help` |
| Shutdown on all paths | `runCli --help` calls `flush` + `shutdown` |
| Disabled when `NUVIO_TELEMETRY=false` | Same |
| Failures do not throw | Mock PostHog `capture` to throw; caller resolves without error |
| Anonymous ID reused | First call writes `~/.nuvio/telemetry.json`; second call reads same `anonymousId` (use temp homedir via `HOME` override in test) |
| No paths in properties | Capture spy; assert no property value matches `/[/\\]/`, no keys like `cwd`, `root`, `file`, `path`, `name` |

Optional integration: run `runInit` on fixture with telemetry mocked and assert event sequence.

### Overlay: `packages/overlay/src/telemetry.test.ts`

Use vitest + jsdom (existing overlay test setup).

| Test | Assertion |
| ---- | --------- |
| Disabled when `localStorage["nuvio.telemetry"] === "0"` | No capture |
| Disabled when `VITE_NUVIO_TELEMETRY === "0"` | No capture |
| Failures do not throw | Mock `posthog-js` capture throw |
| `mapApplyFailureReason` | Maps `unknown_id` → `no_patch_target`, etc. |
| No forbidden properties | Events emit with event name only (or fixed allowlist) |

Run:

```bash
pnpm --filter @nuvio/cli test
pnpm --filter @nuvio/overlay test
```

---

## 10. Version & publish

Bump **all five** published packages to **0.5.5** (aligned versions):

- `@nuvio/shared`
- `@nuvio/ast-engine`
- `@nuvio/vite-plugin`
- `@nuvio/overlay`
- `@nuvio/cli`

Even if only CLI and overlay have code changes, aligned versions keep `nuvio init` install pins consistent (per v0.5.3 practice).

```bash
# After implementation + tests green
pnpm publish:stable --otp=XXXXXX
git tag v0.5.5
```

Release notes: [`docs/nuvio_v0.5.5.md`](nuvio_v0.5.5.md).

---

## 11. Implementation checklist

### Code

- [x] `pnpm add posthog-node --filter @nuvio/cli`
- [x] `pnpm add posthog-js --filter @nuvio/overlay`
- [x] `packages/cli/src/telemetry.ts`
- [x] Wire `init.ts` + `cli.ts`
- [x] `packages/overlay/src/telemetry.ts`
- [x] Wire `NuvioDevShell.tsx` patchAck / connect / onSelectId
- [x] `tsup` define for overlay token / env flags
- [x] Version **0.5.5** in all five `package.json` files
- [x] `nuvio_cli_invoked` + flush/SIGINT hardening (v0.5.5)

### Tests

- [x] `packages/cli/test/telemetry.test.ts`
- [x] `packages/overlay/src/telemetry.test.ts`
- [x] `pnpm test:cli` green

### Docs

- [x] This file (shipped)
- [x] `CHANGELOG.md` 0.5.4
- [x] `README.md`, `packages/cli/README.md`, `nuvioUser.md`
- [x] `TELEMETRY.md` pointer update
- [x] Init stdout privacy notice

### Pre-publish verification

- [ ] **CLI smoke:** `pnpm telemetry:smoke` → PostHog **Activity** shows `nuvio_cli_invoked` + `nuvio_init_started` + `nuvio_init_completed`
- [ ] **Overlay smoke:** `pnpm build && pnpm dev` (dogfood) → Edit → select → Preview → Apply → Activity shows `overlay_connected` … `apply_to_code`
- [ ] Opt-out: `NUVIO_TELEMETRY=0 nuvio init` sends nothing
- [ ] Confirm no events contain `/`, `\`, `.tsx`, project folder names

**Token:** wired in [`packages/cli/src/nuvio-posthog-token.ts`](../packages/cli/src/nuvio-posthog-token.ts) and [`packages/overlay/src/nuvio-posthog-token.ts`](../packages/overlay/src/nuvio-posthog-token.ts) (keep in sync; bundled into `dist/` at build). Host: `https://us.i.posthog.com`. Project ID: `455720`.

---

## 12. Confirmation: no personal/source data

After implementation, each event payload must contain **only**:

| Event | Allowed payload |
| ----- | ---------------- |
| `nuvio_cli_invoked` | `nuvio_version`, `os`, `arch`, `node`, `command`, optional `package_manager` (only `--pm` override) |
| `nuvio_init_started` | `nuvio_version`, `os`, `arch`, `node`, `package_manager`, `has_react`, `has_vite`, `has_tailwind` |
| `nuvio_init_completed` | Same + optional `result_tier: "full" \| "partial"` |
| `nuvio_init_failed` | Same + `error_code`, optional `result_tier` |
| `doctor_run` | Same + `pass_count`, `warn_count`, `fail_count`, `ready` (boolean) |
| `scan_run` | Same + `host_count`, `duplicate_count`, `library_count` |
| `stats_run` | Same + `editable_hosts`, `tagged_files`, `duplicate_ids`, `table_hosts`, `library_count` |
| `overlay_connected` | Event name only (or `nuvio_version` if build-inlined) |
| `first_selection` | Event name only |
| `preview_changes` | Event name only |
| `apply_to_code` | Event name only |
| `apply_failed` | `reason`: `duplicate_id` \| `no_patch_target` \| `unsupported_classname` \| `apply_error` |
| `tag_element_started` | Event name only |
| `tag_element_completed` | Event name only |
| `tag_element_failed` | `reason`: `duplicate_id` \| `invalid_id` \| `no_loc` \| `parse_error` \| `write_error` \| `tag_error` |

**Explicitly excluded from all events:**

- Source code, AST snippets, patch ops
- File paths, repo roots, `package.json` name
- `data-nuvio-id` values
- className strings, element text, diff summaries
- Raw `errorMessage`, stack traces
- Emails, usernames, IP enrichment beyond PostHog defaults (review PostHog project settings: disable IP capture if available)

**Distinct ID:** anonymous UUID in `~/.nuvio/telemetry.json` (CLI) / PostHog local persistence (overlay) — not derived from username, repo, or machine hostname.

---

**Summary:** v0.5.4 introduced opt-out PostHog telemetry; **v0.5.5** adds `nuvio_cli_invoked` (top-of-funnel CLI runs) and hardened flush/shutdown; **v0.6.0** adds `tag_element_*` events for click-to-tag adoption; **v0.9** adds `doctor_run`, `scan_run`, and `stats_run` (aggregate setup/diagnostic signals — no paths or host ids). CLI and overlay use separate anonymous IDs — do not combine funnels. **`apply_to_code`** remains the main activation KPI.
