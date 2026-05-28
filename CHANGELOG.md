# Changelog

All notable changes to published `@nuvio/*` packages are documented here. This project follows [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.3.0-alpha.0] — 2026-05-28 (Phase B — stack mastery alpha)

Phase B per [nuvio_v0.3.0.md](docs/nuvio_v0.3.0.md): hierarchy-first targeting, Tailwind depth, responsive breakpoint-aware patching, and hardening gates on real dashboard fixtures.

### Added

- **Index v3 targeting metadata** on wire/index: `textTargets`, `styleTargets`, `patchHostId`, hierarchy hints.
- **Overlay target routing**: explicit text/style target resolution with host-vs-child patch labels.
- **ComponentTree upgrades**: risk filters, duplicate-id diagnostics, host grouping.
- **Tailwind depth controls**: expanded spacing/layout/typography/visual picks (line-height, letter-spacing, flex/grid, border/ring, axis spacing).
- **Responsive pipeline**: active breakpoint context (`base|sm|md|lg|xl`) from overlay to patch engine.
- **Breakpoint-aware AST helpers**: `parseClassNameByBreakpoint`, `mergeAtBreakpoint`.
- **Plugin runtime gate**: `NUVIO=0` and `nuvio({ enabled: false })`.
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

**Phase A** per [nuvio_v0.2.0.md](docs/nuvio_v0.2.0.md): host-agnostic overlay, Tailwind v4 + TailAdmin dogfood, source index v2. Install with npm **`alpha`** tag when published (maintainers: [npmPublish.md](docs/npmPublish.md), [DOGFOOD.md](docs/DOGFOOD.md) §v0.2).

### Added

- **Self-contained overlay CSS** (`@nuvio/overlay/style.css`) — no host Tailwind `content` entry for Nuvio UI.
- **Shadow DOM** chrome (chip, editor, diagnostics) with injected overlay styles.
- **Positioning v2**: collision-aware defaults, versioned `localStorage` keys (`nuvio:*:v2`), **Reset position**, offscreen saved positions ignored.
- **Source index v2** (`PROTOCOL_VERSION` **5**): component name, literal `className`, map context, risk level, `unsupportedReasons` on `indexReady`.
- **Runtime diagnostics**: Vite/React/Tailwind versions where detectable; duplicate id reporting; selection summary in editor.
- **Monorepo fixtures**: `apps/tailwind-v4-test` (TW v4 CSS-first), `apps/tailadmin-dogfood` (TailAdmin dashboard).
- **Docs**: [nuvioUser.md](docs/nuvioUser.md) simplified setup (§16); [COMPATIBILITY.md](docs/COMPATIBILITY.md), [DOGFOOD.md](docs/DOGFOOD.md) v0.2 checklists.

### Changed

- **`apps/demo-app`**: removed `@nuvio/overlay` from Tailwind `content` (overlay independence).
- Overlay UI uses `nuvio-*` classes + CSS variables (host-agnostic).
- Editor shows file, line, component, className patchability, and risk from index metadata.
- Maintainer docs consolidated into [npmPublish.md](docs/npmPublish.md); overlay **Properties** → **Editor**; **Preview** → **Validate**; frosted-glass chrome; **`NuvioDevShell`** no-op outside `import.meta.env.DEV`.

### Unchanged

- Dev-only Vite integration; string-literal `className` on patched hosts; utility whitelist + `tailwind-merge`.
- Validate (`dryRun`) → Apply → session **Undo last**; structural ops from 0.1.0 (`moveSibling`, `setHidden`, `duplicateHost`).

## [0.1.0] — 2026-05-24 (Full MVP — `latest` on npm)

First **stable** release after public alpha. Install with `@latest` (no dist-tag) or pin `0.1.0`.

### Added

- **Phase 4 / Full MVP** property controls: text alignment, gap, width, max-width, height, min-height, opacity, shadow; expanded curated text/background colors.
- **Structural patch ops** (`PROTOCOL_VERSION` **4**): `moveSibling`, `setHidden`, `duplicateHost` with golden tests in `@nuvio/ast-engine`.
- **Layout & structure** UI: move up/down (sibling reorder under flex/grid parents), hide, show, duplicate; auto-apply after successful structural preview.
- **Indexed elements** list in the Editor panel for quick selection.
- **Overlay chrome**: draggable/collapsible Editor panel and Nuvio chip; layout persisted under `nuvio:overlay-chrome:v1`.
- **Docs**: [FULL_MVP_DOD.md](docs/FULL_MVP_DOD.md), [DOGFOOD.md](docs/DOGFOOD.md); updated [LIMITATIONS](docs/LIMITATIONS.md), [COMPATIBILITY](docs/COMPATIBILITY.md), maintainer publishing guide.

### Changed

- Wire protocol bumped to **v4** (structural ops). Rebuild all packages and restart dev after upgrading.
- README and demo app document Full MVP flows (including flex-row card reorder).

### Unchanged from alpha

- Dev-only Vite integration; string-literal `className` on patched hosts; Tailwind utility whitelist + `tailwind-merge`.
- Session-scoped **Undo last**; **Preview** required before **Apply** for style edits.

## [0.1.0-alpha.0] — 2026-05-12

### Added (public alpha)

- Initial publishable **`@nuvio/shared`**, **`@nuvio/ast-engine`**, **`@nuvio/vite-plugin`**, **`@nuvio/overlay`** at `0.1.0-alpha.0` (npm **`alpha`** tag).
- Phase 3 feature set: dev-time source index, `data-nuvio-id` selection, alpha property controls (text + Tailwind whitelist), **Preview** (`dryRun`), **Apply**, session **Undo last**, touched-file logging.
- Docs: [compatibility stub](docs/COMPATIBILITY.md), [known limitations](docs/LIMITATIONS.md), maintainer publishing guide, MIT [LICENSE](LICENSE).
