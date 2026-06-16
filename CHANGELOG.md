# Changelog

All notable changes to `@rte/*` packages are documented here. This project follows [Semantic Versioning](https://semver.org/).

**Release policy:** `@rte/*` **1.1.0** is the stable npm line (`latest`). **1.0.0** was the first stable release without Brand Kit.

## [Unreleased]

_No changes yet._

## [1.1.0] — 2026-06-14

Brand Kit release — project-wide branding by category across pages. All five publish packages aligned at **1.1.0**.

### Added

- **Brand Kit** — overlay tab to define brand presets (`rte/brand.json`), validate, and bulk-apply by category (card, heading, text, button, table, form, badge).
- **Cross-page branding** — save once, navigate routes, validate/apply per category with saved config and per-page PCC hosts.
- **PCC manifests** — `rte/pages/*.pcc.yaml` route-to-host mapping; dev HTTP endpoints for brand and PCC config.
- **CLI** — `rte brand scan|apply`, `rte coverage verify` for offline brand/coverage checks.
- **Brand telemetry** — `brand_kit_opened`, `brand_saved`, `brand_bulk_validated`, `brand_bulk_applied`, and related overlay events.

### Changed

- TailAdmin dogfood app instrumented for Brand Kit demos (PCC hosts, category counts documented in dogfood README).

## [1.0.0] — 2026-06-10

First stable open-source release for React + Vite + Tailwind vibe coders. All five publish packages aligned at **1.0.0**.

### Added

- **Click To Tag** — click untagged elements, confirm **Make Editable**, rte inserts `data-rte-id` in source.
- Dev-time `data-rte-loc` transform; WebSocket `tagElement` RPC (protocol **v8**); `insertDataRteIdAtLocation` in ast-engine.
- **Better Tailwind** — `cn()` with `cond && "token"`, `classnames()` static maps, per-host `classNameMode`.
- **Component libraries** — detect shadcn / TailAdmin / DaisyUI; `libraryHint`; library-aware routing and id suggestions.
- **CLI diagnostics** — `rte doctor`, `rte scan`, `rte stats` (offline AST index, `--json`).
- **Examples** — `examples/vite-basic`, `examples/shadcn-dashboard`, `examples/tailadmin-demo`.
- **Library guides** — `docs/libraries/shadcn.md`, `tailadmin.md`, `daisyui.md`.
- **Coverage matrix** — [docs/COVERAGE.md](docs/COVERAGE.md) (Vite + Tailwind maximum support for 1.0).
- Telemetry: `rte_cli_invoked`, `tag_element_*`, `doctor_run`, `scan_run`, `stats_run`.

### Changed

- All public `@rte/*` packages bumped from 0.5.x / internal 0.6.0 alignment to **1.0.0**.
- CLI templates (`AGENT.md`, `START_HERE.md`) document click-to-tag and `cn()` support.
- `rte doctor` recognizes workspace-linked monorepo apps and layout-mounted shells.

### Migration

See [MIGRATION_0.5_to_1.0.md](docs/MIGRATION_0.5_to_1.0.md).

## [0.5.5] — 2026-06-09 (telemetry reliability — internal milestone)

### Added

- CLI top-of-funnel event `rte_cli_invoked` — fires on every CLI start (`init`, `--help`, bare `rte`, unknown commands) before init validation or file writes.
- Improved CLI telemetry flush/shutdown on all exit paths, including `SIGINT` / `SIGTERM`, with a bounded timeout so PostHog events are less likely to be lost on quick exits.

### Changed

- Telemetry docs updated with separate CLI and overlay funnels; `rte_cli_invoked` documented as top-of-funnel, `apply_to_code` as main activation KPI.

> **Note:** Rolled into `[Unreleased]` → **1.0.0** per ship-once policy. See [rte_v0.5.5.md](docs/rte_v0.5.5.md).

## [0.5.4] — 2026-06-05 (anonymous telemetry)

### Added

- Anonymous, opt-out PostHog telemetry in `@rte/cli` (`rte init` funnel) and `@rte/overlay` (connect → select → preview → apply funnel).
- Disable CLI telemetry: `RTE_TELEMETRY=0` (or `false`). Disable overlay telemetry: `localStorage.setItem("rte.telemetry", "0")`.
- Privacy notice in `rte init` success output. Spec: [PostHog_telemetry.md](docs/PostHog_telemetry.md).

### Changed

- All public `@rte/*` packages aligned at **0.5.4**.

## [0.5.3] — 2026-06-03 (Vite 8 peer)

### Changed

- `@rte/vite-plugin` peer `vite` now includes **^8.0.0** (removes pnpm peer warning on current `create vite` react-ts templates).
- All public `@rte/*` packages aligned at **0.5.3** (no overlay or CLI behavior changes).

## [0.5.2] — 2026-06-03 (CLI: overlay dev wiring fix)

### Fixed

- `@rte/cli` `init` now patches `src/main.tsx` with `import "@rte/overlay/style.css"` and adds `optimizeDeps.exclude: ["@rte/overlay"]` to `vite.config.ts` so the Edit chip works on fresh Vite apps (no manual steps).

### Note

- **0.5.1** on npm shipped without these patches; discovered during S8b post-publish smoke. Use **`@rte/cli@0.5.2`** (or add the two snippets manually).

## [0.5.1] — 2026-06-03 (CLI onboarding)

### Added

- `@rte/cli` with `rte init` — install, wire Vite, mount overlay, add starter `page.title`, create `rte/START_HERE.md` + `rte/AGENT.md`
- `pnpm v051:acceptance` smoke script

### Changed

- All public `@rte/*` packages bumped to `0.5.1` for aligned installs
- [`rteUser.md`](docs/rteUser.md) and root README lead with Quick Start (`pnpm dlx @rte/cli init`)

## [0.5.0-beta.0] — 2026-05-31 (Cards + Tables beta — Rule 5 Simple Mode)

Beta per [rte_v0.5.0.md](docs/rte_v0.5.0.md) §18.1.

### Added

- **Rule 5 Simple Mode:** three-question screens (title → controls → Preview/Apply/Undo); single **Advanced** section.
- **Human titles:** Product Name, Card Label, Table Title (not raw ids or row modes).
- **Back navigation:** `← Recent Orders Table`, `← Orders Card`, `← Card Options`.
- **Quick Style** chips for text edits; **Responsive preview** (Desktop/Mobile) in Advanced.
- **`simple-mode-nav.ts`**, **`simple-mode-actions.ts`**, **`getSimpleBlockedEditFallback`**.
- **Step 1 visibility audit:** [SIMPLE_MODE_VISIBILITY_AUDIT.md](docs/SIMPLE_MODE_VISIBILITY_AUDIT.md) + automated tests.
- **Beta acceptance script:** `scripts/v05-beta-acceptance.mjs` (screenshots SS1–SS10).

### Changed

- Pending changes UI: compact “No pending changes” / “1 pending change” (no empty preview box).
- Table onboarding hint only at table root menu — not on cell/header sub-screens.
- Blocked copy: “Rte can't safely edit this text yet.” for text contexts.

### Verification

- `pnpm dogfood` green (82+ overlay tests).
- [DOGFOOD.md](docs/DOGFOOD.md) § v0.5.0-beta.0 signed.
- Screenshots: [docs/screenshots/v0.5/](docs/screenshots/v0.5/).

## [0.5.0] — 2026-05-31 (Vibe-coder task router — stable)

Public release per [rte_v0.5.0.md](docs/rte_v0.5.0.md) §18.2.

### Added

- **Task router (stable modes):** Button, Form, Nav, Chart, and Section menus alongside Card + Table.
- **Container guidance v2:** multi-choice (Heading, Description, Button, Card) instead of single CTA.
- **Presets v2:** outcome families (Cleaner, Compact, Elevated, text/button/section presets) with context filtering.
- **TailAdmin P-C–P-F instrumentation:** Monthly Target, Demographic card, form label/input, `nav.dashboard`.
- **Simple Mode polish:** width control in button tasks; outline hides developer filter chips.

### Changed

- Simple Mode actions: **Preview Changes** / **Apply to Code** (protocol unchanged).
- **Copy Fix Prompt** branding; human preview with no Tailwind tokens in Simple Mode.
- Demo app copy updated for 10-minute onboarding path (S8).

### Verification

- `pnpm dogfood` green.
- Manual: [DOGFOOD.md](docs/DOGFOOD.md) § v0.5.0 stable.

## [0.4.0] — 2026-05-31 (Phase C — Vibe-coder UX, Vite + Next)

Stable Phase C per [rte_v0.4.0.md](docs/rte_v0.4.0.md) §11.2.

### Added

- **Onboarding guides** (simple mode): skippable welcome card + first-time contextual hints (buttons, tables, charts, containers). Persisted in `localStorage` (`rte:onboarding:v1`).
- **`@rte/next`**: attach Rte dev WebSocket + source index to a Next.js **custom dev server** (App Router client components).
- **`apps/next-dogfood`**: Next acceptance fixture with metric cards + §4.2 Recent Orders table.
- **Component modes** (card/chart/nav/form/button) alongside table mode; **Outline search** in simple mode.
- **Handoff action bar**: `suggestedAction` CTAs + **Open in editor** (`cursor://` / `RTE_EDITOR_URL`).
- **Content-aware friendly labels** via index `textPreview`; full **style preset** utility mapping (shadow/border/gap).
- **Index v4 polish**: `tableMeta.columns`, array declaration line, Tier C field suffixes (`price`, `category`).
- Tests: plain-message map (16 reasons), container guidance, `source-index-table`.

### Changed

- **Protocol v7** (was v6 in alpha — table metadata unchanged, version bump for stable slice).
- Simple-mode panel order: selection → guidance → component/table mode → Quick edits → device → outline.
- Hide/Show moved into Quick edits (simple mode); table sub-target tabs sync with canvas selection.

### Verification

- `pnpm dogfood` green (Vite gate).
- Next dogfood: `pnpm dev:next` + [DOGFOOD.md](docs/DOGFOOD.md) § v0.4.0 stable scenario 10.

## [0.4.0-alpha.0] — 2026-05-29 (Phase C — Vibe-coder UX, Vite)

Phase C per [rte_v0.4.0.md](docs/rte_v0.4.0.md) §11.1: simple-mode editing, table guidance, AI handoff on **Vite** (Next.js in stable `0.4.0`).

### Added

- **Quick edits** + collapsed **More styles**; plain patch messages; **container guidance** banner.
- **Table mode** (section / column headers / rows); TailAdmin **Recent Orders** §4.2 instrumentation.
- **Index v4** metadata: `rowTargets`, `tableMeta`, `tableDataField`; template `data-rte-id` expansion for `tableData.map`.
- **`setTableDataField`** patch op for static row copy (Tier C).
- **Outline** with friendly labels; **Copy fix context**; style presets + **layout helper** chips.
- **Protocol v6** (table metadata + `setTableDataField`).

### Changed

- TailAdmin `TableCell` / `TableRow` forward native props so indexed ids exist in the DOM.
- Dogfood docs: [DOGFOOD.md](docs/DOGFOOD.md) v0.4 checklist; [rteUser.md](docs/rteUser.md) table block.

### Not in this release

- `@rte/next` adapter (target **0.4.0** stable).
- Open-in-editor links; opt-in telemetry implementation.

### Verification

- `pnpm dogfood` green.
- Manual TailAdmin pass: [DOGFOOD.md](docs/DOGFOOD.md) § v0.4.0-alpha.0.

## [0.3.0-alpha.0] — 2026-05-28 (Phase B — stack mastery alpha)

Phase B per [rte_v0.3.0.md](docs/rte_v0.3.0.md): hierarchy-first targeting, Tailwind depth, responsive breakpoint-aware patching, and hardening gates on real dashboard fixtures.

### Added

- **Index v3 targeting metadata** on wire/index: `textTargets`, `styleTargets`, `patchHostId`, hierarchy hints.
- **Overlay target routing**: explicit text/style target resolution with host-vs-child patch labels.
- **ComponentTree upgrades**: risk filters, duplicate-id diagnostics, host grouping.
- **Tailwind depth controls**: expanded spacing/layout/typography/visual picks (line-height, letter-spacing, flex/grid, border/ring, axis spacing).
- **Responsive pipeline**: active breakpoint context (`base|sm|md|lg|xl`) from overlay to patch engine.
- **Breakpoint-aware AST helpers**: `parseClassNameByBreakpoint`, `mergeAtBreakpoint`.
- **Plugin runtime gate**: `RTE=0` and `rte({ enabled: false })`.
- **Telemetry spec doc**: [TELEMETRY.md](docs/TELEMETRY.md) (spec-only, opt-in model).

### Changed

- Public v0.3 editor remains **polish-only**: no public create/insert/duplicate UI actions.
- Style validate flow now supports debounced style-only validation to reduce slider/color noise.
- TailAdmin dogfood metric instrumentation aligned to host/label/value contract for predictable edits.
- Shared package exports extended for protocol v0.3 types (`Breakpoint`, style/hierarchy target types).

### Verification

- `pnpm dogfood` passes with v0.3 changes (build + typecheck + test + demo build).
- TailAdmin dogfood app build passes.

## [0.2.0-alpha.0] — 2026-05-28 (Phase A — reliability)

**Phase A** per [rte_v0.2.0.md](docs/rte_v0.2.0.md): host-agnostic overlay, Tailwind v4 + TailAdmin dogfood, source index v2. Install with npm **`alpha`** tag when published (maintainers: [npmPublish.md](docs/npmPublish.md), [DOGFOOD.md](docs/DOGFOOD.md) §v0.2).

### Added

- **Self-contained overlay CSS** (`@rte/overlay/style.css`) — no host Tailwind `content` entry for Rte UI.
- **Shadow DOM** chrome (chip, editor, diagnostics) with injected overlay styles.
- **Positioning v2**: collision-aware defaults, versioned `localStorage` keys (`rte:*:v2`), **Reset position**, offscreen saved positions ignored.
- **Source index v2** (`PROTOCOL_VERSION` **5**): component name, literal `className`, map context, risk level, `unsupportedReasons` on `indexReady`.
- **Runtime diagnostics**: Vite/React/Tailwind versions where detectable; duplicate id reporting; selection summary in editor.
- **Monorepo fixtures**: `apps/tailwind-v4-test` (TW v4 CSS-first), `apps/tailadmin-dogfood` (TailAdmin dashboard).
- **Docs**: [rteUser.md](docs/rteUser.md) simplified setup (§16); [COMPATIBILITY.md](docs/COMPATIBILITY.md), [DOGFOOD.md](docs/DOGFOOD.md) v0.2 checklists.

### Changed

- **`apps/demo-app`**: removed `@rte/overlay` from Tailwind `content` (overlay independence).
- Overlay UI uses `rte-*` classes + CSS variables (host-agnostic).
- Editor shows file, line, component, className patchability, and risk from index metadata.
- Maintainer docs consolidated into [npmPublish.md](docs/npmPublish.md); overlay **Properties** → **Editor**; **Preview** → **Validate**; frosted-glass chrome; **`RteDevShell`** no-op outside `import.meta.env.DEV`.

### Unchanged

- Dev-only Vite integration; string-literal `className` on patched hosts; utility whitelist + `tailwind-merge`.
- Validate (`dryRun`) → Apply → session **Undo last**; structural ops from 0.1.0 (`moveSibling`, `setHidden`, `duplicateHost`).

## [0.1.0] — 2026-05-24 (Full MVP — `latest` on npm)

First **stable** release after public alpha. Install with `@latest` (no dist-tag) or pin `0.1.0`.

### Added

- **Phase 4 / Full MVP** property controls: text alignment, gap, width, max-width, height, min-height, opacity, shadow; expanded curated text/background colors.
- **Structural patch ops** (`PROTOCOL_VERSION` **4**): `moveSibling`, `setHidden`, `duplicateHost` with golden tests in `@rte/ast-engine`.
- **Layout & structure** UI: move up/down (sibling reorder under flex/grid parents), hide, show, duplicate; auto-apply after successful structural preview.
- **Indexed elements** list in the Editor panel for quick selection.
- **Overlay chrome**: draggable/collapsible Editor panel and Rte chip; layout persisted under `rte:overlay-chrome:v1`.
- **Docs**: [FULL_MVP_DOD.md](docs/FULL_MVP_DOD.md), [DOGFOOD.md](docs/DOGFOOD.md); updated [LIMITATIONS](docs/LIMITATIONS.md), [COMPATIBILITY](docs/COMPATIBILITY.md), maintainer publishing guide.

### Changed

- Wire protocol bumped to **v4** (structural ops). Rebuild all packages and restart dev after upgrading.
- README and demo app document Full MVP flows (including flex-row card reorder).

### Unchanged from alpha

- Dev-only Vite integration; string-literal `className` on patched hosts; Tailwind utility whitelist + `tailwind-merge`.
- Session-scoped **Undo last**; **Preview** required before **Apply** for style edits.

## [0.1.0-alpha.0] — 2026-05-12

### Added (public alpha)

- Initial publishable **`@rte/shared`**, **`@rte/ast-engine`**, **`@rte/vite-plugin`**, **`@rte/overlay`** at `0.1.0-alpha.0` (npm **`alpha`** tag).
- Phase 3 feature set: dev-time source index, `data-rte-id` selection, alpha property controls (text + Tailwind whitelist), **Preview** (`dryRun`), **Apply**, session **Undo last**, touched-file logging.
- Docs: [compatibility stub](docs/COMPATIBILITY.md), [known limitations](docs/LIMITATIONS.md), maintainer publishing guide, MIT [LICENSE](LICENSE).
