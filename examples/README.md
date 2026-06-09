# Nuvio 1.0 examples

Consumer-facing example projects for the v1.0 release gate. Each includes a README with a **≤5 minute** path to first **Apply to Code**.

| Example | Path | Stack |
| ------- | ---- | ----- |
| **vite-basic** | [`vite-basic/`](vite-basic/) | Vite + React + Tailwind — init + click-to-tag |
| **shadcn-dashboard** | [`shadcn-dashboard/`](shadcn-dashboard/) | shadcn-style `components/ui/*` + Card/Button hosts |
| **tailadmin-demo** | [`tailadmin-demo/`](tailadmin-demo/) | Pointer to full [`apps/tailadmin-dogfood`](../apps/tailadmin-dogfood) |

## Maintainer quick start

```bash
pnpm install
pnpm --filter @nuvio/example-vite-basic dev      # :5175
pnpm --filter @nuvio/example-shadcn-dashboard dev  # :5176
pnpm dev:tailadmin                                 # :5173
```

## Gate script

```bash
pnpm v10:acceptance
```

Runs `nuvio doctor` and `nuvio scan` on each wired example (plus TailAdmin dogfood).
