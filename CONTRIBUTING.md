# Contributing

## Releases (npm)

**Full MVP:** **`@rte/*` `0.1.0`** on npm **`latest`**. **Alpha line:** `0.1.0-alpha.x` on **`alpha`**.

Before publishing stable: `bun run dogfood` and [docs/DOGFOOD.md](./docs/DOGFOOD.md). Maintainer flow: [docs/npmPublish.md](./docs/npmPublish.md). DoD checklist: [docs/FULL_MVP_DOD.md](./docs/FULL_MVP_DOD.md). Limits: [docs/LIMITATIONS.md](./docs/LIMITATIONS.md), [docs/COMPATIBILITY.md](./docs/COMPATIBILITY.md). [CHANGELOG.md](./CHANGELOG.md) tracks releases.

## Monorepo layout

- `packages/shared` — wire protocol (Zod), shared types, path safety helpers
- `packages/vite-plugin` — Vite dev integration (WebSocket, source index, patch apply)
- `packages/overlay` — dev overlay UI (React)
- `packages/ast-engine` — AST patch engine (text + whitelist Tailwind merge, Prettier)
- `apps/tailadmin-dogfood` — TailAdmin dashboard dogfood app

## Dev loop

1. `bun install` — from the **repo root**.
2. `bun run build` — required after changing `packages/*` before running the demo (or use package-level `bun run --filter '@rte/vite-plugin' build` watch while iterating).
3. `bun run dev:tailadmin` — Vite dev server with Rte plugin (port 5173).

## Tests and types

```bash
bun run typecheck
bun run test
```

File writes from the plugin go through `@rte/ast-engine` and `assertPathWithinRoot` from `@rte/shared/secure-path` (Node-only; not included in the browser-safe `@rte/shared` entry).

## Dev-time source index (Phase 1)

See [packages/vite-plugin/SOURCE_INDEX.md](./packages/vite-plugin/SOURCE_INDEX.md) for where the AST id index will live and default scan roots.
