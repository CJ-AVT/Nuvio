# shadcn/ui + nuvio

**Applies to:** `@nuvio/*` **1.0.0**

## Detection

nuvio detects shadcn when your project has `components/ui/*.tsx` or `src/components/ui/*.tsx`.

Developer details → **Libraries: shadcn**.

## What works in 1.0

- **Card**, **Button**, **Table**, **Input** compound tags → Simple Mode task menus
- Library-aware **Make Editable** id suggestions (`CardTitle` → `page.title`, `Button` → `page.button`)
- `cn()` / `clsx()` on hosts when the source index detects a supported `classNameMode`

## Recommended ids

| Host | Example id |
| ---- | ---------- |
| Page title | `dashboard.title` |
| Card container | `metric.revenue.card` |
| Card title | `metric.revenue.title` |
| Card value | `metric.revenue.value` |
| Button | `dashboard.export.button` |
| Table section | `orders.section` |
| Column header | `orders.header.product` |

## Limitations

- **Radix portals** (Dialog content, DropdownMenu in portal) — tag the visible trigger or add manual ids on portal children
- **Slot / forwardRef** wrappers that do not forward `data-nuvio-loc` — use Make Editable on a native child or add ids manually

## Example

[`examples/shadcn-dashboard`](../../examples/shadcn-dashboard/) in this repo.

## Setup

```bash
pnpm dlx @nuvio/cli init --yes
pnpm dev
```

Then instrument hosts or use **Make Editable** on untagged elements.
