# Nuvio 1.0 examples — Vite + Tailwind coverage

Validated example projects for the **v1.0.0** release. Each README has a **≤5 minute** path from clone → **Apply to Code**.

These are what GitHub visitors should try to see maximum **Vite + Tailwind** support in action.

| Example | Path | Port | Proves |
| ------- | ---- | ---- | ------ |
| **vite-basic** | [`vite-basic/`](vite-basic/) | 5175 | `nuvio init` + click-to-tag on plain Vite |
| **shadcn-dashboard** | [`shadcn-dashboard/`](shadcn-dashboard/) | 5176 | shadcn `components/ui/*` + `cn()` class patches |
| **tailadmin-demo** | [`tailadmin-demo/`](tailadmin-demo/) | 5173 via dogfood | Full TailAdmin dashboard instrumentation |

## Quick start (monorepo)

```bash
pnpm install
pnpm --filter @nuvio/example-vite-basic dev
pnpm --filter @nuvio/example-shadcn-dashboard dev
pnpm dev:tailadmin
```

## Verify wiring

```bash
pnpm v10:acceptance
node packages/cli/dist/cli-entry.js doctor --skip-dev-server --cwd examples/vite-basic
```

## Coverage reference

Stack matrix and className modes: [docs/COVERAGE.md](../docs/COVERAGE.md)
