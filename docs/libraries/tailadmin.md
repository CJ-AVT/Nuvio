# TailAdmin + nuvio

**Applies to:** `@nuvio/*` **1.0.0**

## Detection

nuvio detects TailAdmin from paths like `src/layout/AppSidebar`, `src/components/ecommerce/`, or package name hints.

Developer details → **Libraries: tailadmin**.

## What works in 1.0

- Ecommerce metric cards, chart titles, table sections (dogfood-validated)
- Click-to-tag on native elements inside TailAdmin layouts
- Per-host `libraryHint: tailadmin` in source index

## Recommended ids

Follow card/table patterns in `nuvio/AGENT.md`:

- `metric.orders.label`, `metric.orders.value`
- `orders.section`, `orders.header.products`
- `orders.row.${id}.nameText` for row text

## Maintainer example

```bash
pnpm dev:tailadmin
```

Full app: [`apps/tailadmin-dogfood`](../../apps/tailadmin-dogfood). Walkthrough: [`examples/tailadmin-demo`](../../examples/tailadmin-demo/).

## External TailAdmin users

1. `pnpm dlx @nuvio/cli init --yes` in your TailAdmin Vite app root
2. Mount `NuvioDevShell` in your layout if not in `App.tsx` (init patches `App.tsx` by default)
3. Add ids to dashboard hosts or use **Make Editable**

## Limitations

- Layouts that mount the shell only in nested routes may need manual `NuvioDevShell` placement
- Heavily dynamic `className` still fails closed — prefer literal or `cn()` patterns on instrumented hosts
