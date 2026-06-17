# RTE demo app (`@rte/tailadmin-dogfood`)

Minimal React SPA used to dogfood Rte: Tailwind v4 + Vite + React 19 with workspace `@rte/vite-plugin` and `@rte/overlay`. Keeps all PCC `data-rte-id` hosts from the original TailAdmin fixture without the full dashboard template.

## Run

From repo root:

```bash
bun install
bun run dev
# or: cd apps/tailadmin-dogfood && bun run dev
```

Open the URL Vite prints (default `http://localhost:5173/`). Click **Edit** on the Rte chip to open the Editor panel.

## Pages

| Route | PCC page | Purpose |
| --- | --- | --- |
| `/` | `dashboard` | Metrics, charts (placeholders), orders table |
| `/form-elements` | `form-elements` | Form section cards + patchable email field |
| `/basic-tables` | `basic-tables` | Simple data table |
| `/badge` | `badges` | Badge samples |

## Verify PCC / brand

```bash
bunx @rte/cli coverage verify --all --cwd apps/tailadmin-dogfood
bunx @rte/cli brand scan --all --cwd apps/tailadmin-dogfood
```

Manifests live in `rte/pages/*.pcc.yaml`. Table wrappers in `src/components/ui/table/` forward `data-rte-id` to native DOM nodes.

## Layout

- `src/layout/AppLayout.tsx` — shell + `RteDevShell`
- `src/components/ecommerce/` — dashboard blocks (kept for TailAdmin library detection)
