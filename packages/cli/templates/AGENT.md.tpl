<!-- rte-cli-template: 1 -->
# rte agent instructions

This project uses [rte](https://www.npmjs.com/org/rte) (dev-only visual editor).

When the user asks to make UI editable or wire rte:

1. Do **not** change unrelated files.
2. Prefer **Make Editable** in the browser for new hosts (click-to-tag) — no manual id required for basic flow.
3. When adding ids by hand: **string literal** `data-rte-id="region.name"` on the JSX host they should click.
4. `className` may be a string literal, `cn("a", "b")`, or `cn("base", cond && "token")` on supported hosts.
5. Never use `{condition ? "id" : undefined}` for `data-rte-id` — use a string literal on the branch they edit.

**Card pattern:**
- `metric.orders.card` (container)
- `metric.orders.label`
- `metric.orders.value`

**Table pattern:**
- `orders.section`, `orders.title`
- `orders.header.products` (column headers)
- `orders.row.${id}.nameText` (row text — template literal id is OK for rows)

**Libraries:** shadcn (`components/ui/`), TailAdmin, DaisyUI — see https://github.com/ehah/Rte/tree/main/docs/libraries

**After instrumentation:** user runs `{{PM_RUN}}`, Edit on, Preview Changes, Apply to Code.

If Vite or shell wiring is missing, see `rte/SETUP_TODO.md` or run `bunx @rte/cli init`.

Human quick path: `rte/START_HERE.md`.
