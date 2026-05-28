# TailAdmin dogfood (`@nuvio/tailadmin-dogfood`)

Real-world Nuvio compatibility fixture: [TailAdmin free React dashboard](https://github.com/TailAdmin/free-react-tailwind-admin-dashboard) (Tailwind v4 + Vite 6 + React 19) wired to workspace `@nuvio/vite-plugin` and `@nuvio/overlay`.

## Run

From repo root:

```bash
pnpm install
cd apps/tailadmin-dogfood && pnpm dev
```

Open the URL Vite prints (default `http://localhost:5173/`). Click **Edit** on the Nuvio chip, select instrumented elements, validate → apply → undo.

## Instrumented ids (dashboard)

| Id | Location |
| --- | --- |
| `app.header` | `src/layout/AppHeader.tsx` |
| `app.sidebar` | `src/layout/AppSidebar.tsx` |
| `dashboard.title` | `src/pages/Dashboard/Home.tsx` |
| `metric.customers.card` / `metric.customers.value` | `src/components/ecommerce/EcommerceMetrics.tsx` |
| `metric.orders.card` / `metric.orders.value` | same |
| `chart.sales` / `chart.sales.title` | `src/components/ecommerce/StatisticsChart.tsx` |
| `orders.table` | `src/components/ecommerce/RecentOrders.tsx` |

## Acceptance (manual)

See `docs/nuvio_v0.2.0.md` §13.3 — chip/editor visible without CSS hacks, index ≥ 10 ids on dashboard route, text/class edit + undo, dark mode, resize/devtools dock.

## Upstream

To refresh the TailAdmin tree:

```bash
cd apps && rm -rf tailadmin-dogfood && git clone --depth 1 https://github.com/TailAdmin/free-react-tailwind-admin-dashboard.git tailadmin-dogfood
```

Then re-apply Nuvio wiring (this README, `package.json`, `vite.config.ts`, `AppLayout`, and `data-nuvio-id` attributes).
