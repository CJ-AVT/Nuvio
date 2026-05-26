# Contributing

## Releases (npm)

**Full MVP:** **`@nuvio/*` `0.1.0`** on npm **`latest`**. **Alpha line:** `0.1.0-alpha.x` on **`alpha`**.

Before publishing stable: `pnpm dogfood` and [docs/DOGFOOD.md](./docs/DOGFOOD.md). Maintainer flow: [docs/npmPublish.md](./docs/npmPublish.md). DoD checklist: [docs/FULL_MVP_DOD.md](./docs/FULL_MVP_DOD.md). Limits: [docs/LIMITATIONS.md](./docs/LIMITATIONS.md), [docs/COMPATIBILITY.md](./docs/COMPATIBILITY.md). [CHANGELOG.md](./CHANGELOG.md) tracks releases.

## Monorepo layout

- `packages/shared` — wire protocol (Zod), shared types, path safety helpers
- `packages/vite-plugin` — Vite dev integration (WebSocket, source index, patch apply)
- `packages/overlay` — dev overlay UI (React)
- `packages/ast-engine` — AST patch engine (text + whitelist Tailwind merge, Prettier)
- `apps/demo-app` — reference Vite + React + Tailwind app

## Dev loop

1. `pnpm install` — from the **repo root** (see root `.npmrc` for React hoisting so editors resolve `react` reliably).
2. `pnpm build` — required after changing `packages/*` before running the demo (or use package-level `pnpm --filter @nuvio/vite-plugin dev` watch while iterating).
3. `pnpm --filter @nuvio/demo-app dev` — Vite dev server with Nuvio plugin.

## Tests and types

```bash
pnpm typecheck
pnpm test
```

File writes from the plugin go through `@nuvio/ast-engine` and `assertPathWithinRoot` from `@nuvio/shared/secure-path` (Node-only; not included in the browser-safe `@nuvio/shared` entry).

## Dev-time source index (Phase 1)

See [packages/vite-plugin/SOURCE_INDEX.md](./packages/vite-plugin/SOURCE_INDEX.md) for where the AST id index will live and default scan roots.
