# Nuvio v0.5.5 — Telemetry Reliability

**Release:** 0.5.5 (patch — telemetry reliability only)  
**Packages:** `@nuvio/shared`, `@nuvio/ast-engine`, `@nuvio/vite-plugin`, `@nuvio/overlay`, `@nuvio/cli`  
**Spec:** [PostHog_telemetry.md](./PostHog_telemetry.md)

---

## Why this release exists

npm download counts for `@nuvio/cli` passed **600+**, but PostHog showed very few product events — roughly **one** `nuvio_init_started` in the combined funnel.

That gap made it hard to tell whether people were actually **running** the CLI after installing from npm.

**npm downloads ≠ CLI executions.** A download can happen from CI caches, bots, `pnpm dlx` resolution, or installs that never run `nuvio init`.

v0.5.5 adds a true **top-of-funnel** CLI event (`nuvio_cli_invoked`) and hardens flush/shutdown so events are less likely to be lost when users exit quickly or cancel.

**Investigation notes (0.5.4):**

| Observation | Implication |
| ----------- | ----------- |
| 600+ npm downloads | Install/discovery signal only |
| ~1 `nuvio_init_started` in PostHog | Most downloads never ran `nuvio init`, or events were lost on fast exit |
| Overlay events visible separately in Activity | CLI and overlay use **different anonymous IDs** — a single combined funnel is misleading |
| No event on `--help` or bare `nuvio` | Could not measure CLI runs that never reached `init` |

---

## What changed

- Added **`nuvio_cli_invoked`** — fires at CLI start, before init validation, prompts, or file writes.
- Improved CLI telemetry **flush/shutdown** on success, failure, early return, and help/unknown paths.
- Added **`SIGINT` / `SIGTERM`** handlers to flush telemetry before exit (bounded timeout; does not block the CLI for long).
- Documented **separate CLI and overlay funnels** in PostHog (no identity stitching in 0.5.5).
- Updated telemetry docs and README (minimal, vibe-coder friendly).

**Unchanged:** overlay events, init events, opt-out behavior, privacy policy, patch engine, editor UX.

---

## Events tracked

### CLI (`@nuvio/cli`)

| Event | When |
| ----- | ---- |
| `nuvio_cli_invoked` | **First** — every CLI start, before init validation |
| `nuvio_init_started` | `runInit()` begins (not on `--dry-run`) |
| `nuvio_init_completed` | Init exits 0 with tier `full` or `partial` |
| `nuvio_init_failed` | Any init failure path or uncaught CLI error |

**Expected order (init success):**

```text
nuvio_cli_invoked → nuvio_init_started → nuvio_init_completed
```

**Expected order (init failure):**

```text
nuvio_cli_invoked → nuvio_init_started → nuvio_init_failed
```

**`nuvio_cli_invoked` properties (privacy-safe only):**

- `nuvio_version`, `os`, `arch`, `node`
- `command`: `init` | `help` | `unknown` | `none`
- `package_manager` only when `--pm` is passed (no lockfile reads for this event)

### Overlay (`@nuvio/overlay`)

| Event | When |
| ----- | ---- |
| `overlay_connected` | WebSocket ready |
| `first_selection` | First element selected in session |
| `preview_changes` | Successful preview |
| `apply_to_code` | **Main activation KPI** — successful apply |
| `apply_failed` | Failed apply (safe `reason` enum only) |

---

## Privacy

nuvio does **not** collect source code, file contents, file paths, project names, emails, usernames, or personal information.

Telemetry is **anonymous**, **opt-out**, and **invisible** during normal use. Failures never break the CLI or overlay.

---

## How to disable

**CLI:**

```bash
NUVIO_TELEMETRY=0
```

(or `NUVIO_TELEMETRY=false`)

**Browser overlay:**

```js
localStorage.setItem("nuvio.telemetry", "0")
```

Then refresh the page.

---

## How to verify after release

```bash
pnpm dlx @nuvio/cli@0.5.5 --help
pnpm dlx @nuvio/cli@0.5.5 init --yes
```

**PostHog → Activity**

| Command | Expected events |
| ------- | ---------------- |
| `--help` | `nuvio_cli_invoked` (`command: help`) |
| `init --yes` | `nuvio_cli_invoked` → `nuvio_init_started` → `nuvio_init_completed` |

**Recommended funnels (separate — IDs not linked yet):**

**CLI funnel:**

```text
nuvio_cli_invoked → nuvio_init_started → nuvio_init_completed
```

**Overlay activation funnel:**

```text
overlay_connected → first_selection → preview_changes → apply_to_code
```

**Local maintainer smoke:**

```bash
pnpm --filter @nuvio/cli test
NUVIO_TELEMETRY_DEBUG=1 node packages/cli/dist/cli-entry.js --help
pnpm telemetry:smoke   # live PostHog (network)
```

---

## Release checklist

- [ ] `pnpm build` passes
- [ ] `pnpm typecheck` passes
- [ ] `pnpm test` passes
- [ ] `pnpm telemetry:smoke` passes (maintainers, live PostHog)
- [ ] Fresh temp project: `pnpm dlx @nuvio/cli@0.5.5 init --yes` in empty Vite app
- [ ] npm versions bumped to **0.5.5** (all five packages)
- [ ] `pnpm publish:stable --otp=XXXXXX`
- [ ] Git tag `v0.5.5` + GitHub release

---

## Files changed (implementation)

| Area | Files |
| ---- | ----- |
| CLI telemetry | `packages/cli/src/telemetry.ts`, `packages/cli/src/cli.ts` |
| Tests | `packages/cli/test/telemetry.test.ts`, `packages/cli/test/cli-telemetry.test.ts`, `packages/cli/test/telemetry-live.test.ts` |
| Docs | `docs/PostHog_telemetry.md`, `docs/nuvio_v0.5.5.md`, `CHANGELOG.md`, `README.md` |
| Versions | All five `packages/*/package.json` → `0.5.5` |
