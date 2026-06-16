# Dev-time source index (Phase 1)

## Where it lives

Implement the **id → `{ filePath, nodeLocator }` map** inside `packages/vite-plugin` as a dedicated module, for example:

- `packages/vite-plugin/src/source-index.ts` (or `src/index/`)

The Vite plugin already owns dev-server lifecycle (`configureServer`), WebSocket setup, and project root resolution — keeping the scanner next to that code avoids circular dependencies and matches how Rte bootstraps in dev.

`packages/ast-engine` consumes the resolved `{ filePath, locator }` to mutate TSX; it should **not** own filesystem watching for the whole repo (the plugin forwards watch events or invalidates the index).

## Default scan roots

When no `rte.scanRoots` config is provided, default to:

- `src/**/*.{tsx,jsx}` relative to the Vite **config root** (`server.config.root` / `viteConfig.root`).

Exclude common noise via defaults (tunable later):

- `**/node_modules/**`
- `**/dist/**`

## Invalidation

Rebuild or patch the index when:

- A watched file is added, removed, or saved (HMR already surfaces saves).
- The dev server restarts.

## Duplicate ids

If the same `data-rte-id` (or wrapper `id`) appears in more than one file, **fail at index time** with `file:line` diagnostics for each occurrence (see `docs/implPlan.md` Phase 1).
