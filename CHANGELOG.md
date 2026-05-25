# Changelog

All notable changes to published `@nuvio/*` packages are documented here. This project follows [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Changed

- Overlay UI: **Properties** panel renamed **Editor**; style flow button **Preview** renamed **Validate** (same `dryRun` behavior).
- Editor **color pickers**: full Tailwind default palette (Figma-style swatch grid) for text and background utilities.
- **Frosted-glass** overlay chrome (Editor + Nuvio chip); removed read-only Typography/Layout/Appearance inspector blocks.
- **`NuvioDevShell`** returns `null` outside `import.meta.env.DEV`; [DEV_ONLY.md](docs/DEV_ONLY.md) documents deploy/git safety.

## [0.1.0] — 2026-05-24 (Full MVP — `latest` on npm)

First **stable** release after public alpha. Install with `@latest` (no dist-tag) or pin `0.1.0`.

### Added

- **Phase 4 / Full MVP** property controls: text alignment, gap, width, max-width, height, min-height, opacity, shadow; expanded curated text/background colors.
- **Structural patch ops** (`PROTOCOL_VERSION` **4**): `moveSibling`, `setHidden`, `duplicateHost` with golden tests in `@nuvio/ast-engine`.
- **Layout & structure** UI: move up/down (sibling reorder under flex/grid parents), hide, show, duplicate; auto-apply after successful structural preview.
- **Indexed elements** list in the Editor panel for quick selection.
- **Overlay chrome**: draggable/collapsible Editor panel and Nuvio chip; layout persisted under `nuvio:overlay-chrome:v1`.
- **Docs**: [FULL_MVP_DOD.md](docs/FULL_MVP_DOD.md), [DOGFOOD.md](docs/DOGFOOD.md); updated [LIMITATIONS](docs/LIMITATIONS.md), [COMPATIBILITY](docs/COMPATIBILITY.md), [PUBLISHING](docs/PUBLISHING.md).

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
- Docs: [compatibility stub](docs/COMPATIBILITY.md), [known limitations](docs/LIMITATIONS.md), [publishing guide](docs/PUBLISHING.md), MIT [LICENSE](LICENSE).
