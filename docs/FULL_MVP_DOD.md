# Full MVP — definition of done (checklist)

Aligned with [PRD.md](./PRD.md) § *MVP definition of done — Full MVP* and [implPlan.md](./implPlan.md) Phase 4.

## Product scope

- [x] **Alpha trust path** — Validate (`dryRun`), Apply, Undo last, touched-file log, dev-time index, `data-nuvio-id` contract
- [x] **Extended properties** — alignment, gap, width/height, opacity, shadow; expanded text/background color lists
- [x] **Layout moves** — `moveSibling` under flex/grid parents (fail-closed otherwise)
- [x] **Structure toolbar** — hide, show, duplicate (+ move up/down); auto-apply after successful structural preview
- [x] **Indexed elements list** — select any indexed id from the Editor panel
- [x] **Overlay chrome** — draggable/collapsible Editor panel and Nuvio chip; layout persisted in `localStorage`

## Quality bar

- [x] **Golden tests** — `setText`, `mergeTailwindClassName`, Phase 4 utilities, `moveSibling`, `setHidden`, `duplicateHost` in `@nuvio/ast-engine`
- [x] **Protocol tests** — Zod wire parsing including structural ops (`PROTOCOL_VERSION` **4**)
- [x] **Overlay unit tests** — chrome layout persistence, sibling move availability helpers
- [x] **CI** — build packages, typecheck, test, build demo app (`.github/workflows/ci.yml`)
- [x] **Failed mapping never writes** — unknown id / rejected patch → `patchAck` error, no disk write

## Docs and packaging

- [x] [README.md](../README.md) — consumer setup, Full MVP flows, troubleshooting
- [x] [LIMITATIONS.md](./LIMITATIONS.md) — alpha vs full MVP boundaries
- [x] [COMPATIBILITY.md](./COMPATIBILITY.md) — stack matrix
- [x] [PUBLISHING.md](./PUBLISHING.md) — `alpha` and **`latest`** (stable) publish flows
- [x] [CHANGELOG.md](../CHANGELOG.md) — `0.1.0` release notes
- [ ] **Maintainer dogfood** — install `@nuvio/*@latest` (or workspace) in a **clean** Vite app outside this monorepo; complete [DOGFOOD.md](./DOGFOOD.md)

## Release

- [x] Semver **`0.1.0`** on all `@nuvio/*` packages (promoted from `0.1.0-alpha.0`)
- [ ] **`pnpm publish:stable`** run by maintainer with npm `@nuvio` access (see [PUBLISHING.md](./PUBLISHING.md))

## Explicitly later (not Full MVP)

- Floating toolbar anchored to selection (controls live in Editor panel today)
- Left-rail hierarchical component tree (flat indexed list today)
- `className={cn(...)}`, Next.js, design tokens, breakpoint editing → Phase 5–6 / V2
